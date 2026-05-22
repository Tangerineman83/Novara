<!--
================================================================================
NOVARA CMA COMMENTARY FILE — AUTHORING INSTRUCTIONS
================================================================================

PURPOSE
This file contains all per-asset commentary for every CMA set published in the
Novara app. The app parses this file at runtime to display a rich detail panel
when a user clicks any asset class in the Markets tab.

DO NOT alter the delimiter format (---), the header field names (cma_id:,
asset_id:), or the file encoding (UTF-8). Any structural change will silently
break commentary display for that block.

================================================================================
BLOCK STRUCTURE
================================================================================

Each commentary block must follow this exact format:

---
cma_id: [CMA set identifier — see IDENTIFIERS section below]
asset_id: [Asset class identifier — see ASSET IDs section below]
---

[Commentary content here]

The app matches on BOTH cma_id AND asset_id simultaneously. A block with a
mismatched cma_id will not display for the wrong CMA, and a block with a
mismatched asset_id will not display for the wrong asset. If no match is found,
the panel displays: "No commentary available for this asset in the selected CMA."

================================================================================
CMA SET IDENTIFIERS  (cma_id field)
================================================================================

Use exactly one of these identifiers in the cma_id field:

  novara_cma_2026_05   →  May 2026 — Global Equilibrium (Institutional)
  novara_cma_2026_03   →  March 2026 — Global Equilibrium (Institutional)

When a new CMA set is published, Novara Research will confirm the new identifier
to use (format: novara_cma_YYYY_MM). Do not invent identifiers — they must match
the cma_id field in the corresponding config entry exactly.

================================================================================
ASSET CLASS IDENTIFIERS  (asset_id field)
================================================================================

Use exactly one of the identifiers below. The right column shows the display
name as it appears in the app.

  EQUITIES
  usEq              →  US Equity
  devEq             →  Dev Europe Equity
  emEq              →  EM Equity
  jpnEq             →  Japan Equity
  ukEq              →  UK Equity
  apacEq            →  Dev APAC (ex-Japan)

  REAL ASSETS
  globalReits       →  Global REITs
  realEstateDirect  →  Real Estate (Direct)
  infrastructure    →  Infrastructure

  ALTERNATIVES
  privEq            →  Private Equity
  listedAlts        →  Listed Alts
  digitalAssets     →  Digital Assets

  CREDIT
  privCredit        →  Private Credit
  globalHighYield   →  Global High Yield
  emDebt            →  EM Debt
  igCredit          →  IG Credit
  sdCredit          →  Short Duration Credit

  SOV & CASH
  globalSov         →  Global Sovereign
  inflLinked        →  Inflation Linked
  moneyMkt          →  Money Markets

================================================================================
SUPPORTED MARKDOWN
================================================================================

Use only this subset within commentary blocks. Other syntax displays as raw text.

  ## Section heading       (level 2 only — do not use #, ###, or deeper)
  **bold text**            (inline bold)
  - bullet item            (unordered list, single level only)
  | Col | Col |            (pipe tables — include header row and --- separator)
  Blank line               (paragraph break)

DO NOT use: hyperlinks, images, nested lists, code blocks, italics, or HTML tags.

================================================================================
REQUIRED SECTIONS PER BLOCK
================================================================================

Each block should contain these four sections in order:

  ## Valuation & Return Outlook    (2–5 sentences; explain the return assumption)
  ## Key Risks                     (3–5 bullet points)
  ## Economic Indicators           (pipe table: Indicator | Value | Context)
  ## Positioning                   (1–2 sentences; conviction statement)

The Economic Indicators table values must match the corresponding JSON
quantitative data exactly — both are displayed side-by-side in the panel.

================================================================================
UPDATING AN EXISTING CMA SET
================================================================================

To update commentary for an existing CMA: locate the block with the matching
cma_id and asset_id and edit the content directly. Do not change the delimiter
or header lines.

To add a new CMA set: append all 20 asset blocks at the bottom of this file
using the new cma_id confirmed by Novara Research. Existing blocks are unaffected.

================================================================================
COVERAGE REQUIREMENT
================================================================================

Each CMA set requires exactly 20 blocks — one per asset class listed above.
The app displays "No commentary available" for any asset with a missing block.
Missing blocks do not cause errors but incomplete CMA sets should not be
published to production.

================================================================================
-->

---
cma_id: novara_cma_2026_05
asset_id: usEq
---

## Valuation & Return Outlook

The S&P 500 Shiller CAPE stands at approximately **40.5x** as at May 2026 — the second-highest sustained level in over 140 years of market data, exceeded only by the dot-com peak of 44.2x in December 1999. Our **6.5% central return assumption** reflects this constraint explicitly: a valuation drag of **-3.3% per annum** arising from assumed partial mean-reversion toward a normalised 28–30x CAPE over the forecast horizon, partially offset by solid earnings growth of **8.5%** (underpinned by AI-driven productivity and strong corporate margins) and a dividend yield of **1.3%**. A 7.0% upper scenario is defensible if one places low weight on CAPE-based models or assumes structurally higher equilibrium valuations in an AI-intensive economy.

## Key Risks

- **Valuation compression**: A reversion toward 25x CAPE over 10 years reduces annualised returns by approximately 180bps versus our central case; a faster reversion to the 140-year median of 16x would be catastrophic for near-term holders.
- **Earnings disappointment**: AI-driven productivity gains are partially priced in at current multiples; any shortfall in monetisation or capital efficiency would weigh directly on growth assumptions.
- **Dollar reversal**: A sustained USD depreciation reduces returns for non-USD investors and may signal a rotation toward non-US markets; also relevant in a dollar reserve crisis tail scenario.
- **Higher-for-longer rates**: The Iran War has introduced persistent inflationary pressure, reducing the equity risk premium via higher risk-free rates — compressed ERP of 4.2% versus a long-run 5.5% benchmark leaves limited buffer.

## Economic Indicators

|Indicator            |Value|Context                                                |
|---------------------|-----|-------------------------------------------------------|
|CAPE (Shiller P/E)   |40.5x|95th percentile vs. 140yr history                      |
|Forward P/E          |21.2x|~15% premium to 15-year average of 18.4x               |
|Earnings Growth (fwd)|8.5% |Above-trend; AI and margin tailwinds partially priced  |
|Dividend Yield       |1.3% |Near historic lows; buybacks dominate capital return   |
|Implied ERP          |4.2% |Compressed vs. long-run 5.5%; limited valuation cushion|

## Positioning

**Medium conviction.** Strategically retain a core US equity allocation given long-run earnings quality and AI productivity optionality, but treat 7.0% as an optimistic scenario rather than an unbiased estimate; a 6.5% central case is the more defensible anchor for long-horizon planning.


