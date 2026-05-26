/**
 * decum-ui.js — Decumulation Module UI
 * Depends on: decum-engine.js (window.DecumEngine)
 * Self-contained; uses Chart.js already loaded by main app.
 */
(function() {
'use strict';

const DE = window.DecumEngine;
if (!DE) { console.error('DecumEngine not loaded'); return; }

/* ── State ──────────────────────────────────────────────────────────── */
let decumCtx     = null;   // current GlobalContext
let decumResults = null;   // current runAllPresets() output
let decumChart   = null;   // Chart.js instance
let selectedPresets = new Set([1,2,3,4,5,6,7]);  // all on by default

/* ── Defaults ───────────────────────────────────────────────────────── */
const DEFAULTS = {
    pot:        250000,
    startAge:   65,
    targetAge:  90,
    maxAge:     100,
    realReturn: 0.035,
    inflation:  0.025,
    discountRate:0.045,
    splitRatio: 0.40,
};

/* ── Format helpers ─────────────────────────────────────────────────── */
const fmtPound = v => v >= 1e6
    ? `£${(v/1e6).toFixed(2)}m`
    : v >= 1000 ? `£${(v/1000).toFixed(0)}k`
    : `£${v.toFixed(0)}`;
const fmtPct = v => `${(v*100).toFixed(1)}%`;
const fmtMult= v => `${v.toFixed(2)}×`;

/* ── Main run function ──────────────────────────────────────────────── */
function runDecumAnalysis() {
    const pot        = parseFloat(document.getElementById('dc-pot').value)       || DEFAULTS.pot;
    const startAge   = parseInt(document.getElementById('dc-start-age').value)   || DEFAULTS.startAge;
    const targetAge  = parseInt(document.getElementById('dc-target-age').value)  || DEFAULTS.targetAge;
    const maxAge     = parseInt(document.getElementById('dc-max-age').value)      || DEFAULTS.maxAge;
    const realReturn = parseFloat(document.getElementById('dc-real-return').value)/100 || DEFAULTS.realReturn;
    const inflation  = parseFloat(document.getElementById('dc-inflation').value)/100   || DEFAULTS.inflation;
    const splitRatio = parseFloat(document.getElementById('dc-split').value)/100       || DEFAULTS.splitRatio;

    decumCtx = DE.buildContext({ pot, startAge, targetAge, maxAge, realReturn, inflation });

    const overrides = { flex_and_fix: { splitRatio } };
    decumResults = DE.runAllPresets(decumCtx, overrides);

    renderDecumChart();
    renderDecumTable();
    renderDecumSummaryCards();
    document.getElementById('dc-results-wrap').classList.remove('d-none');
}

/* ── Chart ──────────────────────────────────────────────────────────── */
function renderDecumChart() {
    const mode = document.querySelector('input[name="dc-chart-mode"]:checked')?.value || 'income';
    const canvas = document.getElementById('dc-chart');
    if (!canvas || !decumResults) return;

    // Determine x-axis from first result
    const firstResult = Object.values(decumResults)[0];
    if (!firstResult) return;
    const labels = firstResult.records.map(r => r.age);

    const datasets = DE.PRESETS
        .filter(p => selectedPresets.has(p.id) && decumResults[p.key])
        .map(p => {
            const { records } = decumResults[p.key];
            const data = records.map(r => {
                if (mode === 'income')  return r.income_real;
                if (mode === 'bequest') return r.bequest;
                if (mode === 'pot')     return r.A_end;
                // 'total' = cumulative income + bequest value (APV sense — real annual)
                return r.income_real + r.bequest * (r.tpx < 1e-6 ? 0 : 1);
            });
            return {
                label: p.shortName,
                data,
                borderColor: p.color,
                backgroundColor: p.color + '18',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.3,
                fill: false,
            };
        });

    if (decumChart) decumChart.destroy();
    decumChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode:'index', intersect:false },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font:{ size:11, family:'DM Sans, sans-serif' }, boxWidth:12, padding:12 }
                },
                tooltip: {
                    callbacks: {
                        label: item => ` ${item.dataset.label}: ${fmtPound(item.raw)}`,
                    }
                }
            },
            scales: {
                x: {
                    title: { display:true, text:'Age', font:{size:10} },
                    grid:  { color:'#F1F5F9' },
                    ticks: { font:{size:10} },
                },
                y: {
                    title: { display:true, text:mode==='income'?'Real Annual Income':'£ Value', font:{size:10} },
                    grid:  { color:'#F1F5F9' },
                    ticks: { font:{size:10}, callback: v => fmtPound(v) },
                    beginAtZero: true,
                }
            }
        }
    });
}

