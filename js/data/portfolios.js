/**
 * ============================================================
 * FILE: js/data/portfolios.js
 * PURPOSE: Pre-built investment portfolio definitions for all
 *          provider groups and comparator strategies.
 * ============================================================
 *
 * WHAT THIS FILE CONTAINS:
 *   PRESET_PORTFOLIOS — array of portfolio group objects. Each group
 *   corresponds to a provider or a comparator strategy set, and
 *   contains one or more portfolio objects with asset weight vectors.
 *
 * SCHEMA — each group:
 *   groupId       {string}  Unique identifier. Permanent.
 *   groupName     {string}  Display name (provider or comparator set).
 *   isProvider    {boolean} true = shown in VFM provider league table.
 *   portfolios[]  {array}   Portfolio objects (schema below).
 *
 * SCHEMA — each portfolio object:
 *   id        {string}  Unique id. PERMANENT — stored in user localStorage.
 *                       Never rename or remove.
 *   name      {string}  Display label. Safe to update.
 *   weights   {object}  assetKey → weight (decimal). Must sum to 1.0 (±0.001).
 *                       All keys must exist in data/asset-classes.js.
 *   glidepath {array?}  Optional [{years, weights}] for lifestyle funds.
 *                       years = years-to-retirement; weights = asset object.
 *   source    {string?} Data source reference (provider factsheet / TCFD).
 *   asOf      {string?} "YYYY-MM" — date of last weight verification.
 *
 * DATA SOURCES (provider factsheets, publicly available):
 *   NEST           nest.org.uk — Fund fact sheets, quarterly updates
 *   Aviva          aviva.co.uk — Workplace Pension fund range
 *   Legal & General legalandgeneral.com — Workplace DC funds
 *   Scottish Widows scottishwidows.co.uk — Workplace pension funds
 *   Standard Life   standardlife.co.uk — Active Plus funds
 *   Aegon           aegon.co.uk — Workplace investment range
 *   Royal London    royallondon.com — Governed portfolios
 *   Fidelity        fidelity.co.uk — Pathway funds
 *   Hargreaves      hl.co.uk — Workplace pension defaults
 *   [Full source details in commentary/cma_commentary.md]
 *
 * HOW TO UPDATE A PROVIDER PORTFOLIO:
 *   1. Obtain the latest factsheet or TCFD report for the provider.
 *   2. Map published SAA categories to ASSET_CLASSES keys.
 *   3. Update weights object; normalise if factsheet rounds to ≠100%.
 *   4. Update asOf to current YYYY-MM.
 *   5. Add an audit entry below.
 *
 * WEIGHT VALIDATION RULES:
 *   sum(Object.values(weights)) === 1.0  (tolerance ±0.001)
 *   All keys must exist in ASSET_CLASSES in data/asset-classes.js
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
 * │ 2026-05-27  │ Novara/AI    │ Extracted from config.js to portfolios.js    │
 * └─────────────┴──────────────┴──────────────────────────────────────────────┘
 *
 * FOR AI ASSISTANTS:
 *   - Portfolio id values are permanent foreign keys (stored in localStorage).
 *     NEVER rename or remove a portfolio id.
 *   - weights must sum to 1.0 — always validate after editing.
 *   - All weight keys must appear in data/asset-classes.js ASSET_CLASSES.
 *   - Update asOf whenever you change a portfolio's weights.
 *   - Core Building Block portfolios (p_std_growth etc.) were removed in
 *     v58 — do not re-add them.
 *   - p_retire is used in stress scenario calculations — do not remove.
 */