---
cma_id: novara_cma_2026_05
asset_id: devEq
---

## Valuation & Return Outlook

Developed European equities offer a compelling valuation case relative to the US. CAPE ratios across the Eurozone and UK average in the **14–18x range**, materially below the long-run fair value implied premium to US. Our **7.2% return assumption** reflects this valuation tailwind, with earnings growth of approximately **6.5%** supported by the ongoing fiscal expansion in defence and energy infrastructure, and a materially higher dividend yield of **3.2%** than US. The Iran War’s direct energy import cost burden is a near-term headwind, but 20-year equilibrium returns are not materially altered by a transient commodity shock.

## Key Risks

- **Energy import exposure**: Europe imports the majority of its energy needs; Strait of Hormuz disruption has triggered the most aggressive hawkish repricing of ECB policy in the current cycle, compressing near-term equity multiples.
- **Structural growth deficit**: Demographics, energy transition costs, and regulatory drag continue to constrain European GDP growth relative to the US; the earnings growth premium does not fully close the gap.
- **Currency headwind**: For USD-based investors, EUR/GBP weakness versus a structurally stronger dollar reduces USD-equivalent returns; FX hedging costs absorb a meaningful portion of the valuation premium.
- **Political fragmentation**: Populist political risk in France, Italy, and the broader Eastern periphery creates periodic tail events disproportionate to the fundamental economic impact.

## Economic Indicators

|Indicator                 |Value|Context                                                     |
|--------------------------|-----|------------------------------------------------------------|
|CAPE (Eurozone blended)   |15.8x|~60% discount to US on same basis                           |
|Dividend Yield            |3.2% |Structural premium; payout culture differs from US          |
|Earnings Growth (fwd)     |6.5% |Supported by fiscal infrastructure spend                    |
|Real GDP Growth (10yr fwd)|1.2% |Structurally below US; demographic headwind                 |
|Implied ERP               |6.1% |Attractive vs. US; partially reflects political risk premium|

## Positioning

**Medium-high conviction.** The valuation case is one of the clearest across global equity markets; the premium return assumption of 7.2% versus US 6.5% is grounded in measurable discount to fair value, not speculation.


---
cma_id: novara_cma_2026_05
asset_id: emEq
---

## Valuation & Return Outlook

Emerging market equities offer the highest long-run return potential in the equity universe, anchored by superior GDP growth trajectories, structurally improving corporate governance, and — in aggregate — reasonable valuations. Our **central return assumption of 8.5–9.0%** (with 9.1% as an upper scenario) reflects an earnings growth premium of approximately **9–11%** in nominal local currency terms, partially diluted by structural FX and political risk. The Iran War introduces meaningful near-term headwinds: Asian energy import costs are rising sharply, the higher-for-longer US rate environment creates EM sovereign and corporate refinancing pressure, and the stronger dollar compresses USD-equivalent returns. These are real but transient factors for a 20-year horizon.

## Key Risks

- **US dollar strength**: Higher-for-longer US rates and safe-haven flows into USD post-Iran War compress USD-equivalent EM returns and raise refinancing costs for EM USD-denominated borrowers.
- **Commodity import shock**: The energy-intensive manufacturing base of EM Asia faces direct cost inflation from the oil price surge; margin compression is a near-term earnings drag.
- **China structural risk**: Regulatory unpredictability, property sector stress, and the ongoing technology decoupling from the US create idiosyncratic risks beyond the headline index.
- **EM sovereign stress**: A subset of frontier and lower-middle EM economies face genuine debt sustainability challenges in a higher-rate environment, with contagion risk to the broader EM complex.

## Economic Indicators

|Indicator                   |Value|Context                                                        |
|----------------------------|-----|---------------------------------------------------------------|
|MSCI EM Forward P/E         |12.1x|~43% discount to S&P 500; cheap in isolation and relative      |
|Nominal GDP Growth (10yr)   |9.5% |Blended EM weighted; India and SE Asia dominant drivers        |
|Dividend Yield              |2.8% |Moderate; capital retention rates rising in EM Asia            |
|USD Debt / GDP (EM ex-China)|38%  |Refinancing vulnerability in higher-rate environment           |
|ERP Implied                 |7.4% |Highest in equity universe; risk premium appropriately elevated|

## Positioning

**Medium conviction.** Structurally attractive over a 20-year horizon; near-term conditions warrant caution and the central return assumption should be anchored at 8.5–9.0% rather than 9.1% until the rate and energy shock environment stabilises.


---
cma_id: novara_cma_2026_05
asset_id: jpnEq
---

## Valuation & Return Outlook

Japan equity has undergone a genuine structural re-rating over the past three years, driven by the TSE’s corporate governance reform programme, systematic unwinding of cross-shareholdings, and a return to positive nominal earnings growth after three decades of deflation. Our **7.0% return assumption** reflects earnings growth of approximately **7.5%** in yen terms, a dividend yield of **2.3%** (rising as payout ratios normalise toward Western standards), and a modest valuation discount that narrows as governance reform matures. Japan’s near-total dependence on Persian Gulf oil imports is an acute near-term headwind from the Iran War, though historical experience (1973, 1979, 1990) shows yen weakness during oil shocks provides a partial export competitiveness offset.

## Key Risks

- **Yen currency risk**: For non-JPY investors, the structural yen weakness driven by the BOJ’s still-accommodative relative stance absorbs a meaningful portion of JPY-denominated returns; hedging costs are non-trivial.
- **Governance reform stalls**: The corporate transformation story is real but not irreversible; political pressure to slow cross-shareholding unwinding or retreat on shareholder return requirements would undermine the earnings uplift.
- **Oil import shock**: Japan imports nearly 100% of its energy, with the Strait of Hormuz the dominant shipping lane; a prolonged Iran conflict directly damages corporate margins and consumer spending.
- **Valuation premium risk**: CAPE for Japan has risen materially on the back of the reform re-rating; the buffer to further multiple compression is narrower than in 2022.

## Economic Indicators

|Indicator                |Value        |Context                                               |
|-------------------------|-------------|------------------------------------------------------|
|CAPE (Topix)             |22.1x        |Re-rated from ~14x in 2022; still below US            |
|Dividend Yield           |2.3%         |Rising as payout ratios normalise; structural tailwind|
|ROE (12m fwd)            |9.8%         |Highest in Japan’s modern corporate history           |
|Cross-Shareholding Unwind|~35% complete|Structural earnings release still ongoing             |
|Earnings Growth (fwd)    |7.5%         |Governance and reflation driven                       |

## Positioning

