// js/config.js

export const ASSET_CLASSES = [
    { key: "usEq",            name: "US Equity",             category: "Equities",   defaultR: 0.065, defaultV: 0.16, defaultK: 2.5, color: "#1D4ED8" },
    { key: "devEq",           name: "Dev Europe Equity",     category: "Equities",   defaultR: 0.070, defaultV: 0.16, defaultK: 2.0, color: "#3B82F6" },
    { key: "emEq",            name: "EM Equity",             category: "Equities",   defaultR: 0.088, defaultV: 0.23, defaultK: 4.0, color: "#60A5FA" },
    { key: "jpnEq",           name: "Japan Equity",          category: "Equities",   defaultR: 0.060, defaultV: 0.15, defaultK: 2.0, color: "#93C5FD" },
    { key: "ukEq",            name: "UK Equity",             category: "Equities",   defaultR: 0.065, defaultV: 0.15, defaultK: 2.0, color: "#BFDBFE" },
    { key: "apacEq",          name: "Dev APAC (ex-Japan)",   category: "Equities",   defaultR: 0.065, defaultV: 0.16, defaultK: 3.0, color: "#DBEAFE" },
    { key: "globalReits",     name: "Global REITs",          category: "Real Assets",defaultR: 0.060, defaultV: 0.18, defaultK: 2.8, color: "#6D28D9" },
    { key: "realEstateDirect",name: "Real Estate (Direct)",  category: "Real Assets",defaultR: 0.055, defaultV: 0.10, defaultK: 1.8, color: "#7E22CE" },
    { key: "infrastructure",  name: "Infrastructure",        category: "Real Assets",defaultR: 0.065, defaultV: 0.11, defaultK: 1.5, color: "#A855F7" },
    { key: "privEq",          name: "Private Equity",        category: "Alternatives",defaultR: 0.095, defaultV: 0.22, defaultK: 3.5, color: "#B45309" },
    { key: "listedAlts",      name: "Listed Alts",           category: "Alternatives",defaultR: 0.055, defaultV: 0.12, defaultK: 2.5, color: "#F59E0B" },
    { key: "digitalAssets",   name: "Digital Assets",        category: "Alternatives",defaultR: 0.120, defaultV: 0.50, defaultK: 6.5, color: "#0F172A" },
    { key: "privCredit",      name: "Private Credit",        category: "Credit",     defaultR: 0.075, defaultV: 0.09, defaultK: 3.5, color: "#D97706" },
    { key: "globalHighYield", name: "Global High Yield",     category: "Credit",     defaultR: 0.060, defaultV: 0.10, defaultK: 3.0, color: "#047857" },
    { key: "emDebt",          name: "EM Debt",               category: "Credit",     defaultR: 0.065, defaultV: 0.12, defaultK: 3.5, color: "#059669" },
    { key: "igCredit",        name: "IG Credit",             category: "Credit",     defaultR: 0.045, defaultV: 0.06, defaultK: 1.5, color: "#10B981" },
    { key: "sdCredit",        name: "Short Duration Credit", category: "Credit",     defaultR: 0.0425, defaultV: 0.03, defaultK: 0.8, color: "#34D399" },
    { key: "globalSov",       name: "Global Sovereign",      category: "Sov & Cash", defaultR: 0.025, defaultV: 0.075, defaultK: 1.8, color: "#0F766E" },
    { key: "inflLinked",      name: "Inflation Linked",      category: "Sov & Cash", defaultR: 0.020, defaultV: 0.065, defaultK: 2.0, color: "#0E7490" },
    { key: "moneyMkt",        name: "Money Markets",         category: "Sov & Cash", defaultR: 0.025, defaultV: 0.01, defaultK: 0.0, color: "#64748B" }
];

export const CHART_COLORS = [
    { border: '#3730A3', gradientStart: 'rgba(55, 48, 163, 0.4)', gradientEnd: 'rgba(55, 48, 163, 0.0)' },
    { border: '#059669', gradientStart: 'rgba(5, 150, 105, 0.4)', gradientEnd: 'rgba(5, 150, 105, 0.0)' },   
    { border: '#D97706', gradientStart: 'rgba(217, 119, 6, 0.4)', gradientEnd: 'rgba(217, 119, 6, 0.0)' }    
];

