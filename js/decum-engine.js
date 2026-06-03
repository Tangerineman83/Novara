/**
 * ============================================================
 * FILE: js/decum-engine.js
 * PURPOSE: Dual-engine decumulation calculation module.
 *          Self-contained IIFE; exposes window.DecumEngine.
 * ============================================================
 *
 * WHAT THIS FILE CONTAINS:
 *   Pure calculation logic for decumulation projections.
 *   No UI, no data constants (those live in js/data/decum-specs.js).
 *
 *   Exported via window.DecumEngine:
 *     buildContext(params)          → GlobalContext
 *     runSpec(spec, ctx)            → { records, apv, spec, ctx }
 *     runAllSpecs(ctx, specIds?)    → { [id]: result }
 *     getAllSpecs()                 → [...PRESET_SPECS, ...customSpecs]
 *     PRESET_SPECS                 → from data/decum-specs.js
 *     PRODUCT_TYPES                → from data/decum-specs.js
 *     MORTALITY_MAX_AGE            → 110 (from data/decum-specs.js)
 *     IndividualEngine(ctx, spec)  → YearlyRecord[]
 *     CollectiveEngine(ctx, spec)  → YearlyRecord[]
 *     buildSurvivalCurve(x0, max) → [{age, tpx}]
 *     computeAPV(records, ctx)    → {apvIncome, apvBequest, totalNormalized,
 *                                    lipvNormalized, consumptionEfficiency}
 *     bisectIWR(ctx, spec)        → number
 *     actuarialAnnuityValue(s, r) → number
 *     loadCustomSpecs()           → StrategySpec[]
 *     saveCustomSpec(spec)        → void
 *     deleteCustomSpec(id)        → void
 *
 * ── ENGINE ARCHITECTURE ──────────────────────────────────────────────────────
 *
 * Two core engines:
 *   IndividualEngine — personal pot. Member retains 100% asset ownership.
 *     Longevity and sequence risk borne individually. Full bequest.
 *     Income rules: FIXED_REAL | GLWB_RATCHET | DYNAMIC_VARIABLE
 *
 *   CollectiveEngine — institutional pool. Capital surrendered at inception.
 *     productType controls mortality credit treatment:
 *       'cdc': no credits on assets — mortality reduces LIABILITY (actuarial
 *              reserve shrinks), improving funding ratio. Income adjusts via
 *              1/3-per-year smoothing toward 100% funding. (Aon/WTW 2026)
 *       'gsa': capped mortality credits (1.25%) flow to pool assets.
 *              Excess above cap → longevity insurer reserve (ART structure).
 *       'gla': bypassFundingAdjustment=true — income fixed at inception.
 *              Insurer retains all released capital to sustain reserve.
 *
 * Orchestration patterns:
 *   'single'   — one engine only.
 *   'pipeline' — IndividualEngine (phase 1) → CollectiveEngine (phase 2).
 *                Flex→Fix: income-continuity bisection at switchAge.
 *   'parallel' — Both engines simultaneously, results aggregated.
 *                Flex+Fix: X% to fix leg, (100-X)% to flex leg.
 *
 * ── FUNDING RATIO (CDC/GSA) ──────────────────────────────────────────────────
 *   fundingRatio = poolAssets / actuarialReserve
 *   actuarialReserve = Σ_s [ tpx_s (unconditional) × nomInc × DF(r, s-t) ]
 *   Adjustment: income × (1 + min(0.05, max(-0.05, (FR-1) × 1/3)))
 *   Source: Royal Mail CDC design; WTW "Reimagining Pensions" 2024.
 *
 * ── GLIDEPATH / RETURN SCHEDULE ──────────────────────────────────────────────
 *   _buildDeRiskSchedule(ctx, splitT): age-driven glidepath.
 *     Age 65-79: 60% equity = CPI+3.45% nominal.
 *     Age 80-90: linear de-risk from 60% → 0% equity.
 *     Age 90+:   0% equity = CPI+0.75% nominal.
 *   _ctxWithReturn(ctx, engineSpec, splitT?): builds R_t vector.
 *     useGlidepath=true → uses _buildDeRiskSchedule.
 *     Otherwise: flat scalar from engineSpec.engineRealReturn.
 *
 * ── FUTURE INTEGRATION HOOKS (currently wired, not active) ───────────────────
 *   GlobalContext.personaId  → pre-populate pot/startAge from persona.
 *   GlobalContext.portfolioId → resolve CMA-based R_t vector.
 *   runSpec(spec, ctx, R_t_override) → stochastic: pass pre-drawn return path.
 *
 * DEPENDENCIES:
 *   js/data/decum-specs.js (must load BEFORE this file in index.html).
 *   Consumes: window._decum_specs = { S4PMA_QX, MORTALITY_MAX_AGE,
 *                                     PRODUCT_TYPES, PRESET_SPECS }
 *
 * STORAGE:
 *   Custom user strategies: localStorage key 'novara_decum_strategies'.
 *   Separate from main app storage ('novara_user_data').
 *
 * AUDIT TRAIL:
 * ┌─────────────┬──────────────┬──────────────────────────────────────────────┐
 * │ Date        │ Author       │ Description                                  │
 * ├─────────────┼──────────────┼──────────────────────────────────────────────┤
 * │ 2026-01-01  │ Novara/AI    │ Initial dual-engine architecture             │
 * │ 2026-03-01  │ Novara/AI    │ CDC: correct pool evolution (no mort credits │
 * │             │              │   on assets); aggregate actuarial reserve    │
 * │ 2026-04-01  │ Novara/AI    │ Age-driven glidepath; strategy-specific R_t  │
 * │ 2026-05-01  │ Novara/AI    │ LIPV + consumptionEfficiency in computeAPV   │
 * │ 2026-05-27  │ Novara/AI    │ Data extracted to decum-specs.js; this file  │
 * │             │              │   now contains engine logic only (v58.20)    │
 * └─────────────┴──────────────┴──────────────────────────────────────────────┘
 *
 * FOR AI ASSISTANTS:
 *   - Do NOT add data constants (mortality tables, product types, presets)
 *     to this file. They belong in js/data/decum-specs.js.
 *   - The IIFE pattern (function(global){...})(window) is intentional —
 *     keeps all engine state private except what is assigned to global.DecumEngine.
 *   - CollectiveEngine productType discrimination is critical:
 *       CDC → poolMortalityAdj = 0 (no credits on assets)
 *       GSA → poolMortalityAdj = cappedCredit (1.25% cap)
 *       GLA → poolMortalityAdj = mortalityCredit (full, insurer retains)
 *   - bisectIWR uses 60 iterations — sufficient for 1e-8 convergence.
 *   - lrRound guarantees weights sum to exactly 1.0 (100 integer pct).
 */
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
// ── Data: mortality table, product types, preset specs ────────────────────
  // Loaded from js/data/decum-specs.js (must be loaded before this file).
  const { S4PMA_QX, MORTALITY_MAX_AGE, PRODUCT_TYPES, PRESET_SPECS }
      = global._decum_specs || {};
  if (!S4PMA_QX) {
    console.error('decum-specs.js not loaded before decum-engine.js — check <script> order in index.html');
  }

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
            if (rule === 'GLWB_RATCHET') {
                // Insurance guarantee: pay the locked floor for life even after pot = £0.
                // This is what the rider fee purchases — lifetime income certainty.
                for (let tt = t + 1; tt < T; tt++) {
                    const age_tt = startAge + tt;
                    const tpx_tt = survival[tt]?.tpx ?? 0;
                    if (tpx_tt < 1e-8) {
                        records.push({ t:tt, age:age_tt, A_start:0, withdrawal:0, fee:0, A_end:0, income_real:0, bequest:0, tpx:tpx_tt });
                        continue;
                    }
                    cumulInflation *= (1 + pi_t[Math.min(tt, pi_t.length - 1)]);
                    records.push({ t:tt, age:age_tt, A_start:0, withdrawal:glwbFloor,
                        fee:0, A_end:0, income_real: glwbFloor / cumulInflation, bequest:0, tpx:tpx_tt });
                }
            } else {
                for (let tt = t + 1; tt < T; tt++) {
                    records.push({ t:tt, age:startAge+tt, A_start:0, withdrawal:0, fee:0, A_end:0, income_real:0, bequest:0, tpx: survival[tt]?.tpx ?? 0 });
                }
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
        const productType = spec.productType ?? 'cdc';
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
            // Actuarial reserve: aggregate PV of future income obligations.
            // = tpx × (per-survivor reserve) = Σ_s [ tpx_s × nominalIncome × DF(r, s-t) ]
            // This is the aggregate liability of the scheme — what it needs to hold
            // to meet all future income payments to surviving members.
            // Using aggregate reserve ensures funding ratio = 1.0 when pool is exactly
            // sufficient to meet obligations, regardless of cohort size.
            //
            // For income adjustment purposes: the reference income is the CURRENT nominal
            // income level (nominalIncomeLevel for CDC, baseIncome for GSA).
            const _refIncome = (inflMode === 'targeted' || inflMode === 'none')
                ? nominalIncomeLevel
                : baseIncome;
            let actuarialReserve = 0;
            for (let s = t; s < localSurvival.length; s++) {
                const _tpx_s = localSurvival[s]?.tpx ?? 0;
                // Aggregate: unconditional tpx (not conditional on survival to t)
                actuarialReserve += _tpx_s * _refIncome * Math.pow(1 + pricingRate, -(s - t));
            }

            // Funding ratio: aggregate assets vs aggregate liability.
            // > 1.0 → surplus (positive experience vs assumptions)
            // < 1.0 → deficit (adverse experience)
            // = 1.0 → exactly 100% funded (income unchanged)
            const fundingRatio = actuarialReserve > 1e-6 ? poolAssets / actuarialReserve : 1.0;

            // Income adjustment toward 100% funding.
            // CDC (Aon/WTW): scheme targets 100% funded each year via transparent rules.
            //   Adjustment speed = 1/3 per year (3-year smoothing, per Royal Mail CDC design).
            //   Income can increase or decrease — no floor or ceiling in principle,
            //   though cuts are bounded by 5% per year to avoid member hardship.
            // GSA: same mechanism but with mortality credits boosting assets.
            const _speed = (productType === 'cdc' || productType === 'gsa') ? 0.333 : 0.15;
            const _rawAdj = (fundingRatio - 1.0) * _speed;
            // Annual income change bounded: max +5% (prevents overshoot), min -5% (avoids hardship)
            const adjFactor  = 1.0 + Math.min(0.05, Math.max(-0.05, _rawAdj));

            // CDC (targeted): grant this year's CPI increase only if in surplus.
            // Increment the running nominal income level — never bulk-apply prior years.
            // GSA (guaranteed): always escalate with CPI.
            if (inflMode === 'targeted') {
                // Discretionary CPI: step up only when funded (CDC-style)
                if (fundingRatio >= 1.0) {
                    nominalIncomeLevel *= (1 + (ctx.inflation ?? 0.025));
                }
                rawIncome = nominalIncomeLevel * adjFactor;
            } else if (inflMode === 'none') {
                // Level nominal: income does NOT escalate with CPI.
                // Real income declines at inflation rate. (CDC deterministic central case)
                rawIncome = baseIncome * adjFactor;
            } else {
                // 'guaranteed': CPI escalation is contractual (GSA, GLA)
                rawIncome = baseIncome * cumulInflation * adjFactor;
            }
        }
        // ── Pool asset evolution ─────────────────────────────────────
        const R  = staticRet ? pricingRate : R_t[Math.min(t, R_t.length - 1)];
        const qx = tpx > 1e-10 ? Math.max(0, 1 - tpx1 / tpx) : 1.0;

        // Total income paid this period = per-survivor income × cohort survival fraction.
        // As tpx declines (members die), total income payments decline proportionally.
        // This is the correct aggregate-pool model for all collective structures.
        const totalIncomePaid = rawIncome * tpx;

        // Mortality benefit treatment differs by product type:
        //
        // CDC: NO explicit mortality credit on assets. When a member dies their notional
        //   share stays in the pool as an ASSET (no new cash in), but the LIABILITY
        //   (actuarialReserve) shrinks because fewer future payments are owed.
        //   This improves the funding ratio, which over time supports income increases
        //   through the rules-based adjustment mechanism. Members never receive a direct
        //   credit — they benefit indirectly via improved funding.
        //   Source: Aon "CDC: Everything you need to know in 2026" — income is adjusted
        //   in response to future investment AND demographic experience on a scheme-wide basis.
        //
        // GSA: Capped mortality credits (1.25%/yr) passed directly to surviving pool.
        //   Excess above cap flows to insurer longevity reserve. Survivors benefit
        //   directly — this is the pooling mechanism of GSA/ART products.
        //
        // GLA (bypass): Insurer retains full released capital in their reserve.
        //   The reserve must sustain income until the last survivor. Without retaining
        //   all mortality credits the correctly-priced pool would drain prematurely.
        const mortalityCredit = qx * poolAssets;
        let poolMortalityAdj;
        if (bypass) {
            // GLA: insurer retains all released capital
            poolMortalityAdj = mortalityCredit;
        } else if (productType === 'gsa') {
            // GSA: capped credit redistributed to pool; excess to longevity reserve
            poolMortalityAdj = creditCap > 0
                ? Math.min(mortalityCredit, creditCap * poolAssets)
                : mortalityCredit;
        } else {
            // CDC (and any other collective): no explicit mortality credit on assets.
            // The mortality benefit is captured via shrinking actuarialReserve (liability side).
            poolMortalityAdj = 0;
        }

        const A_end_raw = poolAssets * (1 + R) - totalIncomePaid + poolMortalityAdj;
        const A_end = Math.max(0, A_end_raw);

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
    const totalNormalized = (apvIncome + apvBequest) / Math.max(V0, 1);
    // Living Income PV (LIPV): pure consumption value — income received while alive.
    // Excludes bequests entirely. Measures raw lifestyle-funding efficiency.
    // consumptionEfficiency: fraction of total value accruing as income vs estate.
    const lipvNormalized = apvIncome / Math.max(V0, 1);
    const consumptionEfficiency = (apvIncome + apvBequest) > 0
        ? apvIncome / (apvIncome + apvBequest) : 1;
    return { apvIncome, apvBequest, totalNormalized, lipvNormalized, consumptionEfficiency };
}