**Medium conviction.** The structural reform story is credible and partially demonstrated in earnings data; the oil import risk warrants slightly lower near-term weight, but the 7.0% 20-year assumption is robust.


---
cma_id: novara_cma_2026_05
asset_id: ukEq
---

## Valuation & Return Outlook

UK equity remains one of the cheapest developed markets globally on virtually all valuation metrics, a persistent discount that reflects structural concerns — low GDP growth, weak domestic investment, post-Brexit trade friction, and the FTSE 100’s concentration in value sectors (energy, mining, financials, consumer staples). Our **6.5% return assumption** is cautiously positioned relative to global DM peers, anchored by a **dividend yield of 3.6%** (the primary driver of return), modest real earnings growth of **2.5%**, and a small positive valuation re-rating contribution if the discount narrows over time. The FTSE 100’s heavy energy sector weighting is, paradoxically, a near-term beneficiary of the Iran War oil price surge.

## Key Risks

- **GBP tail risk**: Sterling remains the primary source of kurtosis (fat-tail risk) for UK equity — ERM 1992 (-15%), Brexit 2016, and the 2022 Truss LDI crisis all produced outsized GBP-driven drawdowns disproportionate to fundamental earnings damage. This is why the kurtosis assumption has been raised to 2.0 from the original 1.60.
- **Structural growth deficit**: UK productivity growth, business investment, and graduate retention have all weakened post-Brexit; the fundamental earnings growth component of the return is the weakest across DM equities.
- **Sector concentration**: The FTSE 100 is poorly positioned for the AI and technology growth themes that dominate US and parts of European indices; return generation relies heavily on commodity and financial cycles.
- **Political and fiscal risk**: High public debt, NHS funding pressures, and potential further constitutional stress (Scotland) create an idiosyncratic political risk premium.

## Economic Indicators

|Indicator                   |Value|Context                                         |
|----------------------------|-----|------------------------------------------------|
|CAPE (UK)                   |13.8x|Deep discount to global DM; partially structural|
|Dividend Yield              |3.6% |Highest in DM; income-dominant return profile   |
|Real Earnings Growth (fwd)  |2.5% |Structurally weak; post-Brexit productivity drag|
|GBP Volatility (1yr implied)|8.4% |Elevated vs. EUR; reflects political uncertainty|
|Implied ERP                 |6.8% |High; risk premium reflects structural concerns |

## Positioning

**Medium conviction.** The income yield provides a structural floor; the valuation case is compelling on paper but the discount is partly justified by fundamental weaknesses. Kurtosis of 2.0 replaces the previous 1.60, correcting an understatement of GBP and political tail risk.


---
cma_id: novara_cma_2026_05
asset_id: apacEq
---

## Valuation & Return Outlook

Developed APAC ex-Japan is dominated by Australia, Singapore, and Hong Kong, with smaller weights in New Zealand and Korea. The composite offers a **7.2% return assumption** supported by Australia’s commodity export leverage (a beneficiary of sustained commodity price inflation), Singapore’s financial hub positioning in the AI and digital economy transition, and Hong Kong’s proximity to mainland China growth. The correlation with EM equity at 0.80 is the highest cross-equity pair in the matrix, reflecting the China-adjacent economic exposure that characterises the region.

## Key Risks

- **China-adjacent risk**: The most significant tail risk for the region is a China-Taiwan escalation or a sharp China growth slowdown — both would transmit rapidly through trade, property, and financial linkages to Hong Kong and Singapore.
- **Energy import shock**: Australia is a net energy exporter and benefits from higher LNG prices (particularly with the Strait of Hormuz disruption), but Singapore and other APAC nations face direct import cost pressures.
- **AUD/SGD currency risk**: Currency volatility for non-local investors is a meaningful source of additional variance; the region’s FX basket is highly commodity and risk-appetite sensitive.
- **Property sector stress**: Australia’s residential property market remains at extreme valuations by international comparison; a correction would impair consumer spending and bank profitability.

## Economic Indicators

|Indicator                 |Value          |Context                                                       |
|--------------------------|---------------|--------------------------------------------------------------|
|CAPE (APAC DM blended)    |16.2x          |Moderate; below US, close to European levels                  |
|Dividend Yield            |3.1%           |Australia dominates; franking credits enhance domestic returns|
|Real GDP Growth (10yr fwd)|2.1%           |Supported by immigration; Australia above regional average    |
|LNG Export Premium (AUS)  |Significant    |Iran War direct beneficiary via spot LNG prices               |
|China Trade Exposure      |~25% of exports|Primary tail risk channel for the region                      |

## Positioning

**Medium conviction.** Reasonable valuation and income yield; return assumption is well-supported but the China-adjacent tail risk and high EM correlation justify maintaining volatility at 18.5% and kurtosis at 3.10.


---
cma_id: novara_cma_2026_05
asset_id: globalReits
---

## Valuation & Return Outlook

Global listed REITs offer a **6.8% return assumption** over a 20-year horizon, underpinned by a current dividend yield of approximately **4.2%** and real rental income growth of **2.0%** per annum. The asset class carries a significantly higher correlation to listed equities than direct real estate (0.75 with US equity) and its daily liquidity means rate movements transmit immediately into valuations — unlike direct real estate, which marks quarterly. The higher-for-longer interest rate environment driven by the Iran War is a structural headwind to REIT valuations in the near term, but over a 20-year horizon, income yield is the dominant return driver and that yield has improved as prices have adjusted.

## Key Risks

- **Rate sensitivity**: REITs are among the most interest-rate-sensitive listed asset classes; the hawkish repricing of G10 rates following the Iran War oil shock has directly compressed REIT multiples in 2026.
- **Office and retail structural disruption**: Post-COVID remote working trends and e-commerce penetration continue to impair fundamental cash flows for office and retail sub-sectors; the index composition matters significantly.
- **Leverage amplification**: REITs are structurally levered; rising debt costs compress distributable income and trigger refinancing risk in higher-rate regimes.
- **Liquidity mismatch illusion**: Unlike direct real estate, listed REITs offer daily liquidity but behave like equities in a crisis — the 2020 COVID crash saw REITs fall -30%, far beyond fundamental property value moves.

## Economic Indicators

|Indicator                   |Value|Context                                                   |
|----------------------------|-----|----------------------------------------------------------|
|REIT Dividend Yield (global)|4.2% |Well above 10-year average of 3.2%; rate reset opportunity|
|REIT Premium/Discount to NAV|-8%  |Trading at discount; valuation reset creates entry point  |
|Real Rental Growth (fwd)    |2.0% |Logistics, data centres and residential driving growth    |
|Interest Coverage Ratio     |2.8x |Adequate but declining; refinancing pressure building     |
|REIT/Equity Correlation     |0.75 |High; limited diversification benefit in equity drawdowns |

