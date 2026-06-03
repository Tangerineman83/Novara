/**
 * ============================================================
 * FILE: js/data/strategies.js
 * PURPOSE: Investment strategy definitions for all providers
 *          and comparator strategies used in VFM analysis.
 * ============================================================
 *
 * WHAT THIS FILE CONTAINS:
 *   STRATEGY_GROUPS — two groups:
 *     [0] grp_comparators       — non-provider comparator strategies (Optimal DC etc.)
 *     [1] grp_provider_strategies — 23 DC provider default strategies
 *
 * SCHEMA — each group:
 *   groupId     {string}   Unique identifier. Permanent.
 *   groupName   {string}   Display name.
 *   isProvider  {boolean}  true = included in VFM provider ranking table.
 *   strategies  {array}    Strategy objects (schema below).
 *
 * SCHEMA — each strategy object:
 *   strategyId   {string}  Unique id. PERMANENT — stored in user localStorage.
 *                          Never rename or remove.
 *   name         {string}  Display label.
 *   notes        {string?} Confidence level, source documents, editorial notes.
 *                          Format: "[CONFIDENCE] Source: [doc ref]. [Notes]."
 *   isProvider   {boolean} Mirrors parent group.
 *   points       {array}   Glidepath lifecycle points (schema below).
 *
 * SCHEMA — each points entry:
 *   years    {number}  Years to retirement (50 = far, 0 = at retirement).
 *   weights  {object}  portfolioId -> weight (decimal). Weights must sum to 1.0.
 *                      portfolioId must exist in data/portfolios.js.
 *   Exactly 3 points per strategy: years=50 (accumulation), years=X (de-risk
 *   start), years=0 (at-retirement landing). See notes field for X.
 *
 * CONFIDENCE LEVELS (in notes field):
 *   HIGH  = exact % from published factsheet, SIP table, or Chair's statement
 *   MED   = inferred from official document descriptions / category breakdowns
 *   LOW   = estimated from sector descriptions; treat as indicative only
 *
 * DATA SOURCES:
 *   Published SIPs, Chair's Annual Governance Statements, factsheets, KFDs.
 *   Detailed provenance in notes field per strategy and in cma_commentary.md.
 *   Full source trail in provider_strategies_consolidated_2.js (source file).
 *
 * HOW TO ADD A STRATEGY:
 *   1. Add the portfolio(s) to data/portfolios.js first.
 *   2. Create a strategy object with unique strategyId.
 *   3. Define 3 lifecycle points (years=50, de-risk start, years=0).
 *   4. Set notes with confidence level and source reference.
 *   5. Add audit entry below.
 *
 * DEPENDENCIES:
 *   data/portfolios.js (portfolioId resolution).
 *   Consumed by: config.js -> app.js.
 *
 * AUDIT TRAIL:
 * \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
 * | Date        | Author       | Description                                  |
 * |\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500|\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500|\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500|
 * | 2025-01-01  | Novara       | Initial provider and comparator strategies   |
 * | 2026-03-01  | Novara       | VFM comparator rankings updated              |
 * | 2026-05-27  | Novara/AI    | Extracted from config.js to strategies.js    |
 * | 2026-06-03  | Novara/AI    | Major update (v2): strategies rebuilt from   |
 * |             |              |   provider_strategies_consolidated_2.js;     |
 * |             |              |   notes field added with confidence ratings  |
 * |             |              |   and source references per strategy;        |
 * |             |              |   L&G LAF added; Aviva MFF/Vision expanded;  |
 * |             |              |   Std Life SMA + Future Opps added;          |
 * |             |              |   all 23 strategies verified weight sums     |
 * \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
 *
 * FOR AI ASSISTANTS:
 *   - strategyId values are permanent foreign keys (stored in localStorage).
 *     NEVER rename or remove a strategyId.
 *   - All portfolioId values in points must exist in data/portfolios.js.
 *   - notes field should preserve confidence level and source document references.
 *   - Each strategy must have exactly 3 points: years=50, years=N, years=0.
 *   - isProvider=true strategies appear in the VFM league table ranking.
 */

