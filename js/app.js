// js/app.js
import { ASSET_CLASSES, PRESET_PORTFOLIOS, STRATEGY_GROUPS, PRESET_PERSONAS, PRESET_CMAS, CHART_COLORS, STRESS_SCENARIOS } from './config.js?v=17.0';
import { logGamma, getMatrixHeatmapBg, getCorrHeatmapBg, calcDeterministicStats } from './mathUtils.js';

const state = {
    worker: null,
    chartInstance: null,
    strategyChartInstance: null,
    pieLeft: null,
    pieRight: null,
    portfolios: [], 
    personas: [],
    activePersonaId: null,
    strategyYears: [50, 15, 0],
    autoRun: true,
    portfolioInputsCollapsed: false,
    advLeft: false,
    advRight: false
};

let debounceTimer;

window.onerror = function(message, source, lineno, colno, error) { console.error("Sys Err:", error); };

document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById("wrapper");
    const menuBtn = document.getElementById("menu-toggle");
    if (menuBtn) menuBtn.onclick = (e) => { e.preventDefault(); wrapper.classList.toggle("toggled"); };

    // Build initial portfolios dynamically from presets to avoid import errors
    state.portfolios = [];
    PRESET_PORTFOLIOS.forEach(group => {
        group.portfolios.forEach(p => state.portfolios.push(JSON.parse(JSON.stringify(p))));
    });
    
    state.personas = JSON.parse(JSON.stringify(PRESET_PERSONAS));
    if(state.personas.length > 0) state.activePersonaId = state.personas[0].id;

    buildSharedLegend();
    setupEventListeners();

    try {
        initWorker();
        renderAssetRows();
        renderStressAssumptionsTable(); 
        initPresets();
        initRunModelInputs();
        renderPersonaCards();
        setupAutoRun();
        
        refreshPortfolioDropdowns();
        renderPortfolioPane('left', state.portfolios[0].id);
        
        renderStrategyTable(1);
        initTooltips();

        try {
            if(PRESET_CMAS && PRESET_CMAS.length > 0) {
                loadCMAPreset(0);
                const cmaSel = document.getElementById('run-cma-select');
                if(cmaSel) cmaSel.value = "0";
            }
            if(STRATEGY_GROUPS && STRATEGY_GROUPS.length > 0 && STRATEGY_GROUPS[0].strategies.length > 0) {
                loadStrategyPreset(0, 0);
                const stratSel = document.getElementById('run-strat-1');
                if(stratSel) stratSel.value = "0_0";
            }
        } catch (dataErr) {
            console.warn("Default Data Load Warning:", dataErr);
        }
        
        setTimeout(runSimulation, 500);
    } catch (err) {
        console.error("Critical Init Error:", err);
    }
});

function initTooltips() {
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, {
            container: 'body',
            html: true
        }));
    }
}

