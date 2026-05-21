// js/worker.js

function randn_bm() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function rand_gamma(alpha) {
    if (alpha < 1) return rand_gamma(1.0 + alpha) * Math.pow(Math.random(), 1.0 / alpha);
    let d = alpha - 1.0 / 3.0;
    let c = 1.0 / Math.sqrt(9.0 * d);
    while (true) {
        let x = randn_bm();
        let v = 1.0 + c * x;
        while (v <= 0) { x = randn_bm(); v = 1.0 + c * x; }
        v = v * v * v;
        let u = Math.random();
        let x2 = x * x;
        if (u < 1.0 - 0.0331 * x2 * x2) return d * v;
        if (Math.log(u) < 0.5 * x2 + d * (1.0 - v + Math.log(v))) return d * v;
    }
}

function getDfFromKurtosis(k) {
    if (k <= 0.05) return 1000; 
    return (6.0 / k) + 4.0;
}

function rand_t_custom(kurtosis) {
    if (kurtosis <= 0) return randn_bm();
    const df = getDfFromKurtosis(kurtosis);
    const z = randn_bm();
    const v = rand_gamma(df / 2.0) * 2.0; 
    const t = z / Math.sqrt(v / df);
    return t * Math.sqrt((df - 2.0) / df); 
}

// Returns a copy of the sorted array — does NOT mutate the original.
function quantile(arr, q) {
    const sorted = [...arr].sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    }
    return sorted[base];
}

function choleskyStrict(matrix) {
    const n = matrix.length;
    const L = Array(n).fill(0).map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j <= i; j++) {
            let sum = 0;
            for (let k = 0; k < j; k++) {
                sum += L[i][k] * L[j][k];
            }
            if (i === j) {
                const val = matrix[i][i] - sum;
                if (val <= 0.000001) throw new Error("Not PSD");
                L[i][j] = Math.sqrt(val);
            } else {
                L[i][j] = (matrix[i][j] - sum) / L[j][j];
            }
        }
    }
    return L;
}

function getRobustCholesky(matrix) {
    const n = matrix.length;
    let blend = 0.0;
    let currentMatrix = Array(n).fill(0).map((_, i) => [...matrix[i]]);
    
    while (blend <= 1.0) {
        try {
            return choleskyStrict(currentMatrix);
        } catch (e) {
            blend += 0.01;
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    if (i === j) currentMatrix[i][j] = 1.0;
                    else currentMatrix[i][j] = matrix[i][j] * (1.0 - blend);
                }
            }
        }
    }
    
    // Correlation matrix is mathematically impossible (contradictory inputs).
    // Signal to the main thread so the user can be informed.
    throw new Error("CORRELATION_NOT_PSD");
}

// Simulation cache — stored atomically so a racing second simulation
// never leaves cachedPaths and cachedStrategies out of sync.
let simulationCache = null;

