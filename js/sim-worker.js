// js/sim-worker.js  v20.0
// Simulation sub-worker. Receives a chunk of the total sim count,
// runs the Monte Carlo paths, and returns the raw transposed path
// matrix via Transferable ArrayBuffers (zero-copy).
//
// Storage layout: transposed[stratIdx][monthIdx * chunkSize + simIdx]
// This means each month's data for a strategy is a contiguous slice —
// ideal for the coordinator's sort-once-per-month cache build.

// ── RNG ──────────────────────────────────────────────────────────────

function randn_bm() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function rand_gamma(alpha) {
    if (alpha < 1) return rand_gamma(1.0 + alpha) * Math.pow(Math.random(), 1.0 / alpha);
    const d = alpha - 1.0 / 3.0;
    const c = 1.0 / Math.sqrt(9.0 * d);
    while (true) {
        let x = randn_bm();
        let v = 1.0 + c * x;
        while (v <= 0) { x = randn_bm(); v = 1.0 + c * x; }
        v = v * v * v;
        const u = Math.random();
        const x2 = x * x;
        if (u < 1.0 - 0.0331 * x2 * x2) return d * v;
        if (Math.log(u) < 0.5 * x2 + d * (1.0 - v + Math.log(v))) return d * v;
    }
}

// Pre-computed per-asset df and scale — set once when payload arrives.
let DF_CACHE    = null;
let SCALE_CACHE = null;

function rand_t_fast(assetIdx) {
    const df    = DF_CACHE[assetIdx];
    const scale = SCALE_CACHE[assetIdx];
    if (df >= 1e5) return randn_bm();
    const z = randn_bm();
    const v = rand_gamma(df / 2) * 2;
    return (z / Math.sqrt(v / df)) * scale;
}

// ── Cholesky ──────────────────────────────────────────────────────────

function choleskyStrict(matrix) {
    const n = matrix.length;
    const L = Array(n).fill(0).map(() => new Float64Array(n));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j <= i; j++) {
            let sum = 0;
            for (let k = 0; k < j; k++) sum += L[i][k] * L[j][k];
            if (i === j) {
                const val = matrix[i][i] - sum;
                if (val <= 0.000001) throw new Error('Not PSD');
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
    let current = matrix.map(row => Float64Array.from(row));
    while (blend <= 1.0) {
        try { return choleskyStrict(current); }
        catch (e) {
            blend += 0.01;
            for (let i = 0; i < n; i++)
                for (let j = 0; j < n; j++)
                    current[i][j] = i === j ? 1.0 : matrix[i][j] * (1.0 - blend);
        }
    }
    throw new Error('CORRELATION_NOT_PSD');
}

// ── Main simulation ───────────────────────────────────────────────────

self.onmessage = function(e) {
    const { chunkStart, chunkSize, data } = e.data;
    const { cma, strategies, persona, settings, assetKeys } = data;

    const n       = assetKeys.length;
    const retirementMonths = Math.max(1, (persona.retirementAge - persona.age) * 12);
    const months = data.horizonMonths
        ? Math.min(data.horizonMonths, retirementMonths)
        : retirementMonths;
    const inflation = settings.inflation;

    // Pre-compute df/scale once per asset
    DF_CACHE    = new Float64Array(n);
    SCALE_CACHE = new Float64Array(n);
    for (let i = 0; i < n; i++) {
        const k  = cma.k[assetKeys[i]] || 0;
        const df = k <= 0.05 ? 1e6 : (6 / k) + 4;
        DF_CACHE[i]    = df;
        SCALE_CACHE[i] = df >= 1e5 ? 1.0 : Math.sqrt((df - 2) / df);
    }

    // Pre-compute per-asset monthly expected returns and vols
    const MEAN = new Float64Array(n);
    const VOL  = new Float64Array(n);
    for (let i = 0; i < n; i++) {
        MEAN[i] = (cma.r[assetKeys[i]] || 0) / 12;
        VOL[i]  = (cma.v[assetKeys[i]] || 0) / Math.sqrt(12);
    }

    // Build correlation matrix and Cholesky factor
    const corrMatrix = Array(n).fill(0).map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++)
            corrMatrix[i][j] = cma.correlations[assetKeys[i]]?.[assetKeys[j]] ?? 0;

    let L;
    try { L = getRobustCholesky(corrMatrix); }
    catch (err) {
        self.postMessage({ type: 'ERROR', payload: err.message });
        return;
    }

    // Flatten Cholesky into a typed array for cache-friendly inner loop
    const Lflat = new Float64Array(n * n);
    for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++)
            Lflat[i * n + j] = L[i][j];

    const monthlyInflation    = Math.pow(1 + inflation / 100, 1 / 12);
    const monthlySalaryGrowth = Math.pow(1 + (inflation + persona.realSalaryGrowth) / 100, 1 / 12);

    const nStrats = strategies.length;

    // Transposed storage: one Float32Array per strategy, layout [month * chunkSize + sim]
    // Allocated here, transferred (zero-copy) back to coordinator.
    const pathBuffers = strategies.map(() =>
        new Float32Array(months * chunkSize)
    );

    // Reusable per-sim scratch buffers
    const uncorr     = new Float64Array(n);
    const correlated = new Float64Array(n);

    for (let s = 0; s < chunkSize; s++) {
        // Per-strategy state
        const pots    = new Float64Array(nStrats).fill(persona.savings);
        const salaries = new Float64Array(nStrats).fill(persona.salary);
        let cumInfl = 1.0;

        for (let m = 0; m < months; m++) {
            // ── Draw independent shocks using per-asset kurtosis ──
            for (let i = 0; i < n; i++) uncorr[i] = rand_t_fast(i);

            // ── Apply Cholesky correlation structure ──
            for (let i = 0; i < n; i++) {
                let shock = 0;
                const row = i * n;
                for (let j = 0; j <= i; j++) shock += Lflat[row + j] * uncorr[j];
                correlated[i] = VOL[i] * shock;
            }

            cumInfl *= monthlyInflation;

            for (let si = 0; si < nStrats; si++) {
                const md = strategies[si].monthlyData[m];
                let ret = 0;

                for (let i = 0; i < n; i++) {
                    const key = assetKeys[i];
                    const w = md.weights[key] || 0;
                    if (w === 0) continue;
                    const alpha = (md.alphas?.[key] ?? 0) / 12;
                    const te    = md.tes?.[key] ?? 0;
                    const activeShock = te > 0
                        ? (te / Math.sqrt(12)) * rand_t_fast(i)
                        : 0;
                    ret += w * (MEAN[i] + alpha + correlated[i] + activeShock);
                }

                const contribution = (salaries[si] * (persona.contribution / 100)) / 12;
                pots[si] = (pots[si] + contribution) * (1 + ret);
                salaries[si] *= monthlySalaryGrowth;

                // Store in transposed layout: [month * chunkSize + sim]
                pathBuffers[si][m * chunkSize + s] = pots[si] / cumInfl;
            }
        }
    }

    // Transfer buffers zero-copy back to coordinator
    self.postMessage(
        { type: 'CHUNK_DONE', chunkStart, chunkSize, months, buffers: pathBuffers.map(b => b.buffer) },
        pathBuffers.map(b => b.buffer)
    );
};
