/**
 * ============================================================
 * FILE: js/data/asset-classes.js
 * PURPOSE: Master list of investable asset classes and chart palette.
 * ============================================================
 *
 * WHAT THIS FILE CONTAINS:
 *   ASSET_CLASSES — 19 asset class definitions used throughout the app:
 *     simulation engine, CMA overlay, optimizer, portfolio builder.
 *   CHART_COLORS  — three-color gradient palette for projection charts.
 *
 * SCHEMA — each ASSET_CLASSES entry:
 *   key         {string}  Unique camelCase identifier. Never rename — used
 *                         as foreign key in portfolios, strategies, CMAs,
 *                         and in localStorage user data.
 *   name        {string}  Display label (may be updated safely).
 *   category    {string}  Grouping label: "Equities" | "Real Assets" |
 *                         "Alternatives" | "Credit" | "Sov & Cash".
 *   defaultR    {number}  Fallback arithmetic return (decimal) when no CMA
 *                         is active. Updated infrequently.
 *   defaultV    {number}  Fallback annual volatility (decimal).
 *   defaultK    {number}  Fallback excess kurtosis for fat-tail simulation.
 *   color       {string}  Hex color for charts and badges.
 *
 * HOW TO UPDATE:
 *   - Adding an asset: append to the array; add the key to every active CMA
 *     in data/cmas.js and to any affected portfolios in data/portfolios.js.
 *   - Changing defaultR/defaultV: update the corresponding CMA entry too.
 *   - Never remove or rename a key — it is stored in user localStorage.
 *
 * DEPENDENCIES:
 *   Consumed by: config.js → app.js, optimizer (OA asset universe).
 *   No upstream dependencies.
 *
 * AUDIT TRAIL:
 * ┌─────────────┬──────────────┬──────────────────────────────────────────────┐
 * │ Date        │ Author       │ Description                                  │
 * ├─────────────┼──────────────┼──────────────────────────────────────────────┤
 * │ 2025-01-01  │ Novara       │ Initial definition in config.js              │
 * │ 2026-05-27  │ Novara/AI    │ Extracted to js/data/asset-classes.js v58.20 │
 * └─────────────┴──────────────┴──────────────────────────────────────────────┘
 *
 * FOR AI ASSISTANTS:
 *   - Keys are permanent foreign keys — never rename or remove.
 *   - If adding an asset, also add it to data/cmas.js (r, v, k objects).
 *   - Color values are purely cosmetic; safe to update.
 *   - defaultR/defaultV are fallbacks only; the active CMA overrides them.
 */

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
