/**
 * ============================================================
 * FILE: js/data/personas.js
 * PURPOSE: Pre-built member archetypes for scenario analysis.
 * ============================================================
 *
 * WHAT THIS FILE CONTAINS:
 *   PRESET_PERSONAS — array of member archetype objects. Each persona
 *   represents a stylised member profile used in VFM analysis,
 *   projection charts, and (future) decumulation integration.
 *
 * SCHEMA — each PRESET_PERSONAS entry:
 *   personaId         {string}  Unique snake_case identifier. Permanent.
 *   name              {string}  Display name.
 *   age               {number}  Current age (years).
 *   retirementAge     {number}  Planned retirement age.
 *   pot               {number}  Current pension pot value (£).
 *   salary            {number}  Current gross salary (£ p.a.).
 *   contribution      {number}  Total contribution rate (decimal, e.g. 0.12).
 *   riskProfile       {string}  "conservative" | "moderate" | "growth" | "aggressive"
 *   defaultStrategyId {string}  Strategy shown on load (references STRATEGY_GROUPS).
 *
 * HOW TO UPDATE:
 *   - Personas represent typical member cohorts; update values to reflect
 *     current average pot/salary data from scheme experience.
 *   - personaId is stored in user preferences — never rename.
 *   - defaultStrategyId must resolve to a valid strategy in data/strategies.js.
 *
 * FUTURE INTEGRATION NOTE:
 *   Decumulation module (decum-engine.js) accepts personaId as a context
 *   parameter hook (currently unused — wired for future integration).
 *   When integrated, pot and retirementAge will pre-populate the
 *   decumulation analysis context automatically.
 *
 * DEPENDENCIES:
 *   data/strategies.js (defaultStrategyId validation reference).
 *   Consumed by: config.js → app.js.
 *
 * AUDIT TRAIL:
 * ┌─────────────┬──────────────┬──────────────────────────────────────────────┐
 * │ Date        │ Author       │ Description                                  │
 * ├─────────────┼──────────────┼──────────────────────────────────────────────┤
 * │ 2025-01-01  │ Novara       │ Initial 6 persona archetypes                 │
 * │ 2026-05-27  │ Novara/AI    │ Extracted to js/data/personas.js v58.20      │
 * └─────────────┴──────────────┴──────────────────────────────────────────────┘
 *
 * FOR AI ASSISTANTS:
 *   - personaId values are permanent foreign keys.
 *   - riskProfile must match one of the four defined string values.
 *   - contribution is a decimal (0.12 = 12%), not a percentage.
 *   - Salary and pot values are illustrative archetypes, not real member data.
 */

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