## Positioning

**Medium conviction.** Attractive income yield at current prices and a NAV discount provide a reasonable entry point; the rate headwind is acknowledged but is a near-term consideration for a 20-year assumption. Volatility of 19.0% is appropriate and should not be reduced.


---
cma_id: novara_cma_2026_05
asset_id: realEstateDirect
---

## Valuation & Return Outlook

Direct real estate offers a **6.7% return assumption**, composed of an income yield of approximately **4.5%** on a stabilised, diversified global portfolio, real capital growth of **1.5%**, inflation linkage of **0.5%** through lease indexation, and an illiquidity premium of **0.2%** over listed equivalents. The asset class benefits from appraisal-based valuations that smooth quarterly returns, which is both a feature (lower reported volatility) and a risk (the smoothing conceals the true economic volatility and tail risk, which is materially higher than the reported 14% standard deviation implies).

**Critical methodology note**: The kurtosis parameter has been raised from **1.10 to 1.80** in this CMA to partially correct for the well-documented smoothing artefact of appraisal-based returns. The true economic kurtosis is higher still — the stress scenarios in the model (2008 GFC: -22% direct RE; 1990 Japan: -40%) are inconsistent with a k=1.10 distribution and confirm that the reported parameter understates tail risk. Users modelling extreme scenarios should treat direct real estate tail risk as closer to that of global REITs than to the reported smooth return series.

## Key Risks

- **Smoothing artefact**: Appraisal-based quarterly marks systematically understate true economic volatility and kurtosis; drawdowns in stress scenarios are materially worse than historical reported returns suggest.
- **Office and retail structural disruption**: Secular shifts in occupancy demand for office (-30% to -40% valuation resets in CBD office in some markets) and retail remain ongoing; portfolio composition is critical.
- **Refinancing risk**: Higher-for-longer rates directly compress capitalisation rates and increase the cost of debt on floating-rate facilities; many 2020–21 vintage acquisitions face negative leverage.
- **Illiquidity in stress**: Direct real estate cannot be sold quickly in a market dislocation; the illiquidity premium can turn into an illiquidity trap in a forced-sale environment.

## Economic Indicators

|Indicator                    |Value                     |Context                                              |
|-----------------------------|--------------------------|-----------------------------------------------------|
|Stabilised Income Yield      |4.5%                      |Up from 3.8% in 2021; rate reset has improved entry  |
|Real Capital Growth (fwd)    |1.5%                      |Logistics, living sectors, data centres above average|
|Inflation Linkage            |0.5%                      |Lease indexation varies significantly by jurisdiction|
|Office Vacancy (global prime)|18%                       |Elevated post-COVID; structural, not cyclical        |
|Reported vs. True Kurtosis   |1.10 reported / ~1.80 adj.|Smoothing artefact — see methodology note above      |

## Positioning

**Medium conviction.** Return assumption is well-supported by income yield; the kurtosis correction to 1.80 is a firm recommendation. Users should be aware that reported smooth return series significantly understate the economic tail risk of this asset class.


---
cma_id: novara_cma_2026_05
asset_id: infrastructure
---

## Valuation & Return Outlook

Infrastructure offers a **7.5% return assumption** on a gross basis, consistent with JPMorgan’s LTCMA range of 6.5–7.1% after fees for global core infrastructure. The asset class benefits from contractual inflation linkage, regulated or quasi-regulated cash flows, and long asset lives that match institutional liability profiles. Critically, the Iran War and associated global geopolitical fragmentation represent a **structural tailwind** for infrastructure: governments across G10 are materially accelerating commitments to energy security infrastructure (LNG terminals, grid interconnection, strategic reserves), defence-adjacent supply chains, and digital infrastructure. This policy spending acceleration may justify a modest upward revision toward 7.5–8.0% at the next formal CMA refresh.

## Key Risks

- **Regulatory risk**: Regulated utilities are exposed to political interference in pricing reviews — a persistent risk in periods of consumer energy price stress such as the current one.
- **Construction and technology risk**: Greenfield infrastructure (renewables, hydrogen, battery storage) carries materially higher technology and cost-overrun risk than brownfield assets; illiquidity premium may undercompensate.
- **Rising cost of capital**: Higher risk-free rates reduce the present value of long-dated, predictable cash flows; infrastructure valuations are rate-sensitive in the near term despite the long-run income underpinning.
- **Climate transition obsolescence**: Some existing infrastructure faces stranded asset risk as the energy transition accelerates; valuation of fossil fuel-linked infrastructure warrants specific scrutiny.

## Economic Indicators

|Indicator                        |Value           |Context                                                       |
|---------------------------------|----------------|--------------------------------------------------------------|
|Income Yield (core)              |4.8%            |Contractual; inflation-linked in majority of assets           |
|Real Asset Growth                |1.5%            |Volume and pricing growth in regulated sectors                |
|Inflation Linkage                |0.8%            |Direct CPI/RPI linkage in most regulated contracts            |
|Illiquidity Premium              |0.4%            |Over listed equivalents; wider for greenfield assets          |
|G10 Infrastructure Spend Pipeline|$2.1tn (fwd 5yr)|Iran War and energy security acceleration; structural tailwind|

## Positioning

**Medium-high conviction.** One of the most compelling structural allocations in the current environment; the inflation linkage, policy tailwind, and defensive cash flow profile make infrastructure a core holding. Flag for upward return revision at Q3 2026 review.


---
cma_id: novara_cma_2026_05
asset_id: privEq
---

## Valuation & Return Outlook

Private equity offers a **10.5% return assumption** on a gross basis, consistent with JPMorgan’s 2026 LTCMA of 10.2–10.3%, reflecting a favourable exit environment and above-average growth opportunities in technology, AI infrastructure, and healthcare. **On a net-of-fee basis, investors should anchor expectations at 7.5–8.5%** depending on manager quality, strategy, and vintage — this is the economically relevant figure for LP net returns and should be used in long-term planning models rather than the gross figure.

**Smoothing artefact warning**: The kurtosis parameter of 1.90 reflects smoothed NAV-based reported returns and materially understates the true economic tail risk. Academic research (Stafford, 2022) finds that PE returns replicated through levered small-cap public equity exhibit substantially higher kurtosis. The stress scenarios in this model are internally inconsistent with k=1.90 — the 2008 GFC shows a -28% PE return, which is far beyond what a k=1.90 distribution would predict as a plausible outcome. Users must not interpret the low kurtosis as evidence that private equity is a low-tail-risk asset.

## Key Risks

