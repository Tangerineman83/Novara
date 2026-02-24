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

// 2. State Cache
let cachedSimulationPaths = null; 
let cachedStrategies = null;
let cachedMonths = 0;

// 3. Message Handler
self.onmessage = function(e) {
    const { type, payload } = e.data;

    if (type === 'RUN_SIMULATION') {
        try {
            // Full Run: Generate paths, cache them, return default stats (90% CI)
            const paths = runMonteCarloPaths(payload);
            cachedSimulationPaths = paths;
            cachedStrategies = payload.strategies;
            cachedMonths = paths[0].length > 0 ? paths[0][0].length : 0;
            
            const stats = calculateStats(paths, payload.strategies, 0.90);
            self.postMessage({ type: 'SIMULATION_COMPLETE', payload: stats });
        } catch (error) {
            self.postMessage({ type: 'ERROR', payload: error.message });
        }
    } 
    else if (type === 'RECALCULATE_STATS') {
        // Fast Run: Use cached paths, just calc percentiles
        if (!cachedSimulationPaths) return;
        
        try {
            const confidence = payload.confidence || 0.90;
            const stats = calculateStats(cachedSimulationPaths, cachedStrategies, confidence);
            self.postMessage({ type: 'SIMULATION_COMPLETE', payload: stats });
        } catch (error) {
            self.postMessage({ type: 'ERROR', payload: error.message });
        }
    }
};

function runMonteCarloPaths(data) {
    const { cma, strategies, persona, settings, assetKeys } = data;
    const months = Math.max(1, (persona.retirementAge - persona.age) * 12);
    const simCount = settings.simCount || 1000;
    
    // Pre-calculate factors
    const assetFactors = {};
    assetKeys.forEach(key => {
        const ce = cma.ce[key] || 0;
        const cc = cma.cc[key] || 0;
        const resid = Math.sqrt(Math.max(0, 1 - ce ** 2 - cc ** 2));
        
        assetFactors[key] = {
            mean: (cma.r[key] || 0), 
            vol: (cma.v[key] || 0) / Math.sqrt(12),
            ce: ce, cc: cc, resid: resid
        };
    });

    // Run Sim for each strategy
    const allStrategyPaths = strategies.map(strat => {
        const paths = []; // Array of Float32Arrays
        const weightsMap = strat.monthlyWeights;

        for (let s = 0; s < simCount; s++) {
            let pot = persona.savings;
            let salary = persona.salary;
            const path = new Float32Array(months);

            for (let m = 0; m < months; m++) {
                const z1 = randn_bm();
                const z2 = randn_bm();
                const z3 = randn_bm();

                let monthlyReturn = 0;
                
                for (let i = 0; i < assetKeys.length; i++) {
                    const key = assetKeys[i];
                    const w = weightsMap[m][key] || 0;
                    if (w === 0) continue;

                    const fac = assetFactors[key];
                    const imp = strat.implAdjustments[key] || 0; 
                    
                    const rMonthly = (Math.pow(1 + fac.mean + imp, 1/12) - 1) + 
                                     fac.vol * (fac.ce * z1 + fac.cc * z2 + fac.resid * z3);
                    
                    monthlyReturn += w * rMonthly;
                }

                // Contributions & Growth
                const contribution = (salary * (persona.contribution / 100)) / 12;
                pot = (pot + contribution) * (1 + monthlyReturn);
                salary *= Math.pow(1 + (persona.realSalaryGrowth + settings.inflation) / 100, 1/12);
                
                path[m] = pot;
            }
            paths.push(path);
        }
        return paths;
    });

    return allStrategyPaths;
}

function calculateStats(allPaths, strategies, confidence) {
    const months = cachedMonths;
    // Calc Percentiles
    // Confidence 0.90 => alpha = 0.05 => p05 and p95
    // Confidence 0.50 => alpha = 0.25 => p25 and p75
    const alpha = (1 - confidence) / 2;
    const pLower = alpha;
    const pUpper = 1 - alpha;

    const strategyResults = strategies.map((strat, index) => {
        const paths = allPaths[index];
        
        const percentiles = {
            pLower: [], pMedian: [], pUpper: []
        };

        for (let m = 0; m < months; m++) {
            const slices = paths.map(p => p[m]);
            // Copy slice to sort without mutating? quantile sorts it.
            // Slice() is heavy in loop.
            // Optimization: quantile copies internally.
            
            percentiles.pLower.push(quantile(slices, pLower));
            percentiles.pMedian.push(quantile(slices, 0.50));
            percentiles.pUpper.push(quantile(slices, pUpper));
        }

        return {
            name: strat.name,
            percentiles: percentiles,
            stats: {
                confidence: confidence,
                lowerBoundLabel: (pLower * 100).toFixed(0),
                upperBoundLabel: (pUpper * 100).toFixed(0)
            }
        };
    });

    return strategyResults;
}