export const STRATEGY_GROUPS = [
    {
        groupId: 'grp_comparators',
        groupName: 'Comparators',
        isProvider: false,
        strategies: [
            {
                strategyId: 'strat_optimal_dc_strategy_potential',
                name: 'Optimal DC Strategy Potential',
                isProvider: false,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_opt2_growth: 1
                          }
                      },
                    {
                        years: 10,
                        weights: {
                            p_opt2_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_opt2_retire: 1
                          }
                      }
                ]
              }
        ]
      },
    {
        groupId: 'grp_provider_strategies',
        groupName: 'DC Provider Default Strategies',
        isProvider: true,
        strategies: [
            {
                strategyId: 'strat_l_g_target_date_fund__drawdown_default_',
                name: 'L&G Target Date Fund (Drawdown Default)',
                notes: 'TDF. 100% growth assets until 10 yrs before retirement (post-2025 review; bonds removed from growth phase). De-risking 10→0 yrs. Drawdown-targeting at-retirement. £35bn+ AUM. MED confidence on growth proportions (chart not text-accessible). HIGH on structure (100% growth confirmed, 1% PM confirmed). Sources: 2025 TDF Range Brochure (June 2025); Inside L&G Sept 2025.',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_lg_tdf_growth: 1
                          }
                      },
                    {
                        years: 10,
                        weights: {
                            p_lg_tdf_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_lg_tdf_retire: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_l_g_target_date_fund__cash_annuity_targe',
                name: 'L&G Target Date Fund (Cash/Annuity Target)',
                notes: 'TDF (cash-targeting variant). Same growth phase as drawdown TDF. At-retirement: higher cash/SD credit weighting vs drawdown variant. L&G offers both TDF 3 (drawdown) and Cash TDF variants; this uses the same retirement portfolio as it best represents the at-retirement landing for most members. Sources: as above.',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_lg_tdf_growth: 1
                          }
                      },
                    {
                        years: 10,
                        weights: {
                            p_lg_tdf_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_lg_tdf_retire: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_l_g_lifetime_advantage_fund__laf_',
                name: 'L&G Lifetime Advantage Fund (LAF)',
                notes: 'TDF (core default for contract-based clients from Jan 2025). 100% growth assets until 10 yrs; 85% ESG/factor equity (Sustainable Focus, Climate Action, Technology sleeves) + 15% PMAF. PMAF: affordable housing, renewable energy infra, BTR, university spinouts/VC, private credit. LAF surpassed 10% PM (May 2026); targeting 15%. £25bn AUM (May 2026). MED confidence on PM sub-split and equity proportions. De-risking 10→0 yrs; uses TDF retire as at-retirement proxy. Sources: Dec 2024 press release; May 2026 milestone; July 2024 PMAF launch.',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_lg_laf_growth: 1
                          }
                      },
                    {
                        years: 10,
                        weights: {
                            p_lg_laf_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_lg_tdf_retire: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_aviva_my_future_focus__universal_drawdow',
                name: 'Aviva My Future Focus (Universal/Drawdown)',
                notes: 'Lifestyle. 3-fund structure: LTG (90% eq vol, all-equity+property) → Growth (75% eq vol, 15→10 yrs) → Consolidation (35% eq vol, govt-bond dominant, 10→0 yrs). De-risking 15 yrs. Universal default = Consolidation at retirement. Climate transition approach: alpha 0.0025, TE 0.0075 on all listed equity. HIGH confidence (in90131.pdf — exact SAA all 3 funds). Source: static.aviva.io/content/dam/document-library/corporate-pensions/in90131.pdf',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_mff_ltg: 1
                          }
                      },
                    {
                        years: 15,
                        weights: {
                            p_mff_ltg: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_mff_consolidation: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_aviva_my_future_vision',
                name: 'Aviva My Future Vision',
                notes: 'Lifestyle. Same 15-yr 3-fund glidepath as MFF. LTG: 75% listed eq + 25% PM (8.8% PE, 6.3% infra, 3.8% RE, 6.3% priv debt). Growth: 66% eq + 25% PM (priv debt grows to 8.5%) + 9% bonds. Consolidation: 31% eq + 20% PM (14% priv debt dominant) + 49% bonds. Regional eq = MFF proportions scaled to Vision totals (MED). HIGH confidence for sleeve totals. Managers: StepStone/KKR (PE), Invesco (infra), Neuberger/Apollo (priv debt). Mansion House Accord: 10% PM, ≥5% UK. Source: static.aviva.io/content/dam/document-library/corporate-pensions/SP992767.pdf',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_vision_ltg: 1
                          }
                      },
                    {
                        years: 15,
                        weights: {
                            p_vision_ltg: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_vision_consolidation: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_standard_life_sma__sustainable_multi_ass',
                name: 'Standard Life SMA (Sustainable Multi-Asset)',
                notes: 'Lifestyle. 3-fund glidepath: 100% Growth (LPNL, £9.4bn) until 15 yrs; linear transition to 100% Pre-Retirement (CEMH, £3.8bn) at 10 yrs; linear transition to 100% At-Retirement (PLND, £2.7bn) at 0 yrs. Growth = pure equity+property (92.7% eq, 7.3% property). Pre-Retirement ~62.6% eq + bonds/credit. At-Retirement ~33.7% eq + bond-dominant (SD credit 23.8% largest line). Climate transition equity: alpha 0.0025, TE 0.0075. HIGH confidence (all 3 funds sourced from published factsheets Q1 2026). Sources: LPNL.pdf, CEMH.pdf, PLND.pdf (library.standardlife.co.uk).',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_sl_sma_growth: 1
                          }
                      },
                    {
                        years: 15,
                        weights: {
                            p_sl_sma_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_sl_sma_retire: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_standard_life_future_opportunities',
                name: 'Standard Life Future Opportunities',
                notes: 'Lifestyle. Same 3-fund glidepath as SMA. Growth differs: SMA equity scaled to 75% + 25% private markets (10% PE, 10% infrastructure, 5% private credit). Pre-Retirement and At-Retirement = same funds as SMA. Climate transition equity: alpha 0.0025, TE 0.0075. MED confidence for growth (no published factsheet; structure confirmed by Standard Life). Pre-Retirement/At-Retirement HIGH confidence (same sourced funds as SMA).',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_sl_future_growth: 1
                          }
                      },
                    {
                        years: 15,
                        weights: {
                            p_sl_future_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_sl_sma_retire: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_nest_retirement_date_fund',
                name: 'NEST Retirement Date Fund',
                notes: 'TDF. Four phases from Q4 2025 exact data. Foundation (Starter/2068+): 50% Higher Growth + 45% Long-Term Stable Growth — lower equity (36.8%), higher infrastructure (8.9%), moneyMkt 7.4%. Growth plateau (2046-2063, 20-37 yrs): 65% Higher Growth + 30% Long-Term Stable — equity 47.8%, moneyMkt 6.5% (corrected from prior 10.8%). Consolidation (2036, 10 yrs): Income Seeking emerges at 10% — equity rises to 51.5%, gilts 1.1%. Retirement (2026, at TRA): Higher Growth 30% + Income Seeking 40% + Cap Pres 27% + Longevity 2% — sdCredit 20.1% dominant, moneyMkt 10.9% (corrected from prior 21.9%). p_nest_consolidation retained as reference portfolio; glidepath uses Foundation/Growth/Retirement. Climate transition equity throughout (LGIM Future World). HIGH confidence. Source: Q4 2025 PDF.',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_nest_foundation: 1
                          }
                      },
                    {
                        years: 20,
                        weights: {
                            p_nest_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_nest_retire: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_aegon_universal_balanced_collection__ubc',
                name: 'Aegon Universal Balanced Collection (UBC)',
                notes: 'Single blended fund (not lifestyle). GPP/ARC clients. Q1 2026: 78.2% Aegon Diversified + 15.4% Private Markets sleeve (CG Multi-Alternatives LTAF 5% + CG AM Private Credit LTAF 4% + Aegon Global Quant Equity 6%) + 6.1% AAM Multi Asset Credit. Look-through: 54% US equity, 8.1% Europe, 2.5% UK, 0.9% Japan + 13% Intl + 6.3% alts + 8.4% FI. Target 17% LTAF by 2028 (currently ~15.4%). Climate transition alpha/TE on listed equity. Sources: UBC Q1 2026 factsheet; Oct 2025 phase 2 announcement.',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_aegon_ubc_growth: 1
                          }
                      },
                    {
                        years: 6,
                        weights: {
                            p_aegon_ubc_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_aegon_ubc_retire: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_aegon_lifepath_flexi__drawdown_',
                name: 'Aegon LifePath Flexi (Drawdown)',
                notes: 'TDF. Master Trust / TargetPlan. Growth: 100% equity (BlackRock ACS ESG Insights range). De-risk starts 15 yrs (extended from 10 yrs in June 2025). At-retirement: predominantly fixed income + some equity (drawdown). Q1 2026 factsheet (BTL1RT2, £12.1bn): N.America 64.8%, Europe&UK 16.2%, EM 8.7%, Japan 6.7%, APAC 3.3%, RE 4.94%, Cash 1.9%. Climate transition alpha/TE confirmed. NOTE: 20% PM growth / 8% PM retirement announced for Summer 2026 — re-code when live. Source: LifePath Flexi 2052-2054 factsheet Q1 2026.',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_aegon_lp_growth: 1
                          }
                      },
                    {
                        years: 15,
                        weights: {
                            p_aegon_lp_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_aegon_lp_retire: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_fidelity_futurewise_tdf',
                name: 'Fidelity FutureWise TDF',
                notes: 'TDF (since Nov 2022). £25bn AUM (May 2026). CODED AS TARGET STATE: 15% PM in growth (>20 yrs from TRA), phasing down to 0% at 10 yrs. Equity from 2040 factsheet (31.12.2025): NA 68.1%, Eur 12.3%, Asia ex-Jpn 7.8%, Japan 5.9%, EM 1.9%, UK 1.5%. PM via Fidelity Diversified Private Assets LTAF: PE/privCredit/infra/RE/natural capital. Currently ~5% (Oct 2025), target 15% by early 2028. At-retirement: FutureWise Retirement Fund factsheet (1 Apr 2025): 60-80% bonds, balance equity. Climate transition alpha/TE confirmed (BlackRock ACS ESG Insights sub-funds throughout). Sources: 2040 factsheet; Retirement Fund factsheet; SIP Feb 2025; May 2026 announcement.',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_fidelity_fw_growth: 1
                          }
                      },
                    {
                        years: 20,
                        weights: {
                            p_fidelity_fw_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_fidelity_fw_retire: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_scottish_widows_lifetime_investment__gro',
                name: 'Scottish Widows Lifetime Investment (Growth Path)',
                notes: 'New default from March 2025 (replaces PIA). 100% growth assets; de-risking 12 yrs before SRA. To-and-through drawdown target. Robeco SDG tilt (exclusive partnership). No private markets in base default; Plus/Extra variants launched Feb 2026 (11%/23% PM respectively). Factor-based alpha/TE: Robeco SDG = systematic factor + SDG screening (0.005/0.015). MED confidence — factsheet not yet published. Sources: March 2025 launch coverage; Feb 2026 Pensions Expert (LTAF variants).',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_sw_lifetime_growth: 1
                          }
                      },
                    {
                        years: 12,
                        weights: {
                            p_sw_lifetime_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_sw_lifetime_retire: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_royal_london_balanced_lifestyle_strategy',
                name: 'Royal London Balanced Lifestyle Strategy (Drawdown)',
                notes: 'Lifestyle. GP Dynamic 15+ yrs. Journey: GP Dynamic → GP Growth Drawdown (10 yrs) → GP Conservative Drawdown (5 yrs) → GRIP 3 (0 yrs). HIGH confidence for both portfolios (RL adviser data sheets Mar 2026). GRIP 3: 31.6% equity, 50.5% bonds, 7.0% property, 5.8% commodities, 5.1% cash. Manager Trevor Greetham (RLAM). Factor alpha/TE applied to both. Sources: GP Dynamic datasheet 19.03.2026; GRIP 3 data sheet 31.03.2026.',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_rl_gpd: 1
                          }
                      },
                    {
                        years: 15,
                        weights: {
                            p_rl_gpd: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_rl_grip3: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_hargreaves_lansdown_workplace_default',
                name: 'Hargreaves Lansdown Workplace Default',
                notes: 'Lifestyle. HL Growth Fund (84.5% equities, SAA May 2025) → BlackRock MyMap 4 at retirement (6-9% abs vol target, ~50% equity, short-duration bonds). Switching starts 10 yrs before NRA. HIGH confidence for HL Growth (SAA Review 2025 PDF); MED for MyMap 4 (BlackRock factsheet Mar 2026, top 10 exact, remainder estimated). No alpha/TE on either (plain iShares ETF building blocks).',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_hl_growth: 1
                          }
                      },
                    {
                        years: 10,
                        weights: {
                            p_hl_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_hl_mymap4: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_now__pensions_default__journey_path_',
                name: 'NOW: Pensions Default (Journey Path)',
                notes: 'Lifestyle. now: growth fund (74.3% equity sustainable transition, real assets, HY, green bonds, 0.8% PM) → now: retirement countdown fund (pure SD bonds/T-bills/cash, NO equity) over 10-yr de-risk. HIGH confidence on both (Q4 2025 factsheets, 31 Dec 2025). RCF is capital-preservation only — very different from prior coding. Schroders LTAF (PE+infra) will go into growth fund when live (target Q1 2026, 10% PM by 2030). CT alpha/TE on growth equity confirmed (\'sustainable transition\' labelling). Sources: NP/D0246/02/2026 + NP/D0353/02/2026.',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_now_growth: 1
                          }
                      },
                    {
                        years: 10,
                        weights: {
                            p_now_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_now_rcf: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_mercer_master_trust_default__smartpath_',
                name: 'Mercer Master Trust Default (SmartPath)',
                notes: 'Lifestyle→TDF hybrid (SmartPath). Mercer Growth Fund (70% equity, 10% IL bonds; SAA confirmed from chart) → Mercer Diversified Retirement Fund from 8 yrs (35% equity, 20% IL bonds, 13% HY, dominant bond exposure). HIGH confidence on asset class totals (SAA charts from SmartPath brochure); MED on regional equity split (MSCI World applied). CT alpha/TE confirmed (Mercer TCFD 2024, 45% carbon reduction achieved). Schroders LTAF (PE+infra, £350m, Q1 2026) — re-code growth when live. Sources: SmartPath brochure Dec 2024 (pensions.uk.mmc.com).',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_mercer_growth: 1
                          }
                      },
                    {
                        years: 8,
                        weights: {
                            p_mercer_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_mercer_target_drawdown: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_aon_managed_retirement_pathway_fund',
                name: 'Aon Managed Retirement Pathway Fund',
                notes: 'TDF (active+passive). Growth plateau ages 25-45 (90.6% equities). De-risking from 15 yrs (changed 2024; was 7.5 yrs). IL bonds dominant at retirement (30%). UBS Climate Transition equity from Feb 2025. Two LTAFs (~15% each) planned from 2026. HIGH confidence for 87.4% of retirement portfolio; EDITORIAL on 12.6% residual (flag for verification). Source: aonmt.tbs.aon.com Chair\'s Statement Dec 2024.',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_aon_growth: 1
                          }
                      },
                    {
                        years: 15,
                        weights: {
                            p_aon_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_aon_retire: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_lifesight_drawdown_lifecycle__wtw_',
                name: 'LifeSight Drawdown Lifecycle (WTW)',
                notes: 'Lifecycle. 100% LifeSight Equity Fund until 20 yrs from TRA (corrected from 25yr — Appendix D March 2026). Gradual de-risk 20→0 yrs to medium risk drawdown landing: ~35% Equity + 35% DGF + 30% Cash. Equity Fund (£13.1bn): 99.2% equity (WTW Global Diversified Equity Index 75.1%, AMX STOXX Climate Transition 9.2%, MSCI regional 14.9%), 0.8% PE LTAF. DGF (£7.8bn): equities 36.2%, corp bonds 27.7%, govts 10.9%, alts 25.2% (infra 15.6%, property 5.4%, ILS 4.0%). HIGH confidence. Sources: LifeSight Equity Fund and DGF factsheets 31 Mar 2026; Appendix D WTW March 2026.',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_lifesight_equity: 1
                          }
                      },
                    {
                        years: 20,
                        weights: {
                            p_lifesight_equity: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_lifesight_landing: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_cushon_sustainable_investment_strategy',
                name: 'Cushon Sustainable Investment Strategy',
                notes: 'Lifestyle. Growth: 75% equity (Solactive/climate), 15% PM (Schroders ClimatePlus LTAF — renewables, natural capital, climate PE), 10% bonds. De-risking 7 yrs. ClimatePlus auto-switches to Cushon Market Advantage at TRA. HIGH confidence for sleeve totals (direct website); MED for sub-allocations. Sources: cushon.co.uk + SIP May 2025.',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_cushon_growth: 1
                          }
                      },
                    {
                        years: 7,
                        weights: {
                            p_cushon_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_cushon_retire: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_smart_pension_sustainable_growth_default',
                name: 'Smart Pension Sustainable Growth Default',
                notes: 'Lifestyle. Growth: 80% equity, 10% green FI, 10% PM (evolving to 15%: 5% credit + 5% PE/VC + 5% renewables, announced May 2025). Portfolio = announced target state (implementing 12-18 months from May 2025). De-risking 8 yrs. At-retirement: Smart Income Fund (CPI+2.5%). MED-HIGH confidence. Sources: SIP Mar 2024, IPID Jul 2024, top1000funds.com Apr 2024, IPE May 2025.',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_smart_growth: 1
                          }
                      },
                    {
                        years: 8,
                        weights: {
                            p_smart_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_smart_retire: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_sei_master_trust_flexi_access_default',
                name: 'SEI Master Trust Flexi Access Default',
                notes: 'Lifestyle (to-and-through). Growth: 100% SEI Factor Equity (age ≤50). Glide: 100% eq → 26%/20%/29%/25% (Factor Eq/Core/Moderate/Cash) at age 65. Post-65 continues to 100% Moderate at age 88. Platforms: SW + LGIM. No illiquid assets currently. HIGH confidence for top-level splits (Cambridge Univ. factsheet). Sources: SIP Jan 2025, Chair\'s Stmt Jul 2024, flexi default factsheet.',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_sei_growth: 1
                          }
                      },
                    {
                        years: 15,
                        weights: {
                            p_sei_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_sei_retire: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_tpt_sustainable_future_target_date_fund',
                name: 'TPT Sustainable Future Target Date Fund',
                notes: 'TDF (AllianceBernstein). CPI+4% p.a. objective. Growth: >85% overseas equities + 3.5% listed PE trusts (exact P&I Nov 2021) + property + commodities. 19-yr glide. SAA+DAA active overlay. Drawdown-oriented at-retirement. MED-HIGH confidence. Sources: Chair\'s Stmt Sep 2024, Corporate Adviser 2024, P&I Nov 2021.',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_tpt_growth: 1
                          }
                      },
                    {
                        years: 19,
                        weights: {
                            p_tpt_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_tpt_retire: 1
                          }
                      }
                ]
              },
            {
                strategyId: 'strat_the_people_s_pension__b_ce__balanced_def',
                name: 'The People\'s Pension (B&CE) Balanced Default',
                notes: 'Lifestyle. Growth (Global Investments up to 85% shares, £30bn, CPI+2.5%): 78.4% equity, 18.9% bonds, 3.0% listed infrastructure. Equity: US 39.2%, Japan 8.4%, APAC dev 6.9%, Europe 12.4%, UK 5.9%, EM 5.3%. No cash sleeve (prior 5% moneyMkt removed). Bonds: Invesco mandate (IG corp, govt, IL, HY, EM — sub-split MED confidence). At-retirement: Pre-Retirement Fund (£6.4bn, CPI+0.5%), NOT \'up to 15% shares\' (prior coding error corrected). 20.4% equity, 78.8% bonds (govts 30.5%, IG 21.0%, IL 10.5%, SD 8.4%), 0.78% listed infra. HIGH confidence on sleeve totals from Q1 2026 factsheets. Managers: Amundi (passive dev eq), Invesco (FI), State Street (EM).',
                isProvider: true,
                points: [
                    {
                        years: 50,
                        weights: {
                            p_tpp_growth: 1
                          }
                      },
                    {
                        years: 10,
                        weights: {
                            p_tpp_growth: 1
                          }
                      },
                    {
                        years: 0,
                        weights: {
                            p_tpp_retire: 1
                          }
                      }
                ]
              }
        ]
      }
];