- **Illiquidity and J-curve**: Committed capital is locked for 7–12 years; the J-curve effect means early vintage losses before distributions commence; inappropriate for investors with near-term liquidity needs.
- **Valuation opacity**: NAV marks are quarterly and manager-determined; true mark-to-market losses in a crisis are only revealed at exit or in secondary market transactions, typically at 20–40% discounts to reported NAV.
- **Leverage amplification**: PE portfolios are typically 3–5x levered; rising interest rates directly compress portfolio company interest coverage and compress exit multiples simultaneously.
- **AI capital concentration risk**: Current vintage funds are heavily weighted toward AI infrastructure and enabling technology; concentration in a single themematic wave creates vintage-specific risk.

## Economic Indicators

|Indicator              |Value|Context                                              |
|-----------------------|-----|-----------------------------------------------------|
|Base Return Gross      |10.5%|JPMorgan LTCMA benchmark: 10.2%; consistent          |
|Illiquidity Premium    |3.0% |Over equivalent-risk public equity; manager-dependent|
|Alpha Estimate         |1.5% |Operational value creation, above index selection    |
|Fee Drag (typical 2+20)|-4.0%|Net return to LP significantly below gross           |
|Reported Kurtosis      |1.90 |Smoothing artefact; true economic k materially higher|

## Positioning

**Medium conviction** on gross returns. **High conviction on the smoothing disclosure** — the 10.5% gross figure should never be presented to investors or plan members without the corresponding 7.5–8.5% net-of-fee range. The kurtosis parameter is flagged as a known understatement.


---
cma_id: novara_cma_2026_05
asset_id: listedAlts
---

## Valuation & Return Outlook

Listed alternatives — encompassing liquid hedge fund strategies, systematic trend-following, equity long/short, global macro, and multi-strategy funds — carry a **return assumption of 6.4%**, which should be treated as an upper-end estimate conditional on an optimistic view of manager alpha generation. JPMorgan’s 2026 LTCMA places event-driven hedge funds at 5.2% and macro hedge funds at 4.1%, suggesting that 6.4% is only achievable for a growth-tilted alternatives sleeve with meaningful equity long/short exposure or systematic trend-following. A more conservative composite estimate of **5.5–6.0%** is appropriate unless the portfolio composition is specified and skewed toward higher-returning strategies.

## Key Risks

- **Alpha erosion**: Hedge fund alpha generation has been under secular pressure from market efficiency improvements, HFT crowding, and fee compression driving manager consolidation; the 6.4% return is more demanding to achieve than its apparent modesty suggests.
- **Strategy composition risk**: The aggregate return is highly sensitive to the underlying strategy mix — a macro/trend-following tilt behaves very differently from an equity long/short tilt, especially during rate shock periods.
- **Fee drag**: Liquid alternatives typically charge 1.5–2.0% management fees with performance fees; the net-of-fee return to the investor may be 150–200bps below the gross figure.
- **Correlation instability**: Correlations to public equity markets are unstable and tend to rise in equity drawdowns — the diversification benefit appears most reliable in slow bear markets, not in sharp systemic sell-offs.

## Economic Indicators

|Indicator                  |Value|Context                                                                |
|---------------------------|-----|-----------------------------------------------------------------------|
|Base Return                |5.8% |Blended hedge fund composite; JPMorgan benchmark ~4.5–5.2%             |
|Illiquidity Premium        |0.3% |Minimal for daily/monthly liquidity structures                         |
|Alpha Estimate             |0.8% |Residual after fees; highly manager-dependent                          |
|Fee Drag                   |-0.5%|Net of assumed 1.5% management fee                                     |
|Equity Correlation (stress)|0.65 |Higher than normal-period estimate; diversification is regime-dependent|

## Positioning

**Low-medium conviction.** The 6.4% return assumption is at the optimistic end of the range; a disclosure of the intended strategy composition is recommended. Until composition is specified, 5.5–6.0% is the more defensible central estimate.


---
cma_id: novara_cma_2026_05
asset_id: digitalAssets
---

## Valuation & Return Outlook

Digital assets carry a **12.5% return assumption**, which must be clearly understood as a speculative structural view rather than a grounded actuarial CMA. There is no reliable academic or empirical foundation for a 20-year nominal return estimate for an asset class that: has existed in institutionally accessible form for fewer than 15 years; has experienced four peak-to-trough drawdowns exceeding 70%; has no cash flow-based valuation anchor; and operates in an evolving and uncertain regulatory environment. The 12.5% figure represents the midpoint of a distribution of plausible outcomes that spans near-zero (regulatory extinction, technology failure, displacement by CBDC) to materially higher (mainstream institutional adoption, digital gold narrative, AI payment infrastructure). It is not a probability-weighted equilibrium estimate in the sense applicable to other asset classes.

**The volatility of 48.0% is itself conservative relative to long-run Bitcoin realised volatility of 60–80%**, reflecting an assumption of progressive institutional maturation over the 20-year horizon. If this maturation does not occur, the actual distribution is significantly worse than the model implies.

## Key Risks

- **Regulatory extinction**: Coordinated G20 regulatory action, CBDC displacement, or a major exchange collapse could eliminate or severely impair the investable market; this is a genuine left-tail outcome with non-trivial probability.
- **Extreme volatility and drawdown risk**: The kurtosis of 5.50 is the highest in the file; realised drawdowns of -52% (COVID 2020) and -64% (2022 crypto winter) have both occurred within the asset class’s short history.
- **Liquidity illusion**: Market depth in digital assets can collapse rapidly; bid-offer spreads in a crisis are orders of magnitude wider than in normal conditions, making exit at modelled prices unrealistic.
- **Custody and operational risk**: Unique operational risks — key loss, exchange failure, protocol exploits — are not captured in any statistical risk parameter and represent a form of total loss risk absent from traditional asset classes.

## Economic Indicators

|Indicator                      |Value    |Context                                                    |
|-------------------------------|---------|-----------------------------------------------------------|
|Return Assumption              |12.5%    |Speculative structural view; not actuarially grounded      |
|Annualised Volatility          |48.0%    |Conservative; realised BTC vol 60–80% historically         |
|Kurtosis                       |5.50     |Highest in file; reflects extreme tail event history       |
|Max Historical Drawdown        |-84%     |BTC cycle peak-to-trough (2021–2022)                       |
|Institutional Allocation (est.)|~1–3% AUM|Still nascent; adoption curve assumption embedded in return|

## Positioning

**Low conviction — speculative allocation only.** This CMA block must carry a prominent disclosure that the return assumption is not comparable in basis or rigour to other asset classes in this file. Position sizing should reflect the extreme kurtosis and the non-zero probability of total loss; no strategic allocation above 2–3% is defensible on risk-adjusted grounds.


