// js/config.js

export const ASSET_CLASSES = [
    { key: "usEq", name: "US Equity", defaultR: 0.075, defaultV: 0.16, defaultK: 1.5, color: "#1D4ED8" },
    { key: "devEq", name: "Dev Europe Equity", defaultR: 0.070, defaultV: 0.16, defaultK: 1.6, color: "#3B82F6" },
    { key: "emEq", name: "EM Equity", defaultR: 0.085, defaultV: 0.20, defaultK: 2.5, color: "#60A5FA" },
    { key: "jpnEq", name: "Japan Equity", defaultR: 0.060, defaultV: 0.15, defaultK: 1.5, color: "#93C5FD" },
    { key: "ukEq", name: "UK Equity", defaultR: 0.065, defaultV: 0.15, defaultK: 1.8, color: "#BFDBFE" },
    { key: "apacEq", name: "Dev APAC (ex-Japan)", defaultR: 0.065, defaultV: 0.16, defaultK: 1.7, color: "#DBEAFE" },
    
    { key: "globalReits", name: "Global REITs", defaultR: 0.060, defaultV: 0.18, defaultK: 2.0, color: "#6D28D9" },
    { key: "realEstateDirect", name: "Real Estate (Direct)", defaultR: 0.055, defaultV: 0.10, defaultK: 2.5, color: "#7E22CE" },
    { key: "infrastructure", name: "Infrastructure", defaultR: 0.065, defaultV: 0.11, defaultK: 2.0, color: "#A855F7" },
    
    { key: "privEq", name: "Private Equity", defaultR: 0.095, defaultV: 0.22, defaultK: 4.5, color: "#B45309" },
    { key: "privCredit", name: "Private Credit", defaultR: 0.075, defaultV: 0.09, defaultK: 3.5, color: "#D97706" },
    { key: "listedAlts", name: "Listed Alts", defaultR: 0.055, defaultV: 0.12, defaultK: 1.5, color: "#F59E0B" },
    { key: "digitalAssets", name: "Digital Assets", defaultR: 0.120, defaultV: 0.50, defaultK: 5.0, color: "#0F172A" },
    
    { key: "globalHighYield", name: "Global High Yield", defaultR: 0.060, defaultV: 0.10, defaultK: 2.5, color: "#047857" },
    { key: "emDebt", name: "EM Debt", defaultR: 0.065, defaultV: 0.12, defaultK: 2.5, color: "#059669" },
    { key: "igCredit", name: "IG Credit", defaultR: 0.045, defaultV: 0.06, defaultK: 1.2, color: "#10B981" },
    { key: "sdCredit", name: "Short Duration Credit", defaultR: 0.035, defaultV: 0.03, defaultK: 1.0, color: "#34D399" },
    { key: "globalSov", name: "Global Sovereign", defaultR: 0.025, defaultV: 0.05, defaultK: 0.5, color: "#0F766E" },
    { key: "inflLinked", name: "Inflation Linked", defaultR: 0.020, defaultV: 0.05, defaultK: 0.5, color: "#0E7490" },
    { key: "moneyMkt", name: "Money Markets", defaultR: 0.025, defaultV: 0.01, defaultK: 0.0, color: "#64748B" }
];

export const CHART_COLORS = [
    { border: '#3B82F6', gradientStart: 'rgba(59, 130, 246, 0.4)', gradientEnd: 'rgba(59, 130, 246, 0.0)' },
    { border: '#10B981', gradientStart: 'rgba(16, 185, 129, 0.4)', gradientEnd: 'rgba(16, 185, 129, 0.0)' },
    { border: '#F59E0B', gradientStart: 'rgba(245, 158, 11, 0.4)', gradientEnd: 'rgba(245, 158, 11, 0.0)' }
];

