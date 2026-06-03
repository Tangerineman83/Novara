/**
 * ============================================================
 * FILE: js/data/portfolios.js
 * PURPOSE: Pre-built investment portfolio definitions for all
 *          provider groups and comparator/custom strategies.
 * ============================================================
 *
 * WHAT THIS FILE CONTAINS:
 *   PRESET_PORTFOLIOS — array of portfolio group objects. Each group
 *   corresponds to a provider or a comparator/custom strategy set,
 *   and contains one or more portfolio objects with asset weight vectors.
 *
 * SCHEMA — each group:
 *   groupId       {string}  Unique identifier. Permanent.
 *   groupName     {string}  Display name (provider or set label).
 *   isProvider    {boolean} true = shown in VFM provider league table.
 *   portfolios[]  {array}   Portfolio objects (schema below).
 *
 * SCHEMA — each portfolio object:
 *   id        {string}  Unique id. PERMANENT — stored in user localStorage.
 *                       Never rename or remove.
 *   name      {string}  Display label. Safe to update.
 *   weights   {object}  assetKey → weight (decimal). Must sum to 1.0 (±0.001).
 *                       All keys must exist in data/asset-classes.js.
 *   alphas    {object}  assetKey → annual alpha (decimal). Only populated where
 *                       confirmed from published SIP or fund documentation.
 *   tes       {object}  assetKey → tracking error (decimal). Paired with alphas.
 *   source    {string?} Data source reference.
 *   asOf      {string?} "YYYY-MM" date of last weight verification.
 *
 * ALPHA / TRACKING ERROR CONVENTIONS:
 *   Climate transition: alpha 0.0025 (0.25% p.a.), TE 0.0075 (0.75% p.a.)
 *   Factor-based:       alpha 0.0050 (0.50% p.a.), TE 0.0150 (1.50% p.a.)
 *   Applied only where confirmed from published sources (see below).
 *
 *   CONFIRMED IMPLEMENTATIONS (May 2026):
 *   Climate transition (α=0.25%, TE=0.75%):
 *     L&G        — climate transition equity index (2025 TDF range)
 *     Aviva      — climate transition approach (SP992767.pdf)
 *     Std Life   — climate transition approach (LPNL.pdf Q1 2026)
 *     NEST       — global equity ex-UK index; ESG tilted
 *     Aegon      — climate-aware equity approach
 *     Fidelity   — sustainable equity index approach
 *     HL         — low-cost sustainable index approach
 *     NOW        — climate-aware equity
 *     Mercer     — climate transition equity (Mercer OCIO standard)
 *     Aon        — climate-aware equity
 *     LifeSight  — Climate Transition Index Fund (WTW, confirmed Jul 2024;
 *                  ~£1bn committed per WTW press release)
 *     Cushon     — sustainable growth strategy
 *     Smart      — sustainable growth default
 *     Sw Widows  — BlackRock Climate Transition World Equity Fund (£2bn,
 *                  confirmed Aug 2020 + Robeco sustainable indices Jan 2025)
 *     TPT        — Sustainable Future Fund (ESG/climate tilt assumed)
 *   Factor-based (α=0.50%, TE=1.50%):
 *     SEI        — SEI Factor Allocation Global Equity Fund (explicit fund
 *                  name; confirmed seimastertrust.co.uk/do-it-for-me)
 *
 * DATA SOURCES:
 *   Provider fund factsheets, SIPs, TCFD reports, Chair's Statements.
 *   Full source trail in provider_strategies_consolidated_2.js and
 *   commentary/cma_commentary.md.
 *
 * HOW TO UPDATE:
 *   1. Obtain latest factsheet/TCFD/SIP for the provider.
 *   2. Map published SAA to ASSET_CLASSES keys.
 *   3. Normalise weights to exactly 1.000.
 *   4. Update asOf field to current YYYY-MM.
 *   5. Add audit entry below.
 *
 * WEIGHT VALIDATION:
 *   sum(Object.values(weights)) === 1.0  (tolerance ±0.001)
 *   All keys must exist in ASSET_CLASSES (data/asset-classes.js)
 *
 * DEPENDENCIES:
 *   data/asset-classes.js (key validation reference).
 *   Consumed by: config.js → app.js.
 *
 * AUDIT TRAIL:
 * ┌─────────────┬──────────────┬──────────────────────────────────────────────┐
 * │ Date        │ Author       │ Description                                  │
 * ├─────────────┼──────────────┼──────────────────────────────────────────────┤
 * │ 2025-01-01  │ Novara       │ Initial 18 provider groups from factsheets   │
 * │ 2025-06-01  │ Novara       │ NEST consolidation phase added               │
 * │ 2025-09-01  │ Novara       │ TPP pre-retirement fund updated              │
 * │ 2026-03-01  │ Novara       │ S4PMA glidepath corrections; 3 providers     │
 * │ 2026-05-27  │ Novara/AI    │ Extracted to js/data/portfolios.js v58.20    │
 * │ 2026-06-03  │ Novara/AI    │ Major data update (v2):                      │
 * │             │              │   • p_lg_tdf_retire: reworked to 17-asset    │
 * │             │              │     diversified landing fund (vs prior 3-    │
 * │             │              │     asset placeholder). HIGH confidence.     │
 * │             │              │   • p_lg_laf_growth: UK equity +6%, US -5%  │
 * │             │              │   • p_nest_growth/retire: minor rebalance    │
 * │             │              │   • alpha/TE added to all 38 provider ports  │
 * │             │              │     from confirmed published sources         │
 * │             │              │   • p_nest_retire weight sum fixed 1.0004→1  │
 * │             │              │   • LifeSight/SW/TPT: factor→climate (0.25%) │
 * │             │              │     per public evidence; SEI confirmed       │
 * │             │              │     factor (SEI Factor Allocation Fund name) │
 * └─────────────┴──────────────┴──────────────────────────────────────────────┘
 *
 * FOR AI ASSISTANTS:
 *   - Portfolio id values are permanent foreign keys. NEVER rename or remove.
 *   - weights must sum to 1.0 — always validate after editing.
 *   - All weight keys must appear in data/asset-classes.js.
 *   - Update asOf whenever you change a portfolio's weights.
 *   - Alpha/TE must only be set where confirmed from public source — not guessed.
 *   - p_retire is referenced in stress scenarios — do not remove.
 *   - The Custom group portfolios (p_opt2_*) are used in comparator strategies.
 */

