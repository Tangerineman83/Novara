/**
 * ============================================================
 * FILE: js/data/decum-specs.js
 * PURPOSE: Decumulation strategy specifications — mortality table,
 *          product type definitions, and 8 preset strategy configs.
 * ============================================================
 *
 * WHAT THIS FILE CONTAINS:
 *   S4PMA_QX       — IFoA S4PMA Male Annuitant mortality table.
 *   MORTALITY_MAX_AGE — Table terminus age (110).
 *   PRODUCT_TYPES  — 7 product type definitions (user-facing labels
 *                    mapping to engine parameter defaults).
 *   PRESET_SPECS   — 8 built-in decumulation strategy specifications.
 *
 * ── MORTALITY TABLE ──────────────────────────────────────────────────────────
 * Source: Institute and Faculty of Actuaries (IFoA), S4 Series.
 *   S4PMA = Self-Administered Pension scheme Male Annuitants.
 *   Digitised from CMI_2021 base table with S4PMA scaling factors.
 *   qx = P(death in [x, x+1) | alive at exact age x).
 *   Table runs from age 50 to 110. q_110 = 1.0 (certain death at terminus).
 *   For female mortality, the S4PFA table would apply (not yet implemented).
 *   Table update source: www.actuaries.org.uk/learn-and-develop/
 *     actuarial-tables/standard-mortality-tables
 *
 * ── PRODUCT_TYPES ────────────────────────────────────────────────────────────
 * Schema per entry:
 *   label              {string}  User-facing product name.
 *   description        {string}  Shown in spec inspector tooltip.
 *   engineType         {string}  'collective'|'individual'|'pipeline'|'parallel'
 *   defaults           {object}  Default EngineSpec values. Key fields:
 *     bypassFundingAdjustment {bool} true = GLA (income fixed at inception;
 *                             insurer bears all risk). false = GSA/CDC.
 *     staticReturn    {bool}    true = pool earns pricingRate (GLA/insurer).
 *     pricingDiscountRate {num} Nominal pricing rate (decimal).
 *     realPricingRate {num}     Real pricing rate for CPI-linked products.
 *     mortalityCreditLimit {num} Annual credit cap (0 = fully pooled).
 *     inflationLinkage {string} 'none'|'guaranteed'|'targeted'
 *
 * ── PRESET_SPECS ─────────────────────────────────────────────────────────────
 * Schema per entry:
 *   id              {string}  Unique id. PERMANENT — stored as localStorage
 *                             key for user custom variants. Never rename.
 *   shortName       {string}  Chart/table label (keep ≤10 chars).
 *   color           {string}  Hex colour for chart lines.
 *   isPreset        {bool}    true = built-in, cannot be deleted by user.
 *   orchestration   {object}  { type, splitAge?, splitRatio? }
 *   primaryEngine   {object}  EngineSpec (full schema: see decum-engine.js).
 *   secondaryEngine {object?} EngineSpec for pipeline/parallel second leg.
 *
 * ── KEY ACTUARIAL DEFAULTS ───────────────────────────────────────────────────
 *   GLA  nomPricingRate=3.8%  realPricingRate=1.5%
 *        (UK 20yr gilt ~4.2% less ~0.4% insurer loading)
 *   GSA  nomPricingRate=4.05% realPricingRate=1.6%
 *        (mutual structure: no profit loading vs GLA)
 *   CDC  nomPricingRate=4.0%  inflationLinkage=targeted
 *        (CPI increases discretionary per Aon CDC 2026; Royal Mail design)
 *
 * ── INVESTMENT RETURN DEFAULTS (engineRealReturn) ────────────────────────────
 *   CMA building blocks used: equity 5.5% real, bonds 1.0% real, charges 0.25%.
 *   Drawdown/CDC: 3.45% → 0.75% (60%→0% equity glidepath age 65→90)
 *   CDC:          3.20% (higher charges 0.38% for governance overhead)
 *   GSA:          3.40% (60% equity, flat — pooled scheme, no glidepath)
 *   GLWB:         2.45% (60% equity less 1.0% rider fee)
 *   GLA:          staticReturn=true → pool earns pricingRate
 *   Flex+Fix Flex: 3.90% (70% equity — annuity floor permits higher risk)
 *
 * ── SOURCES ──────────────────────────────────────────────────────────────────
 *   Aon: "CDC: Everything you need to know in 2026" (Actuarial Post)
 *   WTW: "Reimagining Pensions in the UK" (2024)
 *   ART: Australian Retirement Trust Balanced Risk-Adjusted product
 *        (CPI+4.0% target return — anchor for GSA return assumption)
 *
 * DEPENDENCIES:
 *   None (pure data). Consumed by: decum-engine.js.
 *   Loaded before decum-engine.js via <script> tag in index.html.
 *
 * AUDIT TRAIL:
 * ┌─────────────┬──────────────┬──────────────────────────────────────────────┐
 * │ Date        │ Author       │ Description                                  │
 * ├─────────────┼──────────────┼──────────────────────────────────────────────┤
 * │ 2026-01-01  │ Novara       │ Initial 7 preset specs in decum-engine.js    │
 * │ 2026-03-01  │ Novara/AI    │ GLA pool fix; CDC mortality per Aon/WTW      │
 * │ 2026-04-01  │ Novara/AI    │ Strategy-specific returns (CMA framework)    │
 * │ 2026-05-01  │ Novara/AI    │ Prudent Drawdown (8th preset) added          │
 * │ 2026-05-27  │ Novara/AI    │ Extracted from decum-engine.js v58.20        │
 * └─────────────┴──────────────┴──────────────────────────────────────────────┘
 *
 * FOR AI ASSISTANTS:
 *   - PRESET_SPECS id values are permanent foreign keys. Never rename.
 *   - GLA bypassFundingAdjustment=true is the critical GLA flag — do not
 *     copy it to GSA or CDC entries.
 *   - CDC inflationLinkage="targeted" is correct. Do not change to "guaranteed".
 *   - pricingDiscountRate and realPricingRate are interdependent: if gilt
 *     yields shift, update both consistently (real = nominal - inflation).
 *   - S4PMA_QX: update only when IFoA publishes revised S-series tables.
 *   - q_110 = 1.0 is intentional and must remain (table terminus).
 */

