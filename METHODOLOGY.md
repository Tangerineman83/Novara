# Novara: model methodology (replication grade)

- **Repo:** `Tangerineman83/Novara` (public). Read at HEAD `676b8c2` (3 Jun 2026 19:27 UK, "Add files via upload"). There is no README or LICENSE. A branch `TEST-CODE-ASSIST` exists and was not used.
- **Read method:** a read-only local clone at `/workspace/modelling/methods/_clones/Novara`, with the push URL set to `DISABLED`. Nothing in the repo was changed. A one-off NumPy check of the committed correlation matrices was run outside the repo (see §6). Findings from the later `novsim` port of this maths are cited where they measure behaviour that this repo does not report itself (the PSD shrink).
- **Written:** 14 Nov 2026 (Europe/London) for job t177u.
- **Citations:** `file:line` refers to HEAD `676b8c2`. Every parameter value below is quoted from code or committed data. Where a value is not in the repo, it says **not specified in repo**.

---

## 1. Purpose

Novara is a static, browser-based member-outcomes modeller. It has no server. Opened as a local page it lets a user:

1. Choose a capital-market-assumption (CMA) vintage and one or more investment strategies (glidepaths built from named portfolios).
2. Run a **monthly, multi-asset, fat-tailed Monte Carlo** of an accumulating pension pot, and read a percentile fan and a value-for-money (VFM) league table.
3. Inspect **instant (deterministic) stress tests** on a pair of portfolios.
4. Build a **constrained random efficient frontier** of seven rounded portfolios.
5. Compare **deterministic decumulation** product designs (drawdown, GLWB, GLA, GSA, CDC, and two hybrids) on actuarial present values.

There are four calculation engines plus a CMA library:

| Engine | Status | Files |
|---|---|---|
| Scenario generator + accumulation projection | Live. Runs in a pool of web workers. | `js/sim-worker.js`, coordinated by `js/worker.js`, orchestrated from `js/app.js` `runSimulation` / `runVFM` |
| Deterministic portfolio stats | Live, used in the Markets and Optimiser views | `js/mathUtils.js` `calcDeterministicStats`; optimiser copies in `js/app.js` `pArith` / `pVar` / `pGeom` |
| Stress tests | Live, instant linear shocks | `js/data/stress-scenarios.js`, `js/app.js` `renderStressTests` |
| Constrained optimiser | Live, unseeded | `js/app.js` `genPortfolio`, `buildFrontier`, `trimPortfolio`, `lrRound` |
| Decumulation engines | Live, deterministic annual; a stochastic `R_t` hook exists but is unused | `js/decum-engine.js`, data in `js/data/decum-specs.js` |

`js/config.js` is a barrel only. UI-only files (`js/avatars.js`, `js/decum-ui.js`, `css/`) are out of scope.

---

## 2. Data sources (with dates)

| Data | Source / URL | Date / vintage | Where |
|---|---|---|---|
| CMA returns, vols, excess kurtosis, correlations (20 assets) | Author calibration. Header: equity returns from "MSCI long-run historical" plus a "forward-looking risk premium framework"; fixed income from "prevailing yield curves (May 2026 UK/US/EUR gilt/swap curves) plus credit spread"; private-asset vols "smoothed (appraisal-based)"; vols a "blend of 10-year realised vol and implied vol"; kurtosis "calibrated to observed tail events 2000–2024" (`cmas.js:21-31`). The numerical values themselves are **not specified in repo** as coming from a named table or workbook. | Two vintages: `novara_cma_2026_05` ("May 2026 — Global Equilibrium (Institutional)") and `novara_cma_2026_03`. Audit trail also mentions a 2025 vintage (`cmas.js:48`) that is **not in the file**. The 2026-03-01 audit line is labelled "May 2026 vintage" (`cmas.js:49`), which is inconsistent. | `js/data/cmas.js` |
| Asset-class catalogue and UI fallback r/v/k | Hard-coded. These fallbacks are **not** the same as the May 2026 CMA (e.g. `usEq` default vol 0.16 vs CMA 0.155). | n/a | `js/data/asset-classes.js:51-70` |
| Named portfolios and glidepath strategies | Hard-coded weights, optional alpha and tracking error. Third-party provider and fund names appear here. This doc does not repeat those names. | n/a | `js/data/portfolios.js`, `js/data/strategies.js` |
| Personas | Four illustrative people (Maya, James, Priya, David). Header comment says contribution is a decimal (`personas.js:50`) but the stored values are percentages (10, 12, 20) and the UI label is "Contrib (%)" (`app.js:1233`). The simulation divides by 100 (`sim-worker.js:246`). | n/a | `js/data/personas.js:56-81` |
| Stress scenarios | 23 named market events, each a vector of instant asset returns. How each vector was estimated is **not specified in repo**. | Includes historical episodes 1929–2023 plus stylised / prospective cases (`s_green_bubble`, `s_cyber_crash`, `s_dollar_deposed`, `s_2026_iran`). | `js/data/stress-scenarios.js` (23 entries, `:61-174`) |
| Mortality | IFoA S4PMA male annuitant qx, ages 50–110. Header: "Digitised from CMI_2021 base table with S4PMA scaling factors" (`decum-specs.js:17-18`). The digitisation source file is **not specified in repo**. | Table as committed; max age 110 (`:119`) | `js/data/decum-specs.js` `S4PMA_QX` `:104-118` |
| Decumulation product defaults | Author judgement, with comments citing published CDC design notes. Exact derivation of each rate is **not specified in repo**. | Comments dated 2026-03-01 and 2026-04-01 (`decum-specs.js:82-83`) | `js/data/decum-specs.js` |
| Equity regional cap weights | Comment: "MSCI ACWI March 2026" | March 2026 | `app.js:3294-3295` `EQ_CAP = [0.663, 0.125, 0.115, 0.051, 0.034, 0.012]` for US, Dev Europe, EM, Japan, UK, Dev APAC ex-Japan |
| Inflation default | UI default 2.5% a year, treated as a **percent** | n/a | `index.html:844`; `app.js:3096-3097` |

