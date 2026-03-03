// js/config.js

export const ASSET_CLASSES = [
    { key: "usEq", name: "US Equity", category: "Equities", defaultR: 0.075, defaultV: 0.16, defaultK: 1.5, color: "#1D4ED8" },
    { key: "devEq", name: "Dev Europe Equity", category: "Equities", defaultR: 0.070, defaultV: 0.16, defaultK: 1.6, color: "#3B82F6" },
    { key: "emEq", name: "EM Equity", category: "Equities", defaultR: 0.085, defaultV: 0.20, defaultK: 2.5, color: "#60A5FA" },
    { key: "jpnEq", name: "Japan Equity", category: "Equities", defaultR: 0.060, defaultV: 0.15, defaultK: 1.5, color: "#93C5FD" },
    { key: "ukEq", name: "UK Equity", category: "Equities", defaultR: 0.065, defaultV: 0.15, defaultK: 1.8, color: "#BFDBFE" },
    { key: "apacEq", name: "Dev APAC (ex-Japan)", category: "Equities", defaultR: 0.065, defaultV: 0.16, defaultK: 1.7, color: "#DBEAFE" },
    { key: "globalReits", name: "Global REITs", category: "Real Assets", defaultR: 0.060, defaultV: 0.18, defaultK: 2.0, color: "#6D28D9" },
    { key: "realEstateDirect", name: "Real Estate (Direct)", category: "Real Assets", defaultR: 0.055, defaultV: 0.10, defaultK: 2.5, color: "#7E22CE" },
    { key: "infrastructure", name: "Infrastructure", category: "Real Assets", defaultR: 0.065, defaultV: 0.11, defaultK: 2.0, color: "#A855F7" },
    { key: "privEq", name: "Private Equity", category: "Alternatives", defaultR: 0.095, defaultV: 0.22, defaultK: 4.5, color: "#B45309" },
    { key: "listedAlts", name: "Listed Alts", category: "Alternatives", defaultR: 0.055, defaultV: 0.12, defaultK: 1.5, color: "#F59E0B" },
    { key: "digitalAssets", name: "Digital Assets", category: "Alternatives", defaultR: 0.120, defaultV: 0.50, defaultK: 5.0, color: "#0F172A" },
    { key: "privCredit", name: "Private Credit", category: "Credit", defaultR: 0.075, defaultV: 0.09, defaultK: 3.5, color: "#D97706" },
    { key: "globalHighYield", name: "Global High Yield", category: "Credit", defaultR: 0.060, defaultV: 0.10, defaultK: 2.5, color: "#047857" },
    { key: "emDebt", name: "EM Debt", category: "Credit", defaultR: 0.065, defaultV: 0.12, defaultK: 2.5, color: "#059669" },
    { key: "igCredit", name: "IG Credit", category: "Credit", defaultR: 0.045, defaultV: 0.06, defaultK: 1.2, color: "#10B981" },
    { key: "sdCredit", name: "Short Duration Credit", category: "Credit", defaultR: 0.035, defaultV: 0.03, defaultK: 1.0, color: "#34D399" },
    { key: "globalSov", name: "Global Sovereign", category: "Sov & Cash", defaultR: 0.025, defaultV: 0.05, defaultK: 0.5, color: "#0F766E" },
    { key: "inflLinked", name: "Inflation Linked", category: "Sov & Cash", defaultR: 0.020, defaultV: 0.05, defaultK: 0.5, color: "#0E7490" },
    { key: "moneyMkt", name: "Money Markets", category: "Sov & Cash", defaultR: 0.025, defaultV: 0.01, defaultK: 0.0, color: "#64748B" }
];

export const CHART_COLORS = [
    { border: '#3730A3', gradientStart: 'rgba(55, 48, 163, 0.4)', gradientEnd: 'rgba(55, 48, 163, 0.0)' },
    { border: '#059669', gradientStart: 'rgba(5, 150, 105, 0.4)', gradientEnd: 'rgba(5, 150, 105, 0.0)' },   
    { border: '#D97706', gradientStart: 'rgba(217, 119, 6, 0.4)', gradientEnd: 'rgba(217, 119, 6, 0.0)' }    
];

