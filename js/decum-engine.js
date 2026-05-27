/**
 * decum-engine.js  v58.2
 * Dual-Engine Decumulation Module — spec-driven, self-contained.
 * Exposes window.DecumEngine.
 *
 * Future-proofing hooks (not yet wired):
 *   EngineSpec.portfolioId  → resolved against CMA to produce R_t vector
 *   Context.personaId       → pre-populate pot/startAge from persona state
 *   runPreset(spec, ctx, R_t_override) → stochastic: pass pre-drawn return path
 */
(function(global) {
'use strict';

/* ══════════════════════════════════════════════════════════════════
   1. MORTALITY — S4PMA Male Annuitant (IFoA S4 Series)
   qx = P(death in [x, x+1) | alive at x)
   Table runs to age 110 where q_110 = 1.0.
   ══════════════════════════════════════════════════════════════════ */
const S4PMA_QX = {
   50:0.00303,51:0.00334,52:0.00369,53:0.00408,54:0.00451,
   55:0.00499,56:0.00552,57:0.00612,58:0.00680,59:0.00756,
   60:0.00842,61:0.00939,62:0.01048,63:0.01170,64:0.01307,
   65:0.01462,66:0.01636,67:0.01831,68:0.02051,69:0.02299,
   70:0.02577,71:0.02888,72:0.03236,73:0.03624,74:0.04055,
   75:0.04533,76:0.05062,77:0.05645,78:0.06286,79:0.06989,
   80:0.07757,81:0.08594,82:0.09504,83:0.10489,84:0.11551,
   85:0.12691,86:0.13910,87:0.15208,88:0.16584,89:0.18037,
   90:0.19565,91:0.21165,92:0.22833,93:0.24564,94:0.26352,
   95:0.28190,96:0.30072,97:0.31988,98:0.33929,99:0.35885,
  100:0.37847,101:0.39805,102:0.41749,103:0.43669,104:0.45555,
  105:0.47397,106:0.49186,107:0.50912,108:0.52569,109:0.54148,
  110:1.00000,
};
const MORTALITY_MAX_AGE = 110;

function buildSurvivalCurve(x0, maxAge) {
    const end = Math.min(maxAge, MORTALITY_MAX_AGE);
    const curve = [];
    let p = 1.0;
    for (let age = x0; age <= end; age++) {
        curve.push({ age, tpx: p });
        const qx = S4PMA_QX[age] ?? 1.0;
        p *= (1 - qx);
    }
    return curve;
}

/* ══════════════════════════════════════════════════════════════════
   2. GLOBAL CONTEXT
   buildContext(params) → GlobalContext
   params: { pot, startAge, targetAge, maxAge,
             realReturn, inflation, discountRate,
             // future hooks:
             personaId, R_t_override }
   ══════════════════════════════════════════════════════════════════ */
function buildContext(params = {}) {
    const startAge      = params.startAge      ?? 65;
    const targetAge     = params.targetAge     ?? 90;
    const maxAge        = Math.min(params.maxAge ?? 110, MORTALITY_MAX_AGE);
    const realReturn    = params.realReturn    ?? 0.035;
    const inflation     = params.inflation     ?? 0.025;
    const nominalReturn = (1 + realReturn) * (1 + inflation) - 1;
    const discountRate  = params.discountRate  ?? 0.045;
    const T             = maxAge - startAge + 1;

    // Economic vectors — deterministic central scenario.
    // Future hook: replace R_t with params.R_t_override (stochastic draw).
    const R_t   = params.R_t_override ?? new Array(T).fill(nominalReturn);
    const pi_t  = new Array(T).fill(inflation);
    const DF_t  = Array.from({ length: T }, (_, t) => Math.pow(1 + discountRate, -t));

    const survival = buildSurvivalCurve(startAge, maxAge);

    return {
        V0: params.pot ?? 100000,
        startAge, targetAge, maxAge, T,
        realReturn, inflation, nominalReturn, discountRate,
        R_t, pi_t, DF_t, survival,
        // Future hooks (unused until integration):
        personaId:  params.personaId  ?? null,
        portfolioId: params.portfolioId ?? null,
    };
}

/* ══════════════════════════════════════════════════════════════════
   3. ACTUARIAL VALUE HELPER
   Computes ä_x(r) — present value of £1/yr for life from age x.
   r: pricing discount rate (nominal or real, matching inflationLinkage).
   ══════════════════════════════════════════════════════════════════ */
function actuarialAnnuityValue(survival, r) {
    let av = 0;
    for (let t = 0; t < survival.length; t++) {
        av += (survival[t]?.tpx ?? 0) * Math.pow(1 + r, -t);
    }
    return Math.max(av, 1e-10);
}

/* ══════════════════════════════════════════════════════════════════
   4. INDIVIDUAL ACCOUNT ENGINE
   Simulates a personal pot through retirement.
   engineSpec fields used:
     incomeRule:           'FIXED_REAL' | 'GLWB_RATCHET' | 'DYNAMIC_VARIABLE'
     initialWithdrawalRate: number (pre-computed; use bisectIWR for 'bisect')
     riderFee:             number (annual charge on asset base)
     inflationLinkage:     'none' | 'guaranteed'  (guaranteed = CPI-uplifted draws)
     deRiskSchedule:       number[]  (optional per-year nominal return overrides)
   ══════════════════════════════════════════════════════════════════ */
function IndividualEngine(ctx, spec) {
    const { V0, startAge, T, R_t, pi_t, survival, targetAge } = ctx;
    const iwr      = spec.initialWithdrawalRate ?? 0.05;
    const fee      = spec.riderFee ?? 0.0;
    const rule     = spec.incomeRule ?? 'FIXED_REAL';
    const inflMode = spec.inflationLinkage ?? 'guaranteed';

    const records = [];
    let A             = V0;
    let baseIncome    = V0 * iwr;
    let glwbFloor     = V0 * iwr;
    let cumulInflation = 1.0;

    for (let t = 0; t < T; t++) {
        const age = startAge + t;
        const tpx = survival[t]?.tpx ?? 0;

        if (tpx < 1e-8 || A <= 0) {
            records.push({ t, age, A_start:0, withdrawal:0, fee:0, A_end:0, income_real:0, bequest:0, tpx });
            continue;
        }

        const R = spec.deRiskSchedule?.[t] ?? R_t[t];
        const A_start = A;
        cumulInflation *= (1 + pi_t[t]);

        let withdrawal;
        if (rule === 'GLWB_RATCHET') {
            const A_preW = A_start * (1 + R - fee);
            glwbFloor = Math.max(glwbFloor, A_preW * iwr);
            withdrawal = Math.min(glwbFloor, A_preW);
        } else if (rule === 'DYNAMIC_VARIABLE') {
            const yearsLeft = Math.max(1, targetAge - age);
            withdrawal = A_start / yearsLeft;
        } else {  // FIXED_REAL
            withdrawal = inflMode === 'guaranteed'
                ? baseIncome * cumulInflation
                : baseIncome;
        }

        const feeCharge = A_start * fee;
        const A_grown   = A_start * (1 + R) - feeCharge;
        const A_end     = Math.max(0, A_grown - withdrawal);
        const income_real = withdrawal / cumulInflation;

        records.push({ t, age, A_start, withdrawal, fee: feeCharge, A_end, income_real, bequest: A_end, tpx });
        A = A_end;

        if (A <= 0) {
            for (let tt = t + 1; tt < T; tt++) {
                records.push({ t:tt, age:startAge+tt, A_start:0, withdrawal:0, fee:0, A_end:0, income_real:0, bequest:0, tpx: survival[tt]?.tpx ?? 0 });
            }
            break;
        }
    }

    while (records.length < T) {
        const tt = records.length;
        records.push({ t:tt, age:startAge+tt, A_start:0, withdrawal:0, fee:0, A_end:0, income_real:0, bequest:0, tpx: survival[tt]?.tpx ?? 0 });
    }
    return records;
}

/* ══════════════════════════════════════════════════════════════════
   5. COLLECTIVE POOL ENGINE
   Models institutional pooled structures: GLA, GSA, CDC.
   engineSpec fields used:
     pricingDiscountRate:      number  (nominal, or real when inflationLinkage='guaranteed')
     mortalityCreditLimit:     number  (0 = fully pooled; >0 = capped credit)
     hasNominalMoneyBack:      boolean
     inflationLinkage:         'none' | 'guaranteed' | 'targeted'
     bypassFundingAdjustment:  boolean
       true  → GLA: income is fixed at inception (V0/ä_x); no dynamic adjustment.
               The insurer bears all investment and longevity risk after pricing.
       false → GSA/CDC: income adjusted each year by funding ratio vs actuarial reserve.
     staticReturn:             boolean (true = insurer holds fixed-income, R_t irrelevant)
   V0_override, startAgeOverride: used by pipeline (Flex→Fix phase 2)
   ══════════════════════════════════════════════════════════════════ */
function CollectiveEngine(ctx, spec, V0_override, startAgeOverride) {
    const { T, R_t, pi_t } = ctx;
    const V0         = V0_override ?? ctx.V0;
    const inceptAge  = startAgeOverride ?? ctx.startAge;
    const r          = spec.pricingDiscountRate ?? 0.04;
    const creditCap  = spec.mortalityCreditLimit ?? 0.0;
    const moneyBack  = spec.hasNominalMoneyBack ?? false;
    const bypass     = spec.bypassFundingAdjustment ?? false;
    const inflMode   = spec.inflationLinkage ?? 'guaranteed';
    const staticRet  = spec.staticReturn ?? false;

    // Build local survival from inception age
    const localSurvival = buildSurvivalCurve(inceptAge, inceptAge + T - 1);

    // Pricing: use real discount rate if inflation-linked ("guaranteed")
    // For 'targeted' (CDC), pricing is always nominal — CPI increases are discretionary
    const pricingRate = (inflMode === 'guaranteed')
        ? spec.realPricingRate ?? (r - ctx.inflation)
        : r;

    const av          = actuarialAnnuityValue(localSurvival, pricingRate);
    const baseIncome  = V0 / av;   // annual income unit (nominal or real depending on inflMode)

    const records = [];
    let poolAssets     = V0;
    let guaranteeAcct  = moneyBack ? V0 : 0;
    let cumulInflation = 1.0;
    // For 'targeted' (CDC): track running nominal income level.
    // CPI increment is granted year-by-year only when funded — prevents
    // accumulated CPI from being applied all at once when funding recovers.
    let nominalIncomeLevel = V0 / av;  // starts at base nominal income

    for (let t = 0; t < T; t++) {
        const age  = inceptAge + t;
        const tpx  = localSurvival[t]?.tpx  ?? 0;
        const tpx1 = localSurvival[t+1]?.tpx ?? 0;

        if (tpx < 1e-8) {
            records.push({ t, age, A_start:0, withdrawal:0, fee:0, A_end:0, income_real:0, bequest:0, tpx });
            continue;
        }

        const A_start = poolAssets;
        cumulInflation *= (1 + pi_t[Math.min(t, pi_t.length - 1)]);

        // ── Determine income for this year ──────────────────────────
        let rawIncome;
        if (bypass) {
            // GLA: exact actuarial income — contractually fixed at inception.
            // Insurer bears all subsequent investment and longevity risk.
            rawIncome = inflMode === 'guaranteed'
                ? baseIncome * cumulInflation   // CPI-linked: real income is constant
                : baseIncome;                   // nominal: flat £ forever
        } else {
            // GSA/CDC: income adjusted by funding ratio.
            //
            // Benchmark: expectedPool — the scheme's own internal model trajectory,
            // evolving at pricingRate and paying baseIncome with mortality credits.
            // fundingRatio = actualPool / expectedPool
            //   = 1.0  → scheme exactly on track, no income change
            //   > 1.0  → outperformance, discretionary increase (capped at +20%)
            //   < 1.0  → underperformance, income reduction (floored at -20%)
            //
            // This ensures the investment risk premium (actual return > prudent rate)
            // doesn't automatically translate into maximum income every year.
            // Actuarial reserve: PV of future base income to surviving members
            // at the scheme's pricing rate. Measures solvency vs minimum obligations.
            let actuarialReserve = 0;
            for (let s = t; s < localSurvival.length; s++) {
                const _condProb = tpx > 1e-10 ? (localSurvival[s]?.tpx ?? 0) / tpx : 0;
                actuarialReserve += _condProb * baseIncome * Math.pow(1 + pricingRate, -(s - t));
            }

            // Funding ratio = pool / actuarial reserve
            // > 1 = surplus (actual pool exceeds minimum obligation reserve)
            // < 1 = deficit (pool below minimum obligation reserve)
            const fundingRatio = actuarialReserve > 1e-6 ? poolAssets / actuarialReserve : 1.0;

            // Gradual income adjustment: only 15% of surplus/deficit per year.
            // This mirrors how real CDC/GSA schemes smooth adjustments.
            // Prevents over-distribution in good years while maintaining long-run solvency.
            const adjFactor  = 1.0 + Math.min(0.05, Math.max(-0.05, (fundingRatio - 1.0) * 0.15));

            // CDC (targeted): grant this year's CPI increase only if in surplus.
            // Increment the running nominal income level — never bulk-apply prior years.
            // GSA (guaranteed): always escalate with CPI.
            if (inflMode === 'targeted') {
                // Step nominal income up by one year's CPI only when funded
                if (fundingRatio >= 1.0) {
                    nominalIncomeLevel *= (1 + (ctx.inflation ?? 0.025));
                }
                // Apply smooth adjustment around the current nominal level
                rawIncome = nominalIncomeLevel * adjFactor;
            } else {
                // Guaranteed: CPI escalation is contractual
                rawIncome = baseIncome * cumulInflation * adjFactor;
            }
        }
        // ── Pool asset evolution ─────────────────────────────────────
        const R = staticRet ? pricingRate : R_t[Math.min(t, R_t.length - 1)];
        const qx = tpx > 1e-10 ? Math.max(0, 1 - tpx1 / tpx) : 1.0;
        const mortalityCredit = qx * poolAssets;
        const cappedCredit    = creditCap > 0
            ? Math.min(mortalityCredit, creditCap * poolAssets)
            : mortalityCredit;

        // GSA/CDC: mortality credits redistributed to surviving members
        // GLA: insurer retains forfeited capital to sustain their reserve
        //   → redistribution to pool = mortalityCredit (insurer keeps reserve solvent)
        //   Without this the pool drains before the last survivor, which is wrong.
        //   The correctly-priced annuity ä_x(r) ensures the pool reaches 0 exactly
        //   as the last cohort member approaches age 110.
        const redistribution = bypass ? mortalityCredit : cappedCredit;

        // For GLA: A_end can briefly go negative in extreme old ages due to rounding;
        // clamp to 0 but continue paying income (insurer obligation is contractual).
        const A_end_raw = poolAssets * (1 + R) - rawIncome + redistribution;
        const A_end = bypass ? Math.max(0, A_end_raw) : Math.max(0, A_end_raw);

        // Bequest value
        let bequest = 0;
        if (moneyBack) {
            guaranteeAcct = Math.max(0, guaranteeAcct - rawIncome * 0.3);
            bequest = guaranteeAcct;
        }

        const income_real = rawIncome / cumulInflation;
        records.push({ t, age, A_start, withdrawal: rawIncome, fee: 0, A_end, income_real, bequest, tpx });
        poolAssets = A_end;

        // For GLA (bypass): income is contractually guaranteed — don't stop when pool reaches 0.
        // For CDC/GSA: stop if pool exhausted (scheme/pool insolvency).
        if (poolAssets <= 0 && !bypass) {
            for (let tt = t + 1; tt < T; tt++) {
                records.push({ t:tt, age:inceptAge+tt, A_start:0, withdrawal:0, fee:0, A_end:0, income_real:0, bequest:0, tpx: localSurvival[tt]?.tpx ?? 0 });
            }
            break;
        }
    }

    while (records.length < T) {
        const tt = records.length;
        records.push({ t:tt, age:inceptAge+tt, A_start:0, withdrawal:0, fee:0, A_end:0, income_real:0, bequest:0, tpx: localSurvival[tt]?.tpx ?? 0 });
    }
    return records;
}

/* ══════════════════════════════════════════════════════════════════
   6. BISECTION SOLVER
   Find IWR such that A at targetAge ≈ 0
   ══════════════════════════════════════════════════════════════════ */
function bisectIWR(ctx, specBase) {
    let lo = 0.001, hi = 0.25;
    const targetT = Math.min(ctx.targetAge - ctx.startAge, ctx.T - 1);
    for (let iter = 0; iter < 60; iter++) {
        const mid = (lo + hi) / 2;
        const recs = IndividualEngine(ctx, { ...specBase, initialWithdrawalRate: mid });
        const endA = recs[targetT]?.A_end ?? 0;
        if (endA > 0) lo = mid; else hi = mid;
        if (hi - lo < 1e-8) break;
    }
    return (lo + hi) / 2;
}

/* ══════════════════════════════════════════════════════════════════
   7. APV COMPUTATION
   ══════════════════════════════════════════════════════════════════ */
function computeAPV(records, ctx) {
    const { DF_t, V0 } = ctx;
    let apvIncome = 0, apvBequest = 0;
    records.forEach((r, t) => {
        const df   = DF_t[Math.min(t, DF_t.length - 1)];
        const tpx  = r.tpx ?? 0;
        const tpx1 = records[t + 1]?.tpx ?? 0;
        apvIncome  += tpx * df * (r.withdrawal ?? 0);
        const pDie  = Math.max(0, tpx - tpx1);
        apvBequest += pDie * df * (r.bequest ?? 0);
    });
    return { apvIncome, apvBequest, totalNormalized: (apvIncome + apvBequest) / Math.max(V0, 1) };
}

/* ══════════════════════════════════════════════════════════════════
   8. STRATEGY SPEC SYSTEM
   ══════════════════════════════════════════════════════════════════ */

/**
 * PRODUCT_TYPES — user-facing product type definitions.
 * Each maps to a productType key and sets engine defaults.
 * bypassFundingAdjustment is derived from productType; never shown to users.
 */
const PRODUCT_TYPES = {
    gla: {
        label: 'Guaranteed Lifetime Annuity (GLA)',
        description: 'Full risk transfer to insurer. Contracted income for life. Investment, longevity, and inflation risks all borne by the insurer (if inflation-linked). No bequest unless capital-protected.',
        engineType: 'collective',
        defaults: {
            bypassFundingAdjustment: true,
            staticReturn: true,
            pricingDiscountRate: 0.038,
            realPricingRate: 0.009,
            mortalityCreditLimit: 0.0,
            hasNominalMoneyBack: false,
            inflationLinkage: 'guaranteed',
        },
    },
    gsa: {
        label: 'Group Self-Annuitisation (GSA / ART)',
        description: 'Mutual pooling with capped mortality credits (1.25%/yr). Credits above the cap flow to a longevity reserve (ART structure), sustaining income for very long lives. No shareholder profit extraction. Income adjusts with actuarial funding position.',
        engineType: 'collective',
        defaults: {
            bypassFundingAdjustment: false,
            staticReturn: false,
            pricingDiscountRate: 0.0405,
            realPricingRate: 0.011,
            mortalityCreditLimit: 0.0125,
            hasNominalMoneyBack: true,
            inflationLinkage: 'guaranteed',
        },
    },
    cdc: {
        label: 'Collective Defined Contribution (CDC)',
        description: 'Scheme-managed pool at a prudent valuation rate. Income increases are discretionary, granted only when the funding position supports them — not contractually inflation-linked. Fully pooled mortality; no bequest.',
        engineType: 'collective',
        defaults: {
            bypassFundingAdjustment: false,
            staticReturn: false,
            pricingDiscountRate: 0.04,
            realPricingRate: null,   // not used for CDC
            mortalityCreditLimit: 0.0,
            hasNominalMoneyBack: false,
            inflationLinkage: 'targeted',
        },
    },
    drawdown: {
        label: 'Invested Portfolio (Drawdown)',
        description: 'Member retains full ownership of pot. Longevity and sequence-of-returns risk borne individually. Residual pot fully inheritable.',
        engineType: 'individual',
        defaults: {
            incomeRule: 'FIXED_REAL',
            initialWithdrawalRate: 'bisect',
            riderFee: 0.0,
            inflationLinkage: 'guaranteed',
            deRiskYears: 0,
        },
    },
    glwb: {
        label: 'Guaranteed Lifetime Withdrawal Benefit (GLWB)',
        description: 'Insurance overlay on invested portfolio. Lifetime income floor guaranteed; upside via ratchet if fund grows. Annual rider fee charged on asset base.',
        engineType: 'individual',
        defaults: {
            incomeRule: 'GLWB_RATCHET',
            initialWithdrawalRate: 0.05,
            riderFee: 0.01,
            inflationLinkage: 'guaranteed',
            deRiskYears: 0,
        },
    },
    pipeline: {
        label: '"Flex then Fix" — Phased Hybrid',
        description: 'Invested drawdown through early retirement with de-risking, then full annuitisation at a chosen switching age. Flexibility early; longevity protection later.',
        engineType: 'pipeline',
        defaults: {
            splitAge: 75,
            phase1: { productType:'drawdown', incomeRule:'FIXED_REAL', initialWithdrawalRate:'bisect', inflationLinkage:'guaranteed', deRiskYears:10 },
            phase2: { productType:'gla', bypassFundingAdjustment:true, staticReturn:true, pricingDiscountRate:0.038, realPricingRate:0.009, inflationLinkage:'guaranteed' },
        },
    },
    parallel: {
        label: '"Flex and Fix" — Concurrent Hybrid',
        description: 'Split at inception: a chosen percentage buys an annuity (essential income floor), remainder stays in invested drawdown (flexible spending). Both run simultaneously.',
        engineType: 'parallel',
        defaults: {
            splitRatio: 0.40,
            fixLeg:  { productType:'gla', bypassFundingAdjustment:true, staticReturn:true, pricingDiscountRate:0.038, realPricingRate:0.009, inflationLinkage:'guaranteed' },
            flexLeg: { productType:'drawdown', incomeRule:'FIXED_REAL', initialWithdrawalRate:'bisect', inflationLinkage:'guaranteed' },
        },
    },
};

/**
 * PRESET_SPECS — the seven built-in strategy specifications.
 * Users can load any of these and adjust parameters freely.
 */
const PRESET_SPECS = [
    {
        id: 'preset_drawdown', name: 'Invested Portfolio (Drawdown)',
        shortName: 'Drawdown', color: '#1D4ED8', isPreset: true,
        orchestration: { type: 'single' },
        primaryEngine: {
            type: 'individual', productType: 'drawdown',
            incomeRule: 'FIXED_REAL', initialWithdrawalRate: 'bisect',
            riderFee: 0.0, inflationLinkage: 'guaranteed', deRiskYears: 0,
        },
    },
    {
        id: 'preset_gsa', name: 'Group Self-Annuitisation (GSA)',
        shortName: 'GSA', color: '#7E22CE', isPreset: true,
        orchestration: { type: 'single' },
        primaryEngine: {
            type: 'collective', productType: 'gsa',
            bypassFundingAdjustment: false, staticReturn: false,
            pricingDiscountRate: 0.0405, realPricingRate: 0.016,
            mortalityCreditLimit: 0.0125, hasNominalMoneyBack: true,
            inflationLinkage: 'guaranteed',
        },
    },
    {
        id: 'preset_cdc', name: 'Collective DC (CDC)',
        shortName: 'CDC', color: '#047857', isPreset: true,
        orchestration: { type: 'single' },
        primaryEngine: {
            type: 'collective', productType: 'cdc',
            bypassFundingAdjustment: false, staticReturn: false,
            pricingDiscountRate: 0.04, realPricingRate: null,
            mortalityCreditLimit: 0.0, hasNominalMoneyBack: false,
            inflationLinkage: 'targeted',
        },
    },
    {
        id: 'preset_glwb', name: 'Guaranteed Lifetime Withdrawal (GLWB)',
        shortName: 'GLWB', color: '#B45309', isPreset: true,
        orchestration: { type: 'single' },
        primaryEngine: {
            type: 'individual', productType: 'glwb',
            incomeRule: 'GLWB_RATCHET', initialWithdrawalRate: 0.05,
            riderFee: 0.01, inflationLinkage: 'none', deRiskYears: 0,  // nominal guarantee — real declines with CPI
        },
    },
    {
        id: 'preset_gla', name: 'Guaranteed Lifetime Annuity (GLA)',
        shortName: 'GLA', color: '#0E7490', isPreset: true,
        orchestration: { type: 'single' },
        primaryEngine: {
            type: 'collective', productType: 'gla',
            bypassFundingAdjustment: true, staticReturn: true,
            pricingDiscountRate: 0.038, realPricingRate: 0.015,
            mortalityCreditLimit: 0.0, hasNominalMoneyBack: false,
            inflationLinkage: 'guaranteed',
        },
    },
    {
        id: 'preset_flex_then_fix', name: '"Flex then Fix" — Phased Hybrid',
        shortName: 'Flex→Fix', color: '#DC2626', isPreset: true,
        orchestration: { type: 'pipeline', splitAge: 75 },
        primaryEngine: {
            type: 'individual', productType: 'drawdown',
            incomeRule: 'FIXED_REAL', initialWithdrawalRate: 'bisect',
            riderFee: 0.0, inflationLinkage: 'guaranteed', deRiskYears: 10,
        },
        secondaryEngine: {
            type: 'collective', productType: 'gla',
            bypassFundingAdjustment: true, staticReturn: true,
            pricingDiscountRate: 0.038, realPricingRate: 0.015,
            mortalityCreditLimit: 0.0, hasNominalMoneyBack: false,
            inflationLinkage: 'guaranteed',
        },
    },
    {
        id: 'preset_flex_and_fix', name: '"Flex and Fix" — Concurrent Hybrid',
        shortName: 'Flex+Fix', color: '#CA8A04', isPreset: true,
        orchestration: { type: 'parallel', splitRatio: 0.40 },
        primaryEngine: {
            type: 'collective', productType: 'gla',   // fix leg
            bypassFundingAdjustment: true, staticReturn: true,
            pricingDiscountRate: 0.038, realPricingRate: 0.015,
            mortalityCreditLimit: 0.0, hasNominalMoneyBack: false,
            inflationLinkage: 'guaranteed',
        },
        secondaryEngine: {
            type: 'individual', productType: 'drawdown',   // flex leg
            incomeRule: 'FIXED_REAL', initialWithdrawalRate: 'bisect',
            riderFee: 0.0, inflationLinkage: 'guaranteed', deRiskYears: 0,
        },
    },
];

/* ══════════════════════════════════════════════════════════════════
   9. CUSTOM STRATEGY PERSISTENCE
   Separate namespace from main app.
   ══════════════════════════════════════════════════════════════════ */
const DECUM_STORAGE_KEY = 'novara_decum_strategies';

function loadCustomSpecs() {
    try {
        return JSON.parse(localStorage.getItem(DECUM_STORAGE_KEY) || '[]');
    } catch { return []; }
}

function saveCustomSpec(spec) {
    const all = loadCustomSpecs().filter(s => s.id !== spec.id);
    all.push(spec);
    localStorage.setItem(DECUM_STORAGE_KEY, JSON.stringify(all));
}

function deleteCustomSpec(id) {
    const all = loadCustomSpecs().filter(s => s.id !== id);
    localStorage.setItem(DECUM_STORAGE_KEY, JSON.stringify(all));
}

function getAllSpecs() {
    return [...PRESET_SPECS, ...loadCustomSpecs()];
}

/* ══════════════════════════════════════════════════════════════════
   10. ORCHESTRATION — run a strategy spec against a context
   ══════════════════════════════════════════════════════════════════ */
function runSpec(spec, ctx) {
    const orch = spec.orchestration ?? { type: 'single' };
    let records;

    if (orch.type === 'single') {
        records = _runEngine(spec.primaryEngine, ctx);

    } else if (orch.type === 'pipeline') {
        const splitT = (orch.splitAge ?? 75) - ctx.startAge;
        const deRiskSched = _buildDeRiskSchedule(ctx, splitT, spec.primaryEngine.deRiskYears ?? splitT);

        // For Flex→Fix: find the IWR that gives income-continuity at the switch age.
        // Target: annuity_income(residual_pot_at_switchAge) ≈ drawdown_income
        // i.e. residual_pot = drawdown_income × a_{switchAge}(realPricingRate)
        // This gives a near-seamless handoff in the central scenario.
        // In stochastic scenarios, the step will vary with actual experience. ✓
        let iwr1;
        if (spec.primaryEngine.initialWithdrawalRate === 'bisect') {
            const secSpec    = spec.secondaryEngine ?? {};
            const switchAge  = orch.splitAge ?? 75;
            const survSwitch = buildSurvivalCurve(switchAge, ctx.maxAge);
            const rSwitch    = secSpec.inflationLinkage === 'guaranteed'
                ? (secSpec.realPricingRate ?? 0.015)
                : (secSpec.pricingDiscountRate ?? 0.038);
            const avSwitch   = actuarialAnnuityValue(survSwitch, rSwitch);
            // Bisect: find IWR such that pot_at_switch / avSwitch = V0 * IWR
            let lo2 = 0.001, hi2 = 0.25;
            for (let iter = 0; iter < 60; iter++) {
                const mid2 = (lo2 + hi2) / 2;
                const testRecs = IndividualEngine(ctx, { ...spec.primaryEngine, initialWithdrawalRate: mid2, deRiskSchedule: deRiskSched });
                const potAtSwitch = testRecs[splitT - 1]?.A_end ?? 0;
                const annuityRealInc  = potAtSwitch / avSwitch;
                const drawdownRealInc = ctx.V0 * mid2;
                if (annuityRealInc > drawdownRealInc) lo2 = mid2; else hi2 = mid2;
                if (hi2 - lo2 < 1e-8) break;
            }
            iwr1 = (lo2 + hi2) / 2;
        } else {
            iwr1 = spec.primaryEngine.initialWithdrawalRate;
        }

        const phase1Recs = IndividualEngine(ctx, { ...spec.primaryEngine, initialWithdrawalRate: iwr1, deRiskSchedule: deRiskSched });
        const phase1     = phase1Recs.slice(0, splitT);
        const A10        = phase1Recs[splitT - 1]?.A_end ?? 0;

        const phase2Recs = CollectiveEngine(ctx, spec.secondaryEngine, A10, orch.splitAge);
        const phase2     = phase2Recs.slice(0, ctx.T - splitT).map((r, i) => ({
            ...r, t: splitT + i, age: ctx.startAge + splitT + i,
        }));
        records = [...phase1, ...phase2];

    } else if (orch.type === 'parallel') {
        const split  = orch.splitRatio ?? 0.40;
        const ctxFix  = { ...ctx, V0: ctx.V0 * split };
        const ctxFlex = { ...ctx, V0: ctx.V0 * (1 - split) };

        const iwr = spec.secondaryEngine.initialWithdrawalRate === 'bisect'
            ? bisectIWR(ctxFlex, spec.secondaryEngine)
            : spec.secondaryEngine.initialWithdrawalRate;

        const fixRecs  = CollectiveEngine(ctxFix,  spec.primaryEngine);
        const flexRecs = IndividualEngine(ctxFlex, { ...spec.secondaryEngine, initialWithdrawalRate: iwr });

        records = fixRecs.map((fr, t) => {
            const fl = flexRecs[t] ?? {};
            return {
                t: fr.t, age: fr.age,
                A_start:    (fr.A_start||0) + (fl.A_start||0),
                withdrawal: (fr.withdrawal||0) + (fl.withdrawal||0),
                fee:        fl.fee||0,
                A_end:      (fr.A_end||0) + (fl.A_end||0),
                income_real:(fr.income_real||0) + (fl.income_real||0),
                bequest:    fl.bequest||0,
                tpx:        fr.tpx,
            };
        });
    }

    // Pad / trim to exactly T records
    while (records.length < ctx.T) {
        const tt = records.length;
        records.push({ t:tt, age:ctx.startAge+tt, A_start:0, withdrawal:0, fee:0, A_end:0, income_real:0, bequest:0, tpx: ctx.survival[tt]?.tpx??0 });
    }
    records = records.slice(0, ctx.T);

    const apv = computeAPV(records, ctx);
    return { spec, records, apv, ctx };
}

function _runEngine(engineSpec, ctx) {
    const iwr = engineSpec.initialWithdrawalRate === 'bisect'
        ? bisectIWR(ctx, engineSpec)
        : engineSpec.initialWithdrawalRate;
    if (engineSpec.type === 'individual') {
        return IndividualEngine(ctx, { ...engineSpec, initialWithdrawalRate: iwr });
    }
    return CollectiveEngine(ctx, engineSpec);
}

function _buildDeRiskSchedule(ctx, splitT, deRiskYears) {
    const riskFree = (1 + 0.012) * (1 + ctx.inflation) - 1;  // ~1.2% real gilt
    return Array.from({ length: ctx.T }, (_, t) => {
        if (t >= splitT || deRiskYears <= 0) return ctx.nominalReturn;
        const frac = Math.min(1, t / deRiskYears);
        return ctx.nominalReturn * (1 - frac) + riskFree * frac;
    });
}

function runAllSpecs(ctx, specIds) {
    const specs = getAllSpecs().filter(s => !specIds || specIds.includes(s.id));
    const results = {};
    specs.forEach(s => {
        try { results[s.id] = runSpec(s, ctx); }
        catch(e) { console.warn(`Spec ${s.name} failed:`, e); }
    });
    return results;
}

/* ══════════════════════════════════════════════════════════════════
   11. PUBLIC API
   ══════════════════════════════════════════════════════════════════ */
global.DecumEngine = {
    buildContext, runSpec, runAllSpecs, getAllSpecs,
    PRESET_SPECS, PRODUCT_TYPES, MORTALITY_MAX_AGE,
    buildSurvivalCurve, computeAPV, bisectIWR,
    IndividualEngine, CollectiveEngine,
    // Persistence
    loadCustomSpecs, saveCustomSpec, deleteCustomSpec,
    // Future-proofing: stochastic/integration helpers
    actuarialAnnuityValue,
};

})(window);