// 100% Validated DiceBear Algorithm to ensure beautiful render and dynamic age mapping
function getNeutralAvatarUrl(age, seed) {
    // Corrected strictly for the v9 'avataaars' style schema
    let top = age < 30 ? "shortHairShortFlat" : age <= 50 ? "shortHairShortWaved" : "shortHairTheCaesar";
    let hairColor = age > 50 ? "silverGray" : "brownDark";
    let clothing = age < 30 ? "graphicShirt" : age <= 50 ? "collarAndSweater" : "blazerAndShirt";
    let clothingColor = age < 30 ? "blue03" : age <= 50 ? "pastelGreen" : "blue02";
    let bg = age < 30 ? "eef2ff" : age <= 50 ? "ecfdf5" : "e0e7ff";

    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}&top=${top}&hairColor=${hairColor}&clothing=${clothing}&clothingColor=${clothingColor}&backgroundColor=${bg}&eyes=default&mouth=default&eyebrows=defaultNatural`;
}

function setupEventListeners() {
    document.querySelectorAll('.list-group-item[data-tab]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.innerWidth < 768) document.getElementById("wrapper").classList.remove("toggled");
            document.querySelectorAll('.list-group-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.view-section').forEach(i => i.classList.add('d-none'));
            e.currentTarget.classList.add('active');
            
            const target = e.currentTarget.dataset.tab;
            if (target === 'strategy') {
                refreshPortfolioDropdowns();
                setTimeout(renderStrategyChart, 50); 
            }
            if (target === 'portfolio') {
                setTimeout(() => {
                    if(state.pieLeft) state.pieLeft.resize();
                    if(state.pieRight) state.pieRight.resize();
                }, 50);
            }
            
            document.getElementById(`tab-${target}`).classList.remove('d-none');
        });
    });

    document.getElementById('run-simulation-btn')?.addEventListener('click', runSimulation);
    document.getElementById('confidence-slider')?.addEventListener('input', updateConfidence);
    document.getElementById('auto-update-toggle')?.addEventListener('change', (e) => { state.autoRun = e.target.checked; });
    
    document.getElementById('portfolio-cma-select')?.addEventListener('change', () => {
        const leftId = document.getElementById('port-select-left').value;
        const rightId = document.getElementById('port-select-right').value;
        if(leftId && leftId !== 'none') updatePortfolioVisuals('left', leftId);
        if(rightId && rightId !== 'none') updatePortfolioVisuals('right', rightId);
    });

    document.getElementById('port-select-left')?.addEventListener('change', (e) => renderPortfolioPane('left', e.target.value));
    document.getElementById('port-select-right')?.addEventListener('change', (e) => renderPortfolioPane('right', e.target.value));
    
    document.getElementById('toggle-portfolio-inputs')?.addEventListener('click', () => {
        state.portfolioInputsCollapsed = !state.portfolioInputsCollapsed;
        syncPortfolioInputsVisibility();
    });

    document.getElementById('toggle-strategy-inputs')?.addEventListener('click', () => {
        document.getElementById('strategy-table-container').classList.toggle('d-none');
    });
    document.getElementById('strat-view-toggle')?.addEventListener('change', renderStrategyChart);

    window.addStrategyYearColumn = addStrategyYearColumn;
    window.addStrategyRow = addStrategyRow;
    window.createNewPortfolio = createNewPortfolio;
    window.toggleAdv = toggleAdv;
}

function toggleAdv(side) {
    state[`adv${side}`] = !state[`adv${side}`];
    const cols = document.querySelectorAll(`.adv-col-${side}`);
    if (state[`adv${side}`]) {
        cols.forEach(el => el.classList.remove('d-none'));
    } else {
        cols.forEach(el => el.classList.add('d-none'));
    }
}

function syncPortfolioInputsVisibility() {
    ['left', 'right'].forEach(side => {
        const container = document.getElementById(`port-inputs-${side}-container`);
        const hr = document.getElementById(`port-hr-${side}`);
        if(container && hr) {
            if (state.portfolioInputsCollapsed) {
                container.classList.add('d-none'); hr.classList.add('d-none');
            } else {
                container.classList.remove('d-none'); hr.classList.remove('d-none');
            }
        }
    });
}

function hexToRgba(hex, alpha) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function drawDistributionChart(assetKey, r, v, kurtosis, colorHex) {
    const canvas = document.getElementById(`dist-${assetKey}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width; const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const minX = -0.4; const maxX = 0.4; 
    const vol = Math.max(v, 0.001);
    const k = Math.max(kurtosis, 0.01);
    const df = (k > 0.05) ? (6 / k) + 4 : 1000;
    const s = vol * Math.sqrt((df - 2) / df);
    const coef = Math.exp(logGamma((df+1)/2) - logGamma(df/2)) / (Math.sqrt(Math.PI * df) * s);
    const exponent = -(df + 1) / 2;

    const points = [];
    const maxVisY = 1 / (0.05 * Math.sqrt(2 * Math.PI)); 
    
    for (let x = minX; x <= maxX; x += 0.01) {
        const y = coef * Math.pow(1 + Math.pow((x - r) / s, 2) / df, exponent);
        points.push({x, y});
    }

    ctx.beginPath();
    ctx.moveTo(0, height);
    points.forEach(p => {
        const cx = ((p.x - minX) / (maxX - minX)) * width;
        const cy = height - Math.min(p.y / maxVisY, 1.2) * height * 0.85; 
        ctx.lineTo(cx, cy);
    });
    ctx.lineTo(width, height);
    ctx.closePath();
    
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, hexToRgba(colorHex, 0.7));
    grad.addColorStop(1, hexToRgba(colorHex, 0.0));
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = colorHex; ctx.lineWidth = 1.5; ctx.stroke();
    
    const meanCx = ((r - minX) / (maxX - minX)) * width;
    ctx.beginPath(); ctx.moveTo(meanCx, 0); ctx.lineTo(meanCx, height);
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.2)'; ctx.setLineDash([2, 2]); ctx.stroke(); ctx.setLineDash([]);
}