export const PRESET_CMAS = [
    {
        name: "2026 Q1 Global Equilibrium (Updated)",
        data: {
            r: { usEq: 0.070, devEq: 0.072, emEq: 0.086, jpnEq: 0.070, ukEq: 0.065, apacEq: 0.072, globalReits: 0.068, realEstateDirect: 0.062, infrastructure: 0.071, privEq: 0.105, privCredit: 0.082, listedAlts: 0.064, digitalAssets: 0.125, globalHighYield: 0.078, emDebt: 0.075, igCredit: 0.051, sdCredit: 0.048, globalSov: 0.042, inflLinked: 0.045, moneyMkt: 0.035 },
            v: { usEq: 0.155, devEq: 0.150, emEq: 0.220, jpnEq: 0.170, ukEq: 0.140, apacEq: 0.185, globalReits: 0.190, realEstateDirect: 0.140, infrastructure: 0.120, privEq: 0.240, privCredit: 0.100, listedAlts: 0.145, digitalAssets: 0.480, globalHighYield: 0.110, emDebt: 0.140, igCredit: 0.060, sdCredit: 0.040, globalSov: 0.070, inflLinked: 0.060, moneyMkt: 0.010 },
            k: { usEq: 2.40, devEq: 1.90, emEq: 3.80, jpnEq: 2.10, ukEq: 1.60, apacEq: 3.10, globalReits: 2.80, realEstateDirect: 1.10, infrastructure: 1.30, privEq: 1.90, privCredit: 2.70, listedAlts: 2.10, digitalAssets: 5.50, globalHighYield: 2.90, emDebt: 3.40, igCredit: 1.50, sdCredit: 0.40, globalSov: 1.65, inflLinked: 1.80, moneyMkt: 0.15 },
            correlations: {
                usEq: { usEq: 1.00, devEq: 0.75, emEq: 0.68, jpnEq: 0.45, ukEq: 0.65, apacEq: 0.55, globalReits: 0.75, realEstateDirect: 0.40, infrastructure: 0.45, privEq: 0.88, privCredit: 0.42, listedAlts: 0.65, digitalAssets: 0.62, globalHighYield: 0.62, emDebt: 0.50, igCredit: 0.35, sdCredit: 0.25, globalSov: -0.05, inflLinked: 0.12, moneyMkt: 0.00 },
                devEq: { usEq: 0.75, devEq: 1.00, emEq: 0.75, jpnEq: 0.60, ukEq: 0.85, apacEq: 0.70, globalReits: 0.55, realEstateDirect: 0.40, infrastructure: 0.45, privEq: 0.80, privCredit: 0.40, listedAlts: 0.60, digitalAssets: 0.30, globalHighYield: 0.60, emDebt: 0.50, igCredit: 0.20, sdCredit: 0.10, globalSov: -0.10, inflLinked: -0.05, moneyMkt: 0.00 },
                emEq: { usEq: 0.68, devEq: 0.75, emEq: 1.00, jpnEq: 0.55, ukEq: 0.65, apacEq: 0.80, globalReits: 0.50, realEstateDirect: 0.35, infrastructure: 0.40, privEq: 0.70, privCredit: 0.45, listedAlts: 0.55, digitalAssets: 0.40, globalHighYield: 0.65, emDebt: 0.70, igCredit: 0.25, sdCredit: 0.15, globalSov: -0.05, inflLinked: 0.00, moneyMkt: 0.00 },
                jpnEq: { usEq: 0.45, devEq: 0.60, emEq: 0.55, jpnEq: 1.00, ukEq: 0.55, apacEq: 0.60, globalReits: 0.45, realEstateDirect: 0.30, infrastructure: 0.35, privEq: 0.60, privCredit: 0.30, listedAlts: 0.50, digitalAssets: 0.25, globalHighYield: 0.50, emDebt: 0.45, igCredit: 0.15, sdCredit: 0.10, globalSov: -0.05, inflLinked: 0.00, moneyMkt: 0.00 },
                ukEq: { usEq: 0.65, devEq: 0.85, emEq: 0.65, jpnEq: 0.55, ukEq: 1.00, apacEq: 0.60, globalReits: 0.50, realEstateDirect: 0.45, infrastructure: 0.40, privEq: 0.70, privCredit: 0.40, listedAlts: 0.55, digitalAssets: 0.25, globalHighYield: 0.55, emDebt: 0.45, igCredit: 0.20, sdCredit: 0.10, globalSov: -0.05, inflLinked: 0.05, moneyMkt: 0.00 },
                apacEq: { usEq: 0.55, devEq: 0.70, emEq: 0.80, jpnEq: 0.60, ukEq: 0.60, apacEq: 1.00, globalReits: 0.50, realEstateDirect: 0.35, infrastructure: 0.40, privEq: 0.70, privCredit: 0.45, listedAlts: 0.55, digitalAssets: 0.35, globalHighYield: 0.60, emDebt: 0.65, igCredit: 0.20, sdCredit: 0.10, globalSov: -0.05, inflLinked: 0.00, moneyMkt: 0.00 },
                globalReits: { usEq: 0.75, devEq: 0.55, emEq: 0.50, jpnEq: 0.45, ukEq: 0.50, apacEq: 0.50, globalReits: 1.00, realEstateDirect: 0.65, infrastructure: 0.55, privEq: 0.55, privCredit: 0.45, listedAlts: 0.60, digitalAssets: 0.25, globalHighYield: 0.55, emDebt: 0.45, igCredit: 0.35, sdCredit: 0.20, globalSov: 0.10, inflLinked: 0.15, moneyMkt: 0.00 },
                realEstateDirect: { usEq: 0.40, devEq: 0.40, emEq: 0.35, jpnEq: 0.30, ukEq: 0.45, apacEq: 0.35, globalReits: 0.65, realEstateDirect: 1.00, infrastructure: 0.50, privEq: 0.45, privCredit: 0.35, listedAlts: 0.45, digitalAssets: 0.15, globalHighYield: 0.40, emDebt: 0.35, igCredit: 0.25, sdCredit: 0.15, globalSov: 0.05, inflLinked: 0.20, moneyMkt: 0.00 },
                infrastructure: { usEq: 0.45, devEq: 0.45, emEq: 0.40, jpnEq: 0.35, ukEq: 0.40, apacEq: 0.40, globalReits: 0.55, realEstateDirect: 0.50, infrastructure: 1.00, privEq: 0.50, privCredit: 0.40, listedAlts: 0.55, digitalAssets: 0.20, globalHighYield: 0.50, emDebt: 0.45, igCredit: 0.40, sdCredit: 0.25, globalSov: 0.15, inflLinked: 0.30, moneyMkt: 0.00 },
                privEq: { usEq: 0.88, devEq: 0.80, emEq: 0.70, jpnEq: 0.60, ukEq: 0.70, apacEq: 0.70, globalReits: 0.55, realEstateDirect: 0.45, infrastructure: 0.50, privEq: 1.00, privCredit: 0.45, listedAlts: 0.65, digitalAssets: 0.35, globalHighYield: 0.65, emDebt: 0.55, igCredit: 0.20, sdCredit: 0.10, globalSov: -0.15, inflLinked: -0.05, moneyMkt: 0.00 },
                privCredit: { usEq: 0.42, devEq: 0.40, emEq: 0.45, jpnEq: 0.30, ukEq: 0.40, apacEq: 0.45, globalReits: 0.45, realEstateDirect: 0.35, infrastructure: 0.40, privEq: 0.45, privCredit: 1.00, listedAlts: 0.45, digitalAssets: 0.35, globalHighYield: 0.88, emDebt: 0.65, igCredit: 0.85, sdCredit: 0.65, globalSov: 0.25, inflLinked: 0.15, moneyMkt: 0.10 },
                listedAlts: { usEq: 0.65, devEq: 0.60, emEq: 0.55, jpnEq: 0.50, ukEq: 0.55, apacEq: 0.55, globalReits: 0.60, realEstateDirect: 0.45, infrastructure: 0.55, privEq: 0.65, privCredit: 0.45, listedAlts: 1.00, digitalAssets: 0.30, globalHighYield: 0.60, emDebt: 0.50, igCredit: 0.30, sdCredit: 0.20, globalSov: 0.00, inflLinked: 0.05, moneyMkt: 0.00 },
                digitalAssets: { usEq: 0.62, devEq: 0.30, emEq: 0.40, jpnEq: 0.25, ukEq: 0.25, apacEq: 0.35, globalReits: 0.25, realEstateDirect: 0.15, infrastructure: 0.20, privEq: 0.35, privCredit: 0.35, listedAlts: 0.30, digitalAssets: 1.00, globalHighYield: 0.35, emDebt: 0.40, igCredit: 0.05, sdCredit: 0.05, globalSov: -0.10, inflLinked: -0.05, moneyMkt: 0.00 },
                globalHighYield: { usEq: 0.62, devEq: 0.60, emEq: 0.65, jpnEq: 0.50, ukEq: 0.55, apacEq: 0.60, globalReits: 0.55, realEstateDirect: 0.40, infrastructure: 0.50, privEq: 0.65, privCredit: 0.88, listedAlts: 0.60, digitalAssets: 0.35, globalHighYield: 1.00, emDebt: 0.75, igCredit: 0.55, sdCredit: 0.40, globalSov: 0.10, inflLinked: 0.10, moneyMkt: 0.00 },
                emDebt: { usEq: 0.50, devEq: 0.50, emEq: 0.70, jpnEq: 0.45, ukEq: 0.45, apacEq: 0.65, globalReits: 0.45, realEstateDirect: 0.35, infrastructure: 0.45, privEq: 0.55, privCredit: 0.65, listedAlts: 0.50, digitalAssets: 0.40, globalHighYield: 0.75, emDebt: 1.00, igCredit: 0.45, sdCredit: 0.35, globalSov: 0.15, inflLinked: 0.15, moneyMkt: 0.00 },
                igCredit: { usEq: 0.35, devEq: 0.20, emEq: 0.25, jpnEq: 0.15, ukEq: 0.20, apacEq: 0.20, globalReits: 0.35, realEstateDirect: 0.25, infrastructure: 0.40, privEq: 0.20, privCredit: 0.85, listedAlts: 0.30, digitalAssets: 0.05, globalHighYield: 0.55, emDebt: 0.45, igCredit: 1.00, sdCredit: 0.85, globalSov: 0.70, inflLinked: 0.65, moneyMkt: 0.15 },
                sdCredit: { usEq: 0.25, devEq: 0.10, emEq: 0.15, jpnEq: 0.10, ukEq: 0.10, apacEq: 0.10, globalReits: 0.20, realEstateDirect: 0.15, infrastructure: 0.25, privEq: 0.10, privCredit: 0.65, listedAlts: 0.20, digitalAssets: 0.05, globalHighYield: 0.40, emDebt: 0.35, igCredit: 0.85, sdCredit: 1.00, globalSov: 0.55, inflLinked: 0.50, moneyMkt: 0.25 },
                globalSov: { usEq: -0.05, devEq: -0.10, emEq: -0.05, jpnEq: -0.05, ukEq: -0.05, apacEq: -0.05, globalReits: 0.10, realEstateDirect: 0.05, infrastructure: 0.15, privEq: -0.15, privCredit: 0.25, listedAlts: 0.00, digitalAssets: -0.10, globalHighYield: 0.10, emDebt: 0.15, igCredit: 0.70, sdCredit: 0.55, globalSov: 1.00, inflLinked: 0.85, moneyMkt: 0.20 },
                inflLinked: { usEq: 0.12, devEq: -0.05, emEq: 0.00, jpnEq: 0.00, ukEq: 0.05, apacEq: 0.00, globalReits: 0.15, realEstateDirect: 0.20, infrastructure: 0.30, privEq: -0.05, privCredit: 0.15, listedAlts: 0.05, digitalAssets: -0.05, globalHighYield: 0.10, emDebt: 0.15, igCredit: 0.65, sdCredit: 0.50, globalSov: 0.85, inflLinked: 1.00, moneyMkt: 0.15 },
                moneyMkt: { usEq: 0.00, devEq: 0.00, emEq: 0.00, jpnEq: 0.00, ukEq: 0.00, apacEq: 0.00, globalReits: 0.00, realEstateDirect: 0.00, infrastructure: 0.00, privEq: 0.00, privCredit: 0.10, listedAlts: 0.00, digitalAssets: 0.00, globalHighYield: 0.00, emDebt: 0.00, igCredit: 0.15, sdCredit: 0.25, globalSov: 0.20, inflLinked: 0.15, moneyMkt: 1.00 }
            }
        }
    }
];

