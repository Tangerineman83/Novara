// js/config.js

export const ASSET_CLASSES = [
    { key: "usEq", name: "US Equity", defaultR: 0.075, defaultV: 0.16 },
    { key: "ukEq", name: "UK Equity", defaultR: 0.065, defaultV: 0.15 },
    { key: "devEq", name: "Dev Europe Eq", defaultR: 0.070, defaultV: 0.16 },
    { key: "emEq", name: "EM Equity", defaultR: 0.085, defaultV: 0.20 },
    { key: "globalReits", name: "Global REITs", defaultR: 0.060, defaultV: 0.18 },
    { key: "listedAlts", name: "Listed Alts", defaultR: 0.055, defaultV: 0.12 },
    { key: "privAssets", name: "Div. Private Assets", defaultR: 0.075, defaultV: 0.12 },
    { key: "emDebt", name: "EM Debt", defaultR: 0.065, defaultV: 0.12 },
    { key: "igCredit", name: "IG Credit", defaultR: 0.045, defaultV: 0.06 },
    { key: "sdCredit", name: "Short Duration Credit", defaultR: 0.035, defaultV: 0.03 },
    { key: "moneyMkt", name: "Money Markets", defaultR: 0.025, defaultV: 0.01 },
    { key: "privEq", name: "Private Equity", defaultR: 0.095, defaultV: 0.22 },
    { key: "infrastructure", name: "Infrastructure", defaultR: 0.065, defaultV: 0.11 },
    { key: "privCredit", name: "Private Credit", defaultR: 0.075, defaultV: 0.09 },
    { key: "globalHighYield", name: "Global High Yield", defaultR: 0.060, defaultV: 0.10 },
    { key: "inflLinked", name: "Inflation Linked", defaultR: 0.020, defaultV: 0.05 },
    { key: "globalSov", name: "Global Sovereign", defaultR: 0.025, defaultV: 0.05 }
];

export const CHART_COLORS = [
    { border: '#3B82F6', gradientStart: 'rgba(59, 130, 246, 0.4)', gradientEnd: 'rgba(59, 130, 246, 0.0)' },  // Blue
    { border: '#10B981', gradientStart: 'rgba(16, 185, 129, 0.4)', gradientEnd: 'rgba(16, 185, 129, 0.0)' },  // Green
    { border: '#F59E0B', gradientStart: 'rgba(245, 158, 11, 0.4)', gradientEnd: 'rgba(245, 158, 11, 0.0)' }   // Orange
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

export const INITIAL_PORTFOLIOS = [
    { id: "p_growth", name: "Global Equity Growth", weights: { usEq: 0.55, ukEq: 0.10, devEq: 0.15, emEq: 0.10, listedAlts: 0.10 } },
    { id: "p_balanced", name: "Core Balanced", weights: { usEq: 0.45, ukEq: 0.10, devEq: 0.10, emEq: 0.05, listedAlts: 0.05, igCredit: 0.15, emDebt: 0.05, globalSov: 0.05 } },
    { id: "p_priv_max", name: "Private Markets Max", weights: { usEq: 0.25, devEq: 0.10, privEq: 0.20, privCredit: 0.20, infrastructure: 0.10, privAssets: 0.10, globalHighYield: 0.05 } },
    { id: "p_consolidation", name: "Pre-Retirement Glide", weights: { usEq: 0.30, ukEq: 0.10, igCredit: 0.30, sdCredit: 0.15, globalSov: 0.15 } },
    { id: "p_retire", name: "At Retirement (Income)", weights: { usEq: 0.15, ukEq: 0.10, igCredit: 0.30, sdCredit: 0.25, globalSov: 0.10, moneyMkt: 0.10 } }
];

export const PRESET_STRATEGIES = [
    {
        name: "Standard Lifecycle",
        points: [
            { years: 50, weights: { "p_growth": 1.0 } },
            { years: 15, weights: { "p_balanced": 1.0 } },
            { years: 5,  weights: { "p_consolidation": 1.0 } },
            { years: 0,  weights: { "p_retire": 1.0 } }
        ]
    },
    {
        name: "Private Markets Engine",
        points: [
            { years: 50, weights: { "p_priv_max": 1.0 } },
            { years: 15, weights: { "p_priv_max": 0.5, "p_balanced": 0.5 } },
            { years: 0,  weights: { "p_retire": 1.0 } }
        ]
    }
];

export const PIE_COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
    '#06B6D4', '#EAB308', '#D946EF', '#0EA5E9', '#A855F7', '#64748B', '#F43F5E'
];