---
cma_id: novara_cma_2026_05
asset_id: privCredit
---

## Valuation & Return Outlook

Private credit offers a **8.2% return assumption** on a gross basis, well-anchored to current market conditions. Direct lending yields were troughing in the 8.0–8.5% range in early 2026 before the Iran War triggered a hawkish repricing; private credit spreads have since repriced toward approximately 500bps on new originations, which is yield-enhancing relative to the compressed Q4 2025 environment. This makes May 2026 a modestly better entry point than Q1 for gross return expectations. JPMorgan’s LTCMA places direct lending at 7.6%, suggesting our 8.2% carries a modest positive alpha assumption consistent with manager selectivity in the lower-middle market.

The asset class has grown from a niche middle-market product to a **$1.5–2 trillion market** broadly matching the broadly syndicated loan market in size — the first major test of the asset class through a full credit cycle is now underway.

## Key Risks

- **Credit cycle stress**: Private credit is experiencing its first meaningful full-cycle test. High-profile defaults (Pluralsight, First Brands, Tricolor) and rising PIK facility usage signal early-stage bifurcation in credit quality; default rates are projected to rise from 1.5% to 2.0% annualised by year-end 2026.
- **Covenant erosion**: Competition between private and public credit markets in 2023–25 drove documentation convergence toward broadly syndicated standards, weakening lender protections on a substantial portion of the outstanding book.
- **Leverage within the system**: Banks provide fund financing (subscription facilities, NAV facilities) to private credit managers, creating second-order leverage that is not visible in reported fund-level metrics; a credit stress event could trigger cascading calls.
- **Valuation smoothing**: Like PE, private credit marks quarterly; reported volatility (10.0%) and kurtosis (3.50 revised from 3.00) understate the true economic tail risk in a full credit cycle downturn.

## Economic Indicators

|Indicator         |Value|Context                                               |
|------------------|-----|------------------------------------------------------|
|Risk-Free Yield   |4.3% |US SOFR + term spread; base rate component            |
|Spread Income     |4.9% |Post-Iran repricing toward 500bps context             |
|Default Drag      |-0.7%|KBRA 2.0% default rate × (1 - 0.42 recovery rate)     |
|Duration Effect   |-0.3%|Floating rate; minimal duration; some refinancing risk|
|Kurtosis (revised)|3.50 |Raised from 3.00 to reflect credit cycle tail risk    |

## Positioning

**Medium-high conviction on return; elevated caution on tail risk.** The 8.2% return assumption is supported by current market spreads. The kurtosis revision to 3.50 is a firm recommendation. Manager selection is the dominant alpha and risk driver in this asset class — undifferentiated exposure to large-cap direct lending carries meaningfully lower expected returns and higher covenant risk than selectivity implies.


---
cma_id: novara_cma_2026_05
asset_id: globalHighYield
---

## Valuation & Return Outlook

Global high yield offers a **7.8% return assumption**, reflecting a current all-in yield of approximately **7.5–8.0%** (US HY index yield-to-worst) net of projected default losses. HY spreads widened 15–30bps on new issues from Q4 2025 to Q1 2026, driven by Iran War risk-off sentiment, which has modestly improved the starting yield point versus the Q1 2026 CMA. The 20-year return assumption benefits from the structural income-dominance of high yield — over long horizons, coupon income consistently swamps spread-driven capital gains or losses.

## Key Risks

- **Recession risk and default spike**: In a hard-landing scenario, HY default rates can rise from the current ~2–3% toward 10–12%; spread widening of 400–600bps in a full credit cycle event is consistent with the stress scenarios in the model.
- **Iran-driven growth slowdown**: Higher energy costs reduce corporate free cash flow across energy-intensive sectors, increasing refinancing pressure on the weakest HY issuers; the energy sub-sector is a direct source of stress in a prolonged conflict scenario.
- **Correlation to equities in crisis**: HY correlation to equities rises sharply in drawdowns (0.62 with US equity in this matrix), undermining the diversification case in precisely the scenarios where diversification is most needed.
- **Duration and rate sensitivity**: While shorter duration than investment grade, HY is not immune to rate rises; the higher-for-longer environment creates refinancing cost headwinds for issuers with near-term maturity walls.

## Economic Indicators

|Indicator              |Value |Context                                              |
|-----------------------|------|-----------------------------------------------------|
|Yield-to-Worst (US HY) |7.7%  |Post-Iran repricing; attractive vs. history          |
|OAS Spread             |360bps|Modest widening from Q4 2025 lows of ~300bps         |
|Default Rate (trailing)|2.8%  |Below long-run average of ~4%; cycle risk above      |
|Recovery Rate          |0.40  |Slightly below historical average; covenant lite drag|
|Duration               |3.8yrs|Short relative to IG; rate sensitivity manageable    |

## Positioning

**Medium conviction.** Attractive income yield and a manageable duration profile; the return assumption of 7.8% is well-calibrated to current conditions. The primary risk is a default cycle acceleration — monitor for signs of deteriorating issuer fundamentals in the energy and leveraged buyout segments.


---
cma_id: novara_cma_2026_05
asset_id: emDebt
---

## Valuation & Return Outlook

Emerging market debt carries a **7.5% return assumption**, reflecting a meaningful risk premium over developed market investment grade credit for EM sovereign and quasi-sovereign exposure. The return is decomposed as: a risk-free yield of **4.3%**, spread income of **3.5%** (blended hard-currency spread), a default drag of approximately **-0.5%** (based on long-run EM HY default rates), and a modest duration effect. Near-term conditions — the Iran War driving a stronger dollar and higher US rates — are genuine headwinds for EM debt issuers. For a 20-year horizon, the structural growth premium of EM economies and the progressive deepening of EM local currency markets support the return assumption, though 7.5% is at the upper end of consensus.

## Key Risks

- **Dollar strength and capital flows**: Higher US rates attract capital flows back toward USD assets, compressing EM currency values and raising the cost of USD-denominated debt service for EM sovereigns.
- **Commodity dependency**: Many EM debt issuers are commodity exporters — the Iran War’s oil shock benefits Gulf and African exporters but harms energy-importing EM economies (India, Turkey, Egypt) with potential sovereign stress implications.
- **Geopolitical fragmentation**: The fracturing of the global trade and financial order — particularly the dollar reserve currency debate — creates binary scenarios for certain EM issuers that are not captured in the return distribution.
- **Local currency risk**: EM local currency debt introduces FX volatility on top of credit and duration risk; the blended assumption mixes hard and local currency exposure, requiring attention to composition.

## Economic Indicators