The CMA commentary file (`commentary/cma_commentary.md`) is display text for the Markets tab, not an input to the engines.

---

## 3. Model equations and parameters

### 3.1 Capital market assumptions

Twenty asset keys (the file header in places says 19; the matrix has 20). Arithmetic annual returns \(r\), annual volatilities \(v\), and excess kurtosis \(k\), all nominal and gross of fees (`cmas.js:17-19` and the Phase 1 capability note).

**May 2026 vintage** (`novara_cma_2026_05`, `cmas.js:67-129`):

| Key | \(r\) | \(v\) | \(k\) |
|---|---:|---:|---:|
| usEq | 0.065 | 0.155 | 2.55 |
| devEq | 0.072 | 0.150 | 1.90 |
| emEq | 0.088 | 0.230 | 4.10 |
| jpnEq | 0.070 | 0.170 | 2.10 |
| ukEq | 0.065 | 0.140 | 2.00 |
| apacEq | 0.072 | 0.185 | 3.10 |
| globalReits | 0.068 | 0.190 | 2.80 |
| realEstateDirect | 0.067 | 0.140 | 1.80 |
| infrastructure | 0.075 | 0.120 | 1.30 |
| privEq | 0.105 | 0.240 | 1.90 |
| privCredit | 0.082 | 0.100 | 3.50 |
| listedAlts | 0.064 | 0.145 | 2.10 |
| digitalAssets | 0.125 | 0.480 | 5.50 |
| globalHighYield | 0.078 | 0.110 | 2.90 |
| emDebt | 0.075 | 0.140 | 3.40 |
| igCredit | 0.054 | 0.060 | 1.50 |
| sdCredit | 0.043 | 0.040 | 0.40 |
| globalSov | 0.045 | 0.075 | 1.80 |
| inflLinked | 0.045 | 0.065 | 2.00 |
| moneyMkt | 0.035 | 0.010 | 0.15 |

**March 2026 vintage** differs only in: usEq \(r\) 0.070; emEq \(r\) 0.091 / \(v\) 0.220; sdCredit \(r\) 0.048; globalSov \(v\) 0.070 / \(k\) 1.65; inflLinked \(v\) 0.060 / \(k\) 1.80. The two correlation matrices are identical.

The correlation matrix is stored twice: once as a keyed object in `cmas.js` (used by the Monte Carlo) and once as the positional array `RHO` in `app.js:3303-3324` (used by the optimiser). They match on listed-equity and most other pairs, but **`RHO` sets every money-market off-diagonal to 0**, whereas `cmas.js` has non-zero correlations (e.g. moneyMkt–igCredit 0.15, moneyMkt–sdCredit 0.25, moneyMkt–globalSov 0.20, moneyMkt–privCredit 0.10). See §9.

Neither matrix is positive semi-definite. A NumPy check of the committed May (and March) matrix gives a minimum eigenvalue of **−0.12102** (symmetric to working precision). The Monte Carlo therefore repairs it before use.

### 3.2 Shocks, Cholesky and PSD repair (`sim-worker.js`)

Per asset \(i\), degrees of freedom and a unit-variance scale are cached once (`:149-157`):

