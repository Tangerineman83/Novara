/**
 * ============================================================
 * FILE: js/config.js
 * PURPOSE: Barrel re-export — aggregates all data modules for
 *          app.js. This file contains NO data of its own.
 * ============================================================
 *
 * ARCHITECTURE:
 *   config.js is a thin ES module barrel. All actual data lives
 *   in js/data/. This file simply re-exports everything under
 *   the same names that app.js expects, so app.js never needs
 *   to know about the underlying file structure.
 *
 * MODULE GRAPH:
 *   app.js
 *     └─ config.js (this file)
 *           ├─ data/asset-classes.js   ASSET_CLASSES, CHART_COLORS
 *           ├─ data/cmas.js            PRESET_CMAS
 *           ├─ data/personas.js        PRESET_PERSONAS
 *           ├─ data/portfolios.js      PRESET_PORTFOLIOS
 *           ├─ data/strategies.js      STRATEGY_GROUPS
 *           └─ data/stress-scenarios.js STRESS_SCENARIOS
 *
 *   decum-engine.js (separate — not via config.js):
 *         ├─ data/decum-specs.js       S4PMA_QX, PRODUCT_TYPES,
 *         │                            PRESET_SPECS (via window._decum_specs)
 *         └─ (self-contained IIFE)
 *
 * HOW TO ADD A NEW DATA MODULE:
 *   1. Create js/data/your-module.js following the file header
 *      standard (see any existing data file for the template).
 *   2. Add an export line here: export { FOO } from './data/your-module.js';
 *   3. Add the import to app.js if needed.
 *   4. Update the module graph above.
 *
 * DEPENDENCIES:
 *   All files in js/data/. Consumed by: app.js.
 *
 * AUDIT TRAIL:
 * ┌─────────────┬──────────────┬──────────────────────────────────────────────┐
 * │ Date        │ Author       │ Description                                  │
 * ├─────────────┼──────────────┼──────────────────────────────────────────────┤
 * │ 2026-05-27  │ Novara/AI    │ Refactored from monolithic config.js v58.20  │
 * │             │              │ to barrel + data/ modules                    │
 * └─────────────┴──────────────┴──────────────────────────────────────────────┘
 *
 * FOR AI ASSISTANTS:
 *   - Do NOT add data to this file. It is a barrel only.
 *   - To update data, edit the relevant file in js/data/.
 *   - To add a new export, add a re-export line and update the
 *     module graph in this header.
 *   - app.js import line must NOT change — names are stable.
 */

export { ASSET_CLASSES, CHART_COLORS } from './data/asset-classes.js';
export { PRESET_CMAS }                 from './data/cmas.js';
export { PRESET_PERSONAS }             from './data/personas.js';
export { PRESET_PORTFOLIOS }           from './data/portfolios.js';
export { STRATEGY_GROUPS }             from './data/strategies.js';
export { STRESS_SCENARIOS }            from './data/stress-scenarios.js';