/* ── APV Summary Table ──────────────────────────────────────────────── */
function renderDecumTable() {
    const tbody = document.getElementById('dc-apv-tbody');
    if (!tbody || !decumResults) return;

    // Find max APV income for relative bar scaling
    const maxApvIncome = Math.max(...DE.PRESETS.map(p => decumResults[p.key]?.apv?.apvIncome || 0));

    tbody.innerHTML = DE.PRESETS.map(p => {
        const res = decumResults[p.key];
        if (!res) return '';
        const { apvIncome, apvBequest, totalNormalized } = res.apv;
        const barW = maxApvIncome > 0 ? (apvIncome / maxApvIncome * 100).toFixed(0) : 0;
        const active = selectedPresets.has(p.id);
        return `<tr style="opacity:${active?1:0.4};cursor:pointer;" onclick="decumTogglePreset(${p.id})" title="Click to show/hide on chart">
            <td class="ps-3 align-middle">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:6px;flex-shrink:0;"></span>
                <span style="font-weight:600;font-size:.82rem;">${p.shortName}</span>
                <span class="d-none d-md-inline text-muted" style="font-size:.72rem;"> — ${p.name.replace(p.shortName+' ','').replace(p.shortName,'')}</span>
            </td>
            <td class="text-end align-middle">
                <div style="font-weight:700;font-size:.82rem;">${fmtPound(apvIncome)}</div>
                <div style="background:#F1F5F9;border-radius:2px;height:4px;margin-top:3px;">
                  <div style="width:${barW}%;background:${p.color};height:4px;border-radius:2px;"></div>
                </div>
            </td>
            <td class="text-end align-middle" style="font-size:.82rem;">${fmtPound(apvBequest)}</td>
            <td class="text-end align-middle pe-3">
                <span class="badge rounded-pill" style="background:${p.color}18;color:${p.color};font-weight:700;font-size:.78rem;">${fmtMult(totalNormalized)}</span>
            </td>
        </tr>`;
    }).join('');
}

/* ── Summary Cards ──────────────────────────────────────────────────── */
function renderDecumSummaryCards() {
    const wrap = document.getElementById('dc-summary-cards');
    if (!wrap || !decumResults) return;

    // Best income, best bequest, best total
    let bestIncome = null, bestBequest = null, bestTotal = null;
    DE.PRESETS.forEach(p => {
        const res = decumResults[p.key];
        if (!res) return;
        if (!bestIncome  || res.apv.apvIncome       > bestIncome.apv.apvIncome)       bestIncome  = {...res, preset:p};
        if (!bestBequest || res.apv.apvBequest       > bestBequest.apv.apvBequest)     bestBequest = {...res, preset:p};
        if (!bestTotal   || res.apv.totalNormalized  > bestTotal.apv.totalNormalized)  bestTotal   = {...res, preset:p};
    });

    const card = (label, val, sub, color, icon) => `
        <div class="col-6 col-lg-4">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-body p-3">
                    <div class="text-muted mb-1" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;">${label}</div>
                    <div style="font-size:1.3rem;font-weight:700;color:${color};">${val}</div>
                    <div class="text-muted" style="font-size:.72rem;">${sub}</div>
                </div>
            </div>
        </div>`;

    wrap.innerHTML = `<div class="row g-2">
        ${card('Highest Lifetime Income', fmtPound(bestIncome?.apv.apvIncome||0), bestIncome?.preset.shortName||'—', '#166534', '📈')}
        ${card('Highest Bequest Value',   fmtPound(bestBequest?.apv.apvBequest||0), bestBequest?.preset.shortName||'—', '#1D4ED8', '🎁')}
        ${card('Best Total Value (×pot)', fmtMult(bestTotal?.apv.totalNormalized||0), bestTotal?.preset.shortName||'—', '#7E22CE', '⭐')}
        ${card('Pot Size',  fmtPound(decumCtx.V0), `Age ${decumCtx.startAge} at retirement`, '#374151', '💰')}
        ${card('Planning Horizon', `${decumCtx.targetAge - decumCtx.startAge} yrs`, `Age ${decumCtx.startAge}–${decumCtx.targetAge}`, '#374151', '📅')}
        ${card('Real Return Assumed', fmtPct(decumCtx.realReturn), 'p.a. growth assets', '#374151', '📊')}
    </div>`;
}

/* ── Toggle preset on chart ─────────────────────────────────────────── */
window.decumTogglePreset = function(id) {
    if (selectedPresets.has(id)) selectedPresets.delete(id);
    else selectedPresets.add(id);
    // Sync checkbox state
    const cbs = document.querySelectorAll('#dc-preset-toggles input[type="checkbox"]');
    if (cbs.length === DE.PRESETS.length) {
        DE.PRESETS.forEach((p, k) => { if(cbs[k]) cbs[k].checked = selectedPresets.has(p.id); });
    }
    renderDecumChart();
    renderDecumTable();
};

window.decumSetChartMode = function() {
    if (decumResults) renderDecumChart();
};

/* ── Init on tab open ───────────────────────────────────────────────── */
function initDecumTab() {
    // Populate preset toggles
    const togglesWrap = document.getElementById('dc-preset-toggles');
    if (togglesWrap && !togglesWrap._dc) {
        togglesWrap._dc = true;
        togglesWrap.innerHTML = DE.PRESETS.map(p => `
            <label class="d-flex align-items-center gap-2" style="cursor:pointer;font-size:.78rem;">
                <input type="checkbox" class="form-check-input m-0" ${selectedPresets.has(p.id)?'checked':''} 
                    onchange="decumTogglePreset(${p.id})" style="flex-shrink:0;">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};flex-shrink:0;"></span>
                <span class="text-secondary">${p.name}</span>
            </label>`).join('');
    }
    // Wire up run button
    const btn = document.getElementById('dc-run-btn');
    if (btn && !btn._dc) {
        btn._dc = true;
        btn.addEventListener('click', () => {
            document.getElementById('dc-placeholder')?.classList.add('d-none');
            runDecumAnalysis();
        });
    }
    // Wire chart mode toggles
    document.querySelectorAll('input[name="dc-chart-mode"]').forEach(inp => {
        if (!inp._dc) { inp._dc = true; inp.addEventListener('change', decumSetChartMode); }
    });
}

// Hook into tab switching
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.list-group-item[data-tab]').forEach(el => {
        el.addEventListener('click', function() {
            if (this.dataset.tab === 'decum') setTimeout(initDecumTab, 50);
        });
    });
});

})();
