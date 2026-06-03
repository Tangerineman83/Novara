/**
 * ============================================================
 * FILE: js/data/strategies.js
 * PURPOSE: Investment strategy definitions for all providers
 *          and comparator strategies used in VFM analysis.
 * ============================================================
 *
 * WHAT THIS FILE CONTAINS:
 *   STRATEGY_GROUPS — array of strategy group objects. Each group
 *   contains one or more strategy objects defining how assets are
 *   allocated across a member's career via glidepath rules.
 *
 * SCHEMA — each group:
 *   groupId     {string}   Unique identifier. Permanent.
 *   groupName   {string}   Display name.
 *   isProvider  {boolean}  true = included in VFM provider ranking.
 *   strategies  {array}    Strategy objects (schema below).
 *
 * SCHEMA — each strategy object:
 *   strategyId        {string}  Unique id. PERMANENT — stored in user
 *                               localStorage. Never rename or remove.
 *   name              {string}  Display label.
 *   description       {string?} Short description for UI tooltips.
 *   glidepath         {array}   [{years, portfolioId}] — glidepath points.
 *                               years = years-to-retirement (descending).
 *                               portfolioId = references PRESET_PORTFOLIOS.
 *   defaultPortfolioId {string?} Portfolio used when no glidepath applies.
 *
 * GLIDEPATH RULES:
 *   - Points ordered by years descending (furthest first).
 *   - portfolioId must resolve in PRESET_PORTFOLIOS (data/portfolios.js).
 *   - At retirement (years=0) specify the post-retirement / drawdown fund.
 *
 * DATA SOURCES:
 *   Same as data/portfolios.js — provider factsheets and KFDs.
 *   Glidepath breakpoints from published lifestyle/target-date schedules.
 *
 * DEPENDENCIES:
 *   data/portfolios.js (portfolioId resolution).
 *   Consumed by: config.js → app.js.
 *
 * AUDIT TRAIL:
 * ┌─────────────┬──────────────┬──────────────────────────────────────────────┐
 * │ Date        │ Author       │ Description                                  │
 * ├─────────────┼──────────────┼──────────────────────────────────────────────┤
 * │ 2025-01-01  │ Novara       │ Initial provider and comparator strategies   │
 * │ 2026-03-01  │ Novara       │ VFM comparator rankings updated              │
 * │ 2026-05-27  │ Novara/AI    │ Extracted from config.js to strategies.js    │
 * └─────────────┴──────────────┴──────────────────────────────────────────────┘
 *
 * FOR AI ASSISTANTS:
 *   - strategyId values are permanent foreign keys (stored in localStorage).
 *     NEVER rename or remove a strategyId.
 *   - All portfolioId references must resolve in data/portfolios.js.
 *   - isProvider=true strategies appear in the VFM league table ranking.
 *   - isProvider=false strategies are comparators (Optimal DC, Passive, etc.).
 *   - Glidepath years should be monotonically decreasing.
 */

