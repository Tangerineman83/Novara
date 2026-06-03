/**
 * ============================================================
 * FILE: js/data/stress-scenarios.js
 * PURPOSE: Market stress scenario definitions for portfolio
 *          drawdown and tail risk analysis.
 * ============================================================
 *
 * WHAT THIS FILE CONTAINS:
 *   STRESS_SCENARIOS — array of named market stress events. Each
 *   scenario defines percentage drawdowns per asset class that
 *   are applied instantaneously to model short-term crisis impact.
 *
 * SCHEMA — each scenario:
 *   id          {string}  Unique identifier. Permanent.
 *   name        {string}  Display name (event label).
 *   description {string}  Brief description for tooltip.
 *   shocks      {object}  assetKey → decimal shock (negative = drawdown).
 *                         e.g. { usEq: -0.35 } = 35% drawdown.
 *                         Assets omitted from shocks object = 0% shock.
 *
 * METHODOLOGY:
 *   Shocks are calibrated to observed peak-to-trough drawdowns during
 *   the named historical episodes, adjusted where necessary for
 *   institutional (unleveraged) portfolio exposures.
 *
 *   Key scenarios and primary sources:
 *   - Global Financial Crisis (2008-09): Bloomberg, MSCI historical data
 *   - COVID Shock (2020):               Bloomberg, IMF
 *   - Inflation Shock (2022):           Bloomberg, Ruffer review 2023
 *   - Dot-Com Bust (2000-02):           MSCI, S&P historical
 *   - Mild Recession:                   Novara proprietary scenario
 *
 * HOW TO UPDATE / ADD A SCENARIO:
 *   1. Research peak-to-trough drawdowns for the event.
 *   2. Apply shocks consistently across correlated asset classes.
 *   3. Bonds/cash shocks: be careful — some crises see flight-to-quality.
 *   4. Add a new entry; update audit trail.
 *   5. Do NOT change existing id values — they may be in user state.
 *
 * DEPENDENCIES:
 *   data/asset-classes.js (shock key validation reference).
 *   Consumed by: config.js → app.js (stress test panel).
 *
 * AUDIT TRAIL:
 * ┌─────────────┬──────────────┬──────────────────────────────────────────────┐
 * │ Date        │ Author       │ Description                                  │
 * ├─────────────┼──────────────┼──────────────────────────────────────────────┤
 * │ 2025-01-01  │ Novara       │ Initial 5 stress scenarios                   │
 * │ 2026-05-27  │ Novara/AI    │ Extracted to js/data/stress-scenarios.js     │
 * └─────────────┴──────────────┴──────────────────────────────────────────────┘
 *
 * FOR AI ASSISTANTS:
 *   - id values are permanent (may be referenced in user state).
 *   - All shock keys must exist in data/asset-classes.js.
 *   - Shock values are decimals: -0.35 = 35% loss. Positive values allowed
 *     (e.g. bonds during equity flight-to-quality).
 *   - When adding scenarios, validate that correlated assets have
 *     consistent direction (equity classes should move together in crises).
 */

