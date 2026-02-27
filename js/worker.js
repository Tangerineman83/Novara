// js/worker.js

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

let cachedSimulationPaths = null; 
let cachedStrategies = null;
let cachedMonths = 0;
let cachedStartAge = 30; 

self.onmessage = function(e) {
    const { type, payload } = e.data;

    if (type === 'RUN_SIMULATION') {
        try {
            const paths = runMonteCarloPaths(payload);
            cachedSimulationPaths = paths;
            cachedStrategies = payload.strategies;
            cachedMonths = paths[0].length > 0 ? paths[0][0].length : 0;
            cachedStartAge = payload.persona.age;
            
            const stats = calculateStats(paths, payload.strategies, 0.90);
            self.postMessage({ type: 'SIMULATION_COMPLETE', payload: stats });
        } catch (error) {
            self.postMessage({ type: 'ERROR', payload: error.message });
        }
    } 
    else if (type === 'RECALCULATE_STATS') {
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
    
    const coreInflation = settings.inflation; 
    const realSalaryGrowth = persona.realSalaryGrowth;
    
    const monthlyInflationRate = Math.pow(1 + coreInflation / 100, 1/12);
    const monthlySalaryGrowthRate = Math.pow(1 + (coreInflation + realSalaryGrowth) / 100, 1/12);

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

    // Initialize the master array to hold paths for each strategy
    const allStrategyPaths = strategies.map(() => []); 

    for (let s = 0; s < simCount; s++) {
        // Create simultaneous state trackers for each strategy
        let pots = strategies.map(() => persona.savings);
        let salaries = strategies.map(() => persona.salary);
        let cumulativeInflation = 1.0; 
        
        // Temporary arrays to hold this specific simulation's month-by-month path
        const currentSimPaths = strategies.map(() => new Float32Array(months));

        for (let m = 0; m < months; m++) {
            // 1. Generate MARKET CONDITIONS ONCE for this month
            // This ensures all strategies experience the exact same "market reality"
            const z1 = randn_bm();
            const z2 = randn_bm();
            const z3 = randn_bm();

            // 2. Calculate the random component for each Asset Class ONCE
            const assetRandomness = {};
            for (let i = 0; i < assetKeys.length; i++) {
                const key = assetKeys[i];
                const fac = assetFactors[key];
                assetRandomness[key] = fac.vol * (fac.ce * z1 + fac.cc * z2 + fac.resid * z3);
            }

            cumulativeInflation *= monthlyInflationRate;

            // 3. Apply these identical market conditions to each strategy
            for (let stratIdx = 0; stratIdx < strategies.length; stratIdx++) {
                const strat = strategies[stratIdx];
                const weightsMap = strat.monthlyWeights[m];
                
                let monthlyReturn = 0;
                
                for (let i = 0; i < assetKeys.length; i++) {
                    const key = assetKeys[i];
                    const w = weightsMap[key] || 0;
                    if (w === 0) continue;

                    const fac = assetFactors[key];
                    const imp = strat.implAdjustments[key] || 0; 
                    
                    // Base Expected Return + The Shared Random Shock
                    const expectedReturn = (Math.pow(1 + fac.mean + imp, 1/12) - 1);
                    monthlyReturn += w * (expectedReturn + assetRandomness[key]);
                }

                // Grow Pots and Salaries
                const contribution = (salaries[stratIdx] * (persona.contribution / 100)) / 12;
                pots[stratIdx] = (pots[stratIdx] + contribution) * (1 + monthlyReturn);
                salaries[stratIdx] *= monthlySalaryGrowthRate;
                
                // Store Real Value
                currentSimPaths[stratIdx][m] = pots[stratIdx] / cumulativeInflation;
            }
        }
        
        // Push the completed 40-year paths into the master storage
        for (let stratIdx = 0; stratIdx < strategies.length; stratIdx++) {
            allStrategyPaths[stratIdx].push(currentSimPaths[stratIdx]);
        }
    }

    return allStrategyPaths;
}

function calculateStats(allPaths, strategies, confidence) {
    const months = cachedMonths;
    const alpha = (1 - confidence) / 2;
    const pLower = alpha;
    const pUpper = 1 - alpha;

    const strategyResults = strategies.map((strat, index) => {
        const paths = allPaths[index];
        const percentiles = { pLower: [], pMedian: [], pUpper: [] };

        for (let m = 0; m < months; m++) {
            const slices = paths.map(p => p[m]);
            percentiles.pLower.push(quantile(slices, pLower));
            percentiles.pMedian.push(quantile(slices, 0.50));
            percentiles.pUpper.push(quantile(slices, pUpper));
        }

        return {
            name: strat.name,
            percentiles: percentiles,
            meta: { startAge: cachedStartAge },
            stats: {
                confidence: confidence,
                lowerBoundLabel: (pLower * 100).toFixed(0),
                upperBoundLabel: (pUpper * 100).toFixed(0)
            }
        };
    });

    return strategyResults;
}