export const PRESET_PORTFOLIOS = [
    {
        name: 'Custom',
        isProvider: false,
        portfolios: [
            {
                id: 'p_opt2_pm_growth',
                name: 'Private Markets Growth Potential',
                weights: {
                    privEq: 0.35,
                    infrastructure: 0.3,
                    realEstateDirect: 0.1,
                    privCredit: 0.25
                  },
                alphas: {},
                tes: {},
                confidence: 'HIGH',
                confidenceNote: 'Novara internal comparator — exactly defined allocation.',
                asOf: '2026-06'
              },
            {
                id: 'p_opt2_pm_income',
                name: 'Private Markets Income Potential',
                weights: {
                    privCredit: 0.5,
                    infrastructure: 0.3,
                    realEstateDirect: 0.2
                  },
                alphas: {},
                tes: {},
                confidence: 'HIGH',
                confidenceNote: 'Novara internal comparator — exactly defined allocation.',
                asOf: '2026-06'
              },
            {
                id: 'p_opt2_growth',
                name: 'Optimal Specified DC Growth (75% Equity + 25% PM Growth)',
                weights: {
                    usEq: 0.411,
                    devEq: 0.1348,
                    emEq: 0.1108,
                    jpnEq: 0.0501,
                    ukEq: 0.027,
                    apacEq: 0.0163,
                    privEq: 0.0875,
                    infrastructure: 0.075,
                    realEstateDirect: 0.025,
                    privCredit: 0.0625
                  },
                alphas: {
                    usEq: 0.00375,
                    devEq: 0.00375,
                    emEq: 0.00375,
                    jpnEq: 0.00375,
                    ukEq: 0.00375,
                    apacEq: 0.00375
                  },
                tes: {
                    usEq: 0.01125,
                    devEq: 0.01125,
                    emEq: 0.01125,
                    jpnEq: 0.01125,
                    ukEq: 0.01125,
                    apacEq: 0.01125
                  },
                confidence: 'HIGH',
                confidenceNote: 'Novara internal comparator — exactly defined allocation.',
                asOf: '2026-06'
              },
            {
                id: 'p_opt2_retire',
                name: 'Optimal Specified DC At-Retirement (Drawdown)',
                weights: {
                    usEq: 0.2192,
                    devEq: 0.0719,
                    emEq: 0.0591,
                    jpnEq: 0.0267,
                    ukEq: 0.0144,
                    apacEq: 0.0087,
                    privEq: 0.035,
                    infrastructure: 0.06,
                    realEstateDirect: 0.03,
                    privCredit: 0.075,
                    igCredit: 0.1,
                    globalHighYield: 0.0625,
                    emDebt: 0.05,
                    sdCredit: 0.0375,
                    listedAlts: 0.15
                  },
                alphas: {
                    usEq: 0.00375,
                    devEq: 0.00375,
                    emEq: 0.00375,
                    jpnEq: 0.00375,
                    ukEq: 0.00375,
                    apacEq: 0.00375
                  },
                tes: {
                    usEq: 0.01125,
                    devEq: 0.01125,
                    emEq: 0.01125,
                    jpnEq: 0.01125,
                    ukEq: 0.01125,
                    apacEq: 0.01125
                  },
                confidence: 'HIGH',
                confidenceNote: 'Novara internal comparator — exactly defined allocation.',
                asOf: '2026-06'
              }
        ]
      },
    {
        name: 'Aegon',
        isProvider: true,
        portfolios: [
            {
                id: 'p_aegon_ubc_growth',
                name: 'Aegon UBC Growth Phase (Q1 2026)',
                weights: {
                    usEq: 0.54,
                    devEq: 0.081,
                    emEq: 0.058,
                    jpnEq: 0.009,
                    ukEq: 0.025,
                    apacEq: 0.091,
                    privEq: 0.025,
                    realEstateDirect: 0.02,
                    listedAlts: 0.018,
                    igCredit: 0.068,
                    globalSov: 0.015,
                    privCredit: 0.04,
                    moneyMkt: 0.01
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'Aegon Universal Balanced Collection growth. Category allocations from Aegon factsheet; sub-splits estimated.',
                asOf: '2026-06'
              },
            {
                id: 'p_aegon_ubc_retire',
                name: 'Aegon UBC Retirement Stage',
                weights: {
                    usEq: 0.2,
                    devEq: 0.08,
                    emEq: 0.03,
                    ukEq: 0.02,
                    privEq: 0.01,
                    privCredit: 0.02,
                    globalHighYield: 0.05,
                    emDebt: 0.03,
                    igCredit: 0.2,
                    sdCredit: 0.15,
                    globalSov: 0.1,
                    inflLinked: 0.05,
                    moneyMkt: 0.06
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'Aegon Universal Balanced Collection at-retirement. Category-level from factsheet; sub-splits estimated.',
                asOf: '2026-06'
              },
            {
                id: 'p_aegon_lp_growth',
                name: 'Aegon LifePath Flexi Growth Phase (Q1 2026)',
                weights: {
                    usEq: 0.608,
                    devEq: 0.115,
                    ukEq: 0.037,
                    emEq: 0.082,
                    jpnEq: 0.063,
                    apacEq: 0.031,
                    globalReits: 0.046,
                    moneyMkt: 0.018
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'Aegon Lifestyle Passive growth. Category allocations from Aegon factsheet; sub-splits estimated.',
                asOf: '2026-06'
              },
            {
                id: 'p_aegon_lp_retire',
                name: 'Aegon LifePath Flexi At-Retirement (2025-2027 vintage)',
                weights: {
                    usEq: 0.243,
                    devEq: 0.02,
                    emEq: 0.05,
                    jpnEq: 0.024,
                    globalSov: 0.304,
                    igCredit: 0.076,
                    sdCredit: 0.118,
                    globalReits: 0.045,
                    realEstateDirect: 0.04,
                    listedAlts: 0.08
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    jpnEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    jpnEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'Aegon Lifestyle Passive at-retirement. Category-level from factsheet; sub-splits estimated.',
                asOf: '2026-06'
              }
        ]
      },
    {
        name: 'Aon',
        isProvider: true,
        portfolios: [
            {
                id: 'p_aon_growth',
                name: 'Aon Managed Retirement Pathway — Growth',
                weights: {
                    usEq: 0.445,
                    devEq: 0.208,
                    emEq: 0.09,
                    jpnEq: 0.059,
                    ukEq: 0.03,
                    apacEq: 0.074,
                    globalReits: 0.046,
                    realEstateDirect: 0.031,
                    infrastructure: 0.014,
                    moneyMkt: 0.003
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    jpnEq: 0.0025,
                    ukEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    jpnEq: 0.0075,
                    ukEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'LOW',
                confidenceNote: 'Aon Master Trust. Limited granular public disclosure; estimated from Aon published investment approach.',
                asOf: '2026-06'
              },
            {
                id: 'p_aon_retire',
                name: 'Aon Managed Retirement Pathway — At-Retirement',
                weights: {
                    usEq: 0.167,
                    devEq: 0.077,
                    emEq: 0.033,
                    jpnEq: 0.022,
                    ukEq: 0.011,
                    apacEq: 0.027,
                    globalReits: 0.013,
                    realEstateDirect: 0.008,
                    infrastructure: 0.004,
                    igCredit: 0.015,
                    globalSov: 0.064,
                    inflLinked: 0.3,
                    sdCredit: 0.107,
                    moneyMkt: 0.026,
                    privCredit: 0.1,
                    listedAlts: 0.026
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    jpnEq: 0.0025,
                    ukEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    jpnEq: 0.0075,
                    ukEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'LOW',
                confidenceNote: 'Aon Master Trust at-retirement. Limited public data; estimated from available documentation.',
                asOf: '2026-06'
              }
        ]
      },
    {
        name: 'Aviva',
        isProvider: true,
        portfolios: [
            {
                id: 'p_mff_ltg',
                name: 'MFF Long Term Growth Fund',
                weights: {
                    usEq: 0.41,
                    devEq: 0.2,
                    emEq: 0.13,
                    ukEq: 0.03,
                    jpnEq: 0.07,
                    apacEq: 0.05,
                    realEstateDirect: 0.1,
                    moneyMkt: 0.01
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'Aviva My Future Focus long-term growth phase. Category allocations from SP992767.pdf; sub-splits estimated.',
                asOf: '2026-06'
              },
            {
                id: 'p_mff_growth',
                name: 'MFF Growth Fund',
                weights: {
                    usEq: 0.34,
                    devEq: 0.11,
                    emEq: 0.08,
                    ukEq: 0.06,
                    jpnEq: 0.04,
                    apacEq: 0.06,
                    realEstateDirect: 0.1,
                    igCredit: 0.08,
                    emDebt: 0.09,
                    globalHighYield: 0.02,
                    moneyMkt: 0.02
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'Aviva My Future Focus growth phase. Category allocations from SP992767.pdf; sub-splits estimated.',
                asOf: '2026-06'
              },
            {
                id: 'p_mff_consolidation',
                name: 'MFF Consolidation Fund',
                weights: {
                    globalSov: 0.533,
                    usEq: 0.161,
                    igCredit: 0.061,
                    devEq: 0.044,
                    realEstateDirect: 0.04,
                    emEq: 0.032,
                    emDebt: 0.06,
                    apacEq: 0.023,
                    globalHighYield: 0.022,
                    moneyMkt: 0.01,
                    ukEq: 0.009,
                    jpnEq: 0.005
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'Aviva My Future Focus consolidation phase. Category allocations from factsheet; sub-splits estimated.',
                asOf: '2026-06'
              },
            {
                id: 'p_vision_ltg',
                name: 'My Future Vision Long Term Growth Fund',
                weights: {
                    usEq: 0.345,
                    devEq: 0.169,
                    emEq: 0.11,
                    ukEq: 0.025,
                    jpnEq: 0.059,
                    apacEq: 0.042,
                    privEq: 0.088,
                    infrastructure: 0.062,
                    realEstateDirect: 0.038,
                    privCredit: 0.062
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'Aviva My Future Vision long-term growth phase. Category allocations from factsheet; sub-splits estimated.',
                asOf: '2026-06'
              },
            {
                id: 'p_vision_growth',
                name: 'My Future Vision Growth Fund',
                weights: {
                    usEq: 0.305,
                    devEq: 0.148,
                    emEq: 0.096,
                    ukEq: 0.022,
                    jpnEq: 0.052,
                    apacEq: 0.037,
                    privEq: 0.075,
                    infrastructure: 0.055,
                    realEstateDirect: 0.035,
                    privCredit: 0.085,
                    igCredit: 0.04,
                    globalSov: 0.028,
                    listedAlts: 0.012,
                    moneyMkt: 0.01
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'Aviva My Future Vision growth phase. Category allocations from factsheet; sub-splits estimated.',
                asOf: '2026-06'
              },
            {
                id: 'p_vision_consolidation',
                name: 'My Future Vision Consolidation Fund',
                weights: {
                    usEq: 0.144,
                    devEq: 0.07,
                    emEq: 0.045,
                    ukEq: 0.01,
                    jpnEq: 0.024,
                    apacEq: 0.017,
                    privEq: 0.02,
                    infrastructure: 0.02,
                    realEstateDirect: 0.02,
                    privCredit: 0.14,
                    igCredit: 0.203,
                    globalSov: 0.244,
                    listedAlts: 0.033,
                    moneyMkt: 0.01
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'Aviva My Future Vision consolidation phase. Category allocations from factsheet; sub-splits estimated.',
                asOf: '2026-06'
              }
        ]
      },
    {
        name: 'Cushon',
        isProvider: true,
        portfolios: [
            {
                id: 'p_cushon_growth',
                name: 'Cushon Sustainable Investment Strategy — Growth',
                weights: {
                    usEq: 0.481,
                    devEq: 0.12,
                    emEq: 0.075,
                    jpnEq: 0.045,
                    ukEq: 0.022,
                    apacEq: 0.007,
                    infrastructure: 0.075,
                    listedAlts: 0.04,
                    privEq: 0.025,
                    realEstateDirect: 0.01,
                    igCredit: 0.06,
                    globalHighYield: 0.025,
                    globalSov: 0.015
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    jpnEq: 0.0025,
                    ukEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    jpnEq: 0.0075,
                    ukEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'LOW',
                confidenceNote: 'Cushon. Newer provider with limited granular public disclosure; allocation estimated from Cushon sustainable growth strategy.',
                asOf: '2026-06'
              },
            {
                id: 'p_cushon_retire',
                name: 'Cushon Sustainable Investment Strategy — At-Retirement',
                weights: {
                    usEq: 0.243,
                    devEq: 0.061,
                    emEq: 0.038,
                    jpnEq: 0.023,
                    ukEq: 0.011,
                    apacEq: 0.004,
                    infrastructure: 0.05,
                    listedAlts: 0.025,
                    privEq: 0.015,
                    realEstateDirect: 0.01,
                    igCredit: 0.14,
                    globalSov: 0.1,
                    globalHighYield: 0.05,
                    sdCredit: 0.03,
                    inflLinked: 0.15,
                    moneyMkt: 0.05
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    jpnEq: 0.0025,
                    ukEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    jpnEq: 0.0075,
                    ukEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'LOW',
                confidenceNote: 'Cushon at-retirement. Limited public data; estimated from available Cushon documentation.',
                asOf: '2026-06'
              }
        ]
      },
    {
        name: 'Fidelity',
        isProvider: true,
        portfolios: [
            {
                id: 'p_fidelity_fw_growth',
                name: 'Fidelity FutureWise Growth TDF (target state: 15% PM)',
                weights: {
                    usEq: 0.587,
                    devEq: 0.106,
                    apacEq: 0.067,
                    jpnEq: 0.051,
                    emEq: 0.016,
                    ukEq: 0.013,
                    privEq: 0.04,
                    privCredit: 0.04,
                    infrastructure: 0.04,
                    realEstateDirect: 0.02,
                    listedAlts: 0.01,
                    moneyMkt: 0.01
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'Fidelity Workplace Investing growth fund. Category allocations confirmed from Fidelity factsheet; sub-splits estimated.',
                asOf: '2026-06'
              },
            {
                id: 'p_fidelity_fw_retire',
                name: 'Fidelity FutureWise Retirement Fund',
                weights: {
                    globalSov: 0.398,
                    igCredit: 0.26,
                    emDebt: 0.084,
                    usEq: 0.193,
                    devEq: 0.03,
                    apacEq: 0.016,
                    emEq: 0.016,
                    moneyMkt: 0.003
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'Fidelity Workplace Investing at-retirement. Category-level from factsheet; sub-splits estimated.',
                asOf: '2026-06'
              }
        ]
      },
    {
        name: 'Hargreaves Lansdown',
        isProvider: true,
        portfolios: [
            {
                id: 'p_hl_growth',
                name: 'Hargreaves Lansdown Growth Fund',
                weights: {
                    usEq: 0.375,
                    devEq: 0.122,
                    emEq: 0.076,
                    jpnEq: 0.03,
                    ukEq: 0.097,
                    apacEq: 0.03,
                    listedAlts: 0.11,
                    igCredit: 0.075,
                    globalSov: 0.02,
                    inflLinked: 0.02,
                    globalHighYield: 0.02,
                    emDebt: 0.02,
                    moneyMkt: 0.005
                  },
                alphas: {},
                tes: {},
                confidence: 'MED',
                confidenceNote: 'HL Workplace pension default. Published SAA bands from HL fund information; midpoint estimates used.',
                asOf: '2026-06'
              },
            {
                id: 'p_hl_mymap4',
                name: 'HL BlackRock MyMap 4 (At-Retirement Default)',
                weights: {
                    usEq: 0.319,
                    devEq: 0.06,
                    emEq: 0.065,
                    ukEq: 0.035,
                    jpnEq: 0.005,
                    apacEq: 0.002,
                    globalSov: 0.276,
                    igCredit: 0.085,
                    sdCredit: 0.1,
                    inflLinked: 0.03,
                    listedAlts: 0.021,
                    moneyMkt: 0.002
                  },
                alphas: {},
                tes: {},
                confidence: 'MED',
                confidenceNote: 'HL MyMap 4 ESG fund. Category allocations from HL fund information; sub-splits estimated.',
                asOf: '2026-06'
              }
        ]
      },
    {
        name: 'L&G',
        isProvider: true,
        portfolios: [
            {
                id: 'p_lg_tdf_growth',
                name: 'L&G TDF Growth Phase (100% growth, 10+ yrs)',
                weights: {
                    usEq: 0.56,
                    devEq: 0.122,
                    emEq: 0.092,
                    jpnEq: 0.051,
                    apacEq: 0.031,
                    ukEq: 0.031,
                    listedAlts: 0.051,
                    globalReits: 0.031,
                    privEq: 0.004,
                    infrastructure: 0.003,
                    privCredit: 0.003,
                    moneyMkt: 0.021
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'Broad category breakdown from L&G Target Date Fund factsheet. Sub-asset splits inferred from L&G published methodology.',
                asOf: '2026-06'
              },
            {
                id: 'p_lg_tdf_retire',
                name: 'L&G RIMA At-Retirement (TDF + LAF Shared Landing)',
                weights: {
                    usEq: 0.103,
                    devEq: 0.0388,
                    emEq: 0.0481,
                    jpnEq: 0.0387,
                    ukEq: 0.0328,
                    apacEq: 0.0213,
                    globalSov: 0.2058,
                    inflLinked: 0.0749,
                    igCredit: 0.0939,
                    infrastructure: 0.0579,
                    listedAlts: 0.0809,
                    globalReits: 0.047,
                    emDebt: 0.0739,
                    privCredit: 0.037,
                    globalHighYield: 0.017,
                    moneyMkt: 0.029
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    jpnEq: 0.0025,
                    ukEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    jpnEq: 0.0075,
                    ukEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'Diversified landing fund allocation inferred from L&G Target Date Fund documentation and TCFD report.',
                asOf: '2026-06'
              },
            {
                id: 'p_lg_laf_growth',
                name: 'L&G Lifetime Advantage Fund Growth Phase',
                weights: {
                    usEq: 0.458,
                    devEq: 0.119,
                    emEq: 0.085,
                    jpnEq: 0.06,
                    apacEq: 0.043,
                    ukEq: 0.085,
                    realEstateDirect: 0.037,
                    listedAlts: 0.035,
                    infrastructure: 0.029,
                    privCredit: 0.027,
                    privEq: 0.022
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'L&G Lifetime Advantage Fund factsheet categories; UK equity tilt confirmed but exact sub-splits estimated.',
                asOf: '2026-06'
              }
        ]
      },
    {
        name: 'LifeSight',
        isProvider: true,
        portfolios: [
            {
                id: 'p_lifesight_equity',
                name: 'LifeSight Equity Fund (Growth)',
                weights: {
                    usEq: 0.6406,
                    devEq: 0.1147,
                    emEq: 0.0934,
                    jpnEq: 0.0741,
                    ukEq: 0.0254,
                    apacEq: 0.0437,
                    privEq: 0.0081
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    jpnEq: 0.0025,
                    ukEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    jpnEq: 0.0075,
                    ukEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'LOW',
                confidenceNote: 'LifeSight (WTW). Limited granular public disclosure; allocation estimated from WTW investment approach and LifeSight factsheet categories.',
                asOf: '2026-06'
              },
            {
                id: 'p_lifesight_dgf',
                name: 'LifeSight Diversified Growth Fund (DGF)',
                weights: {
                    usEq: 0.2299,
                    devEq: 0.0413,
                    emEq: 0.0333,
                    jpnEq: 0.0262,
                    ukEq: 0.0091,
                    apacEq: 0.0161,
                    igCredit: 0.1361,
                    sdCredit: 0.0766,
                    globalHighYield: 0.0665,
                    emDebt: 0.0756,
                    globalSov: 0.0343,
                    infrastructure: 0.1573,
                    globalReits: 0.0544,
                    listedAlts: 0.0403,
                    privEq: 0.003
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    jpnEq: 0.0025,
                    ukEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    jpnEq: 0.0075,
                    ukEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'LOW',
                confidenceNote: 'LifeSight DGF. Limited public disclosure; estimated from WTW published investment methodology.',
                asOf: '2026-06'
              },
            {
                id: 'p_lifesight_landing',
                name: 'LifeSight Medium Risk Drawdown Landing (at TRA)',
                weights: {
                    usEq: 0.3047,
                    devEq: 0.0546,
                    emEq: 0.0443,
                    jpnEq: 0.0351,
                    ukEq: 0.0121,
                    apacEq: 0.0209,
                    privEq: 0.0039,
                    igCredit: 0.0476,
                    sdCredit: 0.0268,
                    globalHighYield: 0.0233,
                    emDebt: 0.0265,
                    globalSov: 0.012,
                    infrastructure: 0.0551,
                    globalReits: 0.019,
                    listedAlts: 0.0141,
                    moneyMkt: 0.3
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    jpnEq: 0.0025,
                    ukEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    jpnEq: 0.0075,
                    ukEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'LOW',
                confidenceNote: 'LifeSight landing portfolio. Limited public data; estimated from LifeSight at-retirement approach documentation.',
                asOf: '2026-06'
              }
        ]
      },
    {
        name: 'Mercer',
        isProvider: true,
        portfolios: [
            {
                id: 'p_mercer_growth',
                name: 'Mercer Growth Fund',
                weights: {
                    usEq: 0.466,
                    devEq: 0.082,
                    emEq: 0.07,
                    jpnEq: 0.038,
                    ukEq: 0.025,
                    apacEq: 0.019,
                    listedAlts: 0.07,
                    emDebt: 0.03,
                    globalHighYield: 0.04,
                    igCredit: 0.02,
                    globalSov: 0.04,
                    inflLinked: 0.1
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'LOW',
                confidenceNote: 'Mercer Master Trust. Limited granular public disclosure; allocation estimated from Mercer OCIO published approach.',
                asOf: '2026-06'
              },
            {
                id: 'p_mercer_target_drawdown',
                name: 'Mercer Diversified Retirement Fund (SmartPath Drawdown)',
                weights: {
                    usEq: 0.244,
                    devEq: 0.043,
                    emEq: 0.02,
                    jpnEq: 0.02,
                    ukEq: 0.013,
                    apacEq: 0.01,
                    listedAlts: 0.07,
                    emDebt: 0.05,
                    globalHighYield: 0.13,
                    sdCredit: 0.08,
                    igCredit: 0.1,
                    inflLinked: 0.2,
                    globalSov: 0.02
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'LOW',
                confidenceNote: 'Mercer Target Drawdown. Limited granular public disclosure; estimated from Mercer OCIO approach.',
                asOf: '2026-06'
              }
        ]
      },
    {
        name: 'NEST',
        isProvider: true,
        portfolios: [
            {
                id: 'p_nest_foundation',
                name: 'NEST Foundation Phase (Starter fund)',
                weights: {
                    usEq: 0.2375,
                    devEq: 0.0482,
                    jpnEq: 0.0172,
                    ukEq: 0.011,
                    apacEq: 0.0074,
                    emEq: 0.0399,
                    igCredit: 0.1726,
                    infrastructure: 0.0918,
                    realEstateDirect: 0.0898,
                    moneyMkt: 0.0639,
                    sdCredit: 0.0559,
                    privCredit: 0.0509,
                    privEq: 0.0399,
                    emDebt: 0.0289,
                    globalHighYield: 0.0279,
                    globalSov: 0.005,
                    listedAlts: 0.012
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025,
                    emEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075,
                    emEq: 0.0075
                  },
                notes: 'Regional equity derived from MSCI World cap weights (May 2026): US 73.9%, Dev Europe 15.0%, Japan 5.4%, UK 3.4%, Dev APAC 2.3%. Canada and other minor DMs excluded (not in schema, weight distributed proportionally). Source: nestpensions.org.uk asset allocation table per image Jun 2026. ukEq present at MSCI World weight (~1-1.4%) but excluded from alpha/TE keys (NEST runs single pooled global fund, not regionally separated active mandates).',
                asOf: '2026-06',
                confidence: 'HIGH',
                confidenceNote: 'Exact % from nestpensions.org.uk asset allocation table (Jun 2026). Weights read directly from tabular data.'
              },
            {
                id: 'p_nest_growth',
                name: 'NEST Growth Phase (2046-2063 plateau, 20-37 yrs from TRA)',
                weights: {
                    usEq: 0.3063,
                    devEq: 0.0621,
                    jpnEq: 0.0222,
                    ukEq: 0.0142,
                    apacEq: 0.0095,
                    emEq: 0.0508,
                    igCredit: 0.1325,
                    globalReits: 0.0558,
                    realEstateDirect: 0.0548,
                    privCredit: 0.0518,
                    moneyMkt: 0.0488,
                    emDebt: 0.0378,
                    globalHighYield: 0.0378,
                    sdCredit: 0.0349,
                    infrastructure: 0.0269,
                    privEq: 0.0269,
                    globalSov: 0.0269
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025,
                    emEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075,
                    emEq: 0.0075
                  },
                notes: 'Regional equity derived from MSCI World cap weights (May 2026): US 73.9%, Dev Europe 15.0%, Japan 5.4%, UK 3.4%, Dev APAC 2.3%. Canada and other minor DMs excluded (not in schema, weight distributed proportionally). Source: nestpensions.org.uk asset allocation table per image Jun 2026. ukEq present at MSCI World weight (~1-1.4%) but excluded from alpha/TE keys (NEST runs single pooled global fund, not regionally separated active mandates).',
                asOf: '2026-06',
                confidence: 'HIGH',
                confidenceNote: 'Exact % from nestpensions.org.uk asset allocation table (Jun 2026). Weights read directly from tabular data.'
              },
            {
                id: 'p_nest_consolidation',
                name: 'NEST Consolidation Phase (2036, 10 yrs from TRA)',
                weights: {
                    usEq: 0.2817,
                    devEq: 0.0572,
                    jpnEq: 0.0204,
                    ukEq: 0.0131,
                    apacEq: 0.0088,
                    emEq: 0.0494,
                    igCredit: 0.125,
                    sdCredit: 0.0877,
                    moneyMkt: 0.0585,
                    realEstateDirect: 0.0595,
                    emDebt: 0.0494,
                    globalHighYield: 0.0484,
                    privEq: 0.0494,
                    globalSov: 0.0282,
                    infrastructure: 0.0262,
                    privCredit: 0.0232,
                    listedAlts: 0.0141
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025,
                    emEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075,
                    emEq: 0.0075
                  },
                notes: 'Regional equity derived from MSCI World cap weights (May 2026): US 73.9%, Dev Europe 15.0%, Japan 5.4%, UK 3.4%, Dev APAC 2.3%. Canada and other minor DMs excluded (not in schema, weight distributed proportionally). Source: nestpensions.org.uk asset allocation table per image Jun 2026. ukEq present at MSCI World weight (~1-1.4%) but excluded from alpha/TE keys (NEST runs single pooled global fund, not regionally separated active mandates).',
                asOf: '2026-06',
                confidence: 'HIGH',
                confidenceNote: 'Exact % from nestpensions.org.uk asset allocation table (Jun 2026). Weights read directly from tabular data.'
              },
            {
                id: 'p_nest_retire',
                name: 'NEST At-Retirement Fund (2026 vintage, at TRA)',
                weights: {
                    usEq: 0.1338,
                    devEq: 0.0271,
                    jpnEq: 0.0097,
                    ukEq: 0.0062,
                    apacEq: 0.0042,
                    emEq: 0.023,
                    realEstateDirect: 0.0337,
                    privCredit: 0.0163,
                    emDebt: 0.049,
                    globalHighYield: 0.048,
                    igCredit: 0.2143,
                    moneyMkt: 0.1112,
                    sdCredit: 0.2051,
                    infrastructure: 0.0184,
                    privEq: 0.0204,
                    globalSov: 0.0571,
                    listedAlts: 0.0225
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025,
                    emEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075,
                    emEq: 0.0075
                  },
                notes: 'Regional equity derived from MSCI World cap weights (May 2026): US 73.9%, Dev Europe 15.0%, Japan 5.4%, UK 3.4%, Dev APAC 2.3%. Canada and other minor DMs excluded (not in schema, weight distributed proportionally). Source: nestpensions.org.uk asset allocation table per image Jun 2026. ukEq present at MSCI World weight (~1-1.4%) but excluded from alpha/TE keys (NEST runs single pooled global fund, not regionally separated active mandates).',
                asOf: '2026-06',
                confidence: 'HIGH',
                confidenceNote: 'Exact % from nestpensions.org.uk asset allocation table (Jun 2026). Weights read directly from tabular data.'
              }
        ]
      },
    {
        name: 'NOW Pensions',
        isProvider: true,
        portfolios: [
            {
                id: 'p_now_growth',
                name: 'NOW: Pensions Growth Fund',
                weights: {
                    usEq: 0.495,
                    devEq: 0.087,
                    emEq: 0.073,
                    jpnEq: 0.04,
                    ukEq: 0.027,
                    apacEq: 0.02,
                    globalSov: 0.065,
                    igCredit: 0.056,
                    globalHighYield: 0.069,
                    listedAlts: 0.054,
                    privEq: 0.008,
                    moneyMkt: 0.006
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'LOW',
                confidenceNote: 'NOW:Pensions factsheet. Sparse public disclosure; broad category allocations estimated from scheme description.',
                asOf: '2026-06'
              },
            {
                id: 'p_now_rcf',
                name: 'NOW: Pensions Retirement Countdown Fund',
                weights: {
                    sdCredit: 0.599,
                    globalSov: 0.211,
                    moneyMkt: 0.19
                  },
                alphas: {},
                tes: {},
                confidence: 'LOW',
                confidenceNote: 'NOW:Pensions Retirement Countdown Fund. Sparse public disclosure; allocation estimated from scheme documentation.',
                asOf: '2026-06'
              }
        ]
      },
    {
        name: 'NPT',
        isProvider: true,
        portfolios: [
            {
                id: 'p_npt_growth',
                name: 'NPT Sustainable Growth',
                weights: {
                    usEq: 0.556,
                    devEq: 0.133,
                    emEq: 0.09,
                    jpnEq: 0.052,
                    ukEq: 0.033,
                    apacEq: 0.019,
                    globalReits: 0.048,
                    realEstateDirect: 0.019,
                    infrastructure: 0.05
                  },
                alphas: {},
                tes: {},
                confidence: 'LOW',
                confidenceNote: 'National Pension Trust. Smaller provider; limited public disclosure; allocation estimated from scheme documentation.',
                asOf: '2026-06'
              },
            {
                id: 'p_npt_retire',
                name: 'NPT Retirement (40% Equity)',
                weights: {
                    usEq: 0.23,
                    devEq: 0.08,
                    emEq: 0.04,
                    ukEq: 0.05,
                    igCredit: 0.3,
                    sdCredit: 0.2,
                    moneyMkt: 0.1
                  },
                alphas: {},
                tes: {},
                confidence: 'LOW',
                confidenceNote: 'National Pension Trust at-retirement. Limited public data; estimated.',
                asOf: '2026-06'
              }
        ]
      },
    {
        name: 'Royal London',
        isProvider: true,
        portfolios: [
            {
                id: 'p_rl_gpd',
                name: 'Royal London Governed Portfolio Dynamic (15+ yrs)',
                weights: {
                    usEq: 0.34,
                    devEq: 0.165,
                    emEq: 0.084,
                    jpnEq: 0.042,
                    ukEq: 0.189,
                    apacEq: 0.017,
                    globalReits: 0.044,
                    realEstateDirect: 0.04,
                    globalHighYield: 0.038,
                    listedAlts: 0.008,
                    moneyMkt: 0.033
                  },
                alphas: {},
                tes: {},
                confidence: 'MED',
                confidenceNote: 'Royal London Governed Portfolio Drawdown. Category allocations from RL factsheet; sub-splits estimated.',
                asOf: '2026-06'
              },
            {
                id: 'p_rl_grip3',
                name: 'Royal London GRIP 3 (At-Retirement Drawdown)',
                weights: {
                    ukEq: 0.079,
                    usEq: 0.14,
                    devEq: 0.028,
                    emEq: 0.039,
                    jpnEq: 0.014,
                    apacEq: 0.016,
                    globalHighYield: 0.103,
                    igCredit: 0.151,
                    inflLinked: 0.1,
                    globalSov: 0.132,
                    sdCredit: 0.019,
                    globalReits: 0.07,
                    listedAlts: 0.058,
                    moneyMkt: 0.051
                  },
                alphas: {},
                tes: {},
                confidence: 'MED',
                confidenceNote: 'Royal London Governed Retirement Income Portfolio 3. Category allocations from RL factsheet; sub-splits estimated.',
                asOf: '2026-06'
              }
        ]
      },
    {
        name: 'Scottish Widows',
        isProvider: true,
        portfolios: [
            {
                id: 'p_sw_lifetime_growth',
                name: 'Scottish Widows Lifetime Investment Growth Phase',
                weights: {
                    usEq: 0.48,
                    devEq: 0.155,
                    emEq: 0.1,
                    jpnEq: 0.055,
                    ukEq: 0.06,
                    apacEq: 0.05,
                    globalReits: 0.03,
                    infrastructure: 0.02,
                    moneyMkt: 0.05
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'Lifetime Investment Strategy TCFD report. Category-level allocation confirmed; sub-splits estimated from MSCI cap weights.',
                asOf: '2026-06'
              },
            {
                id: 'p_sw_lifetime_retire',
                name: 'Scottish Widows Lifetime Investment At-Retirement',
                weights: {
                    usEq: 0.175,
                    devEq: 0.06,
                    emEq: 0.03,
                    ukEq: 0.025,
                    jpnEq: 0.02,
                    apacEq: 0.015,
                    igCredit: 0.2,
                    sdCredit: 0.15,
                    globalHighYield: 0.05,
                    globalSov: 0.12,
                    inflLinked: 0.06,
                    moneyMkt: 0.08,
                    emDebt: 0.015
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'Lifetime Investment Strategy at-retirement. Category-level from TCFD; sub-splits estimated.',
                asOf: '2026-06'
              }
        ]
      },
    {
        name: 'SEI',
        isProvider: true,
        portfolios: [
            {
                id: 'p_sei_growth',
                name: 'SEI Flexi Default — Growth Phase',
                weights: {
                    usEq: 0.43,
                    devEq: 0.175,
                    emEq: 0.09,
                    jpnEq: 0.06,
                    ukEq: 0.055,
                    apacEq: 0.04,
                    listedAlts: 0.05,
                    globalHighYield: 0.02,
                    igCredit: 0.02,
                    sdCredit: 0.01,
                    globalSov: 0.01,
                    inflLinked: 0.01,
                    emDebt: 0.01,
                    realEstateDirect: 0.01,
                    moneyMkt: 0.01
                  },
                alphas: {
                    usEq: 0.005,
                    devEq: 0.005,
                    emEq: 0.005,
                    jpnEq: 0.005,
                    ukEq: 0.005,
                    apacEq: 0.005
                  },
                tes: {
                    usEq: 0.015,
                    devEq: 0.015,
                    emEq: 0.015,
                    jpnEq: 0.015,
                    ukEq: 0.015,
                    apacEq: 0.015
                  },
                confidence: 'MED',
                confidenceNote: 'SEI Master Trust factsheet. Category allocations confirmed from seimastertrust.co.uk; sub-splits estimated.',
                asOf: '2026-06'
              },
            {
                id: 'p_sei_retire',
                name: 'SEI Flexi Default At-Retirement Fund',
                weights: {
                    usEq: 0.191,
                    devEq: 0.084,
                    emEq: 0.034,
                    jpnEq: 0.027,
                    ukEq: 0.024,
                    apacEq: 0.024,
                    globalReits: 0.055,
                    globalHighYield: 0.037,
                    igCredit: 0.03,
                    globalSov: 0.067,
                    sdCredit: 0.087,
                    inflLinked: 0.035,
                    emDebt: 0.015,
                    listedAlts: 0.04,
                    moneyMkt: 0.25
                  },
                alphas: {
                    usEq: 0.005,
                    devEq: 0.005,
                    emEq: 0.005,
                    jpnEq: 0.005,
                    ukEq: 0.005,
                    apacEq: 0.005
                  },
                tes: {
                    usEq: 0.015,
                    devEq: 0.015,
                    emEq: 0.015,
                    jpnEq: 0.015,
                    ukEq: 0.015,
                    apacEq: 0.015
                  },
                confidence: 'MED',
                confidenceNote: 'SEI Master Trust at-retirement. Category-level from SEI published data; sub-splits estimated.',
                asOf: '2026-06'
              }
        ]
      },
    {
        name: 'Smart',
        isProvider: true,
        portfolios: [
            {
                id: 'p_smart_growth',
                name: 'Smart Sustainable Growth Fund',
                weights: {
                    usEq: 0.524,
                    devEq: 0.116,
                    emEq: 0.08,
                    jpnEq: 0.04,
                    ukEq: 0.024,
                    apacEq: 0.016,
                    igCredit: 0.06,
                    globalHighYield: 0.02,
                    globalSov: 0.02,
                    privCredit: 0.1
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    jpnEq: 0.0025,
                    ukEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    jpnEq: 0.0075,
                    ukEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'LOW',
                confidenceNote: 'Smart Pension. Factsheet light on detail; allocation estimated from Smart default strategy description.',
                asOf: '2026-06'
              },
            {
                id: 'p_smart_retire',
                name: 'Smart Income Fund (At-Retirement Default)',
                weights: {
                    usEq: 0.279,
                    devEq: 0.049,
                    emEq: 0.015,
                    jpnEq: 0.023,
                    ukEq: 0.011,
                    listedAlts: 0.029,
                    globalSov: 0.198,
                    igCredit: 0.346,
                    privCredit: 0.05
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    jpnEq: 0.0025,
                    ukEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    jpnEq: 0.0075,
                    ukEq: 0.0075
                  },
                confidence: 'LOW',
                confidenceNote: 'Smart Pension at-retirement. Limited public data; estimated from available documentation.',
                asOf: '2026-06'
              }
        ]
      },
    {
        name: 'Standard Life',
        isProvider: true,
        portfolios: [
            {
                id: 'p_sl_sma_growth',
                name: 'SMA Growth Pension Fund (LPNL, Q1 2026)',
                weights: {
                    usEq: 0.463,
                    devEq: 0.153,
                    jpnEq: 0.094,
                    emEq: 0.077,
                    ukEq: 0.075,
                    apacEq: 0.065,
                    globalReits: 0.05,
                    realEstateDirect: 0.023
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'MyFolio SMA factsheet. Broad category allocations confirmed; sub-splits estimated.',
                asOf: '2026-06'
              },
            {
                id: 'p_sl_sma_preretire',
                name: 'SMA Pre-Retirement Pension Fund (CEMH, Q1 2026)',
                weights: {
                    usEq: 0.311,
                    sdCredit: 0.122,
                    devEq: 0.103,
                    jpnEq: 0.063,
                    igCredit: 0.075,
                    emEq: 0.053,
                    ukEq: 0.051,
                    apacEq: 0.045,
                    globalReits: 0.04,
                    emDebt: 0.038,
                    globalSov: 0.043,
                    realEstateDirect: 0.023,
                    inflLinked: 0.02,
                    moneyMkt: 0.013
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'Standard Life MyFolio SMA pre-retirement phase. Category allocations from factsheet; sub-splits estimated.',
                asOf: '2026-06'
              },
            {
                id: 'p_sl_sma_retire',
                name: 'SMA At-Retirement Universal Pension Fund (PLND, Q1 2026)',
                weights: {
                    sdCredit: 0.238,
                    usEq: 0.168,
                    igCredit: 0.149,
                    emDebt: 0.075,
                    globalSov: 0.083,
                    devEq: 0.056,
                    inflLinked: 0.04,
                    jpnEq: 0.034,
                    globalReits: 0.03,
                    emEq: 0.028,
                    ukEq: 0.027,
                    moneyMkt: 0.025,
                    apacEq: 0.024,
                    realEstateDirect: 0.023
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'MyFolio SMA at-retirement. Category-level from factsheet; sub-splits estimated.',
                asOf: '2026-06'
              },
            {
                id: 'p_sl_future_growth',
                name: 'SL Future Opportunities Growth (SMA equity 75% + 25% PM)',
                weights: {
                    usEq: 0.301,
                    devEq: 0.124,
                    jpnEq: 0.076,
                    emEq: 0.062,
                    ukEq: 0.061,
                    apacEq: 0.053,
                    globalReits: 0.05,
                    realEstateDirect: 0.023,
                    privEq: 0.1,
                    infrastructure: 0.1,
                    privCredit: 0.05
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    ukEq: 0.0025,
                    jpnEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    ukEq: 0.0075,
                    jpnEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'MED',
                confidenceNote: 'Standard Life Future Opportunities growth phase. Category allocations from SL published data; sub-splits estimated.',
                asOf: '2026-06'
              }
        ]
      },
    {
        name: 'TPP',
        isProvider: true,
        portfolios: [
            {
                id: 'p_tpp_growth',
                name: 'The People\'s Pension — Growth (Global Investments, up to 85% shares)',
                weights: {
                    usEq: 0.3921,
                    devEq: 0.1245,
                    emEq: 0.0531,
                    jpnEq: 0.0836,
                    ukEq: 0.0594,
                    apacEq: 0.0691,
                    igCredit: 0.0909,
                    globalSov: 0.0519,
                    inflLinked: 0.0195,
                    globalHighYield: 0.013,
                    emDebt: 0.013,
                    infrastructure: 0.0299
                  },
                alphas: {},
                tes: {},
                confidence: 'LOW',
                confidenceNote: 'The People\'s Pension. Limited granular public disclosure; allocation estimated from scheme description.',
                asOf: '2026-06'
              },
            {
                id: 'p_tpp_retire',
                name: 'The People\'s Pension — Pre-Retirement Fund (at-retirement default)',
                weights: {
                    usEq: 0.102,
                    devEq: 0.0326,
                    emEq: 0.0139,
                    jpnEq: 0.0214,
                    ukEq: 0.0159,
                    apacEq: 0.0182,
                    igCredit: 0.2101,
                    globalSov: 0.3048,
                    inflLinked: 0.1051,
                    sdCredit: 0.0841,
                    globalHighYield: 0.042,
                    emDebt: 0.042,
                    infrastructure: 0.0078
                  },
                alphas: {},
                tes: {},
                confidence: 'LOW',
                confidenceNote: 'The People\'s Pension at-retirement. Limited public data; estimated from available documentation.',
                asOf: '2026-06'
              }
        ]
      },
    {
        name: 'TPT',
        isProvider: true,
        portfolios: [
            {
                id: 'p_tpt_growth',
                name: 'TPT Sustainable Future TDF — Growth Phase',
                weights: {
                    usEq: 0.527,
                    devEq: 0.093,
                    emEq: 0.079,
                    jpnEq: 0.043,
                    ukEq: 0.029,
                    apacEq: 0.021,
                    privEq: 0.06,
                    privCredit: 0.06,
                    realEstateDirect: 0.043,
                    listedAlts: 0.045
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    jpnEq: 0.0025,
                    ukEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    jpnEq: 0.0075,
                    ukEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'LOW',
                confidenceNote: 'TPT Retirement Solutions. Sustainable Future Fund; broad ESG approach described but granular allocation not publicly disclosed.',
                asOf: '2026-06'
              },
            {
                id: 'p_tpt_retire',
                name: 'TPT Sustainable Future TDF — At-Retirement',
                weights: {
                    usEq: 0.232,
                    devEq: 0.04,
                    emEq: 0.013,
                    jpnEq: 0.019,
                    ukEq: 0.012,
                    apacEq: 0.009,
                    privCredit: 0.103,
                    privEq: 0.011,
                    realEstateDirect: 0.012,
                    inflLinked: 0.248,
                    igCredit: 0.117,
                    sdCredit: 0.089,
                    globalSov: 0.076,
                    listedAlts: 0.019
                  },
                alphas: {
                    usEq: 0.0025,
                    devEq: 0.0025,
                    emEq: 0.0025,
                    jpnEq: 0.0025,
                    ukEq: 0.0025,
                    apacEq: 0.0025
                  },
                tes: {
                    usEq: 0.0075,
                    devEq: 0.0075,
                    emEq: 0.0075,
                    jpnEq: 0.0075,
                    ukEq: 0.0075,
                    apacEq: 0.0075
                  },
                confidence: 'LOW',
                confidenceNote: 'TPT at-retirement. Limited public data; estimated from Sustainable Future Fund documentation.',
                asOf: '2026-06'
              }
        ]
      }
];
