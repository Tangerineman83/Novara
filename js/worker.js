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

        const worker = new Worker('./sim-worker.js?v=28.0');

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
    const { cma, strategies, persona, normalisedPersona, settings } = data;
    const simCount      = settings.simCount || 10000;
    const months        = data.horizonMonths;
    const nStrats       = strategies.length;

    const numWorkers    = Math.min(MAX_WORKERS,
        (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4);
    const chunkSize     = Math.ceil(simCount / numWorkers);
    const actualWorkers = Math.ceil(simCount / chunkSize);

    // Two separate pot arrays:
    // realPots  — real persona with contributions, for Projected Pot and P(Beat Median)
    // normPots  — £10k zero-contribution persona, for Annualised Return p.a.
    const realPots = Array.from({ length: nStrats }, () => new Float64Array(simCount));
    const normPots = Array.from({ length: nStrats }, () => new Float64Array(simCount));

    const trimmedStrategies = strategies.map(s => ({
        ...s,
        monthlyData: s.monthlyData.slice(0, months)
    }));

    const basePayload = {
        horizonMonths: months,
        cma,
        assetKeys: data.assetKeys,
        settings,
        strategies: trimmedStrategies
    };

    // Progress tracks pairs: each chunk spawns 2 sub-workers (real + norm).
    // We count each sub-worker completion separately; fire VFM_COMPLETE when all done.
    let completedHalves = 0;
    const totalHalves   = actualWorkers * 2;
    let errorFired      = false;

    function handleChunkResult(pots, cs, cs2, buffers) {
        for (let si = 0; si < nStrats; si++) {
            const src      = new Float32Array(buffers[si]);
            const lastBase = (months - 1) * cs2;
            for (let s = 0; s < cs2; s++) pots[si][cs + s] = src[lastBase + s];
        }
        completedHalves++;
        // Report progress once per pair (every 2 completions)
        if (completedHalves % 2 === 0) {
            self.postMessage({
                type: 'VFM_PROGRESS',
                payload: { done: completedHalves / 2, total: actualWorkers }
            });
        }
        if (completedHalves === totalHalves) {
            const result = buildVFMStats(realPots, normPots, strategies, simCount, months, settings.inflation);
            self.postMessage({ type: 'VFM_COMPLETE', payload: result });
        }
    }

    function makeWorker(persona_, pots, cs, cs2) {
        const w = new Worker('./sim-worker.js?v=28.0');
        w.onmessage = function(e) {
            w.terminate();
            if (errorFired) return;
            if (e.data.type === 'ERROR') {
                errorFired = true;
                self.postMessage({ type: 'VFM_ERROR', payload: e.data.payload });
                return;
            }
            handleChunkResult(pots, e.data.chunkStart, e.data.chunkSize, e.data.buffers);
        };
        w.onerror = function(err) {
            w.terminate();
            if (!errorFired) {
                errorFired = true;
                const detail = [err.message, err.filename, err.lineno]
                    .filter(Boolean).join(' ') || 'VFM_WORKER_ERROR';
                self.postMessage({ type: 'VFM_ERROR', payload: detail });
            }
        };
        w.postMessage({ chunkStart: cs, chunkSize: cs2,
            data: { ...basePayload, persona: persona_ } });
    }

    for (let w = 0; w < actualWorkers; w++) {
        const cs  = w * chunkSize;
        const cs2 = Math.min(chunkSize, simCount - cs);
        makeWorker(persona,             realPots, cs, cs2);
        makeWorker(normalisedPersona,   normPots, cs, cs2);
    }
}

function buildVFMStats(realPots, normPots, strategies, simCount, months, inflation) {
    const nStrats  = strategies.length;
    const years    = months / 12;

    // Cumulative inflation over the horizon — used to convert real pots back to nominal.
    // The sim deflates all pots by inflation so projectedPot is in today's money.
    // For the annualised return column we want NOMINAL return (comparable to the
    // arithmetic returns shown in the Portfolio tab), so we reverse the deflation.
    const inflationRate = (inflation || 2.5) / 100;
    const cumInflation  = Math.pow(1 + inflationRate / 12, months);

    const NORM_INIT = 10000; // normalised starting pot

    // Median normalised terminal pot (real terms) — convert to nominal for return calc
    const annualisedReturns = normPots.map(pots => {
        const sorted      = Float64Array.from(pots).sort();
        const medRealPot  = sorted[Math.round(0.5 * (simCount - 1))];
        const medNomPot   = medRealPot * cumInflation; // reverse inflation deflation
        return Math.pow(Math.max(medNomPot, 1) / NORM_INIT, 1 / years) - 1;
    });

    // Median real terminal pot per strategy (persona-specific, with contributions)
    // This IS correctly shown in today's money — label as such in the UI
    const medianRealPots = realPots.map(pots => {
        const sorted = Float64Array.from(pots).sort();
        return sorted[Math.round(0.5 * (simCount - 1))];
    });

    // Cross-strategy median: for each path, average all real terminal pots
    const crossPots = new Float64Array(simCount);
    for (let s = 0; s < simCount; s++) {
        let sum = 0;
        for (let si = 0; si < nStrats; si++) sum += realPots[si][s];
        crossPots[s] = sum / nStrats;
    }
    crossPots.sort();
    const crossMedian = crossPots[Math.round(0.5 * (simCount - 1))];

    // P(beat cross-median) using real pots
    const pBeatMedian = realPots.map(pots => {
        let count = 0;
        for (let s = 0; s < simCount; s++) if (pots[s] > crossMedian) count++;
        return count / simCount;
    });

    return strategies.map((strat, i) => ({
        name:             strat.name,
        isProvider:       strat.isProvider,
        medianPot:        medianRealPots[i],
        annualisedReturn: annualisedReturns[i],
        vsFieldMedian:    medianRealPots[i] - crossMedian,
        pBeatMedian:      pBeatMedian[i]
    }));
}