export const PRESET_CMAS = [
    {
        name: "2026 Q1 Global Equilibrium",
        data: {
            r: { usEq: 0.075, devEq: 0.070, emEq: 0.085, jpnEq: 0.060, ukEq: 0.065, apacEq: 0.065, globalReits: 0.060, realEstateDirect: 0.055, infrastructure: 0.065, privEq: 0.095, privCredit: 0.075, listedAlts: 0.055, digitalAssets: 0.120, globalHighYield: 0.060, emDebt: 0.065, igCredit: 0.045, sdCredit: 0.035, globalSov: 0.025, inflLinked: 0.020, moneyMkt: 0.025 },
            v: { usEq: 0.16, devEq: 0.16, emEq: 0.20, jpnEq: 0.15, ukEq: 0.15, apacEq: 0.16, globalReits: 0.18, realEstateDirect: 0.10, infrastructure: 0.11, privEq: 0.22, privCredit: 0.09, listedAlts: 0.12, digitalAssets: 0.50, globalHighYield: 0.10, emDebt: 0.12, igCredit: 0.06, sdCredit: 0.03, globalSov: 0.05, inflLinked: 0.05, moneyMkt: 0.01 },
            k: { usEq: 1.5, devEq: 1.6, emEq: 2.5, jpnEq: 1.5, ukEq: 1.8, apacEq: 1.7, globalReits: 2.0, realEstateDirect: 2.5, infrastructure: 2.0, privEq: 4.5, privCredit: 3.5, listedAlts: 1.5, digitalAssets: 5.0, globalHighYield: 2.5, emDebt: 2.5, igCredit: 1.2, sdCredit: 1.0, globalSov: 0.5, inflLinked: 0.5, moneyMkt: 0.0 },
            ce: { usEq: 1.0, devEq: 0.95, emEq: 0.85, jpnEq: 0.85, ukEq: 0.95, apacEq: 0.90, globalReits: 0.70, realEstateDirect: 0.40, infrastructure: 0.45, privEq: 0.90, privCredit: 0.45, listedAlts: 0.82, digitalAssets: 0.60, globalHighYield: 0.65, emDebt: 0.50, igCredit: 0.35, sdCredit: 0.25, globalSov: -0.05, inflLinked: 0.15, moneyMkt: 0.0 },
            cc: { usEq: 0.45, devEq: 0.40, emEq: 0.50, jpnEq: 0.35, ukEq: 0.40, apacEq: 0.45, globalReits: 0.55, realEstateDirect: 0.30, infrastructure: 0.40, privEq: 0.45, privCredit: 0.88, listedAlts: 0.45, digitalAssets: 0.20, globalHighYield: 0.85, emDebt: 0.65, igCredit: 1.0, sdCredit: 0.85, globalSov: 0.60, inflLinked: 0.50, moneyMkt: 0.15 }
        }
    }
];

export const PRESET_PERSONAS = [
    { name: "Default (Age 25)", data: { age: 25, retirementAge: 68, savings: 0, salary: 30000, contribution: 10, realSalaryGrowth: 1 } },
    { name: "Mid-Career (Age 40)", data: { age: 40, retirementAge: 68, savings: 50000, salary: 50000, contribution: 10, realSalaryGrowth: 0 } },
    { name: "Late Career (Age 55)", data: { age: 55, retirementAge: 67, savings: 250000, salary: 70000, contribution: 15, realSalaryGrowth: 0 } }
];

export const PRESET_PORTFOLIOS = [
    {
        name: "Standard Core Library",
        portfolios: [
            { id: "p_std_growth", name: "Standard Growth", weights: { usEq: 0.585, devEq: 0.140, emEq: 0.095, jpnEq: 0.055, ukEq: 0.035, apacEq: 0.020, globalReits: 0.05, realEstateDirect: 0.02 }, alpha: 0.0, te: 0.0 },
            { id: "p_ltaf", name: "LTAF", weights: { privEq: 0.35, infrastructure: 0.30, privCredit: 0.30, sdCredit: 0.05 }, alpha: 0.012, te: 0.024 },
            { id: "p_retire", name: "Retirement", weights: { sdCredit: 0.248, usEq: 0.2142, igCredit: 0.150, emDebt: 0.092, globalSov: 0.057, devEq: 0.051, moneyMkt: 0.040, emEq: 0.034, globalReits: 0.025, inflLinked: 0.025, jpnEq: 0.0204, ukEq: 0.0136, privEq: 0.0077, infrastructure: 0.0077, privCredit: 0.0076, apacEq: 0.0068 }, alpha: 0.0, te: 0.0 }
        ]
    },
    {
        name: "Market Peer & Best in Breed (2026)",
        portfolios: [
            { id: "p_peer_growth", name: "Peer Default Growth", weights: { usEq: 0.55, devEq: 0.12, emEq: 0.10, ukEq: 0.05, privEq: 0.04, infrastructure: 0.03, globalReits: 0.04, igCredit: 0.07 }, alpha: 0.0, te: 0.0 },
            { id: "p_peer_retire", name: "Peer Default Retirement", weights: { usEq: 0.15, devEq: 0.08, emEq: 0.03, igCredit: 0.25, sdCredit: 0.22, globalSov: 0.10, moneyMkt: 0.12, infrastructure: 0.02, privCredit: 0.03 }, alpha: 0.0, te: 0.0 },
            { id: "p_bib_growth", name: "Best in Breed Growth", weights: { usEq: 0.40, emEq: 0.20, devEq: 0.10, privEq: 0.10, infrastructure: 0.05, privCredit: 0.05, listedAlts: 0.05, globalReits: 0.05 }, alpha: 0.0, te: 0.0 },
            { id: "p_bib_retire", name: "Best in Breed Retirement", weights: { usEq: 0.20, emEq: 0.05, privCredit: 0.15, igCredit: 0.20, sdCredit: 0.15, inflLinked: 0.15, moneyMkt: 0.10 }, alpha: 0.0, te: 0.0 }
        ]
    }
];