\[
\mathrm{df}_i=\begin{cases}10^{6} & \text{if }k_i\le 0.05\\ 6/k_i+4 & \text{otherwise}\end{cases},\qquad
\mathrm{scale}_i=\begin{cases}1 & \text{if }\mathrm{df}_i\ge 10^{5}\\ \sqrt{(\mathrm{df}_i-2)/\mathrm{df}_i} & \text{otherwise}\end{cases}
\]

A standard Student-\(t\) draw is \(Z/\sqrt{V/\mathrm{df}}\) times that scale, with \(Z\sim N(0,1)\) (Box–Muller, `:52-57`) and \(V\sim\mathrm{Gamma}(\mathrm{df}/2,\text{scale }2)\) via Marsaglia–Tsang (`rand_gamma`, `:59-73`). If \(\mathrm{df}\ge 10^{5}\) the draw is just \(Z\) (`rand_t_fast`, `:79-86`).

Independent \(t\) (or normal) shocks are then correlated with a Cholesky factor \(L\). If a strict Cholesky fails (`val <= 0.000001` on a diagonal, `:99`), `getRobustCholesky` (`:109-123`) shrinks every off-diagonal by 1% steps:

\[
C^{(b)}_{ij}=\begin{cases}1 & i=j\\ (1-b)\,C_{ij} & i\neq j\end{cases},\qquad b=0,0.01,0.02,\ldots
\]

until the strict Cholesky succeeds, or it throws `CORRELATION_NOT_PSD` at \(b>1\). The shrink amount is **not reported to the UI**.

The `novsim` port of this routine (parity-tested against this file at `676b8c2`) finds that both CMA vintages require a shrink of **11%** (`psd_blend` 0.11; Frobenius change about 0.94). A nearest-correlation repair (Higham) would change the matrix by only about 0.147. A faithful replication of Novara must use this shrink, not Higham.

### 3.3 Monthly asset returns and the pot recursion

Monthly mean and vol (`:159-165`):

\[
\mu_i=r_i/12,\qquad \sigma_i=v_i/\sqrt{12}.
\]

The correlated shock for asset \(i\) is \(\sigma_i(L z)_i\). An optional active-risk term, if the glidepath month has tracking error \(\mathrm{TE}_i>0\), adds \(\alpha_i/12 + (\mathrm{TE}_i/\sqrt{12})\,\tilde t_i\) where \(\tilde t_i\) is a **fresh** `rand_t_fast(i)` draw (`:238-243`). Those extra draws mean two strategies with different TE patterns do not share a common random-number stream.

Portfolio return that month is the weight-sum of those asset returns. The pot is real (deflated) and contributions are added **before** the return (`:246-251`):

\[
\mathrm{contrib}_m = (\mathrm{salary}_m\cdot c/100)/12,\qquad
\mathrm{pot}_{m+1}=(\mathrm{pot}_m+\mathrm{contrib}_m)\,(1+\mathrm{ret}_m),
\]

\[
\mathrm{salary}_{m+1}=\mathrm{salary}_m\cdot(1+(\pi+g)/100)^{1/12},\qquad
\mathrm{cpi}_{m+1}=\mathrm{cpi}_m\cdot(1+\pi/100)^{1/12},
\]

and the stored value is \(\mathrm{pot}/\mathrm{cpi}\). Here \(c\) is the contribution **percent**, \(\pi\) is the inflation **percent** (default 2.5), and \(g\) is real salary growth as a percent (persona field `realSalaryGrowth`). Inflation is a **deterministic constant** — there is no inflation shock. There are **no withdrawals** in this engine. Horizon is \(\max(1,(\text{retirementAge}-\text{age})\times 12)\) months (`worker.js:68`), unless a VFM run passes `horizonMonths`.

Default personas (`personas.js`):

| Name | Age | Ret. age | Pot £ | Salary £ | Contrib % | Real salary growth % |
|---|---:|---:|---:|---:|---:|---:|
| Maya | 25 | 68 | 5,000 | 32,000 | 10 | 1.5 |
| James | 40 | 68 | 85,000 | 65,000 | 12 | 0.5 |
| Priya | 55 | 67 | 120,000 | 80,000 | 20 | 0.0 |
| David | 67 | 67 | 280,000 | 0 | 0 | 0.0 |

### 3.4 Glidepath interpolation (`app.js` `interpolateWeights`, `:3048-3088`)

Strategy points are `(years-to-retirement, weights, alphas, tes)`. For month \(m\) of a \(T\)-month run, \(y=(T-m)/12\) is clamped to the first and last point. Between adjacent points \(p_1,p_2\) (ordered by falling years):

\[
\lambda=\frac{y-y_2}{y_1-y_2},\qquad w = w_2 + (w_1-w_2)\lambda
\]