self.onmessage = function(e) {
    const { type, payload } = e.data;

    if (type === 'RUN_SIMULATION') {
        // Validate payload before running
        if (!payload || !payload.strategies || payload.strategies.length === 0) {
            self.postMessage({ type: 'ERROR', payload: 'NO_STRATEGIES' });
            return;
        }
        if (!payload.cma || !payload.cma.correlations) {
            self.postMessage({ type: 'ERROR', payload: 'INVALID_CMA' });
            return;
        }

        try {
            const paths = runMonteCarloPaths(payload);
            // Update cache atomically
            simulationCache = {
                paths,
                strategies: payload.strategies,
                months: paths[0].length > 0 ? paths[0][0].length : 0,
                startAge: payload.persona.age
            };
            const stats = calculateStats(paths, payload.strategies, simulationCache.months, simulationCache.startAge, 0.90);
            self.postMessage({ type: 'SIMULATION_COMPLETE', payload: stats });
        } catch (error) {
            self.postMessage({ type: 'ERROR', payload: error.message });
        }

    } else if (type === 'RECALCULATE_STATS') {
        if (!simulationCache) return;
        try {
            const confidence = payload.confidence || 0.90;
            const stats = calculateStats(
                simulationCache.paths,
                simulationCache.strategies,
                simulationCache.months,
                simulationCache.startAge,
                confidence
            );
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

    // Core Equity Shock parameter — applies fat-tail kurtosis to assets in the
    // Equities, Real Assets, and Alternatives categories. Credit and Sov & Cash
    // assets are excluded: applying systemic kurtosis to cash/short-dated bonds
    // during a crisis overstates their fat-tail behaviour and distorts
    // diversification benefits unrealistically.
    const coreEquityShockKurtosis = settings.sysKurtosis || 2.0;
    const CORE_EQUITY_SHOCK_CATEGORIES = new Set(['Equities', 'Real Assets', 'Alternatives']);
    
    const monthlyInflationRate = Math.pow(1 + coreInflation / 100, 1/12);
    const monthlySalaryGrowthRate = Math.pow(1 + (coreInflation + realSalaryGrowth) / 100, 1/12);

    const assetFactors = {};
    assetKeys.forEach(key => {
        assetFactors[key] = {
            mean: (cma.r[key] || 0), 
            vol: (cma.v[key] || 0) / Math.sqrt(12),
            k: (cma.k[key] || 0),
            applyCoreEquityShock: false // set below once category info is available
        };
    });

    // Attach category info from the payload (passed from ASSET_CLASSES)
    if (data.assetCategories) {
        data.assetCategories.forEach(({ key, category }) => {
            if (assetFactors[key]) {
                assetFactors[key].applyCoreEquityShock = CORE_EQUITY_SHOCK_CATEGORIES.has(category);
            }
        });
    }

    const n = assetKeys.length;
    const correlationMatrix = Array(n).fill(0).map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            correlationMatrix[i][j] = cma.correlations[assetKeys[i]]?.[assetKeys[j]] ?? 0;
        }
    }
    
    const L = getRobustCholesky(correlationMatrix);
    const allStrategyPaths = strategies.map(() => []); 

    for (let s = 0; s < simCount; s++) {
        let pots = strategies.map(() => persona.savings);
        let salaries = strategies.map(() => persona.salary);
        let cumulativeInflation = 1.0; 
        
        const currentSimPaths = strategies.map(() => new Float32Array(months));

        for (let m = 0; m < months; m++) {
            const uncorrShocks = new Float32Array(n);
            for (let i = 0; i < n; i++) {
                const fac = assetFactors[assetKeys[i]];
                // Apply Core Equity Shock kurtosis to qualifying asset categories;
                // all others use their own per-asset kurtosis from the CMA.
                const effectiveK = fac.applyCoreEquityShock
                    ? Math.max(fac.k, coreEquityShockKurtosis)
                    : fac.k;
                uncorrShocks[i] = rand_t_custom(effectiveK);
            }

            const assetRandomness = {};
            for (let i = 0; i < n; i++) {
                let correlatedShock = 0;
                for (let j = 0; j <= i; j++) {
                    correlatedShock += L[i][j] * uncorrShocks[j];
                }
                assetRandomness[assetKeys[i]] = assetFactors[assetKeys[i]].vol * correlatedShock;
            }

            cumulativeInflation *= monthlyInflationRate;

            for (let stratIdx = 0; stratIdx < strategies.length; stratIdx++) {
                const strat = strategies[stratIdx];
                const monthData = strat.monthlyData[m];
                
                let monthlyReturn = 0;
                
                for (let i = 0; i < n; i++) {
                    const key = assetKeys[i];
                    const w = monthData.weights[key] || 0;
                    if (w === 0) continue;

                    const fac = assetFactors[key];
                    const expectedReturn = fac.mean / 12;
                    const alpha = (monthData.alphas && monthData.alphas[key] ? monthData.alphas[key] : 0) / 12;
                    const te = monthData.tes && monthData.tes[key] ? monthData.tes[key] : 0;
                    
                    let activeShock = 0;
                    if (te > 0) {
                        activeShock = (te / Math.sqrt(12)) * rand_t_custom(coreEquityShockKurtosis);
                    }

                    monthlyReturn += w * (expectedReturn + alpha + assetRandomness[key] + activeShock);
                }

                const contribution = (salaries[stratIdx] * (persona.contribution / 100)) / 12;
                pots[stratIdx] = (pots[stratIdx] + contribution) * (1 + monthlyReturn);
                salaries[stratIdx] *= monthlySalaryGrowthRate;
                
                currentSimPaths[stratIdx][m] = pots[stratIdx] / cumulativeInflation;
            }
        }
        for (let stratIdx = 0; stratIdx < strategies.length; stratIdx++) {
            allStrategyPaths[stratIdx].push(currentSimPaths[stratIdx]);
        }
    }
    return allStrategyPaths;
}

function calculateStats(allPaths, strategies, months, startAge, confidence) {
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
            meta: { startAge },
            stats: {
                confidence: confidence,
                lowerBoundLabel: (pLower * 100).toFixed(0),
                upperBoundLabel: (pUpper * 100).toFixed(0)
            }
        };
    });
    return strategyResults;
}