export const PRESET_PORTFOLIOS = [
    // ─── OPTIMAL DC STRATEGY (COMPARATOR) ────────────────────────────────────
    {
        name: "Custom",
        // Reference strategies illustrating theoretically optimal DC default designs.
        // Based on CMA 2026-05 geometric return analysis and specified fund construction.
        //
        // FUND ARCHITECTURE:
        //   Global Equity Potential: 75% of growth. MSCI ACWI cap weights, NA -10% pro-rata uplift.
        //     50% climate-aligned (α=0.25%, TE=0.75%) + 50% factor-based (α=0.5%, TE=1.5%).
        //     Blended: α=0.375%, TE=1.125% applied to all equity classes.
        //   Private Markets Growth Potential: 25% of growth.
        //     PE 35%, infra 30%, real estate 10%, private credit 25%.
        //   At-retirement: 40% equity + 10% PM Growth + 10% PM Income + 25% credit + 15% listed alts.
        //     PM Income: privCredit 50%, infra 30%, real estate 20%.
        //     Credit mix: igCredit 40%, globalHighYield 25%, emDebt 20%, sdCredit 15%.
        //   De-risk: 10 years.
        portfolios: [
            // ── Strategy 2 portfolios ─────────────────────────────────────────
                        // Sub-fund: Private Markets Growth Potential
                        { id: "p_opt2_pm_growth", name: "Private Markets Growth Potential",
                          // PE 35%, Infrastructure 30%, Real Estate 10%, Private Credit 25%.
                          // Arithmetic return: 8.96%, geometric≈7.74% (best PM blend on geom basis).
                          // Private credit 25% is the highest-geom individual asset (7.70%).
                          weights: { privEq:0.350, infrastructure:0.300, realEstateDirect:0.100, privCredit:0.250 },
                          alphas: {}, tes: {} },

            // Sub-fund: Private Markets Income Potential
                        { id: "p_opt2_pm_income", name: "Private Markets Income Potential",
                          // Private Credit 50%, Infrastructure 30%, Real Estate 20%.
                          // Cashflow-oriented. Lower vol than PM Growth. Geom: 7.57%.
                          // Private credit 50% is the highest-geom asset in the entire CMA (7.70%, vol 10%).
                          weights: { privCredit:0.500, infrastructure:0.300, realEstateDirect:0.200 },
                          alphas: {}, tes: {} },

            // Combined growth fund: 75% Global Equity Potential + 25% PM Growth
                        { id: "p_opt2_growth", name: "Optimal Specified DC Growth (75% Equity + 25% PM Growth)",
                          // Equity sleeve (75%): MSCI ACWI cap weights, NA -10% redistributed pro-rata.
                          //   Original MSCI ACWI: US+Canada 64.8%, devEq 14.0%, emEq 11.5%, jpnEq 5.2%, ukEq 2.8%, apacEq 1.7%.
                          //   After NA -10% → usEq 54.8%, others uplifted proportionally:
                          //   devEq +2.98%, emEq +2.27%, jpnEq +1.48%, ukEq +0.80%, apacEq +0.48%.
                          //   Alpha: blended 50/50 (climate α=0.25% + factor α=0.5%) = 0.375% p.a.
                          //   TE:    blended 50/50 (climate TE=0.75% + factor TE=1.5%) = 1.125% p.a.
                          //   Applied uniformly across all equity classes.
                          // PM Growth sleeve (25%): p_opt2_pm_growth look-through.
                          // Arithmetic: 7.70% (incl. alpha), geometric≈6.28%.
                          weights: { usEq:0.4110, devEq:0.1348, emEq:0.1108, jpnEq:0.0501, ukEq:0.0270, apacEq:0.0163,
                                     privEq:0.0875, infrastructure:0.0750, realEstateDirect:0.0250, privCredit:0.0625 },
                          alphas: { usEq:0.00375, devEq:0.00375, emEq:0.00375, jpnEq:0.00375, ukEq:0.00375, apacEq:0.00375 },
                          tes:    { usEq:0.01125, devEq:0.01125, emEq:0.01125, jpnEq:0.01125, ukEq:0.01125, apacEq:0.01125 } },

            // At-retirement: 40% equity + 10% PM Growth + 10% PM Income + 25% credit + 15% listedAlts
                        { id: "p_opt2_retire", name: "Optimal Specified DC At-Retirement (Drawdown)",
                          // 40% equity sleeve (same cap-adjusted weights as growth equity sleeve, scaled to 40%).
                          // 10% PM Growth look-through (PE 35%, infra 30%, RE 10%, privCredit 25%).
                          // 10% PM Income look-through (privCredit 50%, infra 30%, RE 20%).
                          // 25% credit mix: igCredit 40%, globalHighYield 25%, emDebt 20%, sdCredit 15%.
                          // 15% listed alts: listedAlts 100% — diversified absolute return / real assets.
                          // Arithmetic: 7.11%, geometric≈6.07% — outperforms most providers' GROWTH funds.
                          weights: { usEq:0.2192, devEq:0.0719, emEq:0.0591, jpnEq:0.0267, ukEq:0.0144, apacEq:0.0087,
                                     privEq:0.0350, infrastructure:0.0600, realEstateDirect:0.0300, privCredit:0.0750,
                                     igCredit:0.1000, globalHighYield:0.0625, emDebt:0.0500, sdCredit:0.0375,
                                     listedAlts:0.1500 },
                          alphas: { usEq:0.00375, devEq:0.00375, emEq:0.00375, jpnEq:0.00375, ukEq:0.00375, apacEq:0.00375 },
                          tes:    { usEq:0.01125, devEq:0.01125, emEq:0.01125, jpnEq:0.01125, ukEq:0.01125, apacEq:0.01125 } }
        ]
    },

    // ─── AEGON 
    {
        name: "Aegon",
        portfolios: [
            { id: "p_aegon_ubc_growth", name: "Aegon UBC Growth Phase (Q1 2026)",
                          weights: { usEq:0.540, devEq:0.081, emEq:0.058, jpnEq:0.009, ukEq:0.025, apacEq:0.091, privEq:0.025, realEstateDirect:0.020, listedAlts:0.018, igCredit:0.068, globalSov:0.015, privCredit:0.040, moneyMkt:0.010 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_aegon_ubc_retire", name: "Aegon UBC Retirement Stage",
                          weights: { usEq:0.200, devEq:0.080, emEq:0.030, ukEq:0.020, privEq:0.010, privCredit:0.020, globalHighYield:0.050, emDebt:0.030, igCredit:0.200, sdCredit:0.150, globalSov:0.100, inflLinked:0.050, moneyMkt:0.060 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075 } }
,

            { id: "p_aegon_lp_growth", name: "Aegon LifePath Flexi Growth Phase (Q1 2026)",
                          weights: { usEq:0.608, devEq:0.115, ukEq:0.037, emEq:0.082, jpnEq:0.063, apacEq:0.031, globalReits:0.046, moneyMkt:0.018 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_aegon_lp_retire", name: "Aegon LifePath Flexi At-Retirement (2025-2027 vintage)",
                          weights: { usEq:0.243, devEq:0.020, emEq:0.050, jpnEq:0.024, globalSov:0.304, igCredit:0.076, sdCredit:0.118, globalReits:0.045, realEstateDirect:0.040, listedAlts:0.080 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075 } }
        ]
    },

    // ─── AON 
    {
        name: "Aon",
        portfolios: [
            { id: "p_aon_growth", name: "Aon Managed Retirement Pathway — Growth",
                          weights: { usEq:0.445, devEq:0.208, emEq:0.090, jpnEq:0.059, ukEq:0.030, apacEq:0.074, globalReits:0.046, realEstateDirect:0.031, infrastructure:0.014, moneyMkt:0.003 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, ukEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075, ukEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_aon_retire", name: "Aon Managed Retirement Pathway — At-Retirement",
                          weights: { usEq:0.167, devEq:0.077, emEq:0.033, jpnEq:0.022, ukEq:0.011, apacEq:0.027, globalReits:0.013, realEstateDirect:0.008, infrastructure:0.004, igCredit:0.015, globalSov:0.064, inflLinked:0.300, sdCredit:0.107, moneyMkt:0.026, privCredit:0.100, listedAlts:0.026 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, ukEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075, ukEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── AVIVA 
    {
        name: "Aviva",
        portfolios: [
            { id: "p_mff_ltg", name: "MFF Long Term Growth Fund",
                          weights: { usEq:0.410, devEq:0.200, emEq:0.130, ukEq:0.030, jpnEq:0.070, apacEq:0.050, realEstateDirect:0.100, moneyMkt:0.010 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_mff_growth", name: "MFF Growth Fund",
                          weights: { usEq:0.340, devEq:0.110, emEq:0.080, ukEq:0.060, jpnEq:0.040, apacEq:0.060, realEstateDirect:0.100, igCredit:0.080, emDebt:0.090, globalHighYield:0.020, moneyMkt:0.020 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_mff_consolidation", name: "MFF Consolidation Fund",
                          weights: { globalSov:0.533, usEq:0.161, igCredit:0.061, devEq:0.044, realEstateDirect:0.040, emEq:0.032, emDebt:0.060, apacEq:0.023, globalHighYield:0.022, moneyMkt:0.010, ukEq:0.009, jpnEq:0.005 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_vision_ltg", name: "My Future Vision Long Term Growth Fund",
                          weights: { usEq:0.345, devEq:0.169, emEq:0.110, ukEq:0.025, jpnEq:0.059, apacEq:0.042, privEq:0.088, infrastructure:0.062, realEstateDirect:0.038, privCredit:0.062 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_vision_growth", name: "My Future Vision Growth Fund",
                          weights: { usEq:0.305, devEq:0.148, emEq:0.096, ukEq:0.022, jpnEq:0.052, apacEq:0.037, privEq:0.075, infrastructure:0.055, realEstateDirect:0.035, privCredit:0.085, igCredit:0.040, globalSov:0.028, listedAlts:0.012, moneyMkt:0.010 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_vision_consolidation", name: "My Future Vision Consolidation Fund",
                          weights: { usEq:0.144, devEq:0.070, emEq:0.045, ukEq:0.010, jpnEq:0.024, apacEq:0.017, privEq:0.020, infrastructure:0.020, realEstateDirect:0.020, privCredit:0.140, igCredit:0.203, globalSov:0.244, listedAlts:0.033, moneyMkt:0.010 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── CUSHON 
    {
        name: "Cushon",
        portfolios: [
            { id: "p_cushon_growth", name: "Cushon Sustainable Investment Strategy — Growth",
                          weights: { usEq:0.481, devEq:0.120, emEq:0.075, jpnEq:0.045, ukEq:0.022, apacEq:0.007, infrastructure:0.075, listedAlts:0.040, privEq:0.025, realEstateDirect:0.010, igCredit:0.060, globalHighYield:0.025, globalSov:0.015 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, ukEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075, ukEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_cushon_retire", name: "Cushon Sustainable Investment Strategy — At-Retirement",
                          weights: { usEq:0.243, devEq:0.061, emEq:0.038, jpnEq:0.023, ukEq:0.011, apacEq:0.004, infrastructure:0.050, listedAlts:0.025, privEq:0.015, realEstateDirect:0.010, igCredit:0.140, globalSov:0.100, globalHighYield:0.050, sdCredit:0.030, inflLinked:0.150, moneyMkt:0.050 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, ukEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075, ukEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── FIDELITY 
    {
        name: "Fidelity",
        portfolios: [
            { id: "p_fidelity_fw_growth", name: "Fidelity FutureWise Growth TDF (target state: 15% PM)",
                          weights: { usEq:0.587, devEq:0.106, apacEq:0.067, jpnEq:0.051, emEq:0.016, ukEq:0.013, privEq:0.040, privCredit:0.040, infrastructure:0.040, realEstateDirect:0.020, listedAlts:0.010, moneyMkt:0.010 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_fidelity_fw_retire", name: "Fidelity FutureWise Retirement Fund",
                          weights: { globalSov:0.398, igCredit:0.260, emDebt:0.084, usEq:0.193, devEq:0.030, apacEq:0.016, emEq:0.016, moneyMkt:0.003 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── HARGREAVES LANSDOWN 
    {
        name: "Hargreaves Lansdown",
        portfolios: [
            { id: "p_hl_growth", name: "Hargreaves Lansdown Growth Fund",
                          weights: { usEq:0.375, devEq:0.122, emEq:0.076, jpnEq:0.030, ukEq:0.097, apacEq:0.030, listedAlts:0.110, igCredit:0.075, globalSov:0.020, inflLinked:0.020, globalHighYield:0.020, emDebt:0.020, moneyMkt:0.005 },
                          alphas: {}, tes: {} }
,

            { id: "p_hl_mymap4", name: "HL BlackRock MyMap 4 (At-Retirement Default)",
                          weights: { usEq:0.319, devEq:0.060, emEq:0.065, ukEq:0.035, jpnEq:0.005, apacEq:0.002, globalSov:0.276, igCredit:0.085, sdCredit:0.100, inflLinked:0.030, listedAlts:0.021, moneyMkt:0.002 },
                          alphas: {}, tes: {} }
        ]
    },

    // ─── L&G ──────────────────────────────────────────────────────────────────
    {
        name: "L&G",
        portfolios: [
            { id: "p_lg_tdf_growth", name: "L&G TDF Growth Phase (100% growth, 10+ yrs)",
                          weights: { usEq:0.560, devEq:0.122, emEq:0.092, jpnEq:0.051, apacEq:0.031, ukEq:0.031, listedAlts:0.051, globalReits:0.031, privEq:0.004, infrastructure:0.003, privCredit:0.003, moneyMkt:0.021 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_lg_tdf_retire", name: "L&G TDF At-Retirement (Cash/Drawdown Landing)",
                          weights: { sdCredit:0.350, igCredit:0.250, moneyMkt:0.200, usEq:0.120, devEq:0.040, emEq:0.020, globalSov:0.020 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075 } }
,

            { id: "p_lg_laf_growth", name: "L&G Lifetime Advantage Fund Growth Phase",
                          weights: { usEq:0.511, devEq:0.102, emEq:0.076, jpnEq:0.043, apacEq:0.025, ukEq:0.025, listedAlts:0.068, realEstateDirect:0.060, infrastructure:0.045, privEq:0.030, privCredit:0.015 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── LIFESIGHT 
    {
        name: "LifeSight",
        portfolios: [
            { id: "p_lifesight_equity", name: "LifeSight Equity Fund (Growth)",
                          // 31 Mar 2026 factsheet: 99.2% equity, 0.8% private equity (CG WTW LTAF)
                          // Country weights derived from factsheet country breakdown table
                          weights: { usEq:0.6406, devEq:0.1147, emEq:0.0934, jpnEq:0.0741, ukEq:0.0254, apacEq:0.0437, privEq:0.0081 },
                          alphas: { usEq:0.003, devEq:0.003, emEq:0.003, jpnEq:0.003, ukEq:0.003, apacEq:0.003 },
                          tes:    { usEq:0.008, devEq:0.008, emEq:0.008, jpnEq:0.008, ukEq:0.008, apacEq:0.008 } }
,

            { id: "p_lifesight_dgf", name: "LifeSight Diversified Growth Fund (DGF)",
                          // 31 Mar 2026 factsheet: Equities 36.2%, Corp Bonds 27.7%, Govt 10.9%, Alts 25.2%
                          // Equity sub-allocation mirrors Equity Fund regional proportions, scaled to 36.2%
                          // infrastructure = Infra Equity MFG (12.9%) + Schroder Greencoat Renewables (2.7%)
                          // listedAlts = Leadenhall UCITs ILS Fund (insurance-linked securities, 4.0%)
                          weights: { usEq:0.2299, devEq:0.0413, emEq:0.0333, jpnEq:0.0262, ukEq:0.0091, apacEq:0.0161,
                                     igCredit:0.1361, sdCredit:0.0766, globalHighYield:0.0665,
                                     emDebt:0.0756, globalSov:0.0343,
                                     infrastructure:0.1573, globalReits:0.0544, listedAlts:0.0403, privEq:0.003 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, ukEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.008, devEq:0.008, emEq:0.008, jpnEq:0.008, ukEq:0.008, apacEq:0.008 } }
,

            { id: "p_lifesight_landing", name: "LifeSight Medium Risk Drawdown Landing (at TRA)",
                          // At-retirement blend: ~35% Equity Fund + 35% DGF + 30% Cash
                          // Derived from Appendix D Medium Risk Drawdown chart at years=0 (March 2026 WTW doc)
                          // Weights are look-through to underlying asset classes
                          weights: { usEq:0.3047, devEq:0.0546, emEq:0.0443, jpnEq:0.0351, ukEq:0.0121, apacEq:0.0209,
                                     privEq:0.0039, igCredit:0.0476, sdCredit:0.0268, globalHighYield:0.0233,
                                     emDebt:0.0265, globalSov:0.012, infrastructure:0.0551, globalReits:0.019,
                                     listedAlts:0.0141, moneyMkt:0.3 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, ukEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.008, devEq:0.008, emEq:0.008, jpnEq:0.008, ukEq:0.008, apacEq:0.008 } }
        ]
    },

    // ─── MERCER 
    {
        name: "Mercer",
        portfolios: [
            { id: "p_mercer_growth", name: "Mercer Growth Fund",
                          weights: { usEq:0.466, devEq:0.082, emEq:0.070, jpnEq:0.038, ukEq:0.025, apacEq:0.019, listedAlts:0.070, emDebt:0.030, globalHighYield:0.040, igCredit:0.020, globalSov:0.040, inflLinked:0.100 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_mercer_target_drawdown", name: "Mercer Diversified Retirement Fund (SmartPath Drawdown)",
                          weights: { usEq:0.244, devEq:0.043, emEq:0.020, jpnEq:0.020, ukEq:0.013, apacEq:0.010, listedAlts:0.070, emDebt:0.050, globalHighYield:0.130, sdCredit:0.080, igCredit:0.100, inflLinked:0.200, globalSov:0.020 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── NEST ─────────────────────────────────────────────────────────────────
    {
        name: "NEST",
        portfolios: [
            { id: "p_nest_foundation", name: "NEST Foundation Phase (Starter fund)",
                          // Source: Q4 2025 PDF — Starter row (exact). HIGH confidence.
                          // Characteristic split: Higher Growth 50%, Long-Term Stable Growth 45%, Capital Preservation 5%.
                          // Identical to vintages 2068-2071 (50+ yrs from TRA).
                          // Lower equity (36.8%) and higher infrastructure (8.9%) vs Growth phase.
                          // moneyMkt 7.4% (confirmed correct in Q4 2025 data).
                          weights: { usEq:0.1608, devEq:0.0929, emEq:0.0390, jpnEq:0.0324, apacEq:0.0432,
                                     igCredit:0.1730, sdCredit:0.0530, globalHighYield:0.0280, emDebt:0.0290,
                                     globalSov:0.0030, realEstateDirect:0.0850, infrastructure:0.0890,
                                     privEq:0.0330, privCredit:0.0500, listedAlts:0.0150, moneyMkt:0.0740 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_nest_growth",  name: "NEST RDF Growth (30+ yrs)",
                          weights: { usEq:0.205, devEq:0.120, emEq:0.049, jpnEq:0.042, apacEq:0.056, globalReits:0.043, realEstateDirect:0.020, infrastructure:0.068, privEq:0.042, privCredit:0.038, globalHighYield:0.036, emDebt:0.036, igCredit:0.079, sdCredit:0.043, globalSov:0.003, moneyMkt:0.108, listedAlts:0.012 },
                          alphas: {}, tes: {} }
,

            { id: "p_nest_consolidation", name: "NEST Consolidation Phase (2036, 10 yrs from TRA)",
                          // Source: Q4 2025 PDF — 2036 row (exact). HIGH confidence.
                          // Characteristic split: Higher Growth 70%, Income Seeking 10%, Long-Term Stable 15%,
                          //   Capital Preservation 5%. Income Seeking emerges at 10%, signalling active de-risking.
                          // Notable: equity 51.5% — higher than growth plateau (47.8%) because Higher Growth
                          //   characteristic dominates at 70%. Shift is from Long-Term Stable → Income Seeking.
                          // Retained as reference portfolio; glidepath uses Foundation/Growth/Retirement only.
                          weights: { usEq:0.2226, devEq:0.1297, emEq:0.0550, jpnEq:0.0453, apacEq:0.0604,
                                     igCredit:0.1060, sdCredit:0.0460, globalHighYield:0.0460, emDebt:0.0480,
                                     globalSov:0.0110, realEstateDirect:0.0440, infrastructure:0.0330,
                                     privEq:0.0470, privCredit:0.0260, listedAlts:0.0220, moneyMkt:0.0580 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_nest_retire",  name: "NEST RDF At-Retirement (2024/25 vintage)",
                          weights: { usEq:0.095, devEq:0.058, emEq:0.023, jpnEq:0.020, apacEq:0.022, globalReits:0.008, realEstateDirect:0.008, infrastructure:0.012, privEq:0.019, privCredit:0.012, globalHighYield:0.047, emDebt:0.046, igCredit:0.228, sdCredit:0.129, globalSov:0.047, moneyMkt:0.219, listedAlts:0.007 },
                          alphas: {}, tes: {} }
        ]
    },

    // ─── NOW PENSIONS 
    {
        name: "NOW Pensions",
        portfolios: [
            { id: "p_now_growth", name: "NOW: Pensions Growth Fund",
                          weights: { usEq:0.495, devEq:0.087, emEq:0.073, jpnEq:0.040, ukEq:0.027, apacEq:0.020, globalSov:0.065, igCredit:0.056, globalHighYield:0.069, listedAlts:0.054, privEq:0.008, moneyMkt:0.006 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_now_rcf", name: "NOW: Pensions Retirement Countdown Fund",
                          weights: { sdCredit:0.599, globalSov:0.211, moneyMkt:0.190 },
                          alphas: {}, tes: {} }
        ]
    },

    // ─── NPT (National Pension Trust) ─────────────────────────────────────────
    {
        name: "NPT",
        portfolios: [
            { id: "p_npt_growth", name: "NPT Sustainable Growth", weights: { usEq: 0.556, devEq: 0.133, emEq: 0.090, jpnEq: 0.052, ukEq: 0.033, apacEq: 0.019, globalReits: 0.048, realEstateDirect: 0.019, infrastructure: 0.05 }, alphas: {}, tes: {} }
,

            { id: "p_npt_retire", name: "NPT Retirement (40% Equity)", weights: { usEq: 0.23, devEq: 0.08, emEq: 0.04, ukEq: 0.05, igCredit: 0.30, sdCredit: 0.20, moneyMkt: 0.10 }, alphas: {}, tes: {} }
        ]
    },

    // ─── ROYAL LONDON 
    {
        name: "Royal London",
        // Equity implemented via standard market-cap indices (no active stock selection).
        // Alpha and tracking error set to zero; return modelled as pure CMA beta.
        portfolios: [
            { id: "p_rl_gpd", name: "Royal London Governed Portfolio Dynamic (15+ yrs)",
                          weights: { usEq:0.340, devEq:0.165, emEq:0.084, jpnEq:0.042, ukEq:0.189, apacEq:0.017, globalReits:0.044, realEstateDirect:0.040, globalHighYield:0.038, listedAlts:0.008, moneyMkt:0.033 },
                          alphas: {},
                          tes:    {} }
,

            { id: "p_rl_grip3", name: "Royal London GRIP 3 (At-Retirement Drawdown)",
                          weights: { ukEq:0.079, usEq:0.140, devEq:0.028, emEq:0.039, jpnEq:0.014, apacEq:0.016, globalHighYield:0.103, igCredit:0.151, inflLinked:0.100, globalSov:0.132, sdCredit:0.019, globalReits:0.070, listedAlts:0.058, moneyMkt:0.051 },
                          alphas: {},
                          tes:    {} }
        ]
    },

    // ─── SCOTTISH WIDOWS 
    {
        name: "Scottish Widows",
        portfolios: [
            { id: "p_sw_lifetime_growth", name: "Scottish Widows Lifetime Investment Growth Phase",
                          weights: { usEq:0.480, devEq:0.155, emEq:0.100, jpnEq:0.055, ukEq:0.060, apacEq:0.050, globalReits:0.030, infrastructure:0.020, moneyMkt:0.050 },
                          alphas: { usEq:0.005, devEq:0.005, emEq:0.005, ukEq:0.005, jpnEq:0.005, apacEq:0.005 },
                          tes:    { usEq:0.015, devEq:0.015, emEq:0.015, ukEq:0.015, jpnEq:0.015, apacEq:0.015 } }
,

            { id: "p_sw_lifetime_retire", name: "Scottish Widows Lifetime Investment At-Retirement",
                          weights: { usEq:0.175, devEq:0.060, emEq:0.030, ukEq:0.025, jpnEq:0.020, apacEq:0.015, igCredit:0.200, sdCredit:0.150, globalHighYield:0.050, globalSov:0.120, inflLinked:0.060, moneyMkt:0.080, emDebt:0.015 },
                          alphas: { usEq:0.005, devEq:0.005, emEq:0.005, ukEq:0.005, jpnEq:0.005, apacEq:0.005 },
                          tes:    { usEq:0.015, devEq:0.015, emEq:0.015, ukEq:0.015, jpnEq:0.015, apacEq:0.015 } }
        ]
    },

    // ─── SEI ──────────────────────────────────────────────────────────────────
    {
        name: "SEI",
        portfolios: [
            { id: "p_sei_growth", name: "SEI Flexi Default — Growth Phase",
                          weights: { usEq:0.430, devEq:0.175, emEq:0.090, jpnEq:0.060, ukEq:0.055, apacEq:0.040, listedAlts:0.050, globalHighYield:0.020, igCredit:0.020, sdCredit:0.010, globalSov:0.010, inflLinked:0.010, emDebt:0.010, realEstateDirect:0.010, moneyMkt:0.010 },
                          alphas: { usEq:0.005, devEq:0.005, emEq:0.005, jpnEq:0.005, ukEq:0.005, apacEq:0.005 },
                          tes:    { usEq:0.015, devEq:0.015, emEq:0.015, jpnEq:0.015, ukEq:0.015, apacEq:0.015 } }
,

            { id: "p_sei_retire", name: "SEI Flexi Default At-Retirement Fund",
                          weights: { usEq:0.191, devEq:0.084, emEq:0.034, jpnEq:0.027, ukEq:0.024, apacEq:0.024, globalReits:0.055, globalHighYield:0.037, igCredit:0.030, globalSov:0.067, sdCredit:0.087, inflLinked:0.035, emDebt:0.015, listedAlts:0.040, moneyMkt:0.250 },
                          alphas: { usEq:0.005, devEq:0.005, emEq:0.005, jpnEq:0.005, ukEq:0.005, apacEq:0.005 },
                          tes:    { usEq:0.015, devEq:0.015, emEq:0.015, jpnEq:0.015, ukEq:0.015, apacEq:0.015 } }
        ]
    },

    // ─── SMART 
    {
        name: "Smart",
        portfolios: [
            { id: "p_smart_growth", name: "Smart Sustainable Growth Fund",
                          weights: { usEq:0.524, devEq:0.116, emEq:0.080, jpnEq:0.040, ukEq:0.024, apacEq:0.016, igCredit:0.060, globalHighYield:0.020, globalSov:0.020, privCredit:0.100 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, ukEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075, ukEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_smart_retire", name: "Smart Income Fund (At-Retirement Default)",
                          weights: { usEq:0.279, devEq:0.049, emEq:0.015, jpnEq:0.023, ukEq:0.011, listedAlts:0.029, globalSov:0.198, igCredit:0.346, privCredit:0.050 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, ukEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075, ukEq:0.0075 } }
        ]
    },

    // ─── STANDARD LIFE 
    {
        name: "Standard Life",
        portfolios: [
            { id: "p_sl_sma_growth", name: "SMA Growth Pension Fund (LPNL, Q1 2026)",
                          weights: { usEq:0.463, devEq:0.153, jpnEq:0.094, emEq:0.077, ukEq:0.075, apacEq:0.065, globalReits:0.050, realEstateDirect:0.023 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_sl_sma_preretire", name: "SMA Pre-Retirement Pension Fund (CEMH, Q1 2026)",
                          weights: { usEq:0.311, sdCredit:0.122, devEq:0.103, jpnEq:0.063, igCredit:0.075, emEq:0.053, ukEq:0.051, apacEq:0.045, globalReits:0.040, emDebt:0.038, globalSov:0.043, realEstateDirect:0.023, inflLinked:0.020, moneyMkt:0.013 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_sl_sma_retire", name: "SMA At-Retirement Universal Pension Fund (PLND, Q1 2026)",
                          weights: { sdCredit:0.238, usEq:0.168, igCredit:0.149, emDebt:0.075, globalSov:0.083, devEq:0.056, inflLinked:0.040, jpnEq:0.034, globalReits:0.030, emEq:0.028, ukEq:0.027, moneyMkt:0.025, apacEq:0.024, realEstateDirect:0.023 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
,

            { id: "p_sl_future_growth", name: "SL Future Opportunities Growth (SMA equity 75% + 25% PM)",
                          weights: { usEq:0.301, devEq:0.124, jpnEq:0.076, emEq:0.062, ukEq:0.061, apacEq:0.053, globalReits:0.050, realEstateDirect:0.023, privEq:0.100, infrastructure:0.100, privCredit:0.050 },
                          alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
                          tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── TPP ──────────────────────────────────────────────────────────────────
    {
        name: "TPP",
        // Source: Q1 2026 factsheets (31 March 2026), peoplespension.co.uk. HIGH confidence on sleeve totals.
        // Managers: Amundi (passive developed equity), Invesco (fixed income), State Street (EM equity).
        portfolios: [
            { id: "p_tpp_growth", name: "The People's Pension — Growth (Global Investments, up to 85% shares)",
                          // Source: Global Investment (up to 85% shares) factsheet, 31 March 2026. HIGH confidence.
                          // Fund size £29,995.2m. Benchmark: UK CPI + 2.5% p.a.
                          // Shares 78.4% (exact). Regional breakdown of shares from factsheet (exact):
                          //   US 50.2%, Japan 10.7%, Eurozone 8.7%, UK 7.6%, Asia-EM 6.8%, Rest 16.1%
                          //   "Rest of world" 16.1% split: ~55% apacEq (Aus/HK/Singapore/Korea) + ~45% devEq.
                          // Bond 18.9% (Invesco mandate): IG corp, govt, inflation-linked, HY, EM — sub-split MED.
                          // Infrastructure 3.0% (TPP UK Listed Infrastructure, exact from top-10 holdings).
                          // No cash sleeve (cash = -0.6% derivatives overlay only).
                          // CORRECTION vs prior: usEq 39.2% (was 54.0%), no moneyMkt (was 5.0%), igCredit 9.1% added.
                          weights: { usEq:0.3921, devEq:0.1245, emEq:0.0531, jpnEq:0.0836, ukEq:0.0594, apacEq:0.0691,
                                     igCredit:0.0909, globalSov:0.0519, inflLinked:0.0195,
                                     globalHighYield:0.0130, emDebt:0.0130, infrastructure:0.0299 },
                          alphas: {}, tes: {} }
,

            { id: "p_tpp_retire", name: "The People's Pension — Pre-Retirement Fund (at-retirement default)",
                          // Source: Pre-Retirement Fund factsheet, 31 March 2026. HIGH confidence.
                          // Fund size £6,374.5m. Benchmark: UK CPI + 0.5% p.a.
                          // DEFAULT at-retirement landing fund (not "up to 15% shares" — prior coding corrected).
                          // Bond 78.8% (exact). Shares 20.4% (exact). Infrastructure 0.78% (exact, top-10).
                          // No cash sleeve (cash = -0.3% derivatives overlay only; prior 14% moneyMkt removed).
                          // Regional shares breakdown (exact from factsheet, converted to % of fund):
                          //   US 50.0%, Japan 10.5%, Eurozone 8.7%, UK 7.8%, Asia-EM 6.8%, Rest 16.2% (all × 20.4%).
                          // Bond sub-split MED confidence (Invesco mandate; no published breakdown).
                          //   Govts 30.5% dominant (confirmed by US Treasury + UK Gilt futures in top-10 holdings).
                          weights: { usEq:0.1020, devEq:0.0326, emEq:0.0139, jpnEq:0.0214, ukEq:0.0159, apacEq:0.0182,
                                     igCredit:0.2101, globalSov:0.3048, inflLinked:0.1051,
                                     sdCredit:0.0841, globalHighYield:0.0420, emDebt:0.0420, infrastructure:0.0078 },
                          alphas: {}, tes: {} }
        ]
    },

    // ─── TPT ──────────────────────────────────────────────────────────────────
    {
        name: "TPT",
        portfolios: [
            { id: "p_tpt_growth", name: "TPT Sustainable Future TDF — Growth Phase",
                          weights: { usEq:0.527, devEq:0.093, emEq:0.079, jpnEq:0.043, ukEq:0.029, apacEq:0.021, privEq:0.060, privCredit:0.060, realEstateDirect:0.043, listedAlts:0.045 },
                          alphas: { usEq:0.005, devEq:0.005, emEq:0.005, jpnEq:0.005, ukEq:0.005, apacEq:0.005 },
                          tes:    { usEq:0.015, devEq:0.015, emEq:0.015, jpnEq:0.015, ukEq:0.015, apacEq:0.015 } }
,

            { id: "p_tpt_retire", name: "TPT Sustainable Future TDF — At-Retirement",
                          weights: { usEq:0.232, devEq:0.040, emEq:0.013, jpnEq:0.019, ukEq:0.012, apacEq:0.009, privCredit:0.103, privEq:0.011, realEstateDirect:0.012, inflLinked:0.248, igCredit:0.117, sdCredit:0.089, globalSov:0.076, listedAlts:0.019 },
                          alphas: { usEq:0.005, devEq:0.005, emEq:0.005, jpnEq:0.005, ukEq:0.005, apacEq:0.005 },
                          tes:    { usEq:0.015, devEq:0.015, emEq:0.015, jpnEq:0.015, ukEq:0.015, apacEq:0.015 } }
        ]
    }
];