and the same linear blend is applied to alpha and TE. Points are resolved from named portfolios in `getActiveStrategies` (`:2963-3046`): a strategy weight on a portfolio is multiplied through that portfolio's asset weights.

### 3.5 Percentiles and VFM (`worker.js`)

The coordinator caps the worker pool at `MAX_WORKERS = 8` (`:21`), or `navigator.hardwareConcurrency`, or 4 if that is missing (`:72-75`). `simCount` is split into equal chunks. After all chunks return, each month's column is sorted once. A percentile at confidence \(p\) is the nearest-rank read

\[
\mathrm{sorted}[\mathrm{round}(p\cdot(\mathrm{simCount}-1))]
\]

(`:184-185`, used at `:211`). The UI confidence slider defaults to 90% (`index.html:786-787`).

VFM (`runVFMSimulation`, default `simCount` 5,000 if unset — `:234`; the VFM UI default is 2,000, `index.html:830`) keeps terminal real pots and reports the median and the probability of being top or bottom of the peer set (`buildVFMStats`, `:321-373`).

UI defaults for a normal projection: **10,000** paths, inflation **2.5%** (`index.html:825,844`; `app.js:3095-3097`). The worker fallback if `simCount` is missing is 2,000 (`worker.js:67`).

### 3.6 Deterministic stats (`mathUtils.js` `calcDeterministicStats`, `:38-89`)

Portfolio arithmetic return is \(\sum_i w_i(r_i+\alpha_i)\). Variance is \(\sum_{i,j} w_i w_j v_i v_j \rho_{ij}\) plus active variance \(\sum_i (w_i\,\mathrm{TE}_i)^2\). Geometric return is \(\mu_a-\sigma^2/2\). A **hidden** 20-year median haircut is then applied (`:79-86`):

\[
\mathrm{median20Yr}=(1+\mu_a-\sigma^2/2)^{20}\cdot\exp(-0.005\cdot k_{\text{port}}),\qquad k_{\text{port}}=\sum_i w_i k_i.
\]

The 0.005 coefficient is undocumented in the UI. The comment says it was "empirically tuned" on 20-year rolling asset returns; the fit data are **not specified in repo**.

The optimiser uses the same geometric-return identity but **does not apply the kurtosis haircut** (`pGeom`, `app.js:3377`). Equity implementation modes add alpha to return and TE in quadrature to equity vols (`rebuildEffectiveOA`, `:3346-3364`). Defaults: Hybrid 50:50, \(\alpha=0.00375\), \(\mathrm{TE}=0.01050\) (`:3330-3343`). Climate: 0.0025 / 0.0075; Factor: 0.0050 / 0.0150.

### 3.7 Stress tests (`app.js:2514-2525`)

An instant portfolio impact is the linear sum \(\sum_i w_i R_i^{(s)}\) for scenario \(s\). There is no rebalancing, no time dimension, and no liability or cash-flow effect.

### 3.8 Constrained optimiser (`app.js` §3–10 of the optimiser block)

Unseeded `Math.random()` (and `rExp = -log(U+1e-12)` Dirichlet-style fills). Default constraints (`DEFAULTS`, `:3388-3399`): private assets 0–25%; equity 0–100%; liquid alts 0–20%; EM share of equity ≤ 35%; PE share of private sleeve ≤ 60%; sub-IG ≤ 30%; digital ≤ 5%; single asset ≤ 40%; minimum holding 2% if held; regional equity shares may drift by 20% of the MSCI cap weight.

`sampleEqShares` (`:3500-3515`) draws regional shares inside 70% of the drift band, retries up to 40 times. `genPortfolio` (`:3517-3622`) fills equity, then private, liquid alts, sub-IG public, then IG/rates/cash, then normalises and rejects infeasible draws. The UI default cloud size is 10,000 feasible portfolios (`index.html:127`), with a cap of 20 attempts per target (`:3705`).

`buildFrontier` (`:3740-3834`) splits the vol range into \(N_{\text{bands}}\) (default 7, `:3754`) equal bands, averages the top \(K\) (default 3, `:3755`) portfolios by geometric return in each band, fills empty bands from neighbours, applies a triangular 1-neighbour smooth \((w_{b-1}+2w_b+w_{b+1})/4\) to assets that reach 0.5% in any band, then `trimPortfolio` and `lrRound`.

`trimPortfolio` (`:3857-3906`) drops the smallest non-pinned holding while \(\Delta\mu_g\le 2\) bp, \(\Delta\sigma\le 5\) bp, and at least 3 holdings remain. If listed equity is at least 5%, all six regional equity assets are pinned (`:3852-3855`).

`lrRound` (`:3909-3918`) is largest-remainder rounding to 1% weights that sum to 100%.