function renderAssetRows() {
    const thead = document.querySelector('#cma-table thead tr');
    const tbody = document.querySelector('#cma-table tbody');
    if(!tbody || !thead) return;
    
    let headerHTML = `
        <th style="min-width: 180px;">Asset Class</th>
        <th class="text-center" style="width: 100px;">Tail Risk</th>
        <th class="text-end" style="min-width: 90px;">Return (%)</th>
        <th class="text-end" style="min-width: 90px;">Vol (%)</th>
        <th class="text-end pe-4" style="min-width: 90px;">Kurtosis</th>
    `;
    ASSET_CLASSES.forEach(ac => {
        headerHTML += `<th class="text-center corr-col d-none" style="min-width: 50px;" title="${ac.name}">${ac.key.substring(0,6)}</th>`;
    });
    thead.innerHTML = headerHTML;

    tbody.innerHTML = '';
    const frag = document.createDocumentFragment();
    
    ASSET_CLASSES.forEach(asset => {
        const tr = document.createElement('tr');
        let rowHTML = `
            <td class="fw-medium text-muted" style="position: sticky; left: 0; background: var(--bg-surface); z-index: 1;">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${asset.color}; margin-right:6px;"></span>
                ${asset.name}
            </td>
            <td class="text-center"><canvas id="dist-${asset.key}" class="dist-canvas" width="80" height="30"></canvas></td>
            <td class="text-end"><input type="number" step="0.1" class="form-control form-control-sm text-end bg-transparent border-0 px-1" data-key="${asset.key}" data-field="r" value="${(asset.defaultR * 100).toFixed(2)}"></td>
            <td class="text-end"><input type="number" step="0.1" class="form-control form-control-sm text-end bg-transparent border-0 px-1" data-key="${asset.key}" data-field="v" value="${(asset.defaultV * 100).toFixed(2)}"></td>
            <td class="text-end pe-4"><input type="number" step="0.1" class="form-control form-control-sm text-end bg-transparent border-0 px-1" data-key="${asset.key}" data-field="k" value="${(asset.defaultK).toFixed(2)}"></td>
        `;
        
        ASSET_CLASSES.forEach(colAsset => {
            const isSelf = asset.key === colAsset.key;
            const val = isSelf ? "1.00" : "0.00";
            const readOnly = isSelf ? 'readonly tabindex="-1"' : '';
            const bgClass = isSelf ? 'bg-dark text-white' : 'bg-transparent';
            
            rowHTML += `<td class="text-center corr-col d-none p-0 heatmap-cell">
                <input type="number" step="0.05" class="form-control form-control-sm text-center border-0 w-100 h-100 rounded-0 ${bgClass} corr-input" 
                data-row="${asset.key}" data-col="${colAsset.key}" value="${val}" style="font-size: 0.75rem; font-weight: 600;" ${readOnly}>
            </td>`;
        });
        
        tr.innerHTML = rowHTML;
        frag.appendChild(tr);
        
        const inputs = tr.querySelectorAll('input[data-field="r"], input[data-field="v"], input[data-field="k"]');
        inputs.forEach(inp => {
            inp.addEventListener('input', () => {
                const r = parseFloat(tr.querySelector('input[data-field="r"]').value)/100 || 0;
                const v = parseFloat(tr.querySelector('input[data-field="v"]').value)/100 || 0;
                const k = parseFloat(tr.querySelector('input[data-field="k"]').value) || 0;
                drawDistributionChart(asset.key, r, v, k, asset.color);
            });
        });
        
        const corrInputs = tr.querySelectorAll('.corr-input:not([readonly])');
        corrInputs.forEach(inp => {
            inp.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) || 0;
                const rowKey = e.target.dataset.row;
                const colKey = e.target.dataset.col;
                
                e.target.parentElement.style = getCorrHeatmapBg(val);
                
                if (rowKey !== colKey) {
                    const symmetricCell = document.querySelector(`.corr-input[data-row="${colKey}"][data-col="${rowKey}"]`);
                    if(symmetricCell && symmetricCell.value !== e.target.value) {
                        symmetricCell.value = e.target.value;
                        symmetricCell.parentElement.style = getCorrHeatmapBg(val);
                    }
                }
            });
        });
        
        setTimeout(() => drawDistributionChart(asset.key, asset.defaultR, asset.defaultV, asset.defaultK, asset.color), 0);
    });
    tbody.appendChild(frag);

    document.getElementById('toggle-corr-matrix')?.addEventListener('change', (e) => {
        const cols = document.querySelectorAll('.corr-col');
        if (e.target.checked) {
            cols.forEach(el => el.classList.remove('d-none'));
        } else {
            cols.forEach(el => el.classList.add('d-none'));
        }
    });
}

function renderStressAssumptionsTable() {
    const theadTr = document.getElementById('cma-stress-thead-tr');
    const tbody = document.querySelector('#cma-stress-table tbody');
    if (!theadTr || !tbody) return;

    let headHTML = `
        <th class="border-end" style="min-width: 120px; position: sticky; left: 0; background: var(--bg-surface); z-index: 3;">Category</th>
        <th class="border-end" style="min-width: 200px; position: sticky; left: 120px; background: var(--bg-surface); z-index: 3;">Asset Class</th>
    `;
    STRESS_SCENARIOS.forEach(sc => {
        headHTML += `<th class="text-center" style="min-width: 100px; font-size:0.7rem; font-weight:700;">
            <span style="cursor:help; border-bottom:1px dotted #94A3B8;" data-bs-toggle="tooltip" data-bs-title="${sc.description}">${sc.name}</span>
        </th>`;
    });
    theadTr.innerHTML = headHTML;

    const grouped = {};
    ASSET_CLASSES.forEach(ac => {
        if(!grouped[ac.category]) grouped[ac.category] = [];
        grouped[ac.category].push(ac);
    });

    let bodyHTML = '';
    Object.keys(grouped).forEach(cat => {
        const assets = grouped[cat];
        assets.forEach((ac, idx) => {
            bodyHTML += `<tr>`;
            
            if(idx === 0) {
                bodyHTML += `<td rowspan="${assets.length}" class="cat-header text-center border-end" style="position: sticky; left: 0; z-index: 2; background: var(--bg-surface);">${cat}</td>`;
            }
            
            bodyHTML += `
                <td class="fw-medium text-muted border-end" style="position: sticky; left: 120px; background: var(--bg-surface); z-index: 2;">
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${ac.color}; margin-right:6px;"></span>
                    ${ac.name}
                </td>`;
            
            ST