|Indicator             |Value   |Context                                      |
|----------------------|--------|---------------------------------------------|
|Risk-Free Yield       |4.3%    |US Treasury 10yr anchor                      |
|Blended EM Spread     |350bps  |Hard currency; above Q4 2025 lows of ~280bps |
|Default Drag          |-0.5%   |Long-run EM sovereign default rate assumption|
|Duration              |6.2yrs  |Intermediate; meaningful rate sensitivity    |
|EM Currency Volatility|Elevated|USD strength and Iran War creating FX stress |

## Positioning

**Medium conviction — hold with caution.** The return of 7.5% is defensible for a 20-year horizon but sits at the upper end of consensus. Near-term conditions warrant monitoring; the combination of dollar strength, higher rates, and the energy import shock creates a stress environment for the most vulnerable EM issuers.


---
cma_id: novara_cma_2026_05
asset_id: igCredit
---

## Valuation & Return Outlook

Investment grade credit offers a **5.4% return assumption**, anchored to the current all-in yield environment. With the 10-year US Treasury at approximately 4.6% and investment grade OAS spreads around 85–95bps, the current yield-to-worst is approximately **5.4–5.6%** — meaning the return assumption is tightly calibrated to observable starting yields with minimal valuation or spread assumption. Over a 20-year horizon, mean-reversion to a lower rate environment will reduce returns from this starting point, making 5.4% a reasonable equilibrium estimate rather than a projection that the current yield environment persists permanently. The current elevated yield environment represents the best entry point for IG credit since the pre-GFC era.

## Key Risks

- **Rate sensitivity and duration**: Investment grade bonds carry significant duration (approximately 6.8 years for a global aggregate); a sustained rise in long-term rates reduces mark-to-market values materially, as demonstrated in the 2022 rate shock.
- **Spread widening in a credit event**: OAS spreads at 85–95bps are close to the tighter end of the post-GFC range; a corporate credit cycle deterioration would widen spreads toward 200–250bps, imposing significant mark-to-market losses on longer-duration positions.
- **Higher-for-longer regime**: If the Iran War-driven inflation persists, the assumption of mean-reversion toward lower rates is delayed, meaning the capital gain component of the 20-year total return is deferred.
- **Issuer concentration**: Global IG indices are significantly concentrated in financial institutions and large-cap US corporates; a systemic banking event would drive correlated drawdowns across the majority of the index.

## Economic Indicators

|Indicator     |Value |Context                                                |
|--------------|------|-------------------------------------------------------|
|OAS Spread    |85bps |Near post-GFC tight end; modest spread compression risk|
|Yield to Worst|5.4%  |Starting yield well above the pre-2022 environment     |
|Duration      |6.8yrs|Meaningful rate sensitivity; 2022 analog relevant      |
|Default Rate  |0.8%  |Low; below long-run average of 1.2%                    |
|Recovery Rate |0.42  |In line with historical average for senior unsecured   |

## Positioning

**High conviction.** The best risk-return profile in the credit complex for risk-averse institutional investors. The starting yield provides a genuine income cushion; the duration risk is manageable within a diversified portfolio. A minor upward revision to 5.5–5.6% is defensible given current starting yields, but within rounding tolerance for a 20-year assumption.


---
cma_id: novara_cma_2026_05
asset_id: sdCredit
---

## Valuation & Return Outlook

Short duration credit carries a **revised return assumption of 4.25%**, reduced from the Q1 2026 figure of 4.8%. The 4.8% figure embedded the current elevated short-end yield environment as a 20-year equilibrium — a category error for long-horizon CMA construction. Short duration credit continuously rolls toward the prevailing short-end rate; over a 20-year horizon, this asset class should equilibrate toward the neutral policy rate plus a modest spread. With the long-run neutral Fed funds rate in the **3.0–3.5% range** and short duration credit commanding a spread of 50–70bps over cash, the sustainable 20-year equilibrium return is approximately **3.5–4.25%**. The current elevated starting yields are a temporary advantage, not a structural shift.

## Key Risks

- **Roll-down risk in a rate cycle**: As policy rates normalise toward neutral, the running yield on a short duration credit portfolio decreases; the 4.25% return requires active management or a structural shift in the neutral rate above historical norms.
- **Spread compression in risk-off**: Short duration credit spreads historically compress when equities sell off as investors seek liquid, near-cash instruments; the asset class does not provide crisis protection.
- **Inflation erosion**: At 4.25% nominal with 2.5–3.0% long-run inflation, the real return is modest (~1.0–1.5%); this asset class is appropriate for capital preservation rather than real wealth accumulation.
- **Reinvestment risk**: In a declining rate environment, maturing short-duration instruments are reinvested at successively lower yields, compounding the return drag.

## Economic Indicators

|Indicator               |Value|Context                                                    |
|------------------------|-----|-----------------------------------------------------------|
|Risk-Free Yield         |4.3% |Current SOFR/T-bill; will decline toward neutral over cycle|
|Spread Income           |0.6% |Short duration HY/IG blend over cash                       |
|Default Drag            |-0.2%|Low; short tenor limits default exposure                   |
|Duration Effect         |0.0% |Floating/short; minimal rate sensitivity                   |
|Revised 20yr Equilibrium|4.25%|Down from 4.8%; corrects starting yield extrapolation error|

## Positioning

**High conviction on the revision.** The reduction from 4.8% to 4.25% is a firm recommendation, correcting a known error in forward projection methodology. This asset class is appropriate for capital preservation and liquidity management within a portfolio; it is not a return-generating asset over a 20-year horizon and should be sized accordingly.


---
cma_id: novara_cma_2026_05
asset_id: globalSov
---

## Valuation & Return Outlook

Global sovereign bonds carry a **4.5% return assumption**, anchored to a structural view that the post-Iran War hawkish repricing has reset the long-term rate environment modestly higher than the pre-2026 consensus, but not permanently above the 4.0–4.5% range consistent with nominal GDP growth in developed economies. The current 10-year US Treasury yield of approximately 4.6% — near a 16-month high — provides a slightly above-assumption starting yield, and the JPMorgan LTCMA range of 4.0–4.9% for US Treasuries brackets our assumption appropriately. The near-zero equity correlation (-0.05 with US equity) is the asset class’s most important portfolio property — it reflects the post-2022 regime shift and is a deliberate and well-calibrated parameter.

**Volatility has been nudged from 7.0% to 7.5% and kurtosis from 1.65 to 1.80** for May 2026, reflecting the demonstrated capacity of geopolitical energy shocks to drive rapid, large-magnitude rate repricing across G10 markets simultaneously.

## Key Risks