A sort key `gSort = μ_g / (0.707 σ + 10^{-10})` (`:3383`) is stored; 0.707 is hard-coded and **not specified in repo** as a fitted constant (it is \(1/\sqrt{2}\)).

### 3.9 Decumulation (`decum-engine.js`)

**Context defaults** (`buildContext`, `:155-163`): start age 65, target age 90, max age 110, real return 3.5%, inflation 2.5%, discount rate 4.5%. Nominal return is Fisher: \((1+r_{\text{real}})(1+\pi)-1\). Discount factors are \(\mathrm{DF}_t=(1+d)^{-t}\). Survival is

\[
{}_t p_{x_0}=\prod_{a=x_0}^{x_0+t-1}(1-q_a),\qquad {}_0 p_{x_0}=1
\]

(`buildSurvivalCurve`, `:135-144`), with \(q_a\) from S4PMA or 1 if missing. The stochastic hook `R_t_override` is accepted but never populated by the UI.

**Actuarial annuity value:** \(\ddot a=\sum_t {}_t p_x (1+r)^{-t}\), floored at \(10^{-10}\) (`:189-194`).

**IndividualEngine** (`:207-284`). Rules:

- `FIXED_REAL`: withdrawal = \(iwr\cdot V_0\cdot\) cumulative inflation if `inflationLinkage==='guaranteed'`, else the initial amount (nominal).
- `GLWB_RATCHET`: floor starts at \(iwr\cdot V_0\) and ratchets to \(\max(\mathrm{floor}, A_{\mathrm{preW}}\cdot iwr)\) with \(A_{\mathrm{preW}}=A(1+R-f)\); after ruin the floor is still paid (`:255-269`). The preset GLWB uses a **nominal** guarantee (`inflationLinkage: 'none'`, `decum-specs.js:269`) at \(iwr=0.05\) with rider fee 1%.
- `DYNAMIC_VARIABLE`: withdrawal = \(A / \max(1, \text{targetAge}-\text{age})\).

The pot update is \(A\leftarrow\max(0, A(1+R) - A f - \text{withdrawal})\) (`:247-249`). Default IWR when not 'bisect' is 0.05 (`:209`).

**bisectIWR** (`:499-509`): 60 bisections on \(iwr\in[0.001,0.25]\) so that pot at `targetAge` is approximately 0 (tolerance \(10^{-8}\) on the bracket). Prudent Drawdown resets the target to 105 (`decum-specs.js:319`).

**CollectiveEngine** (`:301-493`). Pricing rate is the real pricing rate when inflation is guaranteed, otherwise the nominal `pricingDiscountRate` (default 0.04, `:305`). Base income is \(V_0/\ddot a\). Funding ratio is pool assets over the remaining actuarial reserve (sum of unconditional \({}_s p\) times current reference income, discounted at the pricing rate, `:379-390`). Income is adjusted by

\[
\mathrm{adj}=1+\mathrm{clip}_{[-0.05,0.05]}\big((FR-1)\cdot s\big),\qquad s=1/3\text{ for CDC and GSA, else }0.15
\]

(`:398-401`). For CDC (`inflationLinkage==='targeted'`), this year's CPI step is granted only if \(FR\ge 1\) (`:406-411`). GSA always escalates with CPI. GLA (`bypassFundingAdjustment`) pays the inception income with no funding adjustment; the pool earns the pricing rate (`staticReturn`).

Mortality credits (`:448-462`): GLA retains them in the insurer (they are added back to the pool formula as a wash relative to a deaths-leave-the-pool picture — `poolMortalityAdj = qx * poolAssets` with `bypass`); GSA credits \(\min(q_x A, 0.0125 A)\) to the pool; CDC credits 0 to assets (the benefit is only via a shrinking reserve). Pool update: \(A(1+R)-\text{income}\cdot {}_t p_x + \text{credit}\) (`:464-465`). A GSA money-back bequest reduces a guarantee account by \(0.3\times\) that year's income (`:469-471`); the 0.3 factor is **not specified in repo** as a published loading.

**Glidepath used by Drawdown and CDC** (`_buildDeRiskSchedule`, `:740-754`; building blocks `_CMA`, `:712-717`):

| Parameter | Value | Location |
|---|---|---|
| Equity real return | 0.055 | `:713` |
| Bond real return | 0.010 | `:714` |
| Charges | 0.0025 | `:715` |
| GLWB extra fee (in the CMA helper; the preset also sets `riderFee`) | 0.0100 | `:716` |
| Equity share before age 80 | 60% | `:734-749` |
| Linear de-risk | ages 80→90, 60%→0% | `:751-753` |
| Equity share from age 90 | 0% | `:750` |