export const STRESS_SCENARIOS = [
    {
        id: "s_1929_crash", name: "1929 Great Depression",
        description: "Catastrophic collapse; Digital Assets proxied via 1920s speculative industrials.",
        returns: { usEq: -0.890, devEq: -0.650, emEq: -0.450, jpnEq: -0.400, ukEq: -0.550, apacEq: -0.450, globalReits: -0.700, realEstateDirect: -0.350, infrastructure: -0.250, privEq: -0.450, privCredit: -0.300, listedAlts: -0.600, digitalAssets: -0.920, globalHighYield: -0.400, emDebt: -0.350, igCredit: -0.150, sdCredit: -0.050, globalSov: 0.120, inflLinked: -0.100, moneyMkt: 0.040 }
    },
    {
        id: "s_1973_oil", name: "1973 Oil Crisis",
        description: "Severe stagflation; Digital Assets proxied via high-growth Nifty-50 tech.",
        returns: { usEq: -0.480, devEq: -0.440, emEq: -0.350, jpnEq: -0.320, ukEq: -0.700, apacEq: -0.380, globalReits: -0.350, realEstateDirect: -0.200, infrastructure: -0.250, privEq: -0.300, privCredit: -0.150, listedAlts: -0.280, digitalAssets: -0.550, globalHighYield: -0.220, emDebt: -0.250, igCredit: -0.180, sdCredit: -0.080, globalSov: -0.150, inflLinked: 0.050, moneyMkt: 0.090 }
    },
    {
        id: "s_1987_monday", name: "1987 Black Monday",
        description: "Global flash crash; Digital Assets proxied via early software/semiconductors.",
        returns: { usEq: -0.226, devEq: -0.220, emEq: -0.200, jpnEq: -0.150, ukEq: -0.260, apacEq: -0.180, globalReits: -0.250, realEstateDirect: -0.050, infrastructure: -0.040, privEq: -0.080, privCredit: -0.020, listedAlts: -0.220, digitalAssets: -0.320, globalHighYield: -0.120, emDebt: -0.100, igCredit: -0.060, sdCredit: -0.020, globalSov: 0.050, inflLinked: 0.030, moneyMkt: 0.010 }
    },
    {
        id: "s_1990_japan", name: "1990 Japanese Bubble Burst",
        description: "Bursting of the extreme asset and real estate bubble.",
        returns: { usEq: -0.150, devEq: -0.180, emEq: -0.100, jpnEq: -0.630, ukEq: -0.120, apacEq: -0.250, globalReits: -0.450, realEstateDirect: -0.400, infrastructure: -0.150, privEq: -0.250, privCredit: -0.100, listedAlts: -0.350, digitalAssets: 0.000, globalHighYield: -0.150, emDebt: -0.120, igCredit: -0.080, sdCredit: -0.040, globalSov: 0.120, inflLinked: 0.080, moneyMkt: 0.060 }
    },
    {
        id: "s_1992_erm", name: "1992 ERM Crisis",
        description: "Sterling collapse and sudden interest rate spike.",
        returns: { usEq: -0.050, devEq: -0.080, emEq: -0.050, jpnEq: -0.050, ukEq: -0.150, apacEq: -0.040, globalReits: -0.120, realEstateDirect: -0.100, infrastructure: -0.060, privEq: -0.080, privCredit: -0.040, listedAlts: -0.100, digitalAssets: 0.000, globalHighYield: -0.050, emDebt: -0.080, igCredit: -0.100, sdCredit: -0.040, globalSov: -0.120, inflLinked: -0.050, moneyMkt: 0.150 }
    },
    {
        id: "s_1997_asian", name: "1997 Asian Financial Crisis",
        description: "EM currency contagion and growth collapse.",
        returns: { usEq: -0.100, devEq: -0.120, emEq: -0.650, jpnEq: -0.200, ukEq: -0.080, apacEq: -0.550, globalReits: -0.150, realEstateDirect: -0.100, infrastructure: -0.080, privEq: -0.150, privCredit: -0.100, listedAlts: -0.120, digitalAssets: 0.000, globalHighYield: -0.180, emDebt: -0.350, igCredit: -0.050, sdCredit: -0.020, globalSov: 0.060, inflLinked: 0.030, moneyMkt: 0.040 }
    },
    {
        id: "s_1998_ltcm", name: "1998 Russian/LTCM Crisis",
        description: "Flight to liquidity triggered by systemic hedge fund collapse.",
        returns: { usEq: -0.180, devEq: -0.150, emEq: -0.300, jpnEq: -0.100, ukEq: -0.120, apacEq: -0.200, globalReits: -0.150, realEstateDirect: -0.100, infrastructure: -0.050, privEq: -0.100, privCredit: -0.150, listedAlts: -0.180, digitalAssets: 0.000, globalHighYield: -0.200, emDebt: -0.350, igCredit: -0.080, sdCredit: -0.030, globalSov: 0.100, inflLinked: 0.050, moneyMkt: 0.050 }
    },
    {
        id: "s_2000_dotcom", name: "2000 Dot-Com Bubble",
        description: "Tech-led collapse; Digital Assets proxied via Nasdaq-100.",
        returns: { usEq: -0.470, devEq: -0.450, emEq: -0.350, jpnEq: -0.380, ukEq: -0.440, apacEq: -0.320, globalReits: 0.450, realEstateDirect: 0.120, infrastructure: -0.110, privEq: -0.270, privCredit: -0.050, listedAlts: -0.280, digitalAssets: -0.780, globalHighYield: -0.120, emDebt: -0.150, igCredit: 0.100, sdCredit: 0.060, globalSov: 0.200, inflLinked: 0.140, moneyMkt: 0.050 }
    },
    {
        id: "s_2008_gfc", name: "2008 Global Financial Crisis",
        description: "Systemic credit crunch; Digital Assets proxied via high-beta financials.",
        returns: { usEq: -0.550, devEq: -0.530, emEq: -0.540, jpnEq: -0.420, ukEq: -0.480, apacEq: -0.450, globalReits: -0.640, realEstateDirect: -0.220, infrastructure: -0.120, privEq: -0.280, privCredit: -0.200, listedAlts: -0.520, digitalAssets: -0.850, globalHighYield: -0.260, emDebt: -0.180, igCredit: -0.150, sdCredit: -0.050, globalSov: 0.120, inflLinked: 0.080, moneyMkt: 0.020 }
    },
    {
        id: "s_2011_euro", name: "2011 Eurozone Debt Crisis",
        description: "Sovereign default fears in peripheral Europe.",
        returns: { usEq: -0.180, devEq: -0.280, emEq: -0.250, jpnEq: -0.120, ukEq: -0.150, apacEq: -0.150, globalReits: -0.180, realEstateDirect: -0.150, infrastructure: -0.060, privEq: -0.120, privCredit: -0.050, listedAlts: -0.200, digitalAssets: 0.000, globalHighYield: -0.150, emDebt: -0.180, igCredit: -0.100, sdCredit: -0.030, globalSov: 0.080, inflLinked: 0.050, moneyMkt: 0.010 }
    },
    {
        id: "s_2014_crude", name: "2014 Brent Crude Crisis",
        description: "Oil price collapse impacting energy sectors.",
        returns: { usEq: -0.060, devEq: -0.110, emEq: -0.230, jpnEq: -0.050, ukEq: -0.100, apacEq: -0.080, globalReits: -0.050, realEstateDirect: -0.020, infrastructure: -0.180, privEq: -0.050, privCredit: -0.040, listedAlts: -0.080, digitalAssets: 0.000, globalHighYield: -0.120, emDebt: -0.160, igCredit: -0.050, sdCredit: -0.010, globalSov: 0.040, inflLinked: 0.020, moneyMkt: 0.010 }
    },
    {
        id: "s_2015_snb", name: "2015 Swiss Franc Shock",
        description: "Extreme currency volatility from sudden de-pegging.",
        returns: { usEq: -0.040, devEq: -0.100, emEq: -0.050, jpnEq: -0.020, ukEq: -0.030, apacEq: -0.030, globalReits: -0.050, realEstateDirect: -0.020, infrastructure: -0.020, privEq: -0.030, privCredit: -0.050, listedAlts: -0.040, digitalAssets: 0.000, globalHighYield: -0.050, emDebt: -0.060, igCredit: -0.040, sdCredit: -0.010, globalSov: 0.020, inflLinked: 0.010, moneyMkt: 0.000 }
    },
    {
        id: "s_2016_brexit", name: "2016 Brexit Shock",
        description: "Localized sterling and UK asset panic.",
        returns: { usEq: -0.050, devEq: -0.090, emEq: -0.060, jpnEq: -0.050, ukEq: -0.120, apacEq: -0.050, globalReits: -0.100, realEstateDirect: -0.150, infrastructure: -0.030, privEq: -0.050, privCredit: -0.020, listedAlts: -0.080, digitalAssets: 0.000, globalHighYield: -0.040, emDebt: -0.050, igCredit: -0.030, sdCredit: -0.010, globalSov: 0.050, inflLinked: 0.080, moneyMkt: 0.010 }
    },
    {
        id: "s_2020_covid", name: "2020 COVID-19 Flash Crash",
        description: "Realized drawdown for Bitcoin during the March 2020 liquidity event.",
        returns: { usEq: -0.340, devEq: -0.330, emEq: -0.320, jpnEq: -0.240, ukEq: -0.330, apacEq: -0.280, globalReits: -0.300, realEstateDirect: -0.080, infrastructure: -0.120, privEq: -0.180, privCredit: -0.120, listedAlts: -0.250, digitalAssets: -0.520, globalHighYield: -0.150, emDebt: -0.130, igCredit: -0.120, sdCredit: -0.040, globalSov: 0.080, inflLinked: 0.050, moneyMkt: 0.010 }
    },
    {
        id: "s_2022_uk_bond", name: "2022 UK Bond Crash",
        description: "Historic sell-off in UK sovereign debt triggering broader fixed-income panic.",
        returns: { usEq: -0.080, devEq: -0.120, emEq: -0.100, jpnEq: -0.050, ukEq: -0.150, apacEq: -0.080, globalReits: -0.180, realEstateDirect: -0.120, infrastructure: -0.050, privEq: -0.080, privCredit: -0.050, listedAlts: -0.100, digitalAssets: -0.200, globalHighYield: -0.120, emDebt: -0.150, igCredit: -0.220, sdCredit: -0.080, globalSov: -0.280, inflLinked: -0.300, moneyMkt: 0.020 }
    },
    {
        id: "s_2022_uk_ldi", name: "2022 UK Gilt Crisis (LDI)",
        description: "Leverage unwind; Digital Assets reflects the broad 2022 crypto winter.",
        returns: { usEq: -0.190, devEq: -0.170, emEq: -0.200, jpnEq: -0.100, ukEq: -0.150, apacEq: -0.170, globalReits: -0.250, realEstateDirect: -0.150, infrastructure: -0.080, privEq: -0.150, privCredit: -0.080, listedAlts: -0.180, digitalAssets: -0.640, globalHighYield: -0.130, emDebt: -0.180, igCredit: -0.200, sdCredit: -0.050, globalSov: -0.350, inflLinked: -0.450, moneyMkt: 0.030 }
    },
    {
        id: "s_2022_ukraine", name: "Geopolitical Escalation (2022)",
        description: "Global commodity shock driving structural inflation.",
        returns: { usEq: -0.180, devEq: -0.220, emEq: -0.250, jpnEq: -0.080, ukEq: -0.080, apacEq: -0.120, globalReits: -0.150, realEstateDirect: -0.100, infrastructure: 0.080, privEq: -0.100, privCredit: -0.040, listedAlts: -0.120, digitalAssets: -0.200, globalHighYield: -0.100, emDebt: -0.200, igCredit: -0.120, sdCredit: -0.030, globalSov: -0.150, inflLinked: 0.120, moneyMkt: 0.040 }
    },
    {
        id: "s_2023_svb", name: "2023 US Banking Crisis",
        description: "Digital bank runs testing mid-tier financial stability.",
        returns: { usEq: -0.080, devEq: -0.070, emEq: -0.050, jpnEq: -0.040, ukEq: -0.060, apacEq: -0.040, globalReits: -0.100, realEstateDirect: -0.050, infrastructure: -0.020, privEq: -0.050, privCredit: -0.050, listedAlts: -0.080, digitalAssets: -0.150, globalHighYield: -0.080, emDebt: -0.060, igCredit: -0.060, sdCredit: -0.020, globalSov: 0.040, inflLinked: 0.020, moneyMkt: 0.040 }
    },
    {
        id: "s_2025_liberation", name: "Fiscal Stimulus / Deregulation Boom",
        description: "Hypothetical upside scenario: aggressive fiscal stimulus and deregulation driving broad asset price surge. Note: not calibrated to the actual April 2025 tariff escalation event, which produced negative equity returns.",
        returns: { usEq: 0.150, devEq: 0.080, emEq: 0.050, jpnEq: 0.070, ukEq: 0.060, apacEq: 0.050, globalReits: 0.120, realEstateDirect: 0.080, infrastructure: 0.100, privEq: 0.140, privCredit: 0.060, listedAlts: 0.090, digitalAssets: 0.450, globalHighYield: 0.050, emDebt: 0.040, igCredit: -0.020, sdCredit: 0.010, globalSov: -0.040, inflLinked: 0.020, moneyMkt: 0.010 }
    },
    {
        id: "s_green_bubble", name: "Green Bubble Burst",
        description: "Valuation correction in ESG and transition-aligned assets.",
        returns: { usEq: -0.250, devEq: -0.220, emEq: -0.300, jpnEq: -0.150, ukEq: -0.200, apacEq: -0.200, globalReits: -0.200, realEstateDirect: -0.150, infrastructure: -0.400, privEq: -0.300, privCredit: -0.150, listedAlts: -0.350, digitalAssets: -0.100, globalHighYield: -0.180, emDebt: -0.200, igCredit: -0.100, sdCredit: -0.050, globalSov: 0.050, inflLinked: 0.020, moneyMkt: 0.010 }
    },
    {
        id: "s_cyber_crash", name: "Systemic Cyber-Crash",
        description: "Total infrastructure failure stopping market trading.",
        returns: { usEq: -0.150, devEq: -0.150, emEq: -0.150, jpnEq: -0.150, ukEq: -0.150, apacEq: -0.150, globalReits: -0.200, realEstateDirect: -0.200, infrastructure: -0.100, privEq: -0.150, privCredit: -0.200, listedAlts: -0.200, digitalAssets: -0.100, globalHighYield: -0.200, emDebt: -0.200, igCredit: -0.150, sdCredit: -0.100, globalSov: 0.000, inflLinked: 0.000, moneyMkt: 0.000 }
    },
    {
        id: "s_dollar_deposed", name: "Dollar Reserve Crisis",
        description: "Global shift away from USD as primary reserve currency.",
        returns: { usEq: -0.400, devEq: -0.120, emEq: 0.150, jpnEq: 0.100, ukEq: -0.150, apacEq: 0.100, globalReits: -0.250, realEstateDirect: -0.150, infrastructure: 0.050, privEq: -0.200, privCredit: -0.100, listedAlts: -0.150, digitalAssets: 0.200, globalHighYield: -0.150, emDebt: 0.200, igCredit: -0.250, sdCredit: -0.100, globalSov: -0.300, inflLinked: 0.250, moneyMkt: -0.050 }
    },
    {
        id: "s_2026_iran",
        name: "2026 Iran Energy Shock",
        description: "Largest oil supply disruption in recorded history; Strait of Hormuz closure drives Brent above $100, hawkish rate repricing, and EM stress.",
        returns: { usEq: -0.170, devEq: -0.220, emEq: -0.240, jpnEq: -0.150, ukEq: -0.120, apacEq: -0.200, globalReits: -0.160, realEstateDirect: -0.100, infrastructure: 0.065, privEq: -0.110, privCredit: -0.060, listedAlts: -0.130, digitalAssets: -0.250, globalHighYield: -0.110, emDebt: -0.190, igCredit: -0.090, sdCredit: -0.030, globalSov: -0.065, inflLinked: 0.095, moneyMkt: 0.020 }
    }
];
