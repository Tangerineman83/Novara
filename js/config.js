// js/config.js

export const ASSET_CLASSES = [
    { key: "usEq", name: "US Equity", defaultR: 0.075, defaultV: 0.16, color: "#1D4ED8" },
    { key: "ukEq", name: "UK Equity", defaultR: 0.065, defaultV: 0.15, color: "#3B82F6" },
    { key: "devEq", name: "Dev Europe Eq", defaultR: 0.070, defaultV: 0.16, color: "#60A5FA" },
    { key: "emEq", name: "EM Equity", defaultR: 0.085, defaultV: 0.20, color: "#93C5FD" },
    { key: "globalReits", name: "Global REITs", defaultR: 0.060, defaultV: 0.18, color: "#6D28D9" },
    { key: "listedAlts", name: "Listed Alts", defaultR: 0.055, defaultV: 0.12, color: "#8B5CF6" },
    { key: "privAssets", name: "Div. Private Assets", defaultR: 0.075, defaultV: 0.12, color: "#A78BFA" },
    { key: "privEq", name: "Private Equity", defaultR: 0.095, defaultV: 0.22, color: "#B45309" },
    { key: "infrastructure", name: "Infrastructure", defaultR: 0.065, defaultV: 0.11, color: "#D97706" },
    { key: "privCredit", name: "Private Credit", defaultR: 0.075, defaultV: 0.09, color: "#F59E0B" },
    { key: "globalHighYield", name: "Global High Yield", defaultR: 0.060, defaultV: 0.10, color: "#FBBF24" },
    { key: "emDebt", name: "EM Debt", defaultR: 0.065, defaultV: 0.12, color: "#047857" },
    { key: "igCredit", name: "IG Credit", defaultR: 0.045, defaultV: 0.06, color: "#10B981" },
    { key: "sdCredit", name: "Short Duration Credit", defaultR: 0.035, defaultV: 0.03, color: "#34D399" },
    { key: "globalSov", name: "Global Sovereign", defaultR: 0.025, defaultV: 0.05, color: "#0F766E" },
    { key: "inflLinked", name: "Inflation Linked", defaultR: 0.020, defaultV: 0.05, color: "#0E7490" },
    { key: "moneyMkt", name: "Money Markets", defaultR: 0.025, defaultV: 0.01, color: "#64748B" }
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
            r: { usEq: 0.072, ukEq: 0.068, devEq: 0.070, emEq: 0.085, globalReits: 0.062, listedAlts: 0.068, privAssets: 0.085, emDebt: 0.075, igCredit: 0.052, sdCredit: 0.048, moneyMkt: 0.038, privEq: 0.105, infrastructure: 0.078, privCredit: 0.082, globalHighYield: 0.078, inflLinked: 0.045, globalSov: 0.042 },
            v: { usEq: 0.16, ukEq: 0.15, devEq: 0.16, emEq: 0.20, globalReits: 0.18, listedAlts: 0.13, privAssets: 0.15, emDebt: 0.14, igCredit: 0.06, sdCredit: 0.04, moneyMkt: 0.01, privEq: 0.24, infrastructure: 0.12, privCredit: 0.10, globalHighYield: 0.11, inflLinked: 0.06, globalSov: 0.07 },
            ce: { usEq: 1.0, ukEq: 0.95, devEq: 0.95, emEq: 0.85, globalReits: 0.70, listedAlts: 0.82, privAssets: 0.75, emDebt: 0.50, igCredit: 0.35, sdCredit: 0.25, moneyMkt: 0.0, privEq: 0.90, infrastructure: 0.45, privCredit: 0.45, globalHighYield: 0.65, inflLinked: 0.15, globalSov: -0.05 },
            cc: { usEq: 0.45, ukEq: 0.40, devEq: 0.40, emEq: 0.50, globalReits: 0.55, listedAlts: 0.45, privAssets: 0.40, emDebt: 0.65, igCredit: 1.0, sdCredit: 0.85, moneyMkt: 0.15, privEq: 0.45, infrastructure: 0.40, privCredit: 0.88, globalHighYield: 0.85, inflLinked: 0.50, globalSov: 0.60 }
        }
    }
];

export const PRESET_PERSONAS = [
    { name: "Default (Age 25)", data: { age: 25, retirementAge: 68, savings: 0, salary: 30000, contribution: 10, realSalaryGrowth: 1 } },
    { name: "Mid-Career (Age 40)", data: { age: 40, retirementAge: 68, savings: 50000, salary: 50000, contribution: 10, realSalaryGrowth: 0 } },
    { name: "Late Career (Age 55)", data: { age: 55, retirementAge: 67, savings: 250000, salary: 70000, contribution: 15, realSalaryGrowth: 0 } }
];

// REFRESHED PORTFOLIOS BASED ON SPECIFICATION
export const PRESET_PORTFOLIOS = [
    {
        name: "Standard Core Library",
        portfolios: [
            { 
                id: "p_std_growth", 
                name: "Standard Growth", 
                // 93% Eq (60 US, 15 DevEu, 13 EM, 5 UK) + 2% Real Estate (privAssets) + 5% REITs
                weights: { usEq: 0.60, devEq: 0.15, emEq: 0.13, ukEq: 0.05, globalReits: 0.05, privAssets: 0.02 } 
            },
            { 
                id: "p_enh_growth", 
                name: "Enhanced Growth", 
                // 75% of Standard Growth + 25% Private Mkts
                weights: { usEq: 0.45, devEq: 0.1125, emEq: 0.0975, ukEq: 0.0375, globalReits: 0.0375, privAssets: 0.015, privEq: 0.0833, infrastructure: 0.0833, privCredit: 0.0834 } 
            },
            { 
                id: "p_retire", 
                name: "Retirement", 
                // Mapped precisely from the Standard Life fund image provided
                weights: { sdCredit: 0.248, usEq: 0.192, igCredit: 0.150, emDebt: 0.092, devEq: 0.072, globalSov: 0.057, emEq: 0.050, moneyMkt: 0.040, ukEq: 0.026, globalReits: 0.025, inflLinked: 0.025, privAssets: 0.023 } 
            }
        ]
    }
];

export const INITIAL_PORTFOLIOS = JSON.parse(JSON.stringify(PRESET_PORTFOLIOS[0].portfolios));

// REFRESHED STRATEGIES
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
