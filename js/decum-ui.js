/**
 * decum-ui.js  v58.2
 * Decumulation Module UI — spec-driven strategy selector with inspector.
 * Depends on: decum-engine.js (window.DecumEngine)
 */
(function() {
'use strict';

const DE = window.DecumEngine;
if (!DE) { console.error('DecumEngine not loaded'); return; }

/* ── State ───────────────────────────────────────────────────────── */
let decumCtx       = null;
let decumResults   = null;
let decumChart     = null;
let activeSpec     = null;   // currently loaded spec in inspector
let editedSpec     = null;   // working copy with user edits
let runSpecIds     = [];     // IDs of specs included in last run
let selectedIds    = new Set(); // IDs toggled on in chart

/* ── Format helpers ─────────────────────────────────────────────── */
const fmtPound = v => v >= 1e6 ? `£${(v/1e6).toFixed(2)}m` : v >= 1000 ? `£${(v/1000).toFixed(0)}k` : `£${Math.round(v).toLocaleString()}`;
const pct = v => `${(v*100).toFixed(2)}%`;
const mult= v => `${v.toFixed(2)}×`;

/* ══════════════════════════════════════════════════════════════════
   SPEC INSPECTOR  — builds a dynamic param form from the spec
   ══════════════════════════════════════════════════════════════════ */
function renderSpecInspector() {
    const wrap = document.getElementById('dc-inspector-body');
    if (!wrap || !editedSpec) return;
    const orch = editedSpec.orchestration ?? { type:'single' };

    let html = '';

    // ── Orchestration ────────────────────────────────────────────
    html += section('Orchestration', [
        field('Product type', 'select', 'orch_productType', editedSpec.primaryEngine?.productType ?? 'gla',
            Object.entries(DE.PRODUCT_TYPES).map(([k,v])=>`<option value="${k}" ${editedSpec.primaryEngine?.productType===k?'selected':''}>${v.label}</option>`).join(''),
            'Determines which engine(s) are used and sets sensible parameter defaults.'),
        ...(orch.type === 'pipeline' ? [
            field('Switch to annuity at age', 'number', 'orch_splitAge', orch.splitAge ?? 75,
                null, 'Age at which the invested phase ends and the annuity is purchased.')
        ] : []),
        ...(orch.type === 'parallel' ? [
            field('% of pot to annuity (Fix leg)', 'range', 'orch_splitRatio', Math.round((orch.splitRatio??0.4)*100),
                null, 'Percentage allocated to the guaranteed annuity. Remainder stays in drawdown.', { min:5, max:95, step:5 })
        ] : []),
    ]);

    // ── Primary engine params ────────────────────────────────────
    const pe = editedSpec.primaryEngine ?? {};
    const peLabel = orch.type === 'parallel' ? 'Fix Leg (Annuity)' : orch.type === 'pipeline' ? 'Phase 1 — Drawdown' : 'Engine Parameters';
    html += section(peLabel, engineFields('pe', pe, orch.type));

    // ── Secondary engine (pipeline / parallel) ───────────────────
    if (editedSpec.secondaryEngine) {
        const se = editedSpec.secondaryEngine;
        const seLabel = orch.type === 'parallel' ? 'Flex Leg (Drawdown)' : 'Phase 2 — Annuity';
        html += section(seLabel, engineFields('se', se, orch.type));
    }

    wrap.innerHTML = html;

    // Wire all inputs → editedSpec live update
    wrap.querySelectorAll('[data-field]').forEach(el => {
        el.addEventListener('change', () => applyInspectorEdits());
        if (el.type === 'range') {
            el.addEventListener('input', () => {
                const valEl = document.getElementById(el.id + '_val');
                if (valEl) valEl.textContent = el.dataset.pct ? el.value + '%' : el.value;
            });
        }
    });
}

function section(label, fields) {
    return `<div class="mb-3">
        <div class="text-uppercase fw-semibold text-muted mb-2 mt-1" style="font-size:.65rem;letter-spacing:.08em;border-top:1px solid #F1F5F9;padding-top:8px;">${label}</div>
        ${fields.join('')}
    </div>`;
}

function field(label, type, id, value, options, note, attrs={}) {
    const noteHtml = note ? `<div class="text-muted" style="font-size:.66rem;line-height:1.4;margin-top:2px;">${note}</div>` : '';
    if (type === 'select') {
        return `<div class="mb-2">
            <label class="form-label small text-secondary mb-1">${label}</label>
            <select class="form-select form-select-sm" id="${id}" data-field="${id}">${options}</select>
            ${noteHtml}</div>`;
    }
    if (type === 'range') {
        const min = attrs.min??0, max = attrs.max??100, step = attrs.step??1;
        const isPct = attrs.pct !== false;
        return `<div class="mb-2">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <label class="form-label small text-secondary mb-0">${label}</label>
                <span class="badge bg-light text-primary fw-bold font-monospace" id="${id}_val">${value}%</span>
            </div>
            <input type="range" class="form-range" id="${id}" data-field="${id}" data-pct="1"
                min="${min}" max="${max}" step="${step}" value="${value}">
            ${noteHtml}</div>`;
    }
    if (type === 'toggle') {
        return `<div class="d-flex justify-content-between align-items-start mb-2">
            <div><label class="form-label small text-secondary mb-0">${label}</label>${noteHtml}</div>
            <div class="form-check form-switch ms-2">
                <input class="form-check-input" type="checkbox" id="${id}" data-field="${id}" ${value?'checked':''}>
            </div></div>`;
    }
    if (type === 'inflation-linkage') {
        const opts = [
            ['guaranteed', 'Guaranteed CPI escalation'],
            ['targeted',   'Targeted (discretionary — CDC style)'],
            ['none',       'None (level nominal)'],
        ];
        return `<div class="mb-2">
            <label class="form-label small text-secondary mb-1">${label}</label>
            <select class="form-select form-select-sm" id="${id}" data-field="${id}">
                ${opts.map(([v,l])=>`<option value="${v}" ${value===v?'selected':''}>${l}</option>`).join('')}
            </select>
            ${noteHtml}</div>`;
    }
    // default: number
    return `<div class="mb-2">
        <label class="form-label small text-secondary mb-1">${label}</label>
        <input type="number" class="form-control form-control-sm" id="${id}" data-field="${id}"
            value="${value}" step="${attrs.step??'any'}">
        ${noteHtml}</div>`;
}

function engineFields(prefix, eng, orchType) {
    const isCollective = eng.type === 'collective';
    const fields = [];

    fields.push(field('Inflation linkage', 'inflation-linkage', `${prefix}_inflationLinkage`,
        eng.inflationLinkage ?? 'guaranteed', null,
        isCollective && eng.productType === 'cdc'
            ? 'CDC: "Targeted" means CPI increases are discretionary — only granted when the fund is fully funded. Income is not contractually inflation-linked.'
            : isCollective
                ? 'Guaranteed: income escalates with CPI every year. Priced using real discount rate. None: level nominal income throughout.'
                : 'Guaranteed: withdrawals increase with CPI each year. None: level nominal withdrawals.'));

    if (isCollective) {
        fields.push(field(
            eng.productType === 'cdc'
                ? 'Valuation rate (% p.a.)'
                : 'Pricing discount rate (% p.a.)',
            'number', `${prefix}_pricingDiscountRate`,
            (eng.pricingDiscountRate * 100).toFixed(2), null,
            eng.productType === 'gla'
                ? 'Nominal gilt yield minus insurer loading (~0.4%). Higher rate → lower initial income but better value for insurer.'
                : eng.productType === 'gsa'
                    ? 'Nominal gilt yield minus mutual admin costs (~0.15%). Slightly higher than GLA as no profit loading.'
                    : 'Scheme prudent valuation rate. Income adjustments occur when actual returns differ from this hurdle.',
            { step:'0.01' }));

        if (eng.inflationLinkage === 'guaranteed') {
            fields.push(field('Real pricing rate (% p.a.) — inflation-linked', 'number',
                `${prefix}_realPricingRate`,
                ((eng.realPricingRate ?? 0.01) * 100).toFixed(2), null,
                'Index-linked gilt yield minus loading. Active when inflation linkage is "Guaranteed". Lower rate → higher cost of CPI-linked annuity → lower initial income.',
                { step:'0.01' }));
        }

        if (eng.productType !== 'gla') {
            fields.push(field('Mortality credit limit (% of pool p.a.)', 'number',
                `${prefix}_mortalityCreditLimit`,
                ((eng.mortalityCreditLimit ?? 0) * 100).toFixed(2), null,
                'Cap on annual mortality credits distributed to survivors. 0 = fully pooled (all credits shared). 1.25% is a typical GSA cap to smooth large swings.',
                { step:'0.01' }));
        }

        if (eng.productType !== 'cdc') {
            fields.push(field('Nominal capital protection', 'toggle',
                `${prefix}_hasNominalMoneyBack`,
                eng.hasNominalMoneyBack ?? false, null,
                'If on: a reducing nominal guarantee is maintained as a minimum bequest. Adds cost to pricing.'));
        }

    } else {  // Individual engine
        if (eng.incomeRule !== 'GLWB_RATCHET') {
            fields.push(field('Initial withdrawal rate (% of pot)', 'number',
                `${prefix}_initialWithdrawalRate`,
                eng.initialWithdrawalRate === 'bisect' ? 'Auto (goal-seek)' : (eng.initialWithdrawalRate * 100).toFixed(2),
                null, '"Auto" finds the rate that exhausts the pot exactly at the planning horizon. Override with a specific rate if preferred.',
                { step:'0.01' }));
        }

        if (eng.productType === 'glwb') {
            fields.push(field('Rider fee (% of pot p.a.)', 'number',
                `${prefix}_riderFee`,
                ((eng.riderFee ?? 0.01) * 100).toFixed(2), null,
                'Annual insurance charge deducted from the asset base in exchange for the lifetime income guarantee.',
                { step:'0.01' }));
        }

        if (orchType === 'pipeline' && prefix === 'pe') {
            fields.push(field('De-risk over (years before switch)', 'number',
                `${prefix}_deRiskYears`,
                eng.deRiskYears ?? 10, null,
                'Linear glidepath from growth to near risk-free over this many years before switching to annuity. 0 = no de-risking.',
                { step:1, min:0 }));
        }
    }

    return fields;
}

function applyInspectorEdits() {
    if (!editedSpec) return;
    const get = id => document.getElementById(id);
    const val = id => get(id)?.value;
    const checked = id => get(id)?.checked ?? false;
    const num = id => { const v = parseFloat(val(id)); return isNaN(v) ? null : v; };
    const pctToFrac = id => { const v = num(id); return v === null ? null : v / 100; };

    // Orchestration
    const productType = val('orch_productType');
    if (productType && editedSpec.primaryEngine) {
        editedSpec.primaryEngine.productType = productType;
        const pt = DE.PRODUCT_TYPES[productType];
        if (pt) {
            // Update orchestration type from product type
            const orchMap = { pipeline:'pipeline', parallel:'parallel' };
            if (!editedSpec.isPreset) {
                editedSpec.orchestration.type = orchMap[pt.engineType] ?? 'single';
                editedSpec.primaryEngine.type = pt.engineType === 'pipeline' || pt.engineType === 'parallel' ? 'collective' : pt.engineType;
            }
        }
    }
    if (get('orch_splitAge'))   editedSpec.orchestration.splitAge   = parseInt(val('orch_splitAge'));
    if (get('orch_splitRatio')) editedSpec.orchestration.splitRatio  = parseInt(val('orch_splitRatio')) / 100;

    // Primary engine
    updateEngineFromForm('pe', editedSpec.primaryEngine);
    // Secondary engine
    if (editedSpec.secondaryEngine) updateEngineFromForm('se', editedSpec.secondaryEngine);
}

function updateEngineFromForm(prefix, eng) {
    const get = id => document.getElementById(id);
    const val = id => get(id)?.value;
    const num = (id, div) => { const v = parseFloat(val(id)); return isNaN(v) ? null : div ? v/div : v; };
    const checked = id => get(id)?.checked;

    if (val(`${prefix}_inflationLinkage`))      eng.inflationLinkage      = val(`${prefix}_inflationLinkage`);
    if (num(`${prefix}_pricingDiscountRate`,100) !== null) eng.pricingDiscountRate = num(`${prefix}_pricingDiscountRate`,100);
    if (num(`${prefix}_realPricingRate`,100) !== null)     eng.realPricingRate     = num(`${prefix}_realPricingRate`,100);
    if (num(`${prefix}_mortalityCreditLimit`,100) !== null) eng.mortalityCreditLimit= num(`${prefix}_mortalityCreditLimit`,100);
    if (get(`${prefix}_hasNominalMoneyBack`))   eng.hasNominalMoneyBack   = checked(`${prefix}_hasNominalMoneyBack`);
    if (num(`${prefix}_riderFee`,100) !== null) eng.riderFee              = num(`${prefix}_riderFee`,100);
    if (num(`${prefix}_deRiskYears`,1) !== null) eng.deRiskYears          = Math.round(num(`${prefix}_deRiskYears`,1));
    const iwrEl = get(`${prefix}_initialWithdrawalRate`);
    if (iwrEl && iwrEl.value !== 'Auto (goal-seek)') {
        const iwrNum = parseFloat(iwrEl.value);
        if (!isNaN(iwrNum)) eng.initialWithdrawalRate = iwrNum / 100;
    }
}

/* ══════════════════════════════════════════════════════════════════
   STRATEGY SELECTOR
   ══════════════════════════════════════════════════════════════════ */
function buildStrategySelector() {
    const sel = document.getElementById('dc-strategy-select');
    if (!sel) return;
    const allSpecs = DE.getAllSpecs();
    const presets  = allSpecs.filter(s => s.isPreset);
    const customs  = allSpecs.filter(s => !s.isPreset);

    let html = '<option value="">— Select a strategy —</option>';
    html += '<optgroup label="Built-in Presets">';
    presets.forEach(s => html += `<option value="${s.id}">${s.shortName} — ${s.name}</option>`);
    html += '</optgroup>';
    if (customs.length > 0) {
        html += '<optgroup label="Custom Strategies">';
        customs.forEach(s => html += `<option value="${s.id}">${s.name}</option>`);
        html += '</optgroup>';
    }
    sel.innerHTML = html;
}

window.decumLoadStrategy = function(id) {
    if (!id) return;
    const spec = DE.getAllSpecs().find(s => s.id === id);
    if (!spec) return;
    activeSpec  = spec;
    editedSpec  = JSON.parse(JSON.stringify(spec));  // deep copy
    renderSpecInspector();
    document.getElementById('dc-inspector-wrap').classList.remove('d-none');
    document.getElementById('dc-save-btn').classList.toggle('d-none', !!spec.isPreset);
    document.getElementById('dc-delete-btn').classList.toggle('d-none', !!spec.isPreset);
    document.getElementById('dc-saveas-btn').classList.remove('d-none');
};

/* ══════════════════════════════════════════════════════════════════
   RUN ANALYSIS
   ══════════════════════════════════════════════════════════════════ */
window.decumRunAnalysis = function() {
    const pot        = parseFloat(document.getElementById('dc-pot').value)        || 250000;
    const startAge   = parseInt(document.getElementById('dc-start-age').value)    || 65;
    const targetAge  = parseInt(document.getElementById('dc-target-age').value)   || 90;
    const maxAge     = Math.min(parseInt(document.getElementById('dc-max-age').value) || 110, DE.MORTALITY_MAX_AGE);
    const realReturn = parseFloat(document.getElementById('dc-real-return').value)/100 || 0.035;
    const inflation  = parseFloat(document.getElementById('dc-inflation').value)/100   || 0.025;

    decumCtx = DE.buildContext({ pot, startAge, targetAge, maxAge, realReturn, inflation });

    // Run all specs (presets + custom saved)
    decumResults = DE.runAllSpecs(decumCtx);
    runSpecIds   = Object.keys(decumResults);
    selectedIds  = new Set(runSpecIds);

    renderDecumChart();
    renderDecumTable();
    renderSummaryCards();
    document.getElementById('dc-results-wrap').classList.remove('d-none');
    document.getElementById('dc-placeholder').classList.add('d-none');
};

/* ══════════════════════════════════════════════════════════════════
   CHART
   ══════════════════════════════════════════════════════════════════ */
function renderDecumChart() {
    const mode   = document.querySelector('input[name="dc-chart-mode"]:checked')?.value || 'income';
    const canvas = document.getElementById('dc-chart');
    if (!canvas || !decumResults) return;

    const allSpecs = DE.getAllSpecs();
    const labels   = (Object.values(decumResults)[0]?.records ?? []).map(r => r.age);
    const datasets = allSpecs
        .filter(s => selectedIds.has(s.id) && decumResults[s.id])
        .map(s => {
            const { records } = decumResults[s.id];
            const data = records.map(r =>
                mode === 'income'  ? r.income_real  :
                mode === 'bequest' ? r.bequest :
                mode === 'pot'     ? r.A_end   :
                r.income_real + (r.bequest ?? 0)
            );
            return { label: s.shortName, data, borderColor: s.color, backgroundColor: s.color + '15',
                     borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 4, tension: 0.3, fill: false };
        });

    if (decumChart) decumChart.destroy();
    decumChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive:true, maintainAspectRatio:false,
            interaction:{ mode:'index', intersect:false },
            plugins:{
                legend:{ position:'bottom', labels:{ font:{ size:11 }, boxWidth:12, padding:10 } },
                tooltip:{ callbacks:{ label: i => ` ${i.dataset.label}: ${fmtPound(i.raw)}` } },
            },
            scales:{
                x:{ title:{ display:true, text:'Age', font:{size:10} }, grid:{ color:'#F1F5F9' }, ticks:{font:{size:10}} },
                y:{ title:{ display:true, text: mode==='income'?'Real Annual Income (today\'s £)':'£', font:{size:10} },
                    grid:{color:'#F1F5F9'}, ticks:{ font:{size:10}, callback: v => fmtPound(v) }, beginAtZero:true },
            },
        },
    });
}