// Updated Personas with Seed identifiers for dynamic algorithmic generation
export const PRESET_PERSONAS = [
    { 
        id: "pers_genz", 
        name: "The Gen-Z Accumulator", 
        seed: "GenZ_Acc1",
        desc: "Early 20s, starting early with high multi-decade compounding potential.", 
        data: { age: 25, retirementAge: 68, savings: 5000, salary: 32000, contribution: 10, realSalaryGrowth: 1.5 } 
    },
    { 
        id: "pers_mid", 
        name: "The Mid-Career Builder", 
        seed: "MidCareer_Build2",
        desc: "Peak earning years, balancing mortgage responsibilities and pension acceleration.", 
        data: { age: 40, retirementAge: 68, savings: 85000, salary: 65000, contribution: 12, realSalaryGrowth: 0.5 } 
    },
    { 
        id: "pers_late", 
        name: "The Late Starter", 
        seed: "LateStart_3",
        desc: "Aggressive catch-up phase entering the pre-retirement de-risking window.", 
        data: { age: 55, retirementAge: 67, savings: 120000, salary: 80000, contribution: 20, realSalaryGrowth: 0.0 } 
    }
];

export const PRESET_PORTFOLIOS = [
    {
        name: "Core Building Blocks",
        portfolios: [
            { id: "p_std_growth", name: "Standard Growth", weights: { usEq: 0.585, devEq: 0.140, emEq: 0.095, jpnEq: 0.055, ukEq: 0.035, apacEq: 0.020, globalReits: 0.05, realEstateDirect: 0.02 }, alphas: {}, tes: {} },
            { id: "p_enh_growth", name: "Enhanced Growth", weights: { usEq: 0.43875, devEq: 0.105, emEq: 0.07125, jpnEq: 0.04125, ukEq: 0.02625, apacEq: 0.015, globalReits: 0.0375, realEstateDirect: 0.015, privEq: 0.0875, infrastructure: 0.075, privCredit: 0.075, sdCredit: 0.0125 }, alphas: {}, tes: {} },
            { id: "p_resilient_growth", name: "Resilient Growth", weights: { usEq: 0.25, emEq: 0.10, infrastructure: 0.15, privEq: 0.10, privCredit: 0.10, globalSov: 0.10, sdCredit: 0.10, moneyMkt: 0.05, listedAlts: 0.05 }, alphas: {}, tes: {} },
            { id: "p_ltaf", name: "LTAF", weights: { privEq: 0.35, infrastructure: 0.30, privCredit: 0.30, sdCredit: 0.05 }, alphas: {}, tes: {} },
            { id: "p_retire", name: "Retirement", weights: { sdCredit: 0.248, usEq: 0.2142, igCredit: 0.150, emDebt: 0.092, globalSov: 0.057, devEq: 0.051, moneyMkt: 0.040, emEq: 0.034, globalReits: 0.025, inflLinked: 0.025, jpnEq: 0.0204, ukEq: 0.0136, privEq: 0.0077, infrastructure: 0.0077, privCredit: 0.0076, apacEq: 0.0068 }, alphas: {}, tes: {} }
        ]
    },
    {
        name: "Legal & General (L&G)",
        portfolios: [
            { id: "p_lg_tdf_growth", name: "L&G TDF Growth", weights: { usEq: 0.585, devEq: 0.140, emEq: 0.095, jpnEq: 0.055, ukEq: 0.035, apacEq: 0.020, globalReits: 0.05, realEstateDirect: 0.02 }, alphas: {}, tes: {} },
            { id: "p_lg_tdf_retire", name: "L&G TDF Retirement", weights: { sdCredit: 0.35, igCredit: 0.25, moneyMkt: 0.20, usEq: 0.12, devEq: 0.04, emEq: 0.02, globalSov: 0.02 }, alphas: {}, tes: {} },
            { id: "p_lg_laf_growth", name: "L&G Lifetime Advantage Growth", weights: { usEq: 0.497, devEq: 0.119, emEq: 0.081, jpnEq: 0.047, ukEq: 0.030, apacEq: 0.017, globalReits: 0.043, realEstateDirect: 0.016, privEq: 0.05, infrastructure: 0.05, privCredit: 0.05 }, alphas: {}, tes: {} }
        ]
    },
    {
        name: "Aviva",
        portfolios: [
            { id: "p_av_focus_growth", name: "Aviva My Future Focus Growth", weights: { usEq: 0.45, devEq: 0.15, emEq: 0.12, jpnEq: 0.05, ukEq: 0.08, apacEq: 0.05, infrastructure: 0.05, igCredit: 0.05 }, alphas: {}, tes: {} },
            { id: "p_av_vision_growth", name: "Aviva My Future Vision Growth", weights: { usEq: 0.468, devEq: 0.112, emEq: 0.076, jpnEq: 0.044, ukEq: 0.028, apacEq: 0.016, globalReits: 0.04, realEstateDirect: 0.016, privEq: 0.07, infrastructure: 0.07, privCredit: 0.06 }, alphas: {}, tes: {} }
        ]
    },
    {
        name: "Standard Life",
        portfolios: [
            { id: "p_sl_sma_growth", name: "Standard Life SMA Growth", weights: { usEq: 0.585, devEq: 0.140, emEq: 0.095, jpnEq: 0.055, ukEq: 0.035, apacEq: 0.020, globalReits: 0.05, realEstateDirect: 0.02 }, alphas: {}, tes: {} },
            { id: "p_sl_future_growth", name: "SL Future Opportunities Growth", weights: { usEq: 0.439, devEq: 0.105, emEq: 0.071, jpnEq: 0.041, ukEq: 0.026, apacEq: 0.015, globalReits: 0.038, realEstateDirect: 0.015, privEq: 0.10, infrastructure: 0.10, privCredit: 0.05 }, alphas: {}, tes: {} }
        ]
    },
    {
        name: "NPT",
        portfolios: [
            { id: "p_npt_growth", name: "NPT Sustainable Growth", weights: { usEq: 0.556, devEq: 0.133, emEq: 0.090, jpnEq: 0.052, ukEq: 0.033, apacEq: 0.019, globalReits: 0.048, realEstateDirect: 0.019, infrastructure: 0.05 }, alphas: {}, tes: {} },
            { id: "p_npt_retire", name: "NPT Retirement (40% Equity)", weights: { usEq: 0.23, devEq: 0.08, emEq: 0.04, ukEq: 0.05, igCredit: 0.30, sdCredit: 0.20, moneyMkt: 0.10 }, alphas: {}, tes: {} }
        ]
    }
];

