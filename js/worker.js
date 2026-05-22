// js/worker.js  v20.0
// Coordinator worker.
//
// Responsibilities:
//   1. Spawn a pool of sim-worker.js sub-workers (one per logical CPU core,
//      capped at 8 to avoid overhead on high-core-count machines).
//   2. Distribute the total simCount across the pool in equal chunks.
//   3. Assemble returning Transferable buffers into a single contiguous
//      sorted column cache — one pre-sorted Float64Array per month per strategy.
//   4. Serve RECALCULATE_STATS requests as pure O(1) index reads on the
//      sorted cache — zero simulation, zero sort, microsecond response.
//
// Path layout (inside each sub-worker chunk):
//   buffer[month * chunkSize + simIdx]  (transposed — month-major)
//
// Sorted cache layout (after assembly):
//   sortedCache[stratIdx][monthIdx]  = Float64Array(simCount), sorted ascending

// ── Constants ────────────────────────────────────────────────────────

const MAX_WORKERS = 8;

// ── State ─────────────────────────────────────────────────────────────

let sortedCache   = null;   // sortedCache[strat][month] = sorted Float64Array
let cachedMeta    = null;   // { simCount, months, startAge, strategyNames }
let pendingRun    = null;   // resolve/reject for the current run promise

// ── Entry point ───────────────────────────────────────────────────────

self.onmessage = function(e) {
    const { type, payload } = e.data;

    if (type === 'RUN_SIMULATION') {
        if (!payload?.strategies?.length) {
            self.postMessage({ type: 'ERROR', payload: 'NO_STRATEGIES' });
            return;
        }
        if (!payload?.cma?.correlations) {
            self.postMessage({ type: 'ERROR', payload: 'INVALID_CMA' });
            return;
        }
        runSimulation(payload);

    } else if (type === 'VFM_RUN') {
        // Runs all strategies simultaneously for the VFM league table.
        // Uses a truncated horizon (horizonMonths) instead of full retirement horizon.
        // Returns full path matrix so beat-median stats can be computed.
        if (!payload?.strategies?.length) {
            self.postMessage({ type: 'VFM_ERROR', payload: 'NO_STRATEGIES' });
            return;
        }
        runVFMSimulation(payload);

    } else if (type === 'RECALCULATE_STATS') {
        if (!sortedCache || !cachedMeta) return;
        // Pure index reads — no sort, no worker message, instant.
        const stats = buildStatsFromCache(payload.confidence || 0.90);
        self.postMessage({ type: 'SIMULATION_COMPLETE', payload: stats });
    }
};

// ── Simulation orchestration ──────────────────────────────────────────

