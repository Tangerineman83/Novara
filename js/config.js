// js/config.js

export const ASSET_CLASSES = [
    { key: "equityNorthAm", name: "North American Equity", defaultR: 0.061, defaultV: 0.155, defaultK: 2.40 },
    { key: "equityUK", name: "UK Equity", defaultR: 0.065, defaultV: 0.140, defaultK: 1.60 },
    { key: "equityEuropeExUK", name: "Europe ex-UK Equity", defaultR: 0.060, defaultV: 0.150, defaultK: 1.90 },
    { key: "equityJapan", name: "Japan Equity", defaultR: 0.070, defaultV: 0.170, defaultK: 2.10 },
    { key: "equityAsiaPacExJapan", name: "Asia Pac ex-Japan Eq", defaultR: 0.072, defaultV: 0.185, defaultK: 3.10 },
    { key: "equityEM", name: "Emerging Markets Equity", defaultR: 0.075, defaultV: 0.210, defaultK: 3.80 },
    { key: "privEquityBuyout", name: "Private Equity (Buyout)", defaultR: 0.103, defaultV: 0.240, defaultK: 1.90 },
    { key: "privCreditDirect", name: "Private Credit (Direct)", defaultR: 0.082, defaultV: 0.100, defaultK: 2.70 },
    { key: "realEstateCore", name: "Core Real Estate", defaultR: 0.062, defaultV: 0.140, defaultK: 1.10 },
    { key: "infraGlobal", name: "Global Infrastructure", defaultR: 0.071, defaultV: 0.120, defaultK: 1.30 },
    { key: "creditIGGlobal", name: "Global IG Credit", defaultR: 0.051, defaultV: 0.060, defaultK: 1.50 },
    { key: "creditHYGlobal", name: "Global HY Credit", defaultR: 0.078, defaultV: 0.110, defaultK: 2.90 },
    { key: "inflLinkedGlobal", name: "Global Inflation Linked", defaultR: 0.045, defaultV: 0.060, defaultK: 1.80 },
    { key: "sovBondsGlobal", name: "Global Sovereign Bonds", defaultR: 0.042, defaultV: 0.070, defaultK: 1.65 },
    { key: "moneyMktGlobal", name: "Global Money Markets", defaultR: 0.032, defaultV: 0.010, defaultK: 0.15 },
    { key: "digitalAssets", name: "Digital Assets", defaultR: 0.125, defaultV: 0.480, defaultK: 5.50 }
];

export const CHART_COLORS = [
    { 
        border: '#3B82F6', 
        gradientStart: 'rgba(59, 130, 246, 0.4)', 
        gradientEnd: 'rgba(59, 130, 246, 0.0)' 
    }, 
    { 
        border: '#10B981', 
        gradientStart: 'rgba(16, 185, 129, 0.4)', 
        gradientEnd: 'rgba(16, 185, 129, 0.0)' 
    },
    { 
        border: '#F59E0B', 
        gradientStart: 'rgba(245, 158, 11, 0.4)', 
        gradientEnd: 'rgba(245, 158, 11, 0.0)' 
    },
    { 
        border: '#8B5CF6', 
        gradientStart: 'rgba(139, 92, 246, 0.4)', 
        gradientEnd: 'rgba(139, 92, 246, 0.0)' 
    }
];