/* ══════════════════════════════════════════════════════════════════
   8. STRATEGY SPEC SYSTEM
   ══════════════════════════════════════════════════════════════════ */

/**
 * PRODUCT_TYPES — user-facing product type definitions.
 * Each maps to a productType key and sets engine defaults.
 * bypassFundingAdjustment is derived from productType; never shown to users.
 */
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
        records = _runEngine(spec.primaryEngine, ctx, null);

    } else if (orch.type === 'pipeline') {
        const splitT = (orch.splitAge ?? 75) - ctx.startAge;
        const deRiskSched = _buildDeRiskSchedule(ctx, splitT, spec.primaryEngine.deRiskYears ?? splitT);

        // For Flex→Fix: find the IWR that gives income-continuity at the switch age.
        // Target: annuity_income(residual_pot_at_switchAge) ≈ drawdown_income
        // i.e. residual_pot = drawdown_income × a_{switchAge}(realPricingRate)
        // This gives a near-seamless handoff in the central scenario.
        // In stochastic scenarios, the step will vary with actual experience. ✓
        // Build per-leg context with glidepath R_t (splitT limits glidepath to phase 1 only)
        const ctxP1 = _ctxWithReturn(ctx, spec.primaryEngine, splitT);
        // The glidepath schedule is now in ctxP1.R_t; pass it as deRiskSchedule so
        // IndividualEngine (which reads spec.deRiskSchedule) uses the right returns.
        const deRiskSchedFinal = spec.primaryEngine.useGlidepath
            ? ctxP1.R_t
            : deRiskSched;

        let iwr1;
        if (spec.primaryEngine.initialWithdrawalRate === 'bisect') {
            const secSpec    = spec.secondaryEngine ?? {};
            const switchAge  = orch.splitAge ?? 75;
            const survSwitch = buildSurvivalCurve(switchAge, ctx.maxAge);
            const rSwitch    = secSpec.inflationLinkage === 'guaranteed'
                ? (secSpec.realPricingRate ?? 0.015)
                : (secSpec.pricingDiscountRate ?? 0.038);
            const avSwitch   = actuarialAnnuityValue(survSwitch, rSwitch);
            let lo2 = 0.001, hi2 = 0.25;
            for (let iter = 0; iter < 60; iter++) {
                const mid2 = (lo2 + hi2) / 2;
                const testRecs = IndividualEngine(ctxP1, { ...spec.primaryEngine, initialWithdrawalRate: mid2, deRiskSchedule: deRiskSchedFinal });
                const potAtSwitch = testRecs[splitT - 1]?.A_end ?? 0;
                const annuityRealInc  = potAtSwitch / avSwitch;
                const drawdownRealInc = ctxP1.V0 * mid2;
                if (annuityRealInc > drawdownRealInc) lo2 = mid2; else hi2 = mid2;
                if (hi2 - lo2 < 1e-8) break;
            }
            iwr1 = (lo2 + hi2) / 2;
        } else {
            iwr1 = spec.primaryEngine.initialWithdrawalRate;
        }

        const phase1Recs = IndividualEngine(ctxP1, { ...spec.primaryEngine, initialWithdrawalRate: iwr1, deRiskSchedule: deRiskSchedFinal });
        const phase1     = phase1Recs.slice(0, splitT);
        const A10        = phase1Recs[splitT - 1]?.A_end ?? 0;

        const phase2Recs = CollectiveEngine(ctx, spec.secondaryEngine, A10, orch.splitAge);
        const phase2     = phase2Recs.slice(0, ctx.T - splitT).map((r, i) => ({
            ...r, t: splitT + i, age: ctx.startAge + splitT + i,
        }));
        records = [...phase1, ...phase2];

    } else if (orch.type === 'parallel') {
        const split    = orch.splitRatio ?? 0.40;
        const ctxFix   = _ctxWithReturn({ ...ctx, V0: ctx.V0 * split },         spec.primaryEngine,   null);
        const ctxFlex  = _ctxWithReturn({ ...ctx, V0: ctx.V0 * (1 - split) },   spec.secondaryEngine, null);

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

// Build a context with engine-specific real return override.
// If useGlidepath=true: builds R_t using the standard age 80→90 de-risk schedule.
// Otherwise: uses engineRealReturn as a flat scalar.
function _ctxWithReturn(ctx, engineSpec, splitT) {
    if (engineSpec.useGlidepath) {
        // Glidepath: age 65-79 = 60% equity, age 80-90 linear, age 90+ = 0% equity
        const R_t = _buildDeRiskSchedule(ctx, splitT ?? null, null);
        return {
            ...ctx,
            R_t,
            nominalReturn: R_t[0],   // age-65 return for display/bisection seed
            realReturn:    engineSpec.engineRealReturn ?? 0.0345,
        };
    }
    const r = engineSpec.engineRealReturn;
    if (r === undefined || r === null) return ctx;
    const nom = (1 + r) * (1 + ctx.inflation) - 1;
    return {
        ...ctx,
        realReturn:    r,
        nominalReturn: nom,
        R_t: new Array(ctx.T).fill(nom),
    };
}

function _runEngine(engineSpec, ctx, splitT) {
    const eCtx = _ctxWithReturn(ctx, engineSpec, splitT);
    // Override targetAge for Prudent Drawdown (bisect to longer horizon)
    const bisectCtx = engineSpec.prudentTargetAge
        ? { ...eCtx, targetAge: Math.min(engineSpec.prudentTargetAge, eCtx.maxAge) }
        : eCtx;
    const iwr = engineSpec.initialWithdrawalRate === 'bisect'
        ? bisectIWR(bisectCtx, engineSpec)
        : engineSpec.initialWithdrawalRate;
    if (engineSpec.type === 'individual') {
        return IndividualEngine(eCtx, { ...engineSpec, initialWithdrawalRate: iwr });
    }
    return CollectiveEngine(eCtx, engineSpec);
}

// Capital market building blocks (consistent with CMAs)
const _CMA = {
    equityReal:  0.055,   // global equity net real return
    bondReal:    0.010,   // bonds / lower-risk net real return
    charges:     0.0025,  // typical retail charges
    glwbFee:     0.0100,  // GLWB rider fee (on top of charges)
};

/**
 * _nomReturnForAllocation(equityPct, inflation, extraFee)
 * Returns nominal return for a given equity allocation.
 */
function _nomReturnForAllocation(equityPct, inflation, extraFee = 0) {
    const real = _CMA.equityReal * equityPct
               + _CMA.bondReal   * (1 - equityPct)
               - _CMA.charges
               - extraFee;
    return (1 + real) * (1 + inflation) - 1;
}

/**
 * _buildDeRiskSchedule(ctx, splitT, startAge)
 * Returns a per-year nominal return array implementing the standard glidepath:
 *   age < 80:  60% equity  (CPI + 3.45%)
 *   age 80-90: linear de-risk from 60% → 0% equity
 *   age >= 90: 0% equity   (CPI + 0.75%)
 * Used by Drawdown and CDC (and the flex phase of Flex→Fix up to splitT).
 * splitT: if set, only fills t=0..splitT-1, rest filled with ctx.nominalReturn.
 */
function _buildDeRiskSchedule(ctx, splitT, _unused) {
    const pi = ctx.inflation;
    const rHigh = _nomReturnForAllocation(0.60, pi);  // full growth
    const rLow  = _nomReturnForAllocation(0.00, pi);  // all bonds
    const inceptAge = ctx.startAge;

    return Array.from({ length: ctx.T }, (_, t) => {
        if (splitT !== null && t >= splitT) return ctx.nominalReturn;
        const age = inceptAge + t;
        if (age < 80) return rHigh;
        if (age >= 90) return rLow;
        // Linear de-risk age 80→90
        const frac = (age - 80) / 10;
        return rHigh * (1 - frac) + rLow * frac;
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