window.decumSetChartMode = () => { if(decumResults) renderDecumChart(); };
window.decumToggle = id => {
    if (selectedIds.has(id)) selectedIds.delete(id); else selectedIds.add(id);
    renderDecumChart(); renderDecumTable();
};

/* ══════════════════════════════════════════════════════════════════
   APV TABLE
   ══════════════════════════════════════════════════════════════════ */
function renderDecumTable() {
    const tbody = document.getElementById('dc-apv-tbody');
    if (!tbody || !decumResults) return;
    const allSpecs = DE.getAllSpecs();
    const maxIncome = Math.max(...allSpecs.map(s => decumResults[s.id]?.apv?.apvIncome || 0));

    tbody.innerHTML = allSpecs
        .filter(s => decumResults[s.id])
        .map(s => {
            const { apvIncome, apvBequest, totalNormalized } = decumResults[s.id].apv;
            const active = selectedIds.has(s.id);
            const inflTag = s.primaryEngine?.inflationLinkage === 'targeted'
                ? `<span class="badge ms-1" style="background:#FEF3C7;color:#92400E;font-size:.6rem;">targeted CPI</span>`
                : s.primaryEngine?.inflationLinkage === 'guaranteed'
                    ? `<span class="badge ms-1" style="background:#DCFCE7;color:#166534;font-size:.6rem;">CPI-linked</span>` : '';
            const bar = maxIncome > 0 ? (apvIncome / maxIncome * 100).toFixed(0) : 0;
            return `<tr style="opacity:${active?1:0.38};cursor:pointer;" onclick="decumToggle('${s.id}')">
                <td class="ps-3 align-middle">
                    <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${s.color};margin-right:6px;vertical-align:middle;"></span>
                    <strong style="font-size:.82rem;">${s.shortName}</strong>${inflTag}
                </td>
                <td class="text-end align-middle">
                    <div style="font-weight:700;font-size:.82rem;">${fmtPound(apvIncome)}</div>
                    <div style="background:#F1F5F9;border-radius:2px;height:4px;margin-top:2px;"><div style="width:${bar}%;background:${s.color};height:4px;border-radius:2px;"></div></div>
                </td>
                <td class="text-end align-middle" style="font-size:.82rem;">${fmtPound(apvBequest)}</td>
                <td class="text-end pe-3 align-middle">
                    <span class="badge rounded-pill" style="background:${s.color}20;color:${s.color};font-weight:700;font-size:.78rem;">${mult(totalNormalized)}</span>
                </td>
            </tr>`;
        }).join('');
}