// Exposed as window._decum_specs for decum-engine.js to consume.
// Loaded via <script> tag in index.html BEFORE decum-engine.js.
window._decum_specs = (function() {
  'use strict';

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
            engineRealReturn: 0.0345,  // 60% equity at 65 (CPI+3.45%)
            useGlidepath: true,           // de-risks age 80→90 to 100% bonds
        },
    },
    {
        id: 'preset_gsa', name: 'Group Self-Annuitisation (GSA)',
        shortName: 'GSA', color: '#7E22CE', isPreset: true,
        orchestration: { type: 'single' },
        primaryEngine: {
            type: 'collective', productType: 'gsa',
            bypassFundingAdjustment: false, staticReturn: false,
            pricingDiscountRate: 0.0405, realPricingRate: 0.013,  // lower than GLA (1.5%) — money-back guarantee adds cost
            mortalityCreditLimit: 0.0125, hasNominalMoneyBack: true,
            inflationLinkage: 'guaranteed',
            engineRealReturn: 0.0340,  // 60% equity pooled (matches ART Balanced Risk-Adjusted)
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
            mortalityCreditLimit: 0.0,
            // CDC: no mortality credits flow to assets (deaths reduce LIABILITY, not assets).
            // Mortality benefit captured via shrinking actuarialReserve → improving FR.
            // Income adjustments follow rules-based FR mechanism. Aon/WTW 2024/2026.
            hasNominalMoneyBack: false,
            inflationLinkage: 'targeted',
            // CPI granted year-by-year only when FR>=1. In central case: consistently
            // granted → stable real income. In adverse scenarios: withheld → real declines.
            engineRealReturn: 0.0320,  // 60% equity less 0.38% charges (actuarial governance overhead vs drawdown's 0.25%)
            useGlidepath: true,           // de-risks age 80→90, consistent with drawdown
            // ~CPI+3.20% at 65, transitioning to ~CPI+0.52% at 90 — consistent surplus over 4% prudent rate supports CPI grants.
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
            engineRealReturn: 0.0245,  // 60% equity less 1% rider fee = CPI+2.45%
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
            // GLA staticReturn=true: pool earns pricingRate, not engineRealReturn
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
            engineRealReturn: 0.0345,  // 60% equity at 65
            useGlidepath: true,            // glidepath toward switchAge
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
        id: 'preset_drawdown_prudent', name: 'Invested Portfolio (Prudent Drawdown)',
        shortName: 'Drawdown*', color: '#93C5FD', isPreset: true,
        // "Prudent Drawdown": same as Drawdown but bisects IWR to zero at age 105, not
        // the planning horizon. Illustrates the real cost of longevity uncertainty for
        // an unconstrained individual who must self-insure their longevity tail.
        // The income gap vs standard Drawdown quantifies what pooling is worth.
        orchestration: { type: 'single' },
        primaryEngine: {
            type: 'individual', productType: 'drawdown',
            incomeRule: 'FIXED_REAL', initialWithdrawalRate: 'bisect',
            riderFee: 0.0, inflationLinkage: 'guaranteed', deRiskYears: 0,
            engineRealReturn: 0.0345,
            useGlidepath: true,
            prudentTargetAge: 105,   // bisect to zero at 105, not ctx.targetAge
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
            engineRealReturn: 0.0390,  // 70% equity (CPI+3.90%): annuity floor permits higher risk
        },
    },
];

/* ══════════════════════════════════════════════════════════════════
   9. CUSTOM STRATEGY PERSISTENCE
   Separate namespace from main app.
   ══════════════════════════════════════════════════════════════════ */

  return { S4PMA_QX, MORTALITY_MAX_AGE, PRODUCT_TYPES, PRESET_SPECS };
})();