export const STRATEGY_GROUPS = [
        {
        name: "Comparators",
        strategies: [
            // Provider Median is generated dynamically in buildVFMStrategies — no static entries needed here
            { name: "Optimal DC Strategy Potential",
              // Comparator: Optimal DC Strategy Potential. Specified design for illustrative benchmarking.
              // Growth (p_opt2_growth): 75% Global Equity Potential (MSCI ACWI NA-10% adjusted,
              //   50:50 climate-aligned/factor, blended α=0.375%, TE=1.125%) + 25% PM Growth.
              //   Arithmetic 7.70%, geometric≈6.28%.
              // At-retirement (p_opt2_retire): 40% equity + 10% PM Growth + 10% PM Income
              //   + 25% credit mix + 15% listed alts. Arithmetic 7.11%, geometric≈6.07%.
              // De-risk: 10 years to TRA.
              points: [ { years:50, weights:{"p_opt2_growth":1.0} }, { years:10, weights:{"p_opt2_growth":1.0} }, { years:0, weights:{"p_opt2_retire":1.0} } ] },
        ]
    },
    {
        name: "Provider Strategies",
        isProvider: true,
        strategies: [
            { name: "Aegon LifePath Flexi (Drawdown)",
              points: [ { years:50, weights:{"p_aegon_lp_growth":1.0} }, { years:15, weights:{"p_aegon_lp_growth":1.0} }, { years:0, weights:{"p_aegon_lp_retire":1.0} } ] },
            { name: "Aegon Universal Balanced Collection",
              points: [ { years:50, weights:{"p_aegon_ubc_growth":1.0} }, { years:6, weights:{"p_aegon_ubc_growth":1.0} }, { years:0, weights:{"p_aegon_ubc_retire":1.0} } ] },
            { name: "Aon Managed Retirement Pathway Fund",
              points: [ { years:50, weights:{"p_aon_growth":1.0} }, { years:15, weights:{"p_aon_growth":1.0} }, { years:0, weights:{"p_aon_retire":1.0} } ] },
            { name: "Aviva My Future Focus",
              points: [ { years:50, weights:{"p_mff_ltg":1.0} }, { years:15, weights:{"p_mff_ltg":1.0} }, { years:0, weights:{"p_mff_consolidation":1.0} } ] },
            { name: "Aviva My Future Vision (LTAF)",
              points: [ { years:50, weights:{"p_vision_ltg":1.0} }, { years:15, weights:{"p_vision_ltg":1.0} }, { years:0, weights:{"p_vision_consolidation":1.0} } ] },
            { name: "Cushon Sustainable Investment Strategy",
              points: [ { years:50, weights:{"p_cushon_growth":1.0} }, { years:7, weights:{"p_cushon_growth":1.0} }, { years:0, weights:{"p_cushon_retire":1.0} } ] },
            { name: "Fidelity FutureWise TDF",
              points: [ { years:50, weights:{"p_fidelity_fw_growth":1.0} }, { years:20, weights:{"p_fidelity_fw_growth":1.0} }, { years:0, weights:{"p_fidelity_fw_retire":1.0} } ] },
            { name: "Hargreaves Lansdown Workplace Default",
              points: [ { years:50, weights:{"p_hl_growth":1.0} }, { years:10, weights:{"p_hl_growth":1.0} }, { years:0, weights:{"p_hl_mymap4":1.0} } ] },
            { name: "L&G Lifetime Advantage Fund (LAF)",
              points: [ { years:50, weights:{"p_lg_laf_growth":1.0} }, { years:10, weights:{"p_lg_laf_growth":1.0} }, { years:0, weights:{"p_lg_tdf_retire":1.0} } ] },
            { name: "L&G Target Date Fund (Drawdown Default)",
              points: [ { years:50, weights:{"p_lg_tdf_growth":1.0} }, { years:10, weights:{"p_lg_tdf_growth":1.0} }, { years:0, weights:{"p_lg_tdf_retire":1.0} } ] },
            { name: "LifeSight Drawdown Lifecycle (WTW)",
              // Medium Risk Drawdown — LifeSight default strategy (March 2026)
              // Source: Appendix D, WTW Confidential, March 2026
              // Growth: 100% LifeSight Equity Fund throughout
              // De-risk starts 20 years before TRA (corrected from prior 25yr assumption)
              // Landing at TRA: ~35% Equity / 35% DGF / 30% Cash (medium risk drawdown)
              points: [ { years:50, weights:{"p_lifesight_equity":1.0} }, { years:20, weights:{"p_lifesight_equity":1.0} }, { years:0, weights:{"p_lifesight_landing":1.0} } ] },
            { name: "Mercer Master Trust Default",
              points: [ { years:50, weights:{"p_mercer_growth":1.0} }, { years:8, weights:{"p_mercer_growth":1.0} }, { years:0, weights:{"p_mercer_target_drawdown":1.0} } ] },
            { name: "NEST Retirement Date Fund",
              // TDF. Four phases from Q4 2025 exact data.
              // Foundation (Starter/2068+, 45+ yrs): 50% Higher Growth + 45% Long-Term Stable — equity 36.8%, infra 8.9%.
              // Growth plateau (2046-2063, 20-37 yrs): 65% Higher Growth + 30% Long-Term Stable — equity 47.8%, moneyMkt 6.5%.
              // Retirement (2026, at TRA): Higher Growth 30% + Income Seeking 40% + Cap Pres 27% — sdCredit 20.1%, moneyMkt 10.9%.
              // p_nest_consolidation (2036, 10 yrs) available as reference portfolio but not used in glidepath.
              // Glidepath uses Foundation→Growth (20yr)→Retirement (0yr). Source: Q4 2025 PDF.
              points: [ { years:50, weights:{"p_nest_foundation":1.0} }, { years:20, weights:{"p_nest_growth":1.0} }, { years:0, weights:{"p_nest_retire":1.0} } ] },
            { name: "NOW: Pensions Journey Path",
              points: [ { years:50, weights:{"p_now_growth":1.0} }, { years:10, weights:{"p_now_growth":1.0} }, { years:0, weights:{"p_now_rcf":1.0} } ] },
            { name: "Royal London Balanced Lifestyle (Drawdown)",
              points: [ { years:50, weights:{"p_rl_gpd":1.0} }, { years:15, weights:{"p_rl_gpd":1.0} }, { years:0, weights:{"p_rl_grip3":1.0} } ] },
            { name: "Scottish Widows Lifetime Investment",
              points: [ { years:50, weights:{"p_sw_lifetime_growth":1.0} }, { years:12, weights:{"p_sw_lifetime_growth":1.0} }, { years:0, weights:{"p_sw_lifetime_retire":1.0} } ] },
            { name: "SEI Master Trust Flexi Access Default",
              points: [ { years:50, weights:{"p_sei_growth":1.0} }, { years:15, weights:{"p_sei_growth":1.0} }, { years:0, weights:{"p_sei_retire":1.0} } ] },
            { name: "Smart Pension Sustainable Growth Default",
              points: [ { years:50, weights:{"p_smart_growth":1.0} }, { years:8, weights:{"p_smart_growth":1.0} }, { years:0, weights:{"p_smart_retire":1.0} } ] },
            { name: "Standard Life Future Opps",
              points: [ { years:50, weights:{"p_sl_future_growth":1.0} }, { years:15, weights:{"p_sl_future_growth":1.0} }, { years:0, weights:{"p_sl_sma_retire":1.0} } ] },
            { name: "Standard Life SMA",
              points: [ { years:50, weights:{"p_sl_sma_growth":1.0} }, { years:15, weights:{"p_sl_sma_growth":1.0} }, { years:0, weights:{"p_sl_sma_retire":1.0} } ] },
            { name: "The People's Pension (B&CE) Balanced Default",
              // Lifestyle. Growth: Global Investments up to 85% shares (£30bn, CPI+2.5%).
              // At-retirement: Pre-Retirement Fund (£6.4bn, CPI+0.5%) — corrected from prior "up to 15% shares".
              // De-risk: 10yr to TRA. Source: Q1 2026 factsheets (31 March 2026).
              points: [ { years:50, weights:{"p_tpp_growth":1.0} }, { years:10, weights:{"p_tpp_growth":1.0} }, { years:0, weights:{"p_tpp_retire":1.0} } ] },
            { name: "TPT Sustainable Future Target Date Fund",
              points: [ { years:50, weights:{"p_tpt_growth":1.0} }, { years:19, weights:{"p_tpt_growth":1.0} }, { years:0, weights:{"p_tpt_retire":1.0} } ] }
        
        ]
    }
];