/* ══════════════════════════════════════════════════════════════════
   SUMMARY CARDS
   ══════════════════════════════════════════════════════════════════ */
function renderSummaryCards() {
    const wrap = document.getElementById('dc-summary-cards');
    if (!wrap || !decumResults) return;
    const allSpecs = DE.getAllSpecs().filter(s => decumResults[s.id]);
    const card = (label, val, sub, color) => `
        <div class="col-6 col-lg-4">
            <div class="card border-0 shadow-sm h-100"><div class="card-body p-3">
                <div class="text-muted mb-1" style="font-size:.67rem;text-transform:uppercase;letter-spacing:.07em;">${label}</div>
                <div style="font-size:1.25rem;font-weight:700;color:${color};">${val}</div>
                <div class="text-muted" style="font-size:.71rem;">${sub}</div>
            </div></div>
        </div>`;
    const best = k => allSpecs.reduce((b,s) => (decumResults[s.id].apv[k]||0) > (decumResults[b?.id]?.apv[k]||0) ? s : b, allSpecs[0]);
    const bestInc = best('apvIncome'), bestBq = best('apvBequest'), bestTot = best('totalNormalized');
    wrap.innerHTML = `<div class="row g-2 mb-3">
        ${card('Highest APV Income', fmtPound(decumResults[bestInc?.id]?.apv.apvIncome||0), bestInc?.shortName||'—', '#166534')}
        ${card('Highest APV Bequest', fmtPound(decumResults[bestBq?.id]?.apv.apvBequest||0), bestBq?.shortName||'—', '#1D4ED8')}
        ${card('Best Total/Pot', mult(decumResults[bestTot?.id]?.apv.totalNormalized||0), bestTot?.shortName||'—', '#7E22CE')}
        ${card('Pot at Retirement', fmtPound(decumCtx?.V0||0), `Age ${decumCtx?.startAge||65}`, '#374151')}
        ${card('Planning Horizon', `${(decumCtx?.targetAge||90)-(decumCtx?.startAge||65)} yrs`, `Age ${decumCtx?.startAge||65}–${decumCtx?.targetAge||90}`, '#374151')}
        ${card('Real Return', pct(decumCtx?.realReturn||0), 'p.a. (growth assets)', '#374151')}
    </div>`;
}