export const INITIAL_PORTFOLIOS = JSON.parse(JSON.stringify(PRESET_PORTFOLIOS.flatMap(g => g.portfolios)));

export const PRESET_STRATEGIES = [
    {
        name: "Standard Glidepath",
        points: [
            { years: 50, weights: { "p_std_growth": 1.0 } },
            { years: 15, weights: { "p_std_growth": 1.0 } },
            { years: 0,  weights: { "p_retire": 1.0 } }
        ]
    },
    {
        name: "Enhanced Glidepath",
        points: [
            { years: 50, weights: { "p_std_growth": 0.75, "p_ltaf": 0.25 } },
            { years: 15, weights: { "p_std_growth": 0.75, "p_ltaf": 0.25 } },
            { years: 0,  weights: { "p_retire": 1.0 } }
        ]
    },
    {
        name: "Peer Default Strategy",
        points: [
            { years: 50, weights: { "p_peer_growth": 1.0 } },
            { years: 15, weights: { "p_peer_growth": 1.0 } },
            { years: 0,  weights: { "p_peer_retire": 1.0 } }
        ]
    },
    {
        name: "Best in Breed Maximiser",
        points: [
            { years: 50, weights: { "p_bib_growth": 1.0 } },
            { years: 12, weights: { "p_bib_growth": 1.0 } },
            { years: 0,  weights: { "p_bib_retire": 1.0 } }
        ]
    }
];

