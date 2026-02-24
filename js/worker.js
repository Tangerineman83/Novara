// js/worker.js

// 1. Math Helpers
function randn_bm() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function quantile(arr, q) {
    const sorted = arr.sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    }
    return sorted[base];
}

// 2. Simulation Logic
self.onmessage = function(e) {
    const { type, payload } = e.data;

    if (type === 'RUN_SIMULATION') {
        try {
            const results = runMonteCarlo(payload);
            self.postMessage({ type: 'SIMULATION_COMPLETE', payload: results });
        } catch (error) {
            self.postMessage({ type: 'ERROR', payload: error.message });
        }
    }
};

function runMonteCarlo(data) {
    const { cma, strategies, persona, settings, assetKeys } = data;
    const months = Math.max(0, (persona.retirementAge - persona.age) * 12);
    const simCount = settings.simCount || 1000;
    
    // Pre-calculate factors for speed
    // This maintains your logic: Asset Return = Mean + Vol * (CorrE*Z1 + CorrC*Z2 + Resid*Z3)
    const assetFactors = {};
    assetKeys.forEach(key => {
        const ce = cma.ce[key] || 0; // Corr with Equity
        const cc = cma.cc[key] || 0; // Corr with Credit
        // Fix: Ensure we don't take sqrt of negative number if user inputs bad correlations
        const resid = Math.sqrt(Math.max(0, 1 - ce ** 2 - cc ** 2));
        
        // Adjust returns for implementation alpha/cost
        // Formula: CMA + Alpha - Cost
        assetFactors[key] = {
            mean: (cma.r[key] || 0), 
            vol: (cma.v[key] || 0) / Math.sqrt(12), // Monthly Vol
            ce: ce,
            cc: cc,
            resid: resid
        };
    });

    const strategyResults = strategies.map(strat => {
        const paths = [];
        const finalPots = [];
        
        // Generate Monthly Weights Interpolation
        // (Simplified for brevity, assumes linear interpolation helper exists or passed in)
        const weightsMap = strat.monthlyWeights; // Passed pre-calculated from main thread for efficiency

        for (let s = 0; s < simCount; s++) {
            let pot = persona.savings;
            let salary = persona.salary;
            const path = new Float32Array(months); // TypedArray for performance

            for (let m = 0; m < months; m++) {
                // Generate 3 independent standard normals
                const z1 = randn_bm();
                const z2 = randn_bm();
                const z3 = randn_bm();

                let monthlyReturn = 0;
                
                // Calculate Portfolio Return
                for (let i = 0; i < assetKeys.length; i++) {
                    const key = assetKeys[i];
                    const w = weightsMap[m][key] || 0;
                    if (w === 0) continue;

                    const fac = assetFactors[key];
                    // Apply Implementation Adjustments (Alpha/Cost) calculated in main thread or here
                    const imp = strat.implAdjustments[key] || 0; 
                    
                    const rMonthly = (Math.pow(1 + fac.mean + imp, 1/12) - 1) + 
                                     fac.vol * (fac.ce * z1 + fac.cc * z2 + fac.resid * z3);
                    
                    monthlyReturn += w * rMonthly;
                }

                // Contributions & Growth
                const contribution = (salary * (persona.contribution / 100)) / 12;
                pot = (pot + contribution) * (1 + monthlyReturn);
                
                // Salary Inflation
                salary *= Math.pow(1 + (persona.realSalaryGrowth + settings.inflation) / 100, 1/12);
                
                path[m] = pot;
            }
            paths.push(path);
            finalPots.push(pot);
        }

        // Calculate Percentiles per month (Heavy CPU task)
        const percentiles = {
            p05: [], p50: [], p95: []
        };

        for (let m = 0; m < months; m++) {
            const slices = paths.map(p => p[m]);
            percentiles.p05.push(quantile(slices, 0.05));
            percentiles.p50.push(quantile(slices, 0.50));
            percentiles.p95.push(quantile(slices, 0.95));
        }

        return {
            name: strat.name,
            percentiles: percentiles,
            finalPots: finalPots
        };
    });

    return strategyResults;
}