So the implied real returns are \(0.60\times 0.055+0.40\times 0.010-0.0025=0.0345\) and, at 0% equity, \(0.010-0.0025=0.0075\). Header comments that say the glide starts at age 65 (`decum-specs.js:61`) do not match this code.

**Preset engine real returns** (`PRESET_SPECS`): Drawdown 0.0345; GSA 0.0340; CDC 0.0320 (comment: 0.38% governance charges vs 0.25%); GLWB 0.0245; Flex+Fix flex leg 0.0390 (comment: 70% equity). GLA ignores `engineRealReturn` and earns the pricing rate.

**Pricing rates — three conflicting sources.** A replication must pick one and record it. The values actually used when a preset is run are those on `PRESET_SPECS`:

| Item | `PRODUCT_TYPES` defaults | `PRESET_SPECS` | File header comment (`decum-specs.js:51-53`) |
|---|---|---|---|
| GLA nominal / real | 0.038 / **0.009** (`:129-130`) | 0.038 / **0.015** (`:280`) | 3.8% / **1.5%** |
| GSA nominal / real | 0.0405 / **0.011** (`:143-144`) | 0.0405 / **0.013** (`:235`) | 4.05% / **1.6%** |
| CDC nominal | 0.04 | 0.04 | 4.0% |

**Orchestration** (`runSpec`, `:575-668`): `single`; `pipeline` ("Flex then Fix") switches at age 75 (default) and bisects the phase-1 IWR so that annuity income on the residual pot matches drawdown income at the switch; `parallel` ("Flex and Fix") splits 40% to a GLA and 60% to drawdown (`:325, :634`).

**APV** (`computeAPV`, `:515-533`): \(\mathrm{APV}_{\text{inc}}=\sum_t {}_t p_x\,\mathrm{DF}_t\,W_t\), \(\mathrm{APV}_{\text{beq}}=\sum_t ({}_t p_x-{}_{t+1}p_x)\,\mathrm{DF}_t\,B_t\), both also reported divided by \(V_0\).

---

## 4. Calibration method

There is **no in-repo calibration routine** for the CMA, the kurtosis haircut, the stress vectors, or the decumulation rates. The CMA header describes a qualitative method (§2) but does not give the sample, the estimator, or a reproducible calculation. The 0.005 haircut is described as an empirical fit whose data are not in the repo. Stress-scenario returns and product pricing rates are committed constants.

The Student-\(t\) df formula \(\mathrm{df}=6/k+4\) is the standard moment-matching rule for excess kurtosis \(k=6/(\mathrm{df}-4)\). That identity is used, not re-estimated, at run time.

---

## 5. Simulation steps, RNG and seeding

1. The UI reads CMA, persona, inflation, path count and up to three strategies (`runSimulation`, `app.js:3090-3116`).
2. `worker.js` splits the path count into chunks and starts one `sim-worker.js` per chunk, up to 8 workers.
3. Each sub-worker seeds **xoshiro128+** from

\[
\texttt{setSeed}((0\texttt{xDEADBEEF} \oplus (\texttt{chunkStart}\times 2654435761)) \texttt{ >>> } 0)
\]

(`sim-worker.js:134-135`). The seed expansion is SplitMix32-style (`:20-35`). Uniforms are `result / 4294967296` (`:44`).
4. Because `chunkStart = w * chunkSize` and `chunkSize = ceil(simCount / numWorkers)`, **the partition — and therefore the set of paths — depends on the machine's `hardwareConcurrency`**. The same seed and path count will not reproduce across machines with a different core count. `novsim` later fixed this with block seeding independent of worker count; this repo does not.
5. Within a chunk, path \(s\) reuses the same shock stream for every strategy, except where a strategy's TE triggers extra `rand_t_fast` draws (§3.3).
6. Results are Float32 path buffers, assembled and sorted in the coordinator, then read at the requested percentile.

The optimiser uses unseeded `Math.random()` and is not reproducible.

Decumulation is fully deterministic given the context and spec (no RNG).

Monte Carlo standard error is not reported. At \(N=10{,}000\), \(\sqrt{p(1-p)/N}\) is about ±0.005 at \(p=0.5\).

---

## 6. Checks run for this doc

- Enumerated both committed correlation matrices with NumPy `eigvalsh`. Minimum eigenvalue **−0.12102** for both vintages; matrices are symmetric; they are identical to each other. This confirms the `novsim` finding and is why `getRobustCholesky` has to shrink.
- Confirmed there is no test directory and no `package.json` (no unit or regression tests).
- Confirmed the money-market column of `RHO` is all zeros off-diagonal (`app.js:3303-3324`), unlike `cmas.js`.
- No full browser Monte Carlo was re-run here (the engine is a web-worker app; `novsim` already reproduced the JS paths under the Novara shrink).