// MACRO ECONOMIC SHOCK SCENARIOS (Chronological Order)
export const STRESS_SCENARIOS = [
    {
        id: "s_1929_crash", name: "1929 Great Depression",
        description: "Catastrophic multi-year equity collapse and deflationary spiral.",
        returns: { usEq: -0.890, devEq: -0.650, emEq: -0.450, jpnEq: -0.400, ukEq: -0.550, apacEq: -0.450, globalReits: -0.700, realEstateDirect: -0.350, infrastructure: -0.250, privEq: -0.450, privCredit: -0.300, listedAlts: -0.600, digitalAssets: 0.000, globalHighYield: -0.400, emDebt: -0.350, igCredit: -0.150, sdCredit: -0.050, globalSov: -0.050, inflLinked: -0.100, moneyMkt: 0.040 }
    },
    {
        id: "s_1973_oil", name: "1973 Oil Crisis",
        description: "Severe stagflation triggered by energy supply shocks.",
        returns: { usEq: -0.480, devEq: -0.440, emEq: -0.350, jpnEq: -0.320, ukEq: -0.700, apacEq: -0.380, globalReits: -0.350, realEstateDirect: -0.200, infrastructure: -0.250, privEq: -0.300, privCredit: -0.150, listedAlts: -0.280, digitalAssets: 0.000, globalHighYield: -0.220, emDebt: -0.250, igCredit: -0.180, sdCredit: -0.080, globalSov: -0.150, inflLinked: 0.050, moneyMkt: 0.090 }
    },
    {
        id: "s_1987_monday", name: "1987 Black Monday",
        description: "Global flash crash testing liquidity and electronic trading limits.",
        returns: { usEq: -0.226, devEq: -0.220, emEq: -0.200, jpnEq: -0.150, ukEq: -0.260, apacEq: -0.180, globalReits: -0.250, realEstateDirect: -0.050, infrastructure: -0.040, privEq: -0.080, privCredit: -0.020, listedAlts: -0.220, digitalAssets: 0.000, globalHighYield: -0.120, emDebt: -0.100, igCredit: -0.060, sdCredit: -0.020, globalSov: 0.050, inflLinked: 0.030, moneyMkt: 0.010 }
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
        description: "Tech-led equity collapse following years of speculation.",
        returns: { usEq: -0.470, devEq: -0.450, emEq: -0.350, jpnEq: -0.380, ukEq: -0.440, apacEq: -0.320, globalReits: 0.450, realEstateDirect: 0.120, infrastructure: -0.110, privEq: -0.270, privCredit: -0.050, listedAlts: -0.280, digitalAssets: 0.000, globalHighYield: -0.120, emDebt: -0.150, igCredit: 0.100, sdCredit: 0.060, globalSov: 0.200, inflLinked: 0.140, moneyMkt: 0.050 }
    },
    {
        id: "s_2008_gfc", name: "2008 Global Financial Crisis",
        description: "Systemic credit crunch and breakdown of global banking liquidity.",
        returns: { usEq: -0.550, devEq: -0.530, emEq: -0.540, jpnEq: -0.420, ukEq: -0.480, apacEq: -0.450, globalReits: -0.640, realEstateDirect: -0.220, infrastructure: -0.120, privEq: -0.280, privCredit: -0.200, listedAlts: -0.520, digitalAssets: -0.300, globalHighYield: -0.260, emDebt: -0.180, igCredit: -0.150, sdCredit: -0.050, globalSov: 0.120, inflLinked: 0.080, moneyMkt: 0.020 }
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
        description: "Rapid global asset liquidation due to lockdowns.",
        returns: { usEq: -0.340, devEq: -0.330, emEq: -0.320, jpnEq: -0.240, ukEq: -0.330, apacEq: -0.280, globalReits: -0.300, realEstateDirect: -0.080, infrastructure: -0.120, privEq: -0.180, privCredit: -0.120, listedAlts: -0.250, digitalAssets: -0.520, globalHighYield: -0.150, emDebt: -0.130, igCredit: -0.120, sdCredit: -0.040, globalSov: 0.080, inflLinked: 0.050, moneyMkt: 0.010 }
    },
    {
        id: "s_2022_uk_ldi", name: "2022 UK Gilt Crisis (LDI)",
        description: "Extreme bond volatility and collateral calls for UK pension funds.",
        returns: { usEq: -0.190, devEq: -0.170, emEq: -0.200, jpnEq: -0.100, ukEq: -0.150, apacEq: -0.170, globalReits: -0.250, realEstateDirect: -0.150, infrastructure: -0.080, privEq: -0.150, privCredit: -0.080, listedAlts: -0.180, digitalAssets: -0.640, globalHighYield: -0.130, emDebt: -0.180, igCredit: -0.200, sdCredit: -0.050, globalSov: -0.350, inflLinked: -0.450, moneyMkt: 0.030 }
    },
    {
        id: "s_2022_ukraine", name: "Geopolitical Escalation",
        description: "Global commodity shock driving structural inflation.",
        returns: { usEq: -0.180, devEq: -0.220, emEq: -0.250, jpnEq: -0.080, ukEq: -0.080, apacEq: -0.120, globalReits: -0.150, realEstateDirect: -0.100, infrastructure: 0.080, privEq: -0.100, privCredit: -0.040, listedAlts: -0.120, digitalAssets: -0.200, globalHighYield: -0.100, emDebt: -0.200, igCredit: -0.120, sdCredit: -0.030, globalSov: -0.150, inflLinked: 0.120, moneyMkt: 0.040 }
    },
    {
        id: "s_2023_svb", name: "2023 US Banking Crisis",
        description: "Digital bank runs testing mid-tier financial stability.",
        returns: { usEq: -0.080, devEq: -0.070, emEq: -0.050, jpnEq: -0.040, ukEq: -0.060, apacEq: -0.040, globalReits: -0.100, realEstateDirect: -0.050, infrastructure: -0.020, privEq: -0.050, privCredit: -0.050, listedAlts: -0.080, digitalAssets: -0.150, globalHighYield: -0.080, emDebt: -0.060, igCredit: -0.060, sdCredit: -0.020, globalSov: 0.040, inflLinked: 0.020, moneyMkt: 0.040 }
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
    }
];