- **Inflation persistence**: If the Iran War-driven inflationary impulse proves more persistent than base case, central banks will maintain restrictive policy longer, keeping term premiums elevated and compressing total returns from current yields.
- **Fiscal dominance**: Structurally high government debt-to-GDP ratios across G10 create ongoing supply pressure in sovereign bond markets; term premium may remain elevated for structural rather than cyclical reasons.
- **Regime shift in equity-bond correlation**: The near-zero correlation assumption could reassert toward negative in a genuine growth recession (supporting bonds strongly) or could turn positive again if inflation re-accelerates; the assumption is reasonable but regime-dependent.
- **Currency composition**: A global sovereign index carries significant non-USD duration; EUR and GBP rate moves in the current Iran War environment have been at least as hawkish as USD, affecting blended returns.

## Economic Indicators

|Indicator                |Value |Context                                                    |
|-------------------------|------|-----------------------------------------------------------|
|Real Yield (US TIPS 10yr)|2.1%  |Elevated vs. post-GFC norms; genuine real return available |
|Inflation Breakeven      |2.5%  |Above Fed target; Iran War energy premium embedded         |
|Term Premium             |0.8%  |Positive and rising; structural fiscal supply pressure     |
|Duration (global agg sov)|7.4yrs|Significant rate sensitivity; 2022 stress scenario relevant|
|Equity Correlation       |-0.05 |Correctly near-zero; post-2022 regime shift maintained     |

## Positioning

**High conviction on the near-zero equity correlation assumption.** The return of 4.5% and the revised vol/kurtosis of 7.5%/1.80 are well-calibrated. Sovereign bonds remain the primary portfolio diversifier against equity drawdowns in a deflationary recession scenario; their reduced effectiveness in an inflationary scenario is correctly captured by the near-zero correlation.


---
cma_id: novara_cma_2026_05
asset_id: inflLinked
---

## Valuation & Return Outlook

Inflation-linked bonds carry a **4.5% return assumption**, constructed from a 10-year TIPS real yield of approximately **2.1%** plus a long-run inflation breakeven of **2.3–2.5%**, giving a nominal return of approximately 4.4–4.6% — tightly consistent with the assumption. The Iran War is an active near-term tailwind: higher energy prices directly raise headline CPI, widen inflation breakevens, and increase the value of inflation protection — this is the scenario inflation-linked bonds are designed for. Kurtosis has been nudged from 1.80 to 2.00 and volatility from 6.0% to 6.5% to reflect the elevated inflation shock environment.

The high correlation with global sovereign bonds (0.85) is appropriate — these instruments share duration and credit exposure — but the divergence in their behaviour during supply-side inflation shocks (where nominals sell off, linkers outperform) is captured in the lower equity correlation of +0.12 versus nominal sovereign’s -0.05.

## Key Risks

- **Deflation risk**: In a genuine demand-collapse scenario (deep recession, debt deflation), realised inflation could significantly undershoot breakevens, producing returns well below nominal sovereign alternatives.
- **Real yield risk**: TIPS prices are sensitive to real yield movements; the current TIPS real yield of 2.1% is elevated versus the post-GFC average of ~0%; any mean-reversion would produce significant mark-to-market losses.
- **Liquidity**: TIPS and global linker markets are less liquid than nominal sovereign counterparts; bid-offer spreads widen significantly in a liquidity event.
- **Breakeven inflation correlation**: In a supply-side inflationary shock (such as the current Iran War), breakeven inflation rises but real yields may also rise simultaneously (as central banks tighten) — the net price impact for linkers can be smaller than intuition suggests.

## Economic Indicators

|Indicator                 |Value|Context                                           |
|--------------------------|-----|--------------------------------------------------|
|Real Yield (US TIPS 10yr) |2.1% |Elevated; best real yield entry since 2009        |
|Inflation Breakeven (10yr)|2.5% |Iran War energy premium; above Fed 2% target      |
|Term Premium (real)       |0.4% |Modest; duration risk appropriately priced        |
|Currency Effect           |0.0% |USD-denominated; zero for domestic USD investor   |
|Revised Kurtosis          |2.00 |Nudged from 1.80; near-term inflation shock regime|

## Positioning

**High conviction as inflation hedge.** Current real yields represent the best entry point in over 15 years; the inflation protection is directly relevant in the current Iran War environment. The revised volatility (6.5%) and kurtosis (2.00) appropriately reflect the elevated regime uncertainty.


---
cma_id: novara_cma_2026_05
asset_id: moneyMkt
---

## Valuation & Return Outlook

Money market instruments carry a **3.5% return assumption**, representing the expected equilibrium of the overnight policy rate over a 20-year horizon. This embeds a structural view that the post-pandemic neutral rate has drifted upward from the post-GFC ~2.5% regime toward approximately **3.0–3.5%**, reflecting higher structural inflation, increased government borrowing requirements, and a possible partial reversal of the secular decline in the neutral rate. The current Fed funds rate of approximately 3.5–3.75% sits at or modestly above this equilibrium estimate — consistent with a policy rate that is broadly neutral to mildly restrictive. The Iran War has suppressed rate cuts that would otherwise have occurred in 2026; the path back to the long-run equilibrium is now delayed, which is mildly supportive of near-term money market returns.

## Key Risks

- **Rate cycle descent**: As inflation normalises (whether through Iran War resolution or demand destruction), the policy rate will converge toward the neutral rate; investors locking in current rates via short-term instruments will face re-investment risk.
- **Neutral rate uncertainty**: The structural level of r* is deeply uncertain; if the neutral rate reverts to the post-GFC 2.0–2.5% range (the secular stagnation hypothesis), 3.5% would overstate the long-run return by 50–100bps.
- **Inflation erosion**: At 3.5% nominal with expected long-run inflation of 2.5–3.0%, the real return from money markets is approximately 0.5–1.0% — barely positive and below most liability benchmarks.
- **Reinvestment**: Money markets offer no duration protection; in a rapid rate-cutting cycle, the running yield falls immediately and completely.

## Economic Indicators

|Indicator            |Value     |Context                                       |
|---------------------|----------|----------------------------------------------|
|Real Yield           |0.5%      |3.5% nominal less 3.0% expected inflation     |
|Inflation Breakeven  |3.0%      |Near-term inflation elevated; Iran War premium|
|Term Premium         |0.0%      |By definition zero for overnight instruments  |
|Currency Effect      |0.0%      |USD-denominated baseline                      |
|Policy Rate (current)|3.50–3.75%|Held steady in 2026; Iran War delay to cuts   |

## Positioning

**High conviction on the assumption; low conviction as a strategic allocation.** 3.5% is an appropriate and well-grounded long-run equilibrium assumption. Money markets are a capital preservation and liquidity management tool, not a return-generating strategic asset class. Sizing should reflect liquidity needs and risk budgets rather than return maximisation.