---

## 7. Outputs

| Output | Content |
|---|---|
| Projection fan | Lower / median / upper real pot by month, at the confidence slider (default 90%), plus a results table vs the first strategy |
| VFM table | Median terminal pot and P(top) / P(bottom) in the peer set |
| Stress view | Instant impact per scenario for the left and right portfolios |
| Optimiser chart | Cloud, seven frontier portfolios F1…F7, rounded weights, overlay of provider and comparator points |
| Decumulation view | Yearly records (income, pot, bequest, survival) and APVs for each preset (and any custom specs in `localStorage`) |
| Nothing is written to disk | There is no CLI and no export of path files in this repo |

---

## 8. Validation present

- **Unit or regression tests: none.**
- **No** golden Monte Carlo, **no** analytic identity tests, **no** PSD report, **no** backtest of the CMA against realised returns, **no** mortality-table checksum.
- A comment in `mathUtils.js:66-68` records a past truthy-check bug on zero correlations, which is fixed in that file. The same truthy pattern is still used for alpha and TE in `interpolateWeights` (`app.js:3076-3081`) and `getActiveStrategies` (`:2983-2984`): a genuine zero is harmless (it becomes 0 anyway), but a very small non-zero would also be dropped only if it were falsy, which it is not.
- Reproducibility across browsers is claimed in comments ("identical strategies produce identical simulation paths", `sim-worker.js:14-17`) but that claim fails when worker counts differ (§5).

---

## 9. Known limits and bugs noticed

1. **Correlation matrix is not PSD.** Both vintages have minimum eigenvalue −0.121. The Monte Carlo silently shrinks off-diagonals by 11%. The UI does not disclose the repair. A Higham nearest-correlation matrix would move the input much less. Replications that skip the shrink will not match Novara.
2. **Paths depend on worker count.** Seeding by `chunkStart` means a 4-core machine and an 8-core machine do not draw the same 10,000 paths. There is no user-facing seed control (the master seed `0xDEADBEEF` is hard-coded).
3. **Optimiser `RHO` disagrees with the CMA on money markets** (all optimiser off-diagonals are 0). The two copies can drift; the file header already warns that `RHO` "must be updated separately" (`cmas.js:58-59`).
4. **Hidden kurtosis haircut** \(\exp(-0.005 k)\) on the 20-year median, not used by the optimiser or the Monte Carlo, and not exposed.
5. **Conflicting GLA/GSA real pricing rates** across the file header, `PRODUCT_TYPES` defaults, and `PRESET_SPECS` (§3.9). Presets use the `PRESET_SPECS` values.
6. **Header / code mismatches:** `personas.js` says contribution is a decimal but values and the engine use percents; decumulation comments describe a 65→90 glidepath but the code de-risks only from age 80.
7. **Extra TE draws break common random numbers** across strategies with different tracking-error patterns (`sim-worker.js:238-243`).
8. **Inflation is deterministic.** Accumulation has no withdrawals. Decumulation is deterministic (the `R_t_override` hook is unused), so sequence-of-returns risk in retirement is not simulated in this repo.
9. **S4PMA is used as a static table** with no improvement, no sex mix, and no spouse. Copyright / licence for redistributing the table is **not specified in repo**.
10. **Optimiser is unseeded.** Frontier portfolios will change from run to run.
11. **No tests** (§8). Stale audit line dates the May vintage as 2026-03-01. A 2025 CMA vintage is mentioned but absent.

---

## 10. Reusable methods

### 10.1 Student-t / Cholesky shocks and PSD repair

**What it is.** Monthly multi-asset shocks are drawn from a Student-t (df = 6/k+4, or normal if k≤0.05), scaled by \(\sqrt{(df-2)/df}\), then correlated with a Cholesky factor of the CMA correlation matrix. Because both May and March 2026 matrices are not positive semidefinite (minimum eigenvalue −0.12102, confirmed independently and in novsim), `getRobustCholesky` shrinks off-diagonals by 1% per step until the factor exists. That is about an 11% shrink (novsim: `psd_blend` 0.11, Frobenius ~0.94). novsim’s default is Higham nearest-correlation repair instead, which would move the matrix by ~0.147; `novara_shrink` is the matching option.

**Where else it applies.** Any multi-asset Monte Carlo (novsim already ports this). The same PSD-repair step is needed wherever these CMAs, or any other estimated correlation, are factored. Novara-Lite *displays* the same May 2026 matrix but does not use it in its two-fund path generator.

