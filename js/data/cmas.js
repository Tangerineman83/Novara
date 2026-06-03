/**
 * ============================================================
 * FILE: js/data/cmas.js
 * PURPOSE: Capital Market Assumptions (CMAs) — return, volatility,
 *          and kurtosis estimates by asset class and vintage.
 * ============================================================
 *
 * WHAT THIS FILE CONTAINS:
 *   PRESET_CMAS — array of CMA sets, one per vintage/methodology.
 *   Each set has: name, cma_id, and data: { r, v, k } objects keyed
 *   by asset class key (matching data/asset-classes.js).
 *
 * SCHEMA — each PRESET_CMAS entry:
 *   name     {string}  Human-readable label shown in CMA selector.
 *   cma_id   {string}  Unique identifier, never reuse. Format:
 *                      novara_cma_YYYY_MM (year and month of vintage).
 *   data.r   {object}  Arithmetic return per asset (decimal p.a.).
 *   data.v   {object}  Annual volatility per asset (decimal).
 *   data.k   {object}  Excess kurtosis per asset (0 = normal tails).
 *
 * DATA SOURCES & METHODOLOGY (current vintage: May 2026):
 *   Equity returns:    MSCI long-run historical + Novara forward-looking
 *                      risk premium framework. Reviewed annually.
 *   Fixed income:      Derived from prevailing yield curves (May 2026
 *                      UK/US/EUR gilt/swap curves) plus credit spread.
 *   Private assets:    Illiquidity premium layered on public equivalents;
 *                      volatilities are smoothed (appraisal-based) so
 *                      true economic vol is materially higher.
 *   Volatilities:      Blend of 10-year realised vol and implied vol
 *                      where liquid options markets exist.
 *   Kurtosis:          Calibrated to observed tail events 2000–2024.
 *
 * HOW TO ADD A NEW VINTAGE:
 *   1. Copy the most recent entry and update name and cma_id.
 *   2. Update r, v, k values as appropriate.
 *   3. All asset keys from data/asset-classes.js must be present.
 *   4. Add an audit entry below.
 *   5. Do NOT delete old vintages — they may be referenced in saved user state.
 *
 * DEPENDENCIES:
 *   data/asset-classes.js (asset key validation reference).
 *   Consumed by: config.js → app.js, worker.js, sim-worker.js.
 *
 * AUDIT TRAIL:
 * ┌─────────────┬──────────────┬──────────────────────────────────────────────┐
 * │ Date        │ Author       │ Description                                  │
 * ├─────────────┼──────────────┼──────────────────────────────────────────────┤
 * │ 2025-01-01  │ Novara       │ Initial CMA set (2025 vintage)               │
 * │ 2026-03-01  │ Novara       │ May 2026 vintage; updated equity/credit      │
 * │ 2026-05-27  │ Novara/AI    │ Extracted to js/data/cmas.js v58.20          │
 * └─────────────┴──────────────┴──────────────────────────────────────────────┘
 *
 * FOR AI ASSISTANTS:
 *   - All asset keys in r, v, k must exist in data/asset-classes.js.
 *   - cma_id values are permanent; never reuse or rename.
 *   - When updating returns, update v and k consistently — they are
 *     calibrated together and inconsistent edits break simulation quality.
 *   - Correlation matrix is in app.js (optimizer OA section) and must be
 *     updated separately if asset list changes.
 */

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