/* ══════════════════════════════════════════════════════════════════
   SAVE / LOAD / DELETE
   ══════════════════════════════════════════════════════════════════ */
window.decumSaveSpec = function() {
    if (!editedSpec) return;
    applyInspectorEdits();
    DE.saveCustomSpec(editedSpec);
    buildStrategySelector();
    document.getElementById('dc-strategy-select').value = editedSpec.id;
    showToast('Strategy saved.');
};

window.decumSaveAs = function() {
    if (!editedSpec) return;
    applyInspectorEdits();
    const name = prompt('Name for this strategy:', editedSpec.name + ' (custom)');
    if (!name) return;
    const newSpec = { ...JSON.parse(JSON.stringify(editedSpec)),
        id: 'custom_decum_' + Date.now(), name, isPreset: false };
    editedSpec = newSpec;
    activeSpec = newSpec;
    DE.saveCustomSpec(newSpec);
    buildStrategySelector();
    document.getElementById('dc-strategy-select').value = newSpec.id;
    document.getElementById('dc-save-btn').classList.remove('d-none');
    document.getElementById('dc-delete-btn').classList.remove('d-none');
    document.getElementById('dc-saveas-btn').classList.remove('d-none');
    showToast('Saved as "' + name + '".');
};

window.decumDeleteSpec = function() {
    if (!editedSpec || editedSpec.isPreset) return;
    if (!confirm(`Delete "${editedSpec.name}"?`)) return;
    DE.deleteCustomSpec(editedSpec.id);
    buildStrategySelector();
    document.getElementById('dc-inspector-wrap').classList.add('d-none');
    editedSpec = null;
    showToast('Strategy deleted.');
};

function showToast(msg) {
    const el = document.getElementById('dc-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('d-none');
    setTimeout(() => el.classList.add('d-none'), 2500);
}

/* ══════════════════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════════════════ */
function initDecumTab() {
    buildStrategySelector();
    document.getElementById('dc-run-btn')?.addEventListener('click', () => {
        document.getElementById('dc-placeholder')?.classList.add('d-none');
        decumRunAnalysis();
    });
    document.querySelectorAll('input[name="dc-chart-mode"]').forEach(inp => {
        inp.addEventListener('change', decumSetChartMode);
    });
    document.getElementById('dc-strategy-select')?.addEventListener('change', function() {
        decumLoadStrategy(this.value);
    });
    initDecumTab._done = true;
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.list-group-item[data-tab]').forEach(el => {
        el.addEventListener('click', function() {
            if (this.dataset.tab === 'decum' && !initDecumTab._done) {
                setTimeout(initDecumTab, 50);
            }
        });
    });
});

})();
