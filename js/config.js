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
    { border: '#0d6efd', fill: 'rgba(13, 110, 253, 0.15)' }, // Blue (Primary)
    { border: '#198754', fill: 'rgba(25, 135, 84, 0.15)' },  // Green (Success)
    { border: '#fd7e14', fill: 'rgba(253, 126, 20, 0.15)' }, // Orange (Warning)
    { border: '#6f42c1', fill: 'rgba(111, 66, 193, 0.15)' }  // Purple
];

export const PRESET_CMAS = [
    {
        name: "Standard House View",
        data: {
            r: { globalEq: 0.05, privAssets: 0.065, realEstate: 0.04, igCredit: 0.03 },
            v: { globalEq: 0.15, privAssets: 0.12, realEstate: 0.10, igCredit: 0.05 },
            ce: { globalEq: 1, igCredit: 0 },
            cc: { globalEq: 0, igCredit: 1 }
        }
    },
    {
        name: "Optimistic View (+1%)",
        data: {
            r: { globalEq: 0.06, privAssets: 0.075, realEstate: 0.05, igCredit: 0.04 },
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
