// js/config.js

export const ASSET_CLASSES = [
    // 6 Equity Regions (Mapped to Global Market Cap)
    { key: "usEq", name: "US Equity", defaultR: 0.075, defaultV: 0.16, defaultK: 1.5, color: "#1D4ED8" },
    { key: "devEq", name: "Dev Europe Equity", defaultR: 0.070, defaultV: 0.16, defaultK: 1.6, color: "#3B82F6" },
    { key: "emEq", name: "EM Equity", defaultR: 0.085, defaultV: 0.20, defaultK: 2.5, color: "#60A5FA" },
    { key: "jpnEq", name: "Japan Equity", defaultR: 0.060, defaultV: 0.15, defaultK: 1.5, color: "#93C5FD" },
    { key: "ukEq", name: "UK Equity", defaultR: 0.065, defaultV: 0.15, defaultK: 1.8, color: "#BFDBFE" },
    { key: "apacEq", name: "Dev APAC (ex-Japan)", defaultR: 0.065, defaultV: 0.16, defaultK: 1.7, color: "#DBEAFE" },
    
    // Real Assets
    { key: "globalReits", name: "Global REITs", defaultR: 0.060, defaultV: 0.18, defaultK: 2.0, color: "#6D28D9" },
    { key: "realEstateDirect", name: "Real Estate (Direct)", defaultR: 0.055, defaultV: 0.10, defaultK: 2.5, color: "#7E22CE" },
    { key: "infrastructure", name: "Infrastructure", defaultR: 0.065, defaultV: 0.11, defaultK: 2.0, color: "#A855F7" },
    
    // Private Markets & Alts
    { key: "privEq", name: "Private Equity", defaultR: 0.095, defaultV: 0.22, defaultK: 4.5, color: "#B45309" },
    { key: "privCredit", name: "Private Credit", defaultR: 0.075, defaultV: 0.09, defaultK: 3.5, color: "#D97706" },
    { key: "listedAlts", name: "Listed Alts", defaultR: 0.055, defaultV: 0.12, defaultK: 1.5, color: "#F59E0B" },
    { key: "digitalAssets", name: "Digital Assets", defaultR: 0.120, defaultV: 0.50, defaultK: 5.0, color: "#0F172A" },
    
    // Fixed Income & Cash
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
            { 
                id: "p_std_growth", 
                name: "Standard Growth", 
                // 93% Equity (Market Cap Split), 5% REITs, 2% Direct RE
                weights: { usEq: 0.585, devEq: 0.140, emEq: 0.095, jpnEq: 0.055, ukEq: 0.035, apacEq: 0.020, globalReits: 0.05, realEstateDirect: 0.02 } 
            },
            { 
                id: "p_enh_growth", 
                name: "Enhanced Growth", 
                // 75% Standard Growth + 25% Private Markets (1/3 PE, 1/3 Infra, 1/3 PC)
                weights: { usEq: 0.43875, devEq: 0.105, emEq: 0.07125, jpnEq: 0.04125, ukEq: 0.02625, apacEq: 0.015, globalReits: 0.0375, realEstateDirect: 0.015, privEq: 0.0833, infrastructure: 0.0833, privCredit: 0.0834 } 
            },
            { 
                id: "p_retire", 
                name: "Retirement", 
                // 34% Equity (Market Cap Split), 2.3% Privates, Remainder mapped to fixed income/alts
                weights: { sdCredit: 0.248, usEq: 0.2142, igCredit: 0.150, emDebt: 0.092, globalSov: 0.057, devEq: 0.051, moneyMkt: 0.040, emEq: 0.034, globalReits: 0.025, inflLinked: 0.025, jpnEq: 0.0204, ukEq: 0.0136, privEq: 0.0077, infrastructure: 0.0077, privCredit: 0.0076, apacEq: 0.0068 } 
            }
        ]
    }
];

export const INITIAL_PORTFOLIOS = JSON.parse(JSON.stringify(PRESET_PORTFOLIOS[0].portfolios));

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
            { years: 50, weights: { "p_enh_growth": 1.0 } },
            { years: 15, weights: { "p_enh_growth": 1.0 } },
            { years: 0,  weights: { "p_retire": 1.0 } }
        ]
    }
];