export const PRESET_CMAS = [
    {
        name: "May 2026 — Global Equilibrium (Institutional)",
        cma_id: "novara_cma_2026_05",
        data: {
            r: {
                usEq: 0.065,
                devEq: 0.072,
                emEq: 0.088,
                jpnEq: 0.070,
                ukEq: 0.065,
                apacEq: 0.072,
                globalReits: 0.068,
                realEstateDirect: 0.067,
                infrastructure: 0.075,
                privEq: 0.105,
                privCredit: 0.082,
                listedAlts: 0.064,
                digitalAssets: 0.125,
                globalHighYield: 0.078,
                emDebt: 0.075,
                igCredit: 0.054,
                sdCredit: 0.043,
                globalSov: 0.045,
                inflLinked: 0.045,
                moneyMkt: 0.035
            },
            v: {
                usEq: 0.155,
                devEq: 0.150,
                emEq: 0.230,
                jpnEq: 0.170,
                ukEq: 0.140,
                apacEq: 0.185,
                globalReits: 0.190,
                realEstateDirect: 0.140,
                infrastructure: 0.120,
                privEq: 0.240,
                privCredit: 0.100,
                listedAlts: 0.145,
                digitalAssets: 0.480,
                globalHighYield: 0.110,
                emDebt: 0.140,
                igCredit: 0.060,
                sdCredit: 0.040,
                globalSov: 0.075,
                inflLinked: 0.065,
                moneyMkt: 0.010
            },
            k: {
                usEq: 2.55,
                devEq: 1.90,
                emEq: 4.10,
                jpnEq: 2.10,
                ukEq: 2.00,
                apacEq: 3.10,
                globalReits: 2.80,
                realEstateDirect: 1.80,
                infrastructure: 1.30,
                privEq: 1.90,
                privCredit: 3.50,
                listedAlts: 2.10,
                digitalAssets: 5.50,
                globalHighYield: 2.90,
                emDebt: 3.40,
                igCredit: 1.50,
                sdCredit: 0.40,
                globalSov: 1.80,
                inflLinked: 2.00,
                moneyMkt: 0.15
            },
            correlations: {
                // Symmetrical matrix anchored to revised 2026 regional decoupling views
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
    },

    {
        name: "March 2026 — Global Equilibrium (Institutional)",
        cma_id: "novara_cma_2026_03",
        data: {
            r: { 
                usEq: 0.070, devEq: 0.072, emEq: 0.091, jpnEq: 0.070, ukEq: 0.065, apacEq: 0.072, 
                globalReits: 0.068, realEstateDirect: 0.067, infrastructure: 0.075, 
                privEq: 0.105, privCredit: 0.082, listedAlts: 0.064, digitalAssets: 0.125, 
                globalHighYield: 0.078, emDebt: 0.075, igCredit: 0.054, sdCredit: 0.048, 
                globalSov: 0.045, inflLinked: 0.045, moneyMkt: 0.035 
            },
            v: { 
                usEq: 0.155, devEq: 0.150, emEq: 0.220, jpnEq: 0.170, ukEq: 0.140, apacEq: 0.185, 
                globalReits: 0.190, realEstateDirect: 0.140, infrastructure: 0.120, 
                privEq: 0.240, privCredit: 0.100, listedAlts: 0.145, digitalAssets: 0.480, 
                globalHighYield: 0.110, emDebt: 0.140, igCredit: 0.060, sdCredit: 0.040, 
                globalSov: 0.070, inflLinked: 0.060, moneyMkt: 0.010 
            },
            k: { 
                usEq: 2.55, devEq: 1.90, emEq: 4.10, jpnEq: 2.10, ukEq: 2.00, apacEq: 3.10, 
                globalReits: 2.80, realEstateDirect: 1.80, infrastructure: 1.30, 
                privEq: 1.90, privCredit: 3.50, listedAlts: 2.10, digitalAssets: 5.50, 
                globalHighYield: 2.90, emDebt: 3.40, igCredit: 1.50, sdCredit: 0.40, 
                globalSov: 1.65, inflLinked: 1.80, moneyMkt: 0.15 
            },
            correlations: {
                // Symmetrical matrix anchored to revised 2026 regional decoupling views
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
    },

];

export const PRESET_PERSONAS = [
    { 
        id: "pers_1", 
        name: "Maya", 
        seed: "Maya_1",
        desc: "Starting early with decades of compounding ahead. Every contribution now is worth multiples later.", 
        data: { age: 25, retirementAge: 68, savings: 5000, salary: 32000, contribution: 10, realSalaryGrowth: 1.5 } 
    },
    { 
        id: "pers_2", 
        name: "James", 
        seed: "James_2",
        desc: "Navigating peak earning years alongside mortgage, family, and the pension acceleration window.", 
        data: { age: 40, retirementAge: 68, savings: 85000, salary: 65000, contribution: 12, realSalaryGrowth: 0.5 } 
    },
    { 
        id: "pers_3", 
        name: "Priya", 
        seed: "Priya_3",
        desc: "Pushing hard in the final stretch — higher contributions and a sharper focus on the finish line.", 
        data: { age: 55, retirementAge: 67, savings: 120000, salary: 80000, contribution: 20, realSalaryGrowth: 0.0 } 
    },
    {
        id: "pers_4",
        name: "David",
        seed: "David_4",
        desc: "At the threshold — retired or imminently retiring, focused on how a pension pot holds up across a long drawdown horizon.",
        data: { age: 67, retirementAge: 67, savings: 280000, salary: 0, contribution: 0, realSalaryGrowth: 0.0 }
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

    // ─── L&G ──────────────────────────────────────────────────────────────────
    {
        name: "Legal & General",
        portfolios: [
            { id: "p_lg_tdf_growth", name: "L&G TDF Growth Phase (100% growth, 10+ yrs)",
              weights: { usEq:0.560, devEq:0.122, emEq:0.092, jpnEq:0.051, apacEq:0.031, ukEq:0.031, listedAlts:0.051, globalReits:0.031, privEq:0.004, infrastructure:0.003, privCredit:0.003, moneyMkt:0.021 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_lg_tdf_retire", name: "L&G TDF At-Retirement (Cash/Drawdown Landing)",
              weights: { sdCredit:0.350, igCredit:0.250, moneyMkt:0.200, usEq:0.120, devEq:0.040, emEq:0.020, globalSov:0.020 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075 } },
            { id: "p_lg_laf_growth", name: "L&G Lifetime Advantage Fund Growth Phase",
              weights: { usEq:0.511, devEq:0.102, emEq:0.076, jpnEq:0.043, apacEq:0.025, ukEq:0.025, listedAlts:0.068, realEstateDirect:0.060, infrastructure:0.045, privEq:0.030, privCredit:0.015 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── AVIVA ─────────────────────────────────────────────────────────────────
    {
        name: "Aviva",
        portfolios: [
            { id: "p_mff_ltg", name: "MFF Long Term Growth Fund",
              weights: { usEq:0.410, devEq:0.200, emEq:0.130, ukEq:0.030, jpnEq:0.070, apacEq:0.050, realEstateDirect:0.100, moneyMkt:0.010 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_mff_growth", name: "MFF Growth Fund",
              weights: { usEq:0.340, devEq:0.110, emEq:0.080, ukEq:0.060, jpnEq:0.040, apacEq:0.060, realEstateDirect:0.100, igCredit:0.080, emDebt:0.090, globalHighYield:0.020, moneyMkt:0.020 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_mff_consolidation", name: "MFF Consolidation Fund",
              weights: { globalSov:0.533, usEq:0.161, igCredit:0.061, devEq:0.044, realEstateDirect:0.040, emEq:0.032, emDebt:0.060, apacEq:0.023, globalHighYield:0.022, moneyMkt:0.010, ukEq:0.009, jpnEq:0.005 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_vision_ltg", name: "My Future Vision Long Term Growth Fund",
              weights: { usEq:0.345, devEq:0.169, emEq:0.110, ukEq:0.025, jpnEq:0.059, apacEq:0.042, privEq:0.088, infrastructure:0.062, realEstateDirect:0.038, privCredit:0.062 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_vision_growth", name: "My Future Vision Growth Fund",
              weights: { usEq:0.305, devEq:0.148, emEq:0.096, ukEq:0.022, jpnEq:0.052, apacEq:0.037, privEq:0.075, infrastructure:0.055, realEstateDirect:0.035, privCredit:0.085, igCredit:0.040, globalSov:0.028, listedAlts:0.012, moneyMkt:0.010 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_vision_consolidation", name: "My Future Vision Consolidation Fund",
              weights: { usEq:0.144, devEq:0.070, emEq:0.045, ukEq:0.010, jpnEq:0.024, apacEq:0.017, privEq:0.020, infrastructure:0.020, realEstateDirect:0.020, privCredit:0.140, igCredit:0.203, globalSov:0.244, listedAlts:0.033, moneyMkt:0.010 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── STANDARD LIFE ────────────────────────────────────────────────────────
    {
        name: "Standard Life",
        portfolios: [
            { id: "p_sl_sma_growth", name: "SMA Growth Pension Fund (LPNL, Q1 2026)",
              weights: { usEq:0.463, devEq:0.153, jpnEq:0.094, emEq:0.077, ukEq:0.075, apacEq:0.065, globalReits:0.050, realEstateDirect:0.023 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_sl_sma_preretire", name: "SMA Pre-Retirement Pension Fund (CEMH, Q1 2026)",
              weights: { usEq:0.311, sdCredit:0.122, devEq:0.103, jpnEq:0.063, igCredit:0.075, emEq:0.053, ukEq:0.051, apacEq:0.045, globalReits:0.040, emDebt:0.038, globalSov:0.043, realEstateDirect:0.023, inflLinked:0.020, moneyMkt:0.013 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_sl_sma_retire", name: "SMA At-Retirement Universal Pension Fund (PLND, Q1 2026)",
              weights: { sdCredit:0.238, usEq:0.168, igCredit:0.149, emDebt:0.075, globalSov:0.083, devEq:0.056, inflLinked:0.040, jpnEq:0.034, globalReits:0.030, emEq:0.028, ukEq:0.027, moneyMkt:0.025, apacEq:0.024, realEstateDirect:0.023 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_sl_future_growth", name: "SL Future Opportunities Growth (SMA equity 75% + 25% PM)",
              weights: { usEq:0.301, devEq:0.124, jpnEq:0.076, emEq:0.062, ukEq:0.061, apacEq:0.053, globalReits:0.050, realEstateDirect:0.023, privEq:0.100, infrastructure:0.100, privCredit:0.050 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── NPT (National Pension Trust) ─────────────────────────────────────────
        {
        name: "NPT",
        portfolios: [
            { id: "p_npt_growth", name: "NPT Sustainable Growth", weights: { usEq: 0.556, devEq: 0.133, emEq: 0.090, jpnEq: 0.052, ukEq: 0.033, apacEq: 0.019, globalReits: 0.048, realEstateDirect: 0.019, infrastructure: 0.05 }, alphas: {}, tes: {} },
            { id: "p_npt_retire", name: "NPT Retirement (40% Equity)", weights: { usEq: 0.23, devEq: 0.08, emEq: 0.04, ukEq: 0.05, igCredit: 0.30, sdCredit: 0.20, moneyMkt: 0.10 }, alphas: {}, tes: {} }
        ]
    },

    // ─── NEW PROVIDERS (from consolidated May 2026) ───────────────────────────
    {
        name: "NEST",
        portfolios: [
            { id: "p_nest_growth",  name: "NEST RDF Growth (30+ yrs)",
              weights: { usEq:0.205, devEq:0.120, emEq:0.049, jpnEq:0.042, apacEq:0.056, globalReits:0.043, realEstateDirect:0.020, infrastructure:0.068, privEq:0.042, privCredit:0.038, globalHighYield:0.036, emDebt:0.036, igCredit:0.079, sdCredit:0.043, globalSov:0.003, moneyMkt:0.108, listedAlts:0.012 },
              alphas: {}, tes: {} },
            { id: "p_nest_retire",  name: "NEST RDF At-Retirement (2024/25 vintage)",
              weights: { usEq:0.095, devEq:0.058, emEq:0.023, jpnEq:0.020, apacEq:0.022, globalReits:0.008, realEstateDirect:0.008, infrastructure:0.012, privEq:0.019, privCredit:0.012, globalHighYield:0.047, emDebt:0.046, igCredit:0.228, sdCredit:0.129, globalSov:0.047, moneyMkt:0.219, listedAlts:0.007 },
              alphas: {}, tes: {} }
        ]
    },

    // ─── L&G ──────────────────────────────────────────────────────────────────
    {
        name: "Legal & General",
        portfolios: [
            { id: "p_lg_tdf_growth", name: "L&G TDF Growth Phase (100% growth, 10+ yrs)",
              weights: { usEq:0.560, devEq:0.122, emEq:0.092, jpnEq:0.051, apacEq:0.031, ukEq:0.031, listedAlts:0.051, globalReits:0.031, privEq:0.004, infrastructure:0.003, privCredit:0.003, moneyMkt:0.021 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_lg_tdf_retire", name: "L&G TDF At-Retirement (Drawdown Landing, Stage 3)",
              weights: { usEq:0.154, devEq:0.031, emEq:0.018, jpnEq:0.011, ukEq:0.007, igCredit:0.250, globalSov:0.300, sdCredit:0.100, listedAlts:0.050, privEq:0.015, privCredit:0.015, infrastructure:0.020, moneyMkt:0.029 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075 } },
            { id: "p_lg_laf_growth", name: "L&G Lifetime Advantage Fund Growth Phase",
              weights: { usEq:0.458, devEq:0.119, emEq:0.085, jpnEq:0.060, ukEq:0.085, apacEq:0.043, realEstateDirect:0.037, listedAlts:0.035, infrastructure:0.029, privCredit:0.027, privEq:0.022 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── AVIVA ─────────────────────────────────────────────────────────────────
    {
        name: "Aviva",
        portfolios: [
            { id: "p_mff_ltg", name: "Aviva MFF Long Term Growth Fund",
              weights: { usEq:0.410, devEq:0.200, emEq:0.130, ukEq:0.030, jpnEq:0.070, apacEq:0.050, realEstateDirect:0.100, moneyMkt:0.010 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_mff_growth", name: "Aviva MFF Growth Fund",
              weights: { usEq:0.340, devEq:0.110, emEq:0.080, ukEq:0.060, jpnEq:0.040, apacEq:0.060, realEstateDirect:0.100, igCredit:0.080, emDebt:0.090, globalHighYield:0.020, moneyMkt:0.020 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_mff_consolidation", name: "Aviva MFF Consolidation Fund",
              weights: { globalSov:0.533, usEq:0.161, igCredit:0.061, devEq:0.044, realEstateDirect:0.040, emEq:0.032, emDebt:0.060, apacEq:0.023, globalHighYield:0.022, moneyMkt:0.010, ukEq:0.009, jpnEq:0.005 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_vision_ltg", name: "Aviva My Future Vision Long Term Growth Fund",
              weights: { usEq:0.345, devEq:0.169, emEq:0.110, ukEq:0.025, jpnEq:0.059, apacEq:0.042, privEq:0.088, infrastructure:0.062, realEstateDirect:0.038, privCredit:0.062 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_vision_growth", name: "Aviva My Future Vision Growth Fund",
              weights: { usEq:0.305, devEq:0.148, emEq:0.096, ukEq:0.022, jpnEq:0.052, apacEq:0.037, privEq:0.075, infrastructure:0.055, realEstateDirect:0.035, privCredit:0.085, igCredit:0.040, globalSov:0.028, listedAlts:0.012, moneyMkt:0.010 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_vision_consolidation", name: "Aviva My Future Vision Consolidation Fund",
              weights: { usEq:0.144, devEq:0.070, emEq:0.045, ukEq:0.010, jpnEq:0.024, apacEq:0.017, privEq:0.020, infrastructure:0.020, realEstateDirect:0.020, privCredit:0.140, igCredit:0.203, globalSov:0.244, listedAlts:0.033, moneyMkt:0.010 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── STANDARD LIFE ────────────────────────────────────────────────────────
    {
        name: "Standard Life",
        portfolios: [
            { id: "p_sl_sma_growth", name: "Standard Life SMA Growth Fund",
              weights: { usEq:0.463, devEq:0.153, jpnEq:0.094, emEq:0.077, ukEq:0.075, apacEq:0.065, globalReits:0.050, realEstateDirect:0.023 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_sl_sma_preretire", name: "Standard Life SMA Pre-Retirement Fund",
              weights: { usEq:0.311, sdCredit:0.122, devEq:0.103, jpnEq:0.063, igCredit:0.075, emEq:0.053, ukEq:0.051, apacEq:0.045, globalReits:0.040, emDebt:0.038, globalSov:0.043, realEstateDirect:0.023, inflLinked:0.020, moneyMkt:0.013 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_sl_sma_retire", name: "Standard Life SMA At-Retirement Fund",
              weights: { sdCredit:0.238, usEq:0.168, igCredit:0.149, emDebt:0.075, globalSov:0.083, devEq:0.056, inflLinked:0.040, jpnEq:0.034, globalReits:0.030, emEq:0.028, ukEq:0.027, moneyMkt:0.025, apacEq:0.024, realEstateDirect:0.023 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_sl_future_growth", name: "Standard Life Future Opportunities Growth Fund",
              weights: { usEq:0.301, devEq:0.124, jpnEq:0.076, emEq:0.062, ukEq:0.061, apacEq:0.053, globalReits:0.050, realEstateDirect:0.023, privEq:0.100, infrastructure:0.100, privCredit:0.050 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── NPT (unchanged) ──────────────────────────────────────────────────────
        {
        name: "Standard Life",
        portfolios: [
            { id: "p_sl_sma_growth", name: "SMA Growth Pension Fund (LPNL, Q1 2026)",
              weights: { usEq:0.463, devEq:0.153, jpnEq:0.094, emEq:0.077, ukEq:0.075, apacEq:0.065, globalReits:0.050, realEstateDirect:0.023 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_sl_sma_preretire", name: "SMA Pre-Retirement Pension Fund (CEMH, Q1 2026)",
              weights: { usEq:0.311, sdCredit:0.122, devEq:0.103, jpnEq:0.063, igCredit:0.075, emEq:0.053, ukEq:0.051, apacEq:0.045, globalReits:0.040, emDebt:0.038, globalSov:0.043, realEstateDirect:0.023, inflLinked:0.020, moneyMkt:0.013 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_sl_sma_retire", name: "SMA At-Retirement Universal Pension Fund (PLND, Q1 2026)",
              weights: { sdCredit:0.238, usEq:0.168, igCredit:0.149, emDebt:0.075, globalSov:0.083, devEq:0.056, inflLinked:0.040, jpnEq:0.034, globalReits:0.030, emEq:0.028, ukEq:0.027, moneyMkt:0.025, apacEq:0.024, realEstateDirect:0.023 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_sl_future_growth", name: "SL Future Opportunities Growth (SMA equity 75% + 25% PM)",
              weights: { usEq:0.301, devEq:0.124, jpnEq:0.076, emEq:0.062, ukEq:0.061, apacEq:0.053, globalReits:0.050, realEstateDirect:0.023, privEq:0.100, infrastructure:0.100, privCredit:0.050 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── NPT (National Pension Trust) ─────────────────────────────────────────
        {
        name: "NPT",
        portfolios: [
            { id: "p_npt_growth", name: "NPT Sustainable Growth", weights: { usEq: 0.556, devEq: 0.133, emEq: 0.090, jpnEq: 0.052, ukEq: 0.033, apacEq: 0.019, globalReits: 0.048, realEstateDirect: 0.019, infrastructure: 0.05 }, alphas: {}, tes: {} },
            { id: "p_npt_retire", name: "NPT Retirement (40% Equity)", weights: { usEq: 0.23, devEq: 0.08, emEq: 0.04, ukEq: 0.05, igCredit: 0.30, sdCredit: 0.20, moneyMkt: 0.10 }, alphas: {}, tes: {} }
        ]
    },

    // ─── NEST ─────────────────────────────────────────────────────────────────
    {
        name: "NEST",
        // Source: Q4 2025 NEST Retirement Date Fund PDF (nestpensions.org.uk).
        // Four distinct phases: Foundation (Starter), Growth plateau, Consolidation, Retirement.
        // All weights exact from Q4 2025 PDF; HIGH confidence throughout.
        // Climate transition equity via LGIM Future World throughout all phases.
        portfolios: [
            { id: "p_nest_foundation", name: "NEST Foundation Phase (Starter fund)",
              // Source: Q4 2025 PDF — Starter row (exact). HIGH confidence.
              // Characteristic split: Higher Growth 50%, Long-Term Stable Growth 45%, Capital Preservation 5%.
              // Identical to vintages 2068-2071 (50+ yrs from TRA).
              // Lower equity (36.8%) and higher infrastructure (8.9%) vs Growth phase.
              // moneyMkt 7.4% (confirmed correct in Q4 2025 data).
              weights: { usEq:0.1608, devEq:0.0929, emEq:0.0390, jpnEq:0.0324, apacEq:0.0432,
                         igCredit:0.1730, sdCredit:0.0530, globalHighYield:0.0280, emDebt:0.0290,
                         globalSov:0.0030, realEstateDirect:0.0850, infrastructure:0.0890,
                         privEq:0.0330, privCredit:0.0500, listedAlts:0.0150, moneyMkt:0.0740 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_nest_growth", name: "NEST Growth Phase (2046-2063 plateau, 20-37 yrs from TRA)",
              // Source: Q4 2025 PDF — 2046 row (exact; identical to 2047-2063 rows). HIGH confidence.
              // Characteristic split: Higher Growth 65%, Long-Term Stable Growth 30%, Capital Preservation 5%.
              // Plateau is flat across 2046-2063 vintages. Equity 47.8%.
              // moneyMkt 6.5% (corrected from prior 10.8% — prior was based on wrong vintage).
              weights: { usEq:0.2073, devEq:0.1205, emEq:0.0510, jpnEq:0.0421, apacEq:0.0561,
                         igCredit:0.1160, sdCredit:0.0460, globalHighYield:0.0360, emDebt:0.0380,
                         globalSov:0.0030, realEstateDirect:0.0610, infrastructure:0.0590,
                         privEq:0.0440, privCredit:0.0370, listedAlts:0.0180, moneyMkt:0.0650 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_nest_consolidation", name: "NEST Consolidation Phase (2036, 10 yrs from TRA)",
              // Source: Q4 2025 PDF — 2036 row (exact). HIGH confidence.
              // Characteristic split: Higher Growth 70%, Income Seeking 10%, Long-Term Stable 15%,
              //   Capital Preservation 5%. Income Seeking emerges at 10%, signalling active de-risking.
              // Notable: equity 51.5% — higher than growth plateau (47.8%) because Higher Growth
              //   characteristic dominates at 70%. Shift is from Long-Term Stable → Income Seeking.
              // Retained as reference portfolio; glidepath uses Foundation/Growth/Retirement only.
              weights: { usEq:0.2226, devEq:0.1297, emEq:0.0550, jpnEq:0.0453, apacEq:0.0604,
                         igCredit:0.1060, sdCredit:0.0460, globalHighYield:0.0460, emDebt:0.0480,
                         globalSov:0.0110, realEstateDirect:0.0440, infrastructure:0.0330,
                         privEq:0.0470, privCredit:0.0260, listedAlts:0.0220, moneyMkt:0.0580 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_nest_retire", name: "NEST At-Retirement Fund (2026 vintage, at TRA)",
              // Source: Q4 2025 PDF — 2026 row (exact; identical to 2025). HIGH confidence.
              // Characteristic split: Higher Growth 30%, Income Seeking 40%, Capital Preservation 27%,
              //   Longevity Protection 2%.
              // moneyMkt 10.9% (corrected from prior 21.9% which was Q2 2025 data).
              // sdCredit 20.1% now dominant fixed income line (was 12.9% in prior version).
              // igCredit 21.0% (sterling 13.6% + global 7.4%). globalSov 5.6% (was 4.7%).
              weights: { usEq:0.0964, devEq:0.0557, emEq:0.0230, jpnEq:0.0194, apacEq:0.0259,
                         igCredit:0.2100, sdCredit:0.2010, globalHighYield:0.0470, emDebt:0.0480,
                         globalSov:0.0560, realEstateDirect:0.0330, infrastructure:0.0180,
                         privEq:0.0200, privCredit:0.0160, listedAlts:0.0220, moneyMkt:0.1090 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── AEGON ────────────────────────────────────────────────────────────────
    {
        name: "Aegon",
        portfolios: [
            { id: "p_aegon_ubc_growth", name: "Aegon UBC Growth Phase (Q1 2026)",
              weights: { usEq:0.540, devEq:0.081, emEq:0.058, jpnEq:0.009, ukEq:0.025, apacEq:0.091, privEq:0.025, realEstateDirect:0.020, listedAlts:0.018, igCredit:0.068, globalSov:0.015, privCredit:0.040, moneyMkt:0.010 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_aegon_ubc_retire", name: "Aegon UBC Retirement Stage",
              weights: { usEq:0.200, devEq:0.080, emEq:0.030, ukEq:0.020, privEq:0.010, privCredit:0.020, globalHighYield:0.050, emDebt:0.030, igCredit:0.200, sdCredit:0.150, globalSov:0.100, inflLinked:0.050, moneyMkt:0.060 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075 } },
            { id: "p_aegon_lp_growth", name: "Aegon LifePath Flexi Growth Phase (Q1 2026)",
              weights: { usEq:0.608, devEq:0.115, ukEq:0.037, emEq:0.082, jpnEq:0.063, apacEq:0.031, globalReits:0.046, moneyMkt:0.018 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_aegon_lp_retire", name: "Aegon LifePath Flexi At-Retirement (2025-2027 vintage)",
              weights: { usEq:0.243, devEq:0.020, emEq:0.050, jpnEq:0.024, globalSov:0.304, igCredit:0.076, sdCredit:0.118, globalReits:0.045, realEstateDirect:0.040, listedAlts:0.080 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075 } }
        ]
    },

    // ─── FIDELITY ─────────────────────────────────────────────────────────────
    {
        name: "Fidelity",
        portfolios: [
            { id: "p_fidelity_fw_growth", name: "Fidelity FutureWise Growth TDF (target state: 15% PM)",
              weights: { usEq:0.587, devEq:0.106, apacEq:0.067, jpnEq:0.051, emEq:0.016, ukEq:0.013, privEq:0.040, privCredit:0.040, infrastructure:0.040, realEstateDirect:0.020, listedAlts:0.010, moneyMkt:0.010 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_fidelity_fw_retire", name: "Fidelity FutureWise Retirement Fund",
              weights: { globalSov:0.398, igCredit:0.260, emDebt:0.084, usEq:0.193, devEq:0.030, apacEq:0.016, emEq:0.016, moneyMkt:0.003 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── SCOTTISH WIDOWS ──────────────────────────────────────────────────────
    {
        name: "Scottish Widows",
        portfolios: [
            { id: "p_sw_lifetime_growth", name: "Scottish Widows Lifetime Investment Growth Phase",
              weights: { usEq:0.480, devEq:0.155, emEq:0.100, jpnEq:0.055, ukEq:0.060, apacEq:0.050, globalReits:0.030, infrastructure:0.020, moneyMkt:0.050 },
              alphas: { usEq:0.005, devEq:0.005, emEq:0.005, ukEq:0.005, jpnEq:0.005, apacEq:0.005 },
              tes:    { usEq:0.015, devEq:0.015, emEq:0.015, ukEq:0.015, jpnEq:0.015, apacEq:0.015 } },
            { id: "p_sw_lifetime_retire", name: "Scottish Widows Lifetime Investment At-Retirement",
              weights: { usEq:0.175, devEq:0.060, emEq:0.030, ukEq:0.025, jpnEq:0.020, apacEq:0.015, igCredit:0.200, sdCredit:0.150, globalHighYield:0.050, globalSov:0.120, inflLinked:0.060, moneyMkt:0.080, emDebt:0.015 },
              alphas: { usEq:0.005, devEq:0.005, emEq:0.005, ukEq:0.005, jpnEq:0.005, apacEq:0.005 },
              tes:    { usEq:0.015, devEq:0.015, emEq:0.015, ukEq:0.015, jpnEq:0.015, apacEq:0.015 } }
        ]
    },

    // ─── ROYAL LONDON ─────────────────────────────────────────────────────────
    {
        name: "Royal London",
        // Equity implemented via standard market-cap indices (no active stock selection).
        // Alpha and tracking error set to zero; return modelled as pure CMA beta.
        portfolios: [
            { id: "p_rl_gpd", name: "Royal London Governed Portfolio Dynamic (15+ yrs)",
              weights: { usEq:0.340, devEq:0.165, emEq:0.084, jpnEq:0.042, ukEq:0.189, apacEq:0.017, globalReits:0.044, realEstateDirect:0.040, globalHighYield:0.038, listedAlts:0.008, moneyMkt:0.033 },
              alphas: {},
              tes:    {} },
            { id: "p_rl_grip3", name: "Royal London GRIP 3 (At-Retirement Drawdown)",
              weights: { ukEq:0.079, usEq:0.140, devEq:0.028, emEq:0.039, jpnEq:0.014, apacEq:0.016, globalHighYield:0.103, igCredit:0.151, inflLinked:0.100, globalSov:0.132, sdCredit:0.019, globalReits:0.070, listedAlts:0.058, moneyMkt:0.051 },
              alphas: {},
              tes:    {} }
        ]
    },

    // ─── HARGREAVES LANSDOWN ──────────────────────────────────────────────────
    {
        name: "Hargreaves Lansdown",
        portfolios: [
            { id: "p_hl_growth", name: "Hargreaves Lansdown Growth Fund",
              weights: { usEq:0.375, devEq:0.122, emEq:0.076, jpnEq:0.030, ukEq:0.097, apacEq:0.030, listedAlts:0.110, igCredit:0.075, globalSov:0.020, inflLinked:0.020, globalHighYield:0.020, emDebt:0.020, moneyMkt:0.005 },
              alphas: {}, tes: {} },
            { id: "p_hl_mymap4", name: "HL BlackRock MyMap 4 (At-Retirement Default)",
              weights: { usEq:0.319, devEq:0.060, emEq:0.065, ukEq:0.035, jpnEq:0.005, apacEq:0.002, globalSov:0.276, igCredit:0.085, sdCredit:0.100, inflLinked:0.030, listedAlts:0.021, moneyMkt:0.002 },
              alphas: {}, tes: {} }
        ]
    },

    // ─── NOW PENSIONS ─────────────────────────────────────────────────────────
    {
        name: "NOW Pensions",
        portfolios: [
            { id: "p_now_growth", name: "NOW: Pensions Growth Fund",
              weights: { usEq:0.495, devEq:0.087, emEq:0.073, jpnEq:0.040, ukEq:0.027, apacEq:0.020, globalSov:0.065, igCredit:0.056, globalHighYield:0.069, listedAlts:0.054, privEq:0.008, moneyMkt:0.006 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_now_rcf", name: "NOW: Pensions Retirement Countdown Fund",
              weights: { sdCredit:0.599, globalSov:0.211, moneyMkt:0.190 },
              alphas: {}, tes: {} }
        ]
    },

    // ─── MERCER ───────────────────────────────────────────────────────────────
    {
        name: "Mercer",
        portfolios: [
            { id: "p_mercer_growth", name: "Mercer Growth Fund",
              weights: { usEq:0.466, devEq:0.082, emEq:0.070, jpnEq:0.038, ukEq:0.025, apacEq:0.019, listedAlts:0.070, emDebt:0.030, globalHighYield:0.040, igCredit:0.020, globalSov:0.040, inflLinked:0.100 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } },
            { id: "p_mercer_target_drawdown", name: "Mercer Diversified Retirement Fund (SmartPath Drawdown)",
              weights: { usEq:0.244, devEq:0.043, emEq:0.020, jpnEq:0.020, ukEq:0.013, apacEq:0.010, listedAlts:0.070, emDebt:0.050, globalHighYield:0.130, sdCredit:0.080, igCredit:0.100, inflLinked:0.200, globalSov:0.020 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, ukEq:0.0025, jpnEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, ukEq:0.0075, jpnEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── AON ──────────────────────────────────────────────────────────────────
    {
        name: "AON",
        portfolios: [
            { id: "p_aon_growth", name: "Aon Managed Retirement Pathway — Growth",
              weights: { usEq:0.445, devEq:0.208, emEq:0.090, jpnEq:0.059, ukEq:0.030, apacEq:0.074, globalReits:0.046, realEstateDirect:0.031, infrastructure:0.014, moneyMkt:0.003 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, ukEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075, ukEq:0.0075, apacEq:0.0075 } },
            { id: "p_aon_retire", name: "Aon Managed Retirement Pathway — At-Retirement",
              weights: { usEq:0.167, devEq:0.077, emEq:0.033, jpnEq:0.022, ukEq:0.011, apacEq:0.027, globalReits:0.013, realEstateDirect:0.008, infrastructure:0.004, igCredit:0.015, globalSov:0.064, inflLinked:0.300, sdCredit:0.107, moneyMkt:0.026, privCredit:0.100, listedAlts:0.026 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, ukEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075, ukEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── LIFESIGHT ────────────────────────────────────────────────────────────
    {
        name: "Lifesight",
        // ── Source: LifeSight Equity and DGF factsheets, 31 March 2026 (WTW / L&G) ──
        // The LifeSight Default is the Medium Risk Drawdown Lifecycle:
        //   100% Equity Fund → 20yr de-risk → ~35% Equity / 35% DGF / 30% Cash at TRA
        // De-risk start: 20 years before Target Retirement Age (corrected from 25yr).
        // Source: Appendix D (Core Savings Phase Strategies), March 2026 WTW document.
        //
        // LifeSight Equity Fund (£13.1bn, 31 Mar 2026):
        //   99.2% equities via WTW Global Diversified Equity Index (37.7% + 37.4% GBP-hedged),
        //   AMX STOXX Climate Transition (9.2%), MSCI regional funds (14.9%).
        //   0.8% private equity (CG WTW Private Equity Access LTAF).
        //   Country breakdown: US 61.3%, Japan 7.4%, Taiwan/Korea/China/EM ~9.3%,
        //   Europe ex-UK ~11.4%, UK 2.5%, APAC ex-Japan ~4.4%.
        //   Alpha: fund targets +0.5% p.a. net outperformance vs MSCI ACWI 50% hedged.
        //   Implemented via active ESG tilts on index base and active currency management.
        //   TE: ~80bp consistent with ESG exclusion/tilt mandate.
        //
        // LifeSight DGF (£7.8bn, 31 Mar 2026):
        //   Equities 36.2% (same underlying vehicles as Equity Fund, scaled),
        //   Corporate Bonds 27.7% (AXA Carbon IG 10.1%, LGIM Climate B&M 7.6%, HY 6.6%, other),
        //   Government Bonds 10.9% (EM USD Govt 5.0%, Gilts 3.4%, EM Local 2.5%),
        //   Alternatives 25.2% (Infra+Renewables 15.6%, Property 5.4%, ILS 4.0%, PE 0.3%).
        //   Alpha: modest active management on equity portion only.
        //
        // Landing portfolio (Medium Risk Drawdown at TRA):
        //   ~35% LifeSight Equity look-through + 35% DGF look-through + 30% Cash.
        //   Derived from Appendix D glidepath chart reading at years=0.
        portfolios: [
            { id: "p_lifesight_equity", name: "LifeSight Equity Fund (Growth)",
              // 31 Mar 2026 factsheet: 99.2% equity, 0.8% private equity (CG WTW LTAF)
              // Country weights derived from factsheet country breakdown table
              weights: { usEq:0.6406, devEq:0.1147, emEq:0.0934, jpnEq:0.0741, ukEq:0.0254, apacEq:0.0437, privEq:0.0081 },
              alphas: { usEq:0.003, devEq:0.003, emEq:0.003, jpnEq:0.003, ukEq:0.003, apacEq:0.003 },
              tes:    { usEq:0.008, devEq:0.008, emEq:0.008, jpnEq:0.008, ukEq:0.008, apacEq:0.008 } },
            { id: "p_lifesight_dgf", name: "LifeSight Diversified Growth Fund (DGF)",
              // 31 Mar 2026 factsheet: Equities 36.2%, Corp Bonds 27.7%, Govt 10.9%, Alts 25.2%
              // Equity sub-allocation mirrors Equity Fund regional proportions, scaled to 36.2%
              // infrastructure = Infra Equity MFG (12.9%) + Schroder Greencoat Renewables (2.7%)
              // listedAlts = Leadenhall UCITs ILS Fund (insurance-linked securities, 4.0%)
              weights: { usEq:0.2299, devEq:0.0413, emEq:0.0333, jpnEq:0.0262, ukEq:0.0091, apacEq:0.0161,
                         igCredit:0.1361, sdCredit:0.0766, globalHighYield:0.0665,
                         emDebt:0.0756, globalSov:0.0343,
                         infrastructure:0.1573, globalReits:0.0544, listedAlts:0.0403, privEq:0.003 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, ukEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.008, devEq:0.008, emEq:0.008, jpnEq:0.008, ukEq:0.008, apacEq:0.008 } },
            { id: "p_lifesight_landing", name: "LifeSight Medium Risk Drawdown Landing (at TRA)",
              // At-retirement blend: ~35% Equity Fund + 35% DGF + 30% Cash
              // Derived from Appendix D Medium Risk Drawdown chart at years=0 (March 2026 WTW doc)
              // Weights are look-through to underlying asset classes
              weights: { usEq:0.3047, devEq:0.0546, emEq:0.0443, jpnEq:0.0351, ukEq:0.0121, apacEq:0.0209,
                         privEq:0.0039, igCredit:0.0476, sdCredit:0.0268, globalHighYield:0.0233,
                         emDebt:0.0265, globalSov:0.012, infrastructure:0.0551, globalReits:0.019,
                         listedAlts:0.0141, moneyMkt:0.3 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, ukEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.008, devEq:0.008, emEq:0.008, jpnEq:0.008, ukEq:0.008, apacEq:0.008 } }
        ]
    },

    // ─── CUSHON ───────────────────────────────────────────────────────────────
    {
        name: "Cushon",
        portfolios: [
            { id: "p_cushon_growth", name: "Cushon Sustainable Investment Strategy — Growth",
              weights: { usEq:0.481, devEq:0.120, emEq:0.075, jpnEq:0.045, ukEq:0.022, apacEq:0.007, infrastructure:0.075, listedAlts:0.040, privEq:0.025, realEstateDirect:0.010, igCredit:0.060, globalHighYield:0.025, globalSov:0.015 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, ukEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075, ukEq:0.0075, apacEq:0.0075 } },
            { id: "p_cushon_retire", name: "Cushon Sustainable Investment Strategy — At-Retirement",
              weights: { usEq:0.243, devEq:0.061, emEq:0.038, jpnEq:0.023, ukEq:0.011, apacEq:0.004, infrastructure:0.050, listedAlts:0.025, privEq:0.015, realEstateDirect:0.010, igCredit:0.140, globalSov:0.100, globalHighYield:0.050, sdCredit:0.030, inflLinked:0.150, moneyMkt:0.050 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, ukEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075, ukEq:0.0075, apacEq:0.0075 } }
        ]
    },

    // ─── SMART ────────────────────────────────────────────────────────────────
    {
        name: "Smart",
        portfolios: [
            { id: "p_smart_growth", name: "Smart Sustainable Growth Fund",
              weights: { usEq:0.524, devEq:0.116, emEq:0.080, jpnEq:0.040, ukEq:0.024, apacEq:0.016, igCredit:0.060, globalHighYield:0.020, globalSov:0.020, privCredit:0.100 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, ukEq:0.0025, apacEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075, ukEq:0.0075, apacEq:0.0075 } },
            { id: "p_smart_retire", name: "Smart Income Fund (At-Retirement Default)",
              weights: { usEq:0.279, devEq:0.049, emEq:0.015, jpnEq:0.023, ukEq:0.011, listedAlts:0.029, globalSov:0.198, igCredit:0.346, privCredit:0.050 },
              alphas: { usEq:0.0025, devEq:0.0025, emEq:0.0025, jpnEq:0.0025, ukEq:0.0025 },
              tes:    { usEq:0.0075, devEq:0.0075, emEq:0.0075, jpnEq:0.0075, ukEq:0.0075 } }
        ]
    },

    // ─── SEI ──────────────────────────────────────────────────────────────────
    {
        name: "SEI",
        portfolios: [
            { id: "p_sei_growth", name: "SEI Flexi Default — Growth Phase",
              weights: { usEq:0.430, devEq:0.175, emEq:0.090, jpnEq:0.060, ukEq:0.055, apacEq:0.040, listedAlts:0.050, globalHighYield:0.020, igCredit:0.020, sdCredit:0.010, globalSov:0.010, inflLinked:0.010, emDebt:0.010, realEstateDirect:0.010, moneyMkt:0.010 },
              alphas: { usEq:0.005, devEq:0.005, emEq:0.005, jpnEq:0.005, ukEq:0.005, apacEq:0.005 },
              tes:    { usEq:0.015, devEq:0.015, emEq:0.015, jpnEq:0.015, ukEq:0.015, apacEq:0.015 } },
            { id: "p_sei_retire", name: "SEI Flexi Default At-Retirement Fund",
              weights: { usEq:0.191, devEq:0.084, emEq:0.034, jpnEq:0.027, ukEq:0.024, apacEq:0.024, globalReits:0.055, globalHighYield:0.037, igCredit:0.030, globalSov:0.067, sdCredit:0.087, inflLinked:0.035, emDebt:0.015, listedAlts:0.040, moneyMkt:0.250 },
              alphas: { usEq:0.005, devEq:0.005, emEq:0.005, jpnEq:0.005, ukEq:0.005, apacEq:0.005 },
              tes:    { usEq:0.015, devEq:0.015, emEq:0.015, jpnEq:0.015, ukEq:0.015, apacEq:0.015 } }
        ]
    },

    // ─── TPT ──────────────────────────────────────────────────────────────────
    {
        name: "TPT",
        portfolios: [
            { id: "p_tpt_growth", name: "TPT Sustainable Future TDF — Growth Phase",
              weights: { usEq:0.527, devEq:0.093, emEq:0.079, jpnEq:0.043, ukEq:0.029, apacEq:0.021, privEq:0.060, privCredit:0.060, realEstateDirect:0.043, listedAlts:0.045 },
              alphas: { usEq:0.005, devEq:0.005, emEq:0.005, jpnEq:0.005, ukEq:0.005, apacEq:0.005 },
              tes:    { usEq:0.015, devEq:0.015, emEq:0.015, jpnEq:0.015, ukEq:0.015, apacEq:0.015 } },
            { id: "p_tpt_retire", name: "TPT Sustainable Future TDF — At-Retirement",
              weights: { usEq:0.232, devEq:0.040, emEq:0.013, jpnEq:0.019, ukEq:0.012, apacEq:0.009, privCredit:0.103, privEq:0.011, realEstateDirect:0.012, inflLinked:0.248, igCredit:0.117, sdCredit:0.089, globalSov:0.076, listedAlts:0.019 },
              alphas: { usEq:0.005, devEq:0.005, emEq:0.005, jpnEq:0.005, ukEq:0.005, apacEq:0.005 },
              tes:    { usEq:0.015, devEq:0.015, emEq:0.015, jpnEq:0.015, ukEq:0.015, apacEq:0.015 } }
        ]
    },

    // ─── TPP ──────────────────────────────────────────────────────────────────
    {
        name: "TPP",
        // Source: Q1 2026 factsheets (31 March 2026), peoplespension.co.uk. HIGH confidence on sleeve totals.
        // Managers: Amundi (passive developed equity), Invesco (fixed income), State Street (EM equity).
        portfolios: [
            { id: "p_tpp_growth", name: "The People's Pension — Growth (Global Investments, up to 85% shares)",
              // Source: Global Investment (up to 85% shares) factsheet, 31 March 2026. HIGH confidence.
              // Fund size £29,995.2m. Benchmark: UK CPI + 2.5% p.a.
              // Shares 78.4% (exact). Regional breakdown of shares from factsheet (exact):
              //   US 50.2%, Japan 10.7%, Eurozone 8.7%, UK 7.6%, Asia-EM 6.8%, Rest 16.1%
              //   "Rest of world" 16.1% split: ~55% apacEq (Aus/HK/Singapore/Korea) + ~45% devEq.
              // Bond 18.9% (Invesco mandate): IG corp, govt, inflation-linked, HY, EM — sub-split MED.
              // Infrastructure 3.0% (TPP UK Listed Infrastructure, exact from top-10 holdings).
              // No cash sleeve (cash = -0.6% derivatives overlay only).
              // CORRECTION vs prior: usEq 39.2% (was 54.0%), no moneyMkt (was 5.0%), igCredit 9.1% added.
              weights: { usEq:0.3921, devEq:0.1245, emEq:0.0531, jpnEq:0.0836, ukEq:0.0594, apacEq:0.0691,
                         igCredit:0.0909, globalSov:0.0519, inflLinked:0.0195,
                         globalHighYield:0.0130, emDebt:0.0130, infrastructure:0.0299 },
              alphas: {}, tes: {} },        ]
    }
,

    // ─── ILLUSTRATIVE / REFERENCE ─────────────────────────────────────────────
    {
        name: "Comparator Strategy",
        // Reference strategies illustrating theoretically optimal DC default designs.
        // Based on CMA 2026-05 geometric return analysis and specified fund construction.
        //
        // FUND ARCHITECTURE:
        //   Global Equity Potential: 75% of growth. MSCI ACWI cap weights, NA -10% pro-rata uplift.
        //     50% climate-aligned (α=0.25%, TE=0.75%) + 50% factor-based (α=0.5%, TE=1.5%).
        //     Blended: α=0.375%, TE=1.125% applied to all equity classes.
        //   Private Markets Growth Potential: 25% of growth.
        //     PE 35%, infra 30%, real estate 10%, private credit 25%.
        //   At-retirement: 40% equity + 10% PM Growth + 10% PM Income + 25% credit + 15% listed alts.
        //     PM Income: privCredit 50%, infra 30%, real estate 20%.
        //     Credit mix: igCredit 40%, globalHighYield 25%, emDebt 20%, sdCredit 15%.
        //   De-risk: 10 years.
        portfolios: [
                        // ── Strategy 2 portfolios ─────────────────────────────────────────
            // Sub-fund: Private Markets Growth Potential
            { id: "p_opt2_pm_growth", name: "Private Markets Growth Potential",
              // PE 35%, Infrastructure 30%, Real Estate 10%, Private Credit 25%.
              // Arithmetic return: 8.96%, geometric≈7.74% (best PM blend on geom basis).
              // Private credit 25% is the highest-geom individual asset (7.70%).
              weights: { privEq:0.350, infrastructure:0.300, realEstateDirect:0.100, privCredit:0.250 },
              alphas: {}, tes: {} },

            // Sub-fund: Private Markets Income Potential
            { id: "p_opt2_pm_income", name: "Private Markets Income Potential",
              // Private Credit 50%, Infrastructure 30%, Real Estate 20%.
              // Cashflow-oriented. Lower vol than PM Growth. Geom: 7.57%.
              // Private credit 50% is the highest-geom asset in the entire CMA (7.70%, vol 10%).
              weights: { privCredit:0.500, infrastructure:0.300, realEstateDirect:0.200 },
              alphas: {}, tes: {} },

            // Combined growth fund: 75% Global Equity Potential + 25% PM Growth
            { id: "p_opt2_growth", name: "Optimal Specified DC Growth (75% Equity + 25% PM Growth)",
              // Equity sleeve (75%): MSCI ACWI cap weights, NA -10% redistributed pro-rata.
              //   Original MSCI ACWI: US+Canada 64.8%, devEq 14.0%, emEq 11.5%, jpnEq 5.2%, ukEq 2.8%, apacEq 1.7%.
              //   After NA -10% → usEq 54.8%, others uplifted proportionally:
              //   devEq +2.98%, emEq +2.27%, jpnEq +1.48%, ukEq +0.80%, apacEq +0.48%.
              //   Alpha: blended 50/50 (climate α=0.25% + factor α=0.5%) = 0.375% p.a.
              //   TE:    blended 50/50 (climate TE=0.75% + factor TE=1.5%) = 1.125% p.a.
              //   Applied uniformly across all equity classes.
              // PM Growth sleeve (25%): p_opt2_pm_growth look-through.
              // Arithmetic: 7.70% (incl. alpha), geometric≈6.28%.
              weights: { usEq:0.4110, devEq:0.1348, emEq:0.1108, jpnEq:0.0501, ukEq:0.0270, apacEq:0.0163,
                         privEq:0.0875, infrastructure:0.0750, realEstateDirect:0.0250, privCredit:0.0625 },
              alphas: { usEq:0.00375, devEq:0.00375, emEq:0.00375, jpnEq:0.00375, ukEq:0.00375, apacEq:0.00375 },
              tes:    { usEq:0.01125, devEq:0.01125, emEq:0.01125, jpnEq:0.01125, ukEq:0.01125, apacEq:0.01125 } },

            // At-retirement: 40% equity + 10% PM Growth + 10% PM Income + 25% credit + 15% listedAlts
            { id: "p_opt2_retire", name: "Optimal Specified DC At-Retirement (Drawdown)",
              // 40% equity sleeve (same cap-adjusted weights as growth equity sleeve, scaled to 40%).
              // 10% PM Growth look-through (PE 35%, infra 30%, RE 10%, privCredit 25%).
              // 10% PM Income look-through (privCredit 50%, infra 30%, RE 20%).
              // 25% credit mix: igCredit 40%, globalHighYield 25%, emDebt 20%, sdCredit 15%.
              // 15% listed alts: listedAlts 100% — diversified absolute return / real assets.
              // Arithmetic: 7.11%, geometric≈6.07% — outperforms most providers' GROWTH funds.
              weights: { usEq:0.2192, devEq:0.0719, emEq:0.0591, jpnEq:0.0267, ukEq:0.0144, apacEq:0.0087,
                         privEq:0.0350, infrastructure:0.0600, realEstateDirect:0.0300, privCredit:0.0750,
                         igCredit:0.1000, globalHighYield:0.0625, emDebt:0.0500, sdCredit:0.0375,
                         listedAlts:0.1500 },
              alphas: { usEq:0.00375, devEq:0.00375, emEq:0.00375, jpnEq:0.00375, ukEq:0.00375, apacEq:0.00375 },
              tes:    { usEq:0.01125, devEq:0.01125, emEq:0.01125, jpnEq:0.01125, ukEq:0.01125, apacEq:0.01125 } }
        ]
    }
];

export const STRATEGY_GROUPS = [
        {
        name: "Comparators",
        strategies: [
            // Provider Median is generated dynamically in buildVFMStrategies — no static entries needed here
        ]
    },
    {
        name: "Provider Strategies",
        isProvider: true,
        strategies: [
            { name: "Optimal Specified DC Lifecycle (Comparator)",
              // Hypothetical optimal DC default lifecycle — illustrative strategy 2 (specified design).
              // Growth (p_opt2_growth): 75% Global Equity Potential (MSCI ACWI NA-10% adjusted,
              //   50:50 climate-aligned/factor, blended α=0.375%, TE=1.125%) + 25% PM Growth.
              //   Arithmetic 7.70%, geometric≈6.28%.
              // At-retirement (p_opt2_retire): 40% equity + 10% PM Growth + 10% PM Income
              //   + 25% credit mix + 15% listed alts. Arithmetic 7.11%, geometric≈6.07%.
              // De-risk: 10 years to TRA.
              points: [ { years:50, weights:{"p_opt2_growth":1.0} }, { years:10, weights:{"p_opt2_growth":1.0} }, { years:0, weights:{"p_opt2_retire":1.0} } ] },
            { name: "L&G Target Date Fund (Drawdown Default)",
              points: [ { years:50, weights:{"p_lg_tdf_growth":1.0} }, { years:10, weights:{"p_lg_tdf_growth":1.0} }, { years:0, weights:{"p_lg_tdf_retire":1.0} } ] },
            // Note: the Cash/Annuity landing variant uses the same pre-retirement glidepath
            // as the Drawdown Default. The distinction (cash vs drawdown landing) applies
            // post-retirement and is not modelled in pre-retirement accumulation simulations.
            // The variant has been removed to avoid spurious MC sampling differences
            // between two identically-specified strategies.
            { name: "L&G Lifetime Advantage Fund (LAF)",
              points: [ { years:50, weights:{"p_lg_laf_growth":1.0} }, { years:10, weights:{"p_lg_laf_growth":1.0} }, { years:0, weights:{"p_lg_tdf_retire":1.0} } ] },
            { name: "Aviva My Future Focus",
              points: [ { years:50, weights:{"p_mff_ltg":1.0} }, { years:15, weights:{"p_mff_ltg":1.0} }, { years:0, weights:{"p_mff_consolidation":1.0} } ] },
            { name: "Aviva My Future Vision (LTAF)",
              points: [ { years:50, weights:{"p_vision_ltg":1.0} }, { years:15, weights:{"p_vision_ltg":1.0} }, { years:0, weights:{"p_vision_consolidation":1.0} } ] },
            { name: "Standard Life SMA",
              points: [ { years:50, weights:{"p_sl_sma_growth":1.0} }, { years:15, weights:{"p_sl_sma_growth":1.0} }, { years:0, weights:{"p_sl_sma_retire":1.0} } ] },
            { name: "Standard Life Future Opps",
              points: [ { years:50, weights:{"p_sl_future_growth":1.0} }, { years:15, weights:{"p_sl_future_growth":1.0} }, { years:0, weights:{"p_sl_sma_retire":1.0} } ] },
            { name: "NEST Retirement Date Fund",
              // TDF. Four phases from Q4 2025 exact data.
              // Foundation (Starter/2068+, 45+ yrs): 50% Higher Growth + 45% Long-Term Stable — equity 36.8%, infra 8.9%.
              // Growth plateau (2046-2063, 20-37 yrs): 65% Higher Growth + 30% Long-Term Stable — equity 47.8%, moneyMkt 6.5%.
              // Retirement (2026, at TRA): Higher Growth 30% + Income Seeking 40% + Cap Pres 27% — sdCredit 20.1%, moneyMkt 10.9%.
              // p_nest_consolidation (2036, 10 yrs) available as reference portfolio but not used in glidepath.
              // Glidepath uses Foundation→Growth (20yr)→Retirement (0yr). Source: Q4 2025 PDF.
              points: [ { years:50, weights:{"p_nest_foundation":1.0} }, { years:20, weights:{"p_nest_growth":1.0} }, { years:0, weights:{"p_nest_retire":1.0} } ] },
            { name: "Aegon Universal Balanced Collection",
              points: [ { years:50, weights:{"p_aegon_ubc_growth":1.0} }, { years:6, weights:{"p_aegon_ubc_growth":1.0} }, { years:0, weights:{"p_aegon_ubc_retire":1.0} } ] },
            { name: "Aegon LifePath Flexi (Drawdown)",
              points: [ { years:50, weights:{"p_aegon_lp_growth":1.0} }, { years:15, weights:{"p_aegon_lp_growth":1.0} }, { years:0, weights:{"p_aegon_lp_retire":1.0} } ] },
            { name: "Fidelity FutureWise TDF",
              points: [ { years:50, weights:{"p_fidelity_fw_growth":1.0} }, { years:20, weights:{"p_fidelity_fw_growth":1.0} }, { years:0, weights:{"p_fidelity_fw_retire":1.0} } ] },
            { name: "Scottish Widows Lifetime Investment",
              points: [ { years:50, weights:{"p_sw_lifetime_growth":1.0} }, { years:12, weights:{"p_sw_lifetime_growth":1.0} }, { years:0, weights:{"p_sw_lifetime_retire":1.0} } ] },
            { name: "Royal London Balanced Lifestyle (Drawdown)",
              points: [ { years:50, weights:{"p_rl_gpd":1.0} }, { years:15, weights:{"p_rl_gpd":1.0} }, { years:0, weights:{"p_rl_grip3":1.0} } ] },
            { name: "Hargreaves Lansdown Workplace Default",
              points: [ { years:50, weights:{"p_hl_growth":1.0} }, { years:10, weights:{"p_hl_growth":1.0} }, { years:0, weights:{"p_hl_mymap4":1.0} } ] },
            { name: "NOW: Pensions Journey Path",
              points: [ { years:50, weights:{"p_now_growth":1.0} }, { years:10, weights:{"p_now_growth":1.0} }, { years:0, weights:{"p_now_rcf":1.0} } ] },
            { name: "Mercer Master Trust Default",
              points: [ { years:50, weights:{"p_mercer_growth":1.0} }, { years:8, weights:{"p_mercer_growth":1.0} }, { years:0, weights:{"p_mercer_target_drawdown":1.0} } ] },
            { name: "Aon Managed Retirement Pathway Fund",
              points: [ { years:50, weights:{"p_aon_growth":1.0} }, { years:15, weights:{"p_aon_growth":1.0} }, { years:0, weights:{"p_aon_retire":1.0} } ] },
            { name: "LifeSight Drawdown Lifecycle (WTW)",
              // Medium Risk Drawdown — LifeSight default strategy (March 2026)
              // Source: Appendix D, WTW Confidential, March 2026
              // Growth: 100% LifeSight Equity Fund throughout
              // De-risk starts 20 years before TRA (corrected from prior 25yr assumption)
              // Landing at TRA: ~35% Equity / 35% DGF / 30% Cash (medium risk drawdown)
              points: [ { years:50, weights:{"p_lifesight_equity":1.0} }, { years:20, weights:{"p_lifesight_equity":1.0} }, { years:0, weights:{"p_lifesight_landing":1.0} } ] },
            { name: "Cushon Sustainable Investment Strategy",
              points: [ { years:50, weights:{"p_cushon_growth":1.0} }, { years:7, weights:{"p_cushon_growth":1.0} }, { years:0, weights:{"p_cushon_retire":1.0} } ] },
            { name: "Smart Pension Sustainable Growth Default",
              points: [ { years:50, weights:{"p_smart_growth":1.0} }, { years:8, weights:{"p_smart_growth":1.0} }, { years:0, weights:{"p_smart_retire":1.0} } ] },
            { name: "SEI Master Trust Flexi Access Default",
              points: [ { years:50, weights:{"p_sei_growth":1.0} }, { years:15, weights:{"p_sei_growth":1.0} }, { years:0, weights:{"p_sei_retire":1.0} } ] },
            { name: "TPT Sustainable Future Target Date Fund",
              points: [ { years:50, weights:{"p_tpt_growth":1.0} }, { years:19, weights:{"p_tpt_growth":1.0} }, { years:0, weights:{"p_tpt_retire":1.0} } ] },
            { name: "The People's Pension (B&CE) Balanced Default",
              // Lifestyle. Growth: Global Investments up to 85% shares (£30bn, CPI+2.5%).
              // At-retirement: Pre-Retirement Fund (£6.4bn, CPI+0.5%) — corrected from prior "up to 15% shares".
              // De-risk: 10yr to TRA. Source: Q1 2026 factsheets (31 March 2026).
              points: [ { years:50, weights:{"p_tpp_growth":1.0} }, { years:10, weights:{"p_tpp_growth":1.0} }, { years:0, weights:{"p_tpp_retire":1.0} } ] },
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
