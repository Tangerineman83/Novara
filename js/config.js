// js/config.js

export const ASSET_CLASSES = [
    { key: "globalEq", name: "Global Equity", defaultR: 0.050, defaultV: 0.15 },
    { key: "privAssets", name: "Div. Private Assets", defaultR: 0.065, defaultV: 0.12 },
    { key: "realEstate", name: "Real Estate", defaultR: 0.040, defaultV: 0.10 },
    { key: "listedAlts", name: "Listed Alts", defaultR: 0.045, defaultV: 0.08 },
    { key: "emDebt", name: "EM Debt", defaultR: 0.055, defaultV: 0.12 },
    { key: "igCredit", name: "IG Credit", defaultR: 0.030, defaultV: 0.05 },
    { key: "sdCredit", name: "Short Duration Credit", defaultR: 0.025, defaultV: 0.03 },
    { key: "moneyMkt", name: "Money Markets", defaultR: 0.015, defaultV: 0.01 },
    { key: "privEq", name: "Private Equity", defaultR: 0.080, defaultV: 0.20 },
    { key: "infrastructure", name: "Infrastructure", defaultR: 0.050, defaultV: 0.10 },
    { key: "privCredit", name: "Private Credit", defaultR: 0.060, defaultV: 0.08 },
    { key: "globalHighYield", name: "Global High Yield", defaultR: 0.050, defaultV: 0.10 },
    { key: "inflLinked", name: "Inflation Linked", defaultR: 0.010, defaultV: 0.04 },
    { key: "globalSov", name: "Global Sovereign", defaultR: 0.015, defaultV: 0.04 }
];

export const CHART_COLORS = [
    { 
        border: '#312E81', // Indigo-900
        gradientStart: 'rgba(49, 46, 129, 0.3)', 
        gradientEnd: 'rgba(49, 46, 129, 0.0)' 
    }, 
    { 
        border: '#0D9488', // Teal-600
        gradientStart: 'rgba(13, 148, 136, 0.3)', 
        gradientEnd: 'rgba(13, 148, 136, 0.0)' 
    },
    { 
        border: '#E11D48', // Rose-600
        gradientStart: 'rgba(225, 29, 72, 0.3)', 
        gradientEnd: 'rgba(225, 29, 72, 0.0)' 
    },
    { 
        border: '#D97706', // Amber
        gradientStart: 'rgba(217, 119, 6, 0.3)', 
        gradientEnd: 'rgba(217, 119, 6, 0.0)' 
    }
];

export const PRESET_CMAS = [
    {
        name: "2026 Q1 Global Equilibrium",
        data: {
            r: { globalEq: 0.072, privAssets: 0.085, realEstate: 0.062, listedAlts: 0.068, emDebt: 0.075, igCredit: 0.052, sdCredit: 0.048, moneyMkt: 0.038, privEq: 0.105, infrastructure: 0.078, privCredit: 0.082, globalHighYield: 0.078, inflLinked: 0.045, globalSov: 0.042 },
            v: { globalEq: 0.16, privAssets: 0.15, realEstate: 0.14, listedAlts: 0.13, emDebt: 0.14, igCredit: 0.06, sdCredit: 0.04, moneyMkt: 0.01, privEq: 0.24, infrastructure: 0.12, privCredit: 0.10, globalHighYield: 0.11, inflLinked: 0.06, globalSov: 0.07 },
            ce: { globalEq: 1.0, privAssets: 0.75, realEstate: 0.55, listedAlts: 0.82, emDebt: 0.50, igCredit: 0.35, sdCredit: 0.25, moneyMkt: 0.0, privEq: 0.90, infrastructure: 0.45, privCredit: 0.45, globalHighYield: 0.65, inflLinked: 0.15, globalSov: -0.05 },
            cc: { globalEq: 0.45, privAssets: 0.40, realEstate: 0.35, listedAlts: 0.45, emDebt: 0.65, igCredit: 1.0, sdCredit: 0.85, moneyMkt: 0.15, privEq: 0.45, infrastructure: 0.40, privCredit: 0.88, globalHighYield: 0.85, inflLinked: 0.50, globalSov: 0.60 }
        }
    },
    {
        name: "Standard House View (Legacy)",
        data: {
            r: { globalEq: 0.05, privAssets: 0.065, realEstate: 0.04, igCredit: 0.03 },
            v: { globalEq: 0.15, privAssets: 0.12, realEstate: 0.10, igCredit: 0.05 },
            ce: { globalEq: 1, igCredit: 0 },
            cc: { globalEq: 0, igCredit: 1 }
        }
    }
];

export const PRESET_PERSONAS = [
    {
        name: "Default (Age 25)",
        data: { age: 25, retirementAge: 68, savings: 0, salary: 30000, contribution: 10, realSalaryGrowth: 1 }
    },
    {
        name: "Mid-Career (Age 40)",
        data: { age: 40, retirementAge: 68, savings: 50000, salary: 50000, contribution: 10, realSalaryGrowth: 0 }
    },
    {
        name: "Late Career (Age 55)",
        data: { age: 55, retirementAge: 67, savings: 250000, salary: 70000, contribution: 15, realSalaryGrowth: 0 }
    }
];

export const PRESET_STRATEGIES = [
    {
        name: "Default Balanced",
        points: [
            { years: 50, weights: { globalEq: 0.79, realEstate: 0.02, listedAlts: 0.05, emDebt: 0.05, igCredit: 0.09 } },
            { years: 15, weights: { globalEq: 0.79, realEstate: 0.02, listedAlts: 0.05, emDebt: 0.05, igCredit: 0.09 } },
            { years: 0,  weights: { globalEq: 0.35, realEstate: 0.02, listedAlts: 0.08, emDebt: 0.1, igCredit: 0.2, sdCredit: 0.25 } }
        ]
    },
    {
        name: "100% Growth",
        points: [
            { years: 50, weights: { globalEq: 0.93, realEstate: 0.02, listedAlts: 0.05 } },
            { years: 15, weights: { globalEq: 0.93, realEstate: 0.02, listedAlts: 0.05 } },
            { years: 0,  weights: { globalEq: 0.35, realEstate: 0.02, listedAlts: 0.08, emDebt: 0.1, igCredit: 0.2, sdCredit: 0.25 } }
        ]
    },
    {
        name: "Diversified Private Assets",
        points: [
            { years: 50, weights: { globalEq: 0.6975, privAssets: 0.25, realEstate: 0.015, listedAlts: 0.0375 } },
            { years: 15, weights: { globalEq: 0.6975, privAssets: 0.25, realEstate: 0.015, listedAlts: 0.0375 } },
            { years: 0,  weights: { globalEq: 0.35, realEstate: 0.02, listedAlts: 0.08, emDebt: 0.1, igCredit: 0.2, sdCredit: 0.25 } }
        ]
    },
    {
        name: "Simple Glidepath",
        points: [
            { years: 40, weights: { globalEq: 0.8, igCredit: 0.2 } },
            { years: 0,  weights: { globalEq: 0.2, igCredit: 0.8 } }
        ]
    }
];
