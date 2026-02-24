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
    // New Assets from your JSON
    { key: "privEq", name: "Private Equity", defaultR: 0.080, defaultV: 0.20 },
    { key: "infrastructure", name: "Infrastructure", defaultR: 0.050, defaultV: 0.10 },
    { key: "privCredit", name: "Private Credit", defaultR: 0.060, defaultV: 0.08 },
    { key: "globalHighYield", name: "Global High Yield", defaultR: 0.050, defaultV: 0.10 },
    { key: "inflLinked", name: "Inflation Linked", defaultR: 0.010, defaultV: 0.04 },
    { key: "globalSov", name: "Global Sovereign", defaultR: 0.015, defaultV: 0.04 }
];

export const PRESET_PERSONAS = [
    {
        name: "Default (Age 25)",
        data: { age: 25, retirementAge: 68, savings: 0, salary: 30000, contribution: 10, realSalaryGrowth: 1 }
    },
    {
        name: "Mid-Career (Age 40)",
        data: { age: 40, retirementAge: 68, savings: 50000, salary: 50000, contribution: 10, realSalaryGrowth: 0 }
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
