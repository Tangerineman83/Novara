/**
 * decum-engine.js — Dual-Engine Decumulation Module
 * Self-contained; no dependencies on main app state.
 * 
 * Exports (as window.DecumEngine):
 *   runPreset(presetId, ctx)  → UnifiedTimeline
 *   runAllPresets(ctx)        → { [presetId]: UnifiedTimeline }
 *   buildContext(params)      → GlobalContext
 *   PRESETS                   → preset metadata array
 */
(function(global) {
'use strict';

/* ═══════════════════════════════════════════════════════════════════
   1. S4PMA MALE ANNUITANT MORTALITY TABLE
   Source: Institute and Faculty of Actuaries S4 Series
   qx = probability of dying in year of age [x, x+1)
   Values digitised from CMI_2021 base table with S4PMA scaling.
   ═══════════════════════════════════════════════════════════════════ */
const S4PMA_QX = {
   50:0.00303, 51:0.00334, 52:0.00369, 53:0.00408, 54:0.00451,
   55:0.00499, 56:0.00552, 57:0.00612, 58:0.00680, 59:0.00756,
   60:0.00842, 61:0.00939, 62:0.01048, 63:0.01170, 64:0.01307,
   65:0.01462, 66:0.01636, 67:0.01831, 68:0.02051, 69:0.02299,
   70:0.02577, 71:0.02888, 72:0.03236, 73:0.03624, 74:0.04055,
   75:0.04533, 76:0.05062, 77:0.05645, 78:0.06286, 79:0.06989,
   80:0.07757, 81:0.08594, 82:0.09504, 83:0.10489, 84:0.11551,
   85:0.12691, 86:0.13910, 87:0.15208, 88:0.16584, 89:0.18037,
   90:0.19565, 91:0.21165, 92:0.22833, 93:0.24564, 94:0.26352,
   95:0.28190, 96:0.30072, 97:0.31988, 98:0.33929, 99:0.35885,
  100:0.37847,101:0.39805,102:0.41749,103:0.43669,104:0.45555,
  105:0.47397,106:0.49186,107:0.50912,108:0.52569,109:0.54148,
  110:1.00000
};

/** Cumulative survival probability: P(alive at age x+t | alive at x) */
function survivalProb(x0, t) {
    let p = 1.0;
    for (let j = 0; j < t; j++) {
        const age = x0 + j;
        const qx = S4PMA_QX[Math.min(age, 110)] ?? 1.0;
        p *= (1 - qx);
    }
    return p;
}

/** Build full survival curve from age x0 to maxAge */
function buildSurvivalCurve(x0, maxAge) {
    const curve = [];
    let p = 1.0;
    for (let age = x0; age <= maxAge; age++) {
        curve.push({ age, tpx: p });
        const qx = S4PMA_QX[Math.min(age, 110)] ?? 1.0;
        p *= (1 - qx);
    }
    return curve;  // curve[t].tpx = P(alive at x0+t | alive at x0)
}

/* ═══════════════════════════════════════════════════════════════════
   2. GLOBAL CONTEXT BUILDER
   ═══════════════════════════════════════════════════════════════════ */
/**
 * buildContext(params) → GlobalContext
 * params: {
 *   pot:          float  — initial pot value (£)
 *   startAge:     int    — age at decumulation start (default 65)
 *   targetAge:    int    — target death age for planning (default 90)
 *   maxAge:       int    — maximum age for simulation (default 100)
 *   realReturn:   float  — annual real investment return (default 0.035)
 *   inflation:    float  — annual inflation assumption (default 0.025)
 *   discountRate: float  — nominal discount rate for APV (default 0.045)
 *   gender:       string — 'male' (S4PMA) | 'female' (future: S4PFA)
 * }
 */
function buildContext(params = {}) {
    const startAge     = params.startAge     ?? 65;
    const targetAge    = params.targetAge    ?? 90;
    const maxAge       = params.maxAge       ?? 100;
    const realReturn   = params.realReturn   ?? 0.035;
    const inflation    = params.inflation    ?? 0.025;
    const nominalReturn = (1 + realReturn) * (1 + inflation) - 1;
    const discountRate = params.discountRate ?? 0.045;
    const T = maxAge - startAge + 1;

    // Economic vectors (deterministic central scenario)
    const R_t  = new Array(T).fill(nominalReturn);  // nominal total return
    const pi_t = new Array(T).fill(inflation);       // inflation
    const DF_t = Array.from({length:T}, (_,t) => Math.pow(1+discountRate, -(t)));

    // Survival curve from startAge
    const survival = buildSurvivalCurve(startAge, maxAge);

    return {
        V0: params.pot ?? 100000,
        startAge, targetAge, maxAge, T,
        realReturn, inflation, nominalReturn, discountRate,
        R_t, pi_t, DF_t,
        survival,   // [{age, tpx}] indexed by t (t=0 → startAge)
    };
}

/* ═══════════════════════════════════════════════════════════════════
   3. INDIVIDUAL ACCOUNT ENGINE
   ═══════════════════════════════════════════════════════════════════ */
/**
 * IndividualEngine(ctx, params) → YearlyRecord[]
 * params: {
 *   incomeRule:            'FIXED_REAL' | 'GLWB_RATCHET' | 'DYNAMIC_VARIABLE'
 *   initialWithdrawalRate: float   (fraction of V0 withdrawn in year 1, real)
 *   riderFee:              float   (annual fee on asset base, e.g. 0.01 for GLWB)
 *   deRiskSchedule:        array   (optional: [{t, targetReturn}] override for Preset 6)
 * }
 * Returns array of length T, one record per year t=0..T-1:
 *   { t, age, A_start, withdrawal, fee, A_end, income_real, bequest, tpx }
 */
function IndividualEngine(ctx, params) {
    const { V0, startAge, T, R_t, pi_t, survival } = ctx;
    const iwr   = params.initialWithdrawalRate ?? 0.05;
    const fee   = params.riderFee ?? 0.0;
    const rule  = params.incomeRule ?? 'FIXED_REAL';

    const records = [];
    let A = V0;
    let baseIncome = V0 * iwr;       // Real base income (FIXED_REAL / GLWB floor)
    let glwbFloor  = V0 * iwr;       // GLWB ratchet floor (steps up on market gains)
    let cumulInflation = 1.0;

    for (let t = 0; t < T; t++) {
        const age  = startAge + t;
        const tpx  = survival[t]?.tpx ?? 0;
        if (tpx < 1e-6) {
            records.push({ t, age, A_start:0, withdrawal:0, fee:0, A_end:0, income_real:0, bequest:0, tpx:0 });
            continue;
        }

        const R = (params.deRiskSchedule
            ? (params.deRiskSchedule[t] ?? R_t[t])
            : R_t[t]);

        const A_start = A;
        cumulInflation *= (1 + pi_t[t]);

        // Determine withdrawal
        let withdrawal;
        switch(rule) {
            case 'GLWB_RATCHET': {
                // Asset grows, then ratchet: floor = max(floor, riderRate * A_grown_preWithdrawal)
                const A_pre = A_start * (1 + R - fee);
                const ratchetIncome = A_pre * iwr;
                glwbFloor = Math.max(glwbFloor, ratchetIncome);
                withdrawal = Math.min(glwbFloor, A_pre);
                break;
            }
            case 'DYNAMIC_VARIABLE': {
                // RMD-style: withdraw remaining pot / expected remaining years
                const yearsLeft = Math.max(1, ctx.targetAge - age);
                withdrawal = Math.max(0, A_start / yearsLeft);
                break;
            }
            case 'FIXED_REAL':
            default: {
                // Inflation-adjusted fixed real income
                withdrawal = baseIncome * cumulInflation;
                break;
            }
        }

        // Apply growth, fee, withdrawal
        const feeCharge = A_start * fee;
        const A_grown   = A_start * (1 + R) - feeCharge;
        const A_end     = Math.max(0, A_grown - withdrawal);

        // Real income (deflated back to start-of-period real terms)
        const income_real = withdrawal / cumulInflation;

        records.push({
            t, age,
            A_start,
            withdrawal,
            fee:      feeCharge,
            A_end,
            income_real,
            bequest:  A_end,     // full pot at death (all years)
            tpx,
        });

        A = A_end;
        if (A <= 0) {
            // Pot exhausted — fill remainder with zeros
            for (let tt = t + 1; tt < T; tt++) {
                records.push({ t:tt, age:startAge+tt, A_start:0, withdrawal:0, fee:0, A_end:0, income_real:0, bequest:0, tpx:survival[tt]?.tpx??0 });
            }
            break;
        }
    }

    // Pad if early exit
    while (records.length < T) {
        const tt = records.length;
        records.push({ t:tt, age:startAge+tt, A_start:0, withdrawal:0, fee:0, A_end:0, income_real:0, bequest:0, tpx:survival[tt]?.tpx??0 });
    }
    return records;
}

/* ═══════════════════════════════════════════════════════════════════
   4. COLLECTIVE POOL ENGINE
   ═══════════════════════════════════════════════════════════════════ */
/**
 * CollectiveEngine(ctx, params, V0_override, startAgeOverride) → YearlyRecord[]
 * params: {
 *   pricingDiscountRate:   float   (scheme valuation/hurdle rate)
 *   mortalityCreditLimit:  float   (cap on distributed survival credit; 0 = fully pooled)
 *   hasNominalMoneyBack:   boolean (nominal capital protection guarantee)
 *   staticReturn:          boolean (override R_t with pricingDiscountRate — for GLA)
 * }
 * V0_override: optional starting pool value (for Preset 6 splice)
 * startAgeOverride: optional inception age (for Preset 6, shift mortality index to age 75)
 */
function CollectiveEngine(ctx, params, V0_override, startAgeOverride) {
    const { startAge: ctxStart, T, R_t, pi_t, survival } = ctx;
    const V0        = V0_override ?? ctx.V0;
    const inceptAge = startAgeOverride ?? ctxStart;
    const r         = params.pricingDiscountRate   ?? 0.05;
    const creditCap = params.mortalityCreditLimit   ?? 0.00;
    const moneyBack = params.hasNominalMoneyBack    ?? false;
    const staticRet = params.staticReturn           ?? false;

    // Build local survival from inceptAge if different from ctxStart
    const localSurvival = buildSurvivalCurve(inceptAge, inceptAge + T - 1);

    // Initial unit price: computed so unit income = pricingDiscountRate × unit value
    // Standard actuarial annuity pricing: unit_price = Σ_t tpx × DF_t(r)
    // where DF_t(r) = (1+r)^{-t} using pricing discount rate
    let actuarialValue = 0;
    for (let t = 0; t < T; t++) {
        const tpx = localSurvival[t]?.tpx ?? 0;
        actuarialValue += tpx * Math.pow(1 + r, -(t));
    }
    if (actuarialValue < 1e-10) actuarialValue = 1;

    // Annual income per £1 of pot = 1 / actuarialValue (fair annuity price)
    const annualIncomePerPound = 1.0 / actuarialValue;
    const baseAnnualIncome = V0 * annualIncomePerPound;

    // Pool asset simulation
    // Pool holds the aggregate of all survivors' capital
    // Mortality credits = capital of deceased members redistributed to survivors
    const records = [];
    let poolAssets = V0;
    let unitsOutstanding = 1.0;   // normalised: 1 unit = full pool share
    let guaranteeAccount = moneyBack ? V0 : 0;  // nominal capital tracking
    let cumulInflation = 1.0;

    for (let t = 0; t < T; t++) {
        const localT = t;
        const age  = inceptAge + t;
        const tpx  = localSurvival[localT]?.tpx ?? 0;
        const tpx1 = localSurvival[localT+1]?.tpx ?? 0;
        const qx   = tpx > 1e-10 ? 1 - tpx1/tpx : 1.0;  // q_{x+t}

        if (tpx < 1e-6) {
            records.push({ t, age, A_start:0, withdrawal:0, fee:0, A_end:0, income_real:0, bequest:0, tpx:0 });
            continue;
        }

        const A_start = poolAssets;
        cumulInflation *= (1 + pi_t[Math.min(t, pi_t.length-1)]);

        // Pool investment return
        const R = staticRet ? r : R_t[Math.min(t, R_t.length-1)];
        const investmentReturn = poolAssets * R;

        // Income payment to this cohort year
        // CDC/GSA: income adjusted for funding level
        // For simplicity, income = fair actuarial level adjusted by pool funding ratio
        const fundingRatio = poolAssets / Math.max(1, V0 * tpx);
        const rawIncome = baseAnnualIncome * Math.min(1.1, Math.max(0.5, fundingRatio));

        // Mortality credit: capital released by deaths = qx × poolAssets
        const mortalityCredit = qx * poolAssets;
        const cappedCredit = creditCap > 0
            ? Math.min(mortalityCredit, creditCap * poolAssets)
            : mortalityCredit;  // 0 creditCap means fully pooled (no cap)

        // Net pool assets after income, growth, mortality credit redistribution
        const A_end = Math.max(0,
            poolAssets + investmentReturn - rawIncome - (moneyBack ? 0 : mortalityCredit - cappedCredit)
        );

        // Bequest: nominal money-back guarantee amortizes over expected lifetime
        let bequest = 0;
        if (moneyBack) {
            guaranteeAccount = Math.max(0, guaranteeAccount - (rawIncome * 0.5));
            bequest = guaranteeAccount / Math.max(1, T - t);  // amortised nominal guarantee
        }

        const income_real = rawIncome / cumulInflation;

        records.push({
            t, age,
            A_start,
            withdrawal: rawIncome,
            fee:        0,
            A_end,
            income_real,
            bequest,
            tpx,
        });

        poolAssets = A_end;
        if (poolAssets <= 0) {
            for (let tt = t+1; tt < T; tt++) {
                records.push({ t:tt, age:inceptAge+tt, A_start:0, withdrawal:0, fee:0, A_end:0, income_real:0, bequest:0, tpx:localSurvival[tt]?.tpx??0 });
            }
            break;
        }
    }

    while (records.length < T) {
        const tt = records.length;
        records.push({ t:tt, age:inceptAge+tt, A_start:0, withdrawal:0, fee:0, A_end:0, income_real:0, bequest:0, tpx:localSurvival[tt]?.tpx??0 });
    }
    return records;
}

/* ═══════════════════════════════════════════════════════════════════
   5. BISECTION SOLVER (for Preset 1 goal-seek on IWR)
   ═══════════════════════════════════════════════════════════════════ */
function bisectIWR(ctx, targetEndBalance) {
    // Find initialWithdrawalRate such that A at targetAge ≈ targetEndBalance (default 0)
    let lo = 0.001, hi = 0.20;
    const targetT = ctx.targetAge - ctx.startAge;
    for (let iter = 0; iter < 60; iter++) {
        const mid = (lo + hi) / 2;
        const recs = IndividualEngine(ctx, { incomeRule:'FIXED_REAL', initialWithdrawalRate:mid, riderFee:0 });
        const endA = recs[Math.min(targetT, recs.length-1)]?.A_end ?? 0;
        if (endA > targetEndBalance) lo = mid;
        else hi = mid;
        if (hi - lo < 1e-7) break;
    }
    return (lo + hi) / 2;
}

/* ═══════════════════════════════════════════════════════════════════
   6. APV COMPUTATION
   ═══════════════════════════════════════════════════════════════════ */
function computeAPV(records, ctx) {
    const { DF_t } = ctx;
    let apvIncome = 0, apvBequest = 0;
    records.forEach((r, t) => {
        const df = DF_t[Math.min(t, DF_t.length-1)];
        const tpx = r.tpx;
        // APV of income: E[PV of each payment] = tpx × DF_t × income
        apvIncome  += tpx * df * (r.withdrawal || 0);
        // APV of bequest: probability of dying in [t, t+1] × DF × bequest
        const survival_t0 = records[t]?.tpx ?? 1;
        const survival_t1 = records[t+1]?.tpx ?? 0;
        const probDieInYear = Math.max(0, survival_t0 - survival_t1);
        apvBequest += probDieInYear * df * (r.bequest || 0);
    });
    const totalNormalized = (apvIncome + apvBequest) / ctx.V0;
    return { apvIncome, apvBequest, totalNormalized };
}

/* ═══════════════════════════════════════════════════════════════════
   7. PRESET DEFINITIONS
   ═══════════════════════════════════════════════════════════════════ */
const PRESETS = [
    {
        id: 1, key:'drawdown',
        name:'Invested Portfolio (Drawdown)',
        shortName:'Drawdown',
        color:'#1D4ED8',
        description:'Fund invested; sustainable income from capital. Member bears all longevity and sequence risk. Full bequest of residual pot.',
        engineType:'individual',
        params:{ incomeRule:'FIXED_REAL', riderFee:0.00 },
        usesBisection:true,
    },
    {
        id: 2, key:'gsa',
        name:'Group Self-Annuitisation (GSA)',
        shortName:'GSA',
        color:'#7E22CE',
        description:'Collective pool with mortality credits distributed to survivors. Nominal money-back guarantee. Higher sustainable income than pure drawdown.',
        engineType:'collective',
        params:{ pricingDiscountRate:0.05, mortalityCreditLimit:0.0125, hasNominalMoneyBack:true },
    },
    {
        id: 3, key:'cdc',
        name:'Collective Defined Contribution (CDC)',
        shortName:'CDC',
        color:'#047857',
        description:'Scheme-managed collective pool at prudent valuation rate. Full mortality pooling; no bequest. Smoothed, predictable income.',
        engineType:'collective',
        params:{ pricingDiscountRate:0.04, mortalityCreditLimit:0.00, hasNominalMoneyBack:false },
    },
    {
        id: 4, key:'glwb',
        name:'Guaranteed Lifetime Withdrawal Benefit (GLWB)',
        shortName:'GLWB',
        color:'#B45309',
        description:'Insurance-backed guarantee with ratchet upside. Income floor locked in; pot can grow. Annual rider fee charged on asset base.',
        engineType:'individual',
        params:{ incomeRule:'GLWB_RATCHET', initialWithdrawalRate:0.05, riderFee:0.01 },
    },
    {
        id: 5, key:'gla',
        name:'Guaranteed Lifetime Annuity (GLA)',
        shortName:'GLA',
        color:'#0E7490',
        description:'Full risk transfer to insurer. Level nominal income for life; zero bequest. Priced at backing bond yield minus margin.',
        engineType:'collective',
        params:{ pricingDiscountRate:0.035, mortalityCreditLimit:0.00, hasNominalMoneyBack:false, staticReturn:true },
    },
    {
        id: 6, key:'flex_then_fix',
        name:'"Flex then Fix" (Phased Hybrid)',
        shortName:'Flex→Fix',
        color:'#DC2626',
        description:'Drawdown ages 65–74 with de-risking glidepath, then full annuitisation at 75. Combines flexibility early-retirement with longevity protection late.',
        engineType:'pipeline',
        splitAge: 75,
    },
    {
        id: 7, key:'flex_and_fix',
        name:'"Flex and Fix" (Concurrent Hybrid)',
        shortName:'Flex+Fix',
        color:'#CA8A04',
        description:'Simultaneous split: X% to annuity (essential income floor), (100−X)% to drawdown (flexible spending). User-defined split ratio.',
        engineType:'parallel',
        defaultSplitRatio: 0.40,  // 40% to annuity by default
    },
];

/* ═══════════════════════════════════════════════════════════════════
   8. PRESET ORCHESTRATION
   ═══════════════════════════════════════════════════════════════════ */
function runPreset(presetIdOrKey, ctx, overrideParams) {
    const preset = PRESETS.find(p => p.id === presetIdOrKey || p.key === presetIdOrKey);
    if (!preset) throw new Error(`Unknown preset: ${presetIdOrKey}`);

    const params = { ...preset.params, ...overrideParams };
    let records;

    if (preset.engineType === 'individual') {
        // Bisect IWR for Preset 1 (target zero pot at targetAge)
        if (preset.usesBisection) {
            const iwr = bisectIWR(ctx, 0);
            params.initialWithdrawalRate = iwr;
        }
        records = IndividualEngine(ctx, params);

    } else if (preset.engineType === 'collective') {
        records = CollectiveEngine(ctx, params);

    } else if (preset.engineType === 'pipeline') {
        // Preset 6: IndividualEngine t=0..9 → CollectiveEngine from t=10
        const splitT = preset.splitAge - ctx.startAge;  // = 10 if startAge=65
        // Build de-risk schedule: declining real return over 10 years
        const deRiskSchedule = Array.from({length: ctx.T}, (_,t) => {
            if (t >= splitT) return ctx.nominalReturn;
            // Linear glidepath: from full real return to risk-free over splitT years
            const riskFreeNominal = (1 + 0.01) * (1 + ctx.inflation) - 1;
            const frac = t / splitT;
            return ctx.nominalReturn * (1 - frac) + riskFreeNominal * frac;
        });

        // Phase 1: Drawdown with de-risking
        const iwr1 = bisectIWR(ctx, 0) * 0.85;  // slightly conservative (leave residual for annuitisation)
        const phase1Params = { incomeRule:'FIXED_REAL', initialWithdrawalRate:iwr1, riderFee:0, deRiskSchedule };
        const allRecs1 = IndividualEngine(ctx, phase1Params);
        const phase1 = allRecs1.slice(0, splitT);
        const A10 = allRecs1[splitT - 1]?.A_end ?? 0;

        // Phase 2: Annuity from residual pot at splitAge
        const glaParams = { pricingDiscountRate:0.035, mortalityCreditLimit:0.00, hasNominalMoneyBack:false, staticReturn:true };
        const phase2 = CollectiveEngine(ctx, glaParams, A10, preset.splitAge);
        // Splice: shift phase2 t indices to match full timeline
        const phase2Adjusted = phase2.slice(0, ctx.T - splitT).map((r, i) => ({
            ...r, t: splitT + i, age: ctx.startAge + splitT + i
        }));
        records = [...phase1, ...phase2Adjusted];

    } else if (preset.engineType === 'parallel') {
        // Preset 7: Parallel split
        const splitRatio = params.splitRatio ?? preset.defaultSplitRatio;
        const V_fix  = ctx.V0 * splitRatio;
        const V_flex = ctx.V0 * (1 - splitRatio);

        const glaParams  = { pricingDiscountRate:0.035, mortalityCreditLimit:0.00, hasNominalMoneyBack:false, staticReturn:true };
        const flexParams = { incomeRule:'FIXED_REAL', riderFee:0.00 };
        const iwr = bisectIWR({ ...ctx, V0: V_flex }, 0);
        flexParams.initialWithdrawalRate = iwr;

        const fixRecs  = CollectiveEngine({ ...ctx, V0: V_fix  }, glaParams);
        const flexRecs = IndividualEngine({ ...ctx, V0: V_flex }, flexParams);

        // Aggregate: income = sum; bequest = flex only (annuity has no bequest by default)
        records = fixRecs.map((fr, t) => {
            const fl = flexRecs[t] ?? { withdrawal:0, income_real:0, A_end:0, bequest:0, tpx:fr.tpx };
            return {
                t: fr.t, age: fr.age,
                A_start:   (fr.A_start || 0) + (fl.A_start || 0),
                withdrawal:(fr.withdrawal || 0) + (fl.withdrawal || 0),
                fee:       fl.fee || 0,
                A_end:     (fr.A_end || 0) + (fl.A_end || 0),
                income_real:(fr.income_real || 0) + (fl.income_real || 0),
                bequest:   fl.bequest || 0,   // only flex portion is inheritable
                tpx:       fr.tpx,
                splitRatio,
            };
        });
    }

    // Ensure records cover full T
    while (records.length < ctx.T) {
        const tt = records.length;
        records.push({ t:tt, age:ctx.startAge+tt, A_start:0, withdrawal:0, fee:0, A_end:0, income_real:0, bequest:0, tpx:ctx.survival[tt]?.tpx??0 });
    }
    records = records.slice(0, ctx.T);

    const apv = computeAPV(records, ctx);
    return { preset, records, apv, ctx };
}

function runAllPresets(ctx, overrides) {
    const results = {};
    PRESETS.forEach(p => {
        try {
            results[p.key] = runPreset(p.id, ctx, overrides?.[p.key]);
        } catch(e) {
            console.warn(`Preset ${p.name} failed:`, e);
        }
    });
    return results;
}

/* ═══════════════════════════════════════════════════════════════════
   9. PUBLIC API
   ═══════════════════════════════════════════════════════════════════ */
global.DecumEngine = {
    buildContext,
    runPreset,
    runAllPresets,
    PRESETS,
    S4PMA_QX,
    buildSurvivalCurve,
    computeAPV,
    // Expose engines directly for testing
    IndividualEngine,
    CollectiveEngine,
};

})(window);
