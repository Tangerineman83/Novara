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
        self.postMessage({ type: 'RECALCULATE_STATS', payload: stats });
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
    const workerSimsDone = new Array(actualWorkers).fill(0);
    const totalSimsProj  = actualWorkers * chunkSize;

    for (let w = 0; w < actualWorkers; w++) {
        const chunkStart = w * chunkSize;
        const thisChunk  = Math.min(chunkSize, simCount - chunkStart);

        const worker = new Worker('./sim-worker.js?v=58.11');

        worker.onmessage = function(e) {
            if (errorFired) return;

            if (e.data.type === 'INTRA_PROGRESS') {
                workerSimsDone[w] = e.data.done;
                const td = workerSimsDone.reduce((a,b)=>a+b,0);
                self.postMessage({ type: 'SIMULATION_PROGRESS', payload: { pct: Math.round(td/totalSimsProj*100) } });
                return;
            }

            worker.terminate();

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
            workerSimsDone[w] = thisChunk;
            const tdFinal = workerSimsDone.reduce((a,b)=>a+b,0);
            self.postMessage({ type: 'SIMULATION_PROGRESS', payload: { pct: Math.round(tdFinal/totalSimsProj*100) } });
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
    const simCount           = settings.simCount || 5000;
    const horizonMonths      = data.horizonMonths;      // for return column (short)
    const personaRetireMonths = data.personaRetireMonths || horizonMonths; // for pot simulation (full)
    const nStrats            = strategies.length;

    const numWorkers    = Math.min(MAX_WORKERS,
        (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4);
    const chunkSize     = Math.ceil(simCount / numWorkers);
    const actualWorkers = Math.ceil(simCount / chunkSize);

    // Pot simulation runs to personaRetireMonths — uses fullRetireMonthlyData.
    // This produces terminal pots matching the Projections tab median.
    const realPots = Array.from({ length: nStrats }, () => new Float64Array(simCount));

    // Strategies already carry fullRetireMonthlyData (length = personaRetireMonths).
    // We pass that to the sim workers for the pot simulation.
    const retireStrategies = strategies.map(s => ({
        ...s,
        monthlyData: s.fullRetireMonthlyData || s.monthlyData
    }));

    let chunksReceived = 0;
    let errorFired     = false;
    const vfmWorkerSimsDone = new Array(actualWorkers).fill(0);

    for (let w = 0; w < actualWorkers; w++) {
        const cs  = w * chunkSize;
        const cs2 = Math.min(chunkSize, simCount - cs);
        const worker = new Worker('./sim-worker.js?v=58.11');

        worker.onmessage = function(e) {
            if (errorFired) return;

            if (e.data.type === 'INTRA_PROGRESS') {
                vfmWorkerSimsDone[w] = e.data.done;
                const td = vfmWorkerSimsDone.reduce((a,b)=>a+b,0);
                self.postMessage({ type: 'VFM_PROGRESS', payload: { pct: Math.round(td/simCount*100) } });
                return;
            }

            worker.terminate();
            if (errorFired) return;
            if (e.data.type === 'ERROR') {
                errorFired = true;
                self.postMessage({ type: 'VFM_ERROR', payload: e.data.payload });
                return;
            }
            const { chunkStart: rcs, chunkSize: rcs2, buffers } = e.data;
            for (let si = 0; si < nStrats; si++) {
                const src      = new Float32Array(buffers[si]);
                const lastBase = (personaRetireMonths - 1) * rcs2;
                for (let s = 0; s < rcs2; s++) realPots[si][rcs + s] = src[lastBase + s];
            }
            chunksReceived++;
            vfmWorkerSimsDone[w] = rcs2;
            const tdVfm = vfmWorkerSimsDone.reduce((a,b)=>a+b,0);
            self.postMessage({ type: 'VFM_PROGRESS', payload: { pct: Math.round(tdVfm/simCount*100) } });
            if (chunksReceived === actualWorkers) {
                const result = buildVFMStats(realPots, strategies, simCount);
                self.postMessage({ type: 'VFM_COMPLETE', payload: result });
            }
        };

        worker.onerror = function(err) {
            worker.terminate();
            if (!errorFired) {
                errorFired = true;
                const detail = [err.message, err.filename, err.lineno].filter(Boolean).join(' ') || 'VFM_ERROR';
                self.postMessage({ type: 'VFM_ERROR', payload: detail });
            }
        };

        worker.postMessage({
            chunkStart: cs, chunkSize: cs2,
            data: {
                ...data,
                horizonMonths: personaRetireMonths,  // sim runs to full retirement
                strategies:    retireStrategies.map(s => ({
                    ...s,
                    monthlyData: (s.fullRetireMonthlyData || s.monthlyData)
                }))
            }
        });
    }
}


function buildVFMStats(realPots, strategies, simCount) {
    const nStrats = strategies.length;

    // Median terminal pot — full-retirement simulation in real terms.
    const medianPots = realPots.map(pots => {
        const sorted = Float64Array.from(pots).sort();
        return sorted[Math.round(0.5 * (simCount - 1))];
    });

    // Chance Top / Bottom uses two separate ranking universes:
    //   • Provider strategies: ranked against each other only (comparators excluded).
    //     This gives a provider-relevant metric — where does this strategy sit in the
    //     actual market of DC defaults?
    //   • Comparators: ranked against the full universe (all providers + comparators).
    //     This shows what the comparator's ranking potential would be if adopted as a
    //     provider strategy — the "what if" framing.

    const providerIndices    = strategies.map((s, i) => s.isProvider ? i : -1).filter(i => i >= 0);
    const allIndices         = strategies.map((_, i) => i);

    const pTop    = new Float64Array(nStrats);
    const pBottom = new Float64Array(nStrats);

    for (let s = 0; s < simCount; s++) {
        // ── Provider ranking (providers only) ──
        let maxP = -Infinity, minP = Infinity, maxPi = -1, minPi = -1;
        for (const si of providerIndices) {
            const p = realPots[si][s];
            if (p > maxP) { maxP = p; maxPi = si; }
            if (p < minP) { minP = p; minPi = si; }
        }
        if (maxPi >= 0) pTop[maxPi]++;
        if (minPi >= 0) pBottom[minPi]++;

        // ── Full ranking (comparators only — vs all providers + comparators) ──
        let maxA = -Infinity, minA = Infinity, maxAi = -1, minAi = -1;
        for (const si of allIndices) {
            const p = realPots[si][s];
            if (p > maxA) { maxA = p; maxAi = si; }
            if (p < minA) { minA = p; minAi = si; }
        }
        // Only credit the top/bottom to comparator indices
        if (maxAi >= 0 && !strategies[maxAi].isProvider) pTop[maxAi]++;
        if (minAi >= 0 && !strategies[minAi].isProvider) pBottom[minAi]++;
    }

    return strategies.map((strat, i) => ({
        name:             strat.name,
        isProvider:       strat.isProvider,
        isProviderMedian: strat.isProviderMedian || false,
        medianPot:        medianPots[i],
        pTop:             pTop[i] / simCount,
        pBottom:          pBottom[i] / simCount,
        annualisedReturn: strat.annualisedArithReturn
    }));
}