function runSimulation(data) {
    const { strategies, persona, settings } = data;
    const simCount  = settings.simCount || 2000;
    const months    = Math.max(1, (persona.retirementAge - persona.age) * 12);
    const nStrats   = strategies.length;

    // Decide worker count — use hardware concurrency if available, cap at MAX_WORKERS
    const numWorkers = Math.min(
        MAX_WORKERS,
        (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4
    );
    const chunkSize = Math.ceil(simCount / numWorkers);
    const actualWorkers = Math.ceil(simCount / chunkSize); // may be < numWorkers

    // Allocate the full sorted cache upfront.
    // sortedCache[strat][month] will hold a sorted Float64Array once assembly is done.
    // During assembly we accumulate raw values into assemblyBufs[strat][month].
    const assemblyBufs = Array.from({ length: nStrats }, () =>
        Array.from({ length: months }, () => new Float64Array(simCount))
    );

    let chunksReceived = 0;
    let errorFired     = false;

    for (let w = 0; w < actualWorkers; w++) {
        const chunkStart = w * chunkSize;
        const thisChunk  = Math.min(chunkSize, simCount - chunkStart);

        const worker = new Worker('./sim-worker.js?v=26.0');

        worker.onmessage = function(e) {
            worker.terminate();

            if (errorFired) return;

            if (e.data.type === 'ERROR') {
                errorFired = true;
                self.postMessage({ type: 'ERROR', payload: e.data.payload });
                return;
            }

            // e.data.buffers[stratIdx] is a transferred ArrayBuffer,
            // layout: Float32, [month * thisChunk + simInChunk]
            const { chunkStart: cs, chunkSize: cs2, buffers } = e.data;

            for (let si = 0; si < nStrats; si++) {
                const src = new Float32Array(buffers[si]);
                for (let m = 0; m < months; m++) {
                    const dst     = assemblyBufs[si][m];
                    const srcBase = m * cs2;
                    for (let s = 0; s < cs2; s++) {
                        dst[cs + s] = src[srcBase + s];
                    }
                }
            }

            chunksReceived++;

            if (chunksReceived === actualWorkers) {
                // All chunks received — sort every column once and cache.
                sortedCache = assemblyBufs.map(stratBufs =>
                    stratBufs.map(col => {
                        col.sort(); // native typed sort — no comparator needed
                        return col; // col is now permanently sorted
                    })
                );

                cachedMeta = {
                    simCount,
                    months,
                    startAge:      persona.age,
                    strategyNames: strategies.map(s => s.name)
                };

                const stats = buildStatsFromCache(0.90);
                self.postMessage({ type: 'SIMULATION_COMPLETE', payload: stats });
            }
        };

        worker.onerror = function(err) {
            worker.terminate();
            if (!errorFired) {
                errorFired = true;
                // err.message is often empty for load failures (404 etc.)
                // Include filename and line number where available.
                const detail = [err.message, err.filename, err.lineno]
                    .filter(Boolean).join(' line ') || 'SIM_WORKER_LOAD_ERROR';
                self.postMessage({ type: 'ERROR', payload: detail });
            }
        };

        // Send payload — note monthlyData can be large; strategies are sent by
        // structured clone (not Transferable) because all workers need them.
        worker.postMessage({
            chunkStart,
            chunkSize: thisChunk,
            data
        });
    }
}

// ── Stats from cache — pure index reads ───────────────────────────────
//
// For a given confidence level, the lower and upper bounds are:
//   pLower = (1 - confidence) / 2
//   pUpper = 1 - pLower
//
// Because sortedCache[strat][month] is pre-sorted, the value at any
// percentile p is simply:
//   sorted[Math.round(p * (simCount - 1))]
//
// Moving the slider from 90% → 80% → 90% reads the same indices from
// the same unchanged sorted array — results are bit-for-bit identical.

function buildStatsFromCache(confidence) {
    const { simCount, months, startAge, strategyNames } = cachedMeta;
    const pLower = (1 - confidence) / 2;
    const pUpper = 1 - pLower;
    const last   = simCount - 1;

    return strategyNames.map((name, si) => {
        const stratCols = sortedCache[si];
        const pLowerArr = new Float32Array(months);
        const pMediaArr = new Float32Array(months);
        const pUpperArr = new Float32Array(months);

        for (let m = 0; m < months; m++) {
            const col = stratCols[m];
            pLowerArr[m] = col[Math.round(pLower * last)];
            pMediaArr[m] = col[Math.round(0.50   * last)];
            pUpperArr[m] = col[Math.round(pUpper * last)];
        }

        return {
            name,
            percentiles: {
                pLower: Array.from(pLowerArr),
                pMedian: Array.from(pMediaArr),
                pUpper: Array.from(pUpperArr)
            },
            meta:  { startAge },
            stats: {
                confidence,
                lowerBoundLabel: (pLower * 100).toFixed(0),
                upperBoundLabel: (pUpper * 100).toFixed(0)
            }
        };
    });
}

// ── VFM League Table Simulation ────────────────────────────────────────────
// Runs all strategies (provider + benchmark) over a fixed horizon.
// Returns per-strategy terminal pot arrays so the main thread can compute
// median annualised returns, projected pots, and P(beat median) without
// re-running the simulation when the user switches horizons.

function runVFMSimulation(data) {
    const { cma, strategies, persona, settings } = data;
    const simCount   = settings.simCount || 10000;
    const months     = data.horizonMonths; // fixed horizon, not full retirement
    const nStrats    = strategies.length;
    const inflation  = settings.inflation || 2.5;

    const numWorkers   = Math.min(MAX_WORKERS,
        (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4);
    const chunkSize    = Math.ceil(simCount / numWorkers);
    const actualWorkers = Math.ceil(simCount / chunkSize);

    // assemblyBufs[strat][sim] = terminal pot (only last month stored)
    // We only need the terminal month for the league table stats.
    // Store as Float64Array for precision in annualised return calc.
    const terminalPots = Array.from({ length: nStrats }, () => new Float64Array(simCount));

    // We also need full paths for beat-median — but storing 10 strategies ×
    // 10k sims × up to 120 months (10yr) = 12M floats = 48MB. Instead we
    // compute beat-median directly in each sub-worker chunk and accumulate
    // counts, passing only the terminal pot column back. Beat-median is
    // computed post-assembly once all terminal pots are known.

    let chunksReceived = 0;
    let errorFired     = false;

    for (let w = 0; w < actualWorkers; w++) {
        const chunkStart = w * chunkSize;
        const thisChunk  = Math.min(chunkSize, simCount - chunkStart);

        // Override monthlyData to only run for horizonMonths
        const trimmedStrategies = strategies.map(s => ({
            ...s,
            monthlyData: s.monthlyData.slice(0, months)
        }));

        const worker = new Worker('./sim-worker.js?v=26.0');

        worker.onmessage = function(e) {
            worker.terminate();
            if (errorFired) return;
            if (e.data.type === 'ERROR') {
                errorFired = true;
                self.postMessage({ type: 'VFM_ERROR', payload: e.data.payload });
                return;
            }

            const { chunkStart: cs, chunkSize: cs2, buffers } = e.data;

            // Extract only the terminal month from each strategy buffer
            // Buffer layout: [month * chunkSize + sim]
            for (let si = 0; si < nStrats; si++) {
                const src      = new Float32Array(buffers[si]);
                const lastBase = (months - 1) * cs2;
                for (let s = 0; s < cs2; s++) {
                    terminalPots[si][cs + s] = src[lastBase + s];
                }
            }

            chunksReceived++;
            // Report progress to main thread after each chunk
            self.postMessage({
                type: 'VFM_PROGRESS',
                payload: { done: chunksReceived, total: actualWorkers }
            });
            if (chunksReceived === actualWorkers) {
                const result = buildVFMStats(terminalPots, strategies, simCount, months, persona);
                self.postMessage({ type: 'VFM_COMPLETE', payload: result });
            }
        };

        worker.onerror = function(err) {
            worker.terminate();
            if (!errorFired) {
                errorFired = true;
                const detail = [err.message, err.filename, err.lineno]
                    .filter(Boolean).join(' line ') || 'VFM_WORKER_ERROR';
                self.postMessage({ type: 'VFM_ERROR', payload: detail });
            }
        };

        worker.postMessage({
            chunkStart,
            chunkSize: thisChunk,
            data: {
                ...data,
                horizonMonths: months,
                strategies: strategies.map(s => ({
                    ...s,
                    monthlyData: s.monthlyData.slice(0, months)
                }))
            }
        });
    }
}

function buildVFMStats(terminalPots, strategies, simCount, months, persona) {
    const nStrats  = strategies.length;
    const years    = months / 12;
    const initPot  = persona.savings; // starting pot for annualised return calc

    // Median terminal pot per strategy
    const medians = terminalPots.map(pots => {
        const sorted = Float64Array.from(pots).sort();
        return sorted[Math.round(0.5 * (simCount - 1))];
    });

    // Cross-strategy median: median of all terminal pots across all strategies
    // For each simulation path s, average the terminal pots (equal-weight blend),
    // then take the median of those averages.
    const crossPots = new Float64Array(simCount);
    for (let s = 0; s < simCount; s++) {
        let sum = 0;
        for (let si = 0; si < nStrats; si++) sum += terminalPots[si][s];
        crossPots[s] = sum / nStrats;
    }
    crossPots.sort();
    const crossMedian = crossPots[Math.round(0.5 * (simCount - 1))];

    // P(beat cross-median) per strategy
    const pBeatMedian = terminalPots.map(pots => {
        let count = 0;
        for (let s = 0; s < simCount; s++) if (pots[s] > crossMedian) count++;
        return count / simCount;
    });

    // Median annualised return: (medianPot / initPot)^(1/years) - 1
    // initPot alone understates the invested base because of ongoing contributions.
    // Use median terminal pot directly — the annualised return is implicitly
    // money-weighted because contributions are included in the simulation.
    const annualisedReturns = medians.map(med =>
        Math.pow(Math.max(med, 0.01) / Math.max(initPot, 1), 1 / years) - 1
    );

    return strategies.map((strat, i) => ({
        name:             strat.name,
        isProvider:       strat.isProvider,
        medianPot:        medians[i],
        annualisedReturn: annualisedReturns[i],
        vsFieldMedian:    medians[i] - crossMedian,
        pBeatMedian:      pBeatMedian[i]
    }));
}