export const STRATEGY_GROUPS = [
    {
        name: "Core Strategies",
        strategies: [
            { name: "Standard Glidepath", points: [ { years: 50, weights: { "p_std_growth": 1.0 } }, { years: 15, weights: { "p_std_growth": 1.0 } }, { years: 0,  weights: { "p_retire": 1.0 } } ] },
            { name: "Enhanced Glidepath", points: [ { years: 50, weights: { "p_enh_growth": 1.0 } }, { years: 15, weights: { "p_enh_growth": 1.0 } }, { years: 0,  weights: { "p_retire": 1.0 } } ] },
            { name: "Resilient Glidepath", points: [ { years: 50, weights: { "p_resilient_growth": 1.0 } }, { years: 15, weights: { "p_resilient_growth": 1.0 } }, { years: 0,  weights: { "p_retire": 1.0 } } ] }
        ]
    },
    {
        name: "Provider Strategies",
        strategies: [
            { name: "L&G Target Date Fund (TDF)", points: [ { years: 50, weights: { "p_lg_tdf_growth": 1.0 } }, { years: 15, weights: { "p_lg_tdf_growth": 1.0 } }, { years: 0,  weights: { "p_lg_tdf_retire": 1.0 } } ] },
            { name: "L&G Lifetime Advantage (LAF)", points: [ { years: 50, weights: { "p_lg_laf_growth": 1.0 } }, { years: 15, weights: { "p_lg_laf_growth": 1.0 } }, { years: 0,  weights: { "p_retire": 1.0 } } ] },
            { name: "Aviva My Future Focus", points: [ { years: 50, weights: { "p_av_focus_growth": 1.0 } }, { years: 15, weights: { "p_av_focus_growth": 1.0 } }, { years: 0,  weights: { "p_retire": 1.0 } } ] },
            { name: "Aviva My Future Vision (LTAF)", points: [ { years: 50, weights: { "p_av_vision_growth": 1.0 } }, { years: 15, weights: { "p_av_vision_growth": 1.0 } }, { years: 0,  weights: { "p_retire": 1.0 } } ] },
            { name: "Standard Life SMA", points: [ { years: 50, weights: { "p_sl_sma_growth": 1.0 } }, { years: 15, weights: { "p_sl_sma_growth": 1.0 } }, { years: 0,  weights: { "p_retire": 1.0 } } ] },
            { name: "Standard Life Future Opps", points: [ { years: 50, weights: { "p_sl_future_growth": 1.0 } }, { years: 15, weights: { "p_sl_future_growth": 1.0 } }, { years: 0,  weights: { "p_retire": 1.0 } } ] },
            { name: "NPT Sustainable (19yr Glide)", points: [ { years: 50, weights: { "p_npt_growth": 1.0 } }, { years: 19, weights: { "p_npt_growth": 1.0 } }, { years: 0,  weights: { "p_npt_retire": 1.0 } } ] }
        ]
    }
];

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
        id: "s_2025_liberation", name: "2025 Liberation Day",
        description: "Aggressive fiscal stimulus and deregulation driving asset price surge.",
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
    }
];