export const PRESET_CMAS = [
    {
        name: "2026 Q1 Institutional Regional Set",
        data: {
            r: {
                equityNorthAm: 0.061, equityUK: 0.065, equityEuropeExUK: 0.060, equityJapan: 0.070, equityAsiaPacExJapan: 0.072, equityEM: 0.075,
                privEquityBuyout: 0.103, privCreditDirect: 0.082, realEstateCore: 0.062, infraGlobal: 0.071,
                creditIGGlobal: 0.051, creditHYGlobal: 0.078, inflLinkedGlobal: 0.045, sovBondsGlobal: 0.042, moneyMktGlobal: 0.032, digitalAssets: 0.125
            },
            v: {
                equityNorthAm: 0.155, equityUK: 0.140, equityEuropeExUK: 0.150, equityJapan: 0.170, equityAsiaPacExJapan: 0.185, equityEM: 0.210,
                privEquityBuyout: 0.240, privCreditDirect: 0.100, realEstateCore: 0.140, infraGlobal: 0.120,
                creditIGGlobal: 0.060, creditHYGlobal: 0.110, inflLinkedGlobal: 0.060, sovBondsGlobal: 0.070, moneyMktGlobal: 0.010, digitalAssets: 0.480
            },
            k: {
                equityNorthAm: 2.40, equityUK: 1.60, equityEuropeExUK: 1.90, equityJapan: 2.10, equityAsiaPacExJapan: 3.10, equityEM: 3.80,
                privEquityBuyout: 1.90, privCreditDirect: 2.70, realEstateCore: 1.10, infraGlobal: 1.30,
                creditIGGlobal: 1.50, creditHYGlobal: 2.90, inflLinkedGlobal: 1.80, sovBondsGlobal: 1.65, moneyMktGlobal: 0.15, digitalAssets: 5.50
            },
            ce: {
                equityNorthAm: 1.00, equityUK: 0.62, equityEuropeExUK: 0.78, equityJapan: 0.45, equityAsiaPacExJapan: 0.55, equityEM: 0.68,
                privEquityBuyout: 0.88, privCreditDirect: 0.42, realEstateCore: 0.52, infraGlobal: 0.45,
                creditIGGlobal: 0.35, creditHYGlobal: 0.62, inflLinkedGlobal: 0.12, sovBondsGlobal: -0.05, moneyMktGlobal: 0.00, digitalAssets: 0.62
            },
            cc: {
                equityNorthAm: 0.45, equityUK: 0.40, equityEuropeExUK: 0.42, equityJapan: 0.30, equityAsiaPacExJapan: 0.48, equityEM: 0.65,
                privEquityBuyout: 0.45, privCreditDirect: 0.88, realEstateCore: 0.35, infraGlobal: 0.40,
                creditIGGlobal: 1.00, creditHYGlobal: 0.85, inflLinkedGlobal: 0.50, sovBondsGlobal: 0.60, moneyMktGlobal: 0.15, digitalAssets: 0.35
            }
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

// Sensible mappings for the new regional/institutional asset classes
export const PRESET_STRATEGIES = [
    {
        name: "Default Balanced",
        points: [
            { years: 50, weights: { equityNorthAm: 0.45, equityUK: 0.08, equityEuropeExUK: 0.10, equityJapan: 0.05, equityEM: 0.06, realEstateCore: 0.06, infraGlobal: 0.05, creditIGGlobal: 0.15 } },
            { years: 15, weights: { equityNorthAm: 0.45, equityUK: 0.08, equityEuropeExUK: 0.10, equityJapan: 0.05, equityEM: 0.06, realEstateCore: 0.06, infraGlobal: 0.05, creditIGGlobal: 0.15 } },
            { years: 0,  weights: { equityNorthAm: 0.20, equityUK: 0.05, equityEuropeExUK: 0.05, realEstateCore: 0.05, infraGlobal: 0.05, creditIGGlobal: 0.30, sovBondsGlobal: 0.20, moneyMktGlobal: 0.10 } }
        ]
    },
    {
        name: "100% Growth",
        points: [
            { years: 50, weights: { equityNorthAm: 0.55, equityUK: 0.10, equityEuropeExUK: 0.10, equityJapan: 0.05, equityAsiaPacExJapan: 0.05, equityEM: 0.10, digitalAssets: 0.05 } },
            { years: 15, weights: { equityNorthAm: 0.55, equityUK: 0.10, equityEuropeExUK: 0.10, equityJapan: 0.05, equityAsiaPacExJapan: 0.05, equityEM: 0.10, digitalAssets: 0.05 } },
            { years: 0,  weights: { equityNorthAm: 0.20, equityUK: 0.05, equityEuropeExUK: 0.05, realEstateCore: 0.05, infraGlobal: 0.05, creditIGGlobal: 0.30, sovBondsGlobal: 0.20, moneyMktGlobal: 0.10 } }
        ]
    },
    {
        name: "Institutional Private Assets",
        points: [
            { years: 50, weights: { equityNorthAm: 0.35, equityUK: 0.05, privEquityBuyout: 0.15, privCreditDirect: 0.15, realEstateCore: 0.10, infraGlobal: 0.10, creditIGGlobal: 0.10 } },
            { years: 15, weights: { equityNorthAm: 0.35, equityUK: 0.05, privEquityBuyout: 0.15, privCreditDirect: 0.15, realEstateCore: 0.10, infraGlobal: 0.10, creditIGGlobal: 0.10 } },
            { years: 0,  weights: { equityNorthAm: 0.20, equityUK: 0.05, equityEuropeExUK: 0.05, realEstateCore: 0.05, infraGlobal: 0.05, creditIGGlobal: 0.30, sovBondsGlobal: 0.20, moneyMktGlobal: 0.10 } }
        ]
    },
    {
        name: "Simple Glidepath",
        points: [
            { years: 40, weights: { equityNorthAm: 0.60, equityUK: 0.20, creditIGGlobal: 0.20 } },
            { years: 0,  weights: { equityNorthAm: 0.10, equityUK: 0.10, creditIGGlobal: 0.80 } }
        ]
    }
];