**Known pitfalls.** The shrink is silent in the UI. The optimiser’s `RHO` table zeros money-market off-diagonals, unlike `cmas.js` (0.10–0.25), so two “official” correlation sources disagree. A hidden kurtosis haircut \(\exp(-0.005 k)\) is also applied to the 20-year median, which is easy to miss in a port.

### 10.2 Block / chunk seeding

**What it is.** Each simulation chunk is seeded from `MASTER_SEED` (0xDEADBEEF) XOR `chunkStart * 2654435761`, then expanded with SplitMix32 into xoshiro128+. Paths are Float32.

**Where else it applies.** Any parallel Monte Carlo that must not depend on worker count. novsim’s design (`SeedSequence(seed, spawn_key=(block, stream))` in blocks of 1,000) is the corrected form of this idea. Novara-Lite uses a simpler per-persona × strategy `mulberry32` seed, which *is* independent of workers because it is single-threaded.

**Known pitfalls.** Because the seed includes `chunkStart`, the same `MASTER_SEED` does **not** give identical paths when the worker count (and therefore the chunking) changes. A fixed seed is not enough for bit-stability in this repo.

### 10.3 Glidepath interpolation

**What it is.** `interpolateWeights` linearly interpolates a strategy’s asset weights between the last defined point at or above the years-to-retirement, and the next.

**Where else it applies.** Novara-Lite reuses the same idea, but first collapses each point to a growth-share scalar and interpolates that scalar (mathematically the same as interpolating then summing, because the share is linear). Retirement-Salary-Designer uses a related piecewise-linear interpolation, on lifestyle sliders rather than asset weights.

**Known pitfalls.** None specific to the interpolator itself. The decumulation header comment (“glidepath age 65→90”) does not match the code, which only de-risks from age 80 to 0% equity at 90.

### 10.4 Deterministic decumulation engines

**What it is.** Annual, mostly deterministic product engines (individual drawdown with bisected IWR, GLA, CDC with a funding-ratio adjustment of speed 1/3 capped at ±5%, GSA, GLWB, hybrids), sharing an S4PMA qx table and an APV at a common discount rate.

**Where else it applies.** Directly reused, and in places deliberately revised, by Novara-Lite’s reference implementation (`js/app/sample-data.js`). novsim’s drawdown job is the Python port of the accumulation/decumulation core.

**Known pitfalls.** The `R_t` stochastic hook is wired but not active. GLA/GSA real pricing rates conflict across `PRODUCT_TYPES`, `PRESET_SPECS` and a header comment; presets follow `PRESET_SPECS`. Lite’s review recommended bringing its GSA money-back formula and solved GLWB fee back into this engine. There are no tests in this repo.

### 10.5 Instantaneous stress scenarios

**What it is.** 23 named market episodes applied as an instantaneous per-asset shock to a portfolio, not a pathwise stress.

**Where else it applies.** Ported verbatim into Novara-Lite’s demo dataset and into novsim’s tool 6 (`stress.apply`). The same table can feed any portfolio stress report.

**Known pitfalls.** Shocks are applied once, not as a path. Calibration of each named episode lives in comments, not in an estimator.

## 11. Run recipe

The app is a static ES-module site (no npm package, no build step). A local HTTP server is required because of module imports.

```bash
git clone https://github.com/Tangerineman83/Novara && cd Novara
python3 -m http.server 8000
# open http://localhost:8000/
```

- **Entry:** `index.html` loads `js/app.js`. Projection: `runSimulation()` → worker `RUN_SIMULATION`. VFM: `runVFM()`. Optimiser: `window.optRunOptimizer()`. Decumulation: `DecumEngine.runAllSpecs` / `runSpec` from `js/decum-engine.js`.
- **Inputs to edit:** the CMA and strategy dropdowns, persona fields, `#setting-sim-count` (default 10000), `#setting-inflation` (default 2.5), and the confidence slider (default 90%).
- **To make the Monte Carlo reproducible:** seed by a (block, path) index that does not depend on worker count, as later done in `novsim`. That is a code change and has not been made in this repo.
- **To match Novara's shocks in another language:** use xoshiro128+ with the SplitMix32 expansion and the 11% off-diagonal shrink, not an independent RNG or Higham repair.

## 12. Parameters marked not specified in repo

- The numerical derivation of each CMA \(r,v,k\) and each stress-scenario return (the qualitative method is in the `cmas.js` header; the data and estimator are not).
- The fit sample behind the 0.005 kurtosis haircut.
- Why the optimiser's money-market correlations were zeroed.
- The 0.3 money-back rundown factor, the 0.707 in `gSort`, and the 0.15 non-CDC/GSA adjustment speed.
- Which published S4PMA / CMI_2021 file and scaling factors were digitised.
- How the EQ implementation alpha/TE figures and the CDC 0.38% charge were obtained, beyond the comments.

