// js/app.js
import { ASSET_CLASSES, INITIAL_PORTFOLIOS, PRESET_PORTFOLIOS, PRESET_STRATEGIES, PROVIDER_STRATEGIES, PRESET_PERSONAS, PRESET_CMAS, CHART_COLORS, STRESS_SCENARIOS } from './config.js?v=16.3';
import { logGamma, getMatrixHeatmapBg, getCorrHeatmapBg, calcDeterministicStats } from './mathUtils.js';

const state = {
    worker: null,
    chartInstance: null,
    strategyChartInstance: null,
    pieLeft: null,
    pieRight: null,
    portfolios: [], 
    strategyYears: [50, 15, 0],
    autoRun: true,
    portfolioInputsCollapsed: false
};

let debounceTimer;

window.onerror = function(message, source, lineno, colno, error) { console.error("Sys Err:", error); };

document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById("wrapper");
    const menuBtn = document.getElementById("menu-toggle");
    if (menuBtn) menuBtn.onclick = (e) => { e.preventDefault(); wrapper.classList.toggle("toggled"); };

    state.portfolios = JSON.parse(JSON.stringify(INITIAL_PORTFOLIOS));
    buildSharedLegend();
    setupEventListeners();

    try {
        initWorker();
        renderAssetRows();
        renderStressAssumptionsTable(); 
        initPresets();
        initRunModelInputs();
        setupAutoRun();
        
        // Render UI foundations first
        refreshPortfolioDropdowns();
        renderPortfolioPane('left', state.portfolios[0].id);
        renderStrategyTable();
        initTooltips();

        // Inject Presets into the rendered DOM components
        try {
            if(PRESET_CMAS && PRESET_CMAS.length > 0) {
                loadCMAPreset(0);
                const cmaSel = document.getElementById('run-cma-select');
                if(cmaSel) cmaSel.value = "0";
            }
            if(PRESET_PERSONAS && PRESET_PERSONAS.length > 0) {
                loadPersonaPreset(0);
                const persSel = document.getElementById('run-persona-select');
                if(persSel) persSel.value = "0";
            }
            if(PRESET_STRATEGIES && PRESET_STRATEGIES.length > 0) {
                loadStrategyPreset(0, 'core');
                const stratSel = document.getElementById('run-strat-1');
                if(stratSel) stratSel.value = "core_0";
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
    window.createNewPortfolio = createNewPortfolio;
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
        <th class="text-end pe-4 border-end" style="min-width: 90px;">Kurtosis</th>
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
            <td class="fw-medium text-muted" style="position: sticky; left: 0; background: #FFF; z-index: 1;">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${asset.color}; margin-right:6px;"></span>
                ${asset.name}
            </td>
            <td class="text-center"><canvas id="dist-${asset.key}" class="dist-canvas" width="80" height="30"></canvas></td>
            <td class="text-end"><input type="number" step="0.1" class="form-control form-control-sm text-end bg-transparent border-0 px-1" data-key="${asset.key}" data-field="r" value="${(asset.defaultR * 100).toFixed(2)}"></td>
            <td class="text-end"><input type="number" step="0.1" class="form-control form-control-sm text-end bg-transparent border-0 px-1" data-key="${asset.key}" data-field="v" value="${(asset.defaultV * 100).toFixed(2)}"></td>
            <td class="text-end pe-4 border-end"><input type="number" step="0.1" class="form-control form-control-sm text-end bg-transparent border-0 px-1" data-key="${asset.key}" data-field="k" value="${(asset.defaultK).toFixed(2)}"></td>
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
        <th class="border-end" style="min-width: 120px; position: sticky; left: 0; background: #F8FAFC; z-index: 3;">Category</th>
        <th class="border-end" style="min-width: 200px; position: sticky; left: 120px; background: #F8FAFC; z-index: 3;">Asset Class</th>
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
                bodyHTML += `<td rowspan="${assets.length}" class="cat-header text-center border-end" style="position: sticky; left: 0; z-index: 2; background: #FFF;">${cat}</td>`;
            }
            
            bodyHTML += `
                <td class="fw-medium text-muted border-end" style="position: sticky; left: 120px; background: #FFF; z-index: 2;">
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${ac.color}; margin-right:6px;"></span>
                    ${ac.name}
                </td>`;
            
            STRESS_SCENARIOS.forEach(sc => {
                const val = sc.returns[ac.key] || 0;
                const valPct = (val * 100).toFixed(1);
                const style = getMatrixHeatmapBg(val);
                
                bodyHTML += `<td class="heatmap-cell" style="${style}">${val > 0 ? '+' : ''}${valPct}%</td>`;
            });
            bodyHTML += `</tr>`;
        });
    });
    
    tbody.innerHTML = bodyHTML;

    setTimeout(() => {
        const newTooltips = document.getElementById('cma-stress-collapse').querySelectorAll('[data-bs-toggle="tooltip"]');
        [...newTooltips].map(el => new bootstrap.Tooltip(el, {container:'body', html: true}));
    }, 100);
}

function buildSharedLegend() {
    const container = document.getElementById('shared-portfolio-legend');
    if(!container) return;
    let html = '';
    ASSET_CLASSES.forEach((ac) => {
        html += `<div class="shared-legend-item"><span class="shared-legend-color" style="background-color:${ac.color}"></span>${ac.name}</div>`;
    });
    container.innerHTML = html;
}

function initWorker() {
    state.worker = new Worker('./js/worker.js?v=16.3'); 
    state.worker.onmessage = (e) => {
        const { type, payload } = e.data;
        if (type === 'SIMULATION_COMPLETE') {
            updateUIState('Ready');
            renderChart(payload);
            renderResultsTable(payload);
        } else if (type === 'ERROR') { updateUIState('Error'); }
    };
}

function initPresets() {
    const cmaSelect = document.getElementById('cma-preset-select');
    if (cmaSelect) {
        cmaSelect.innerHTML = '<option value="">Load Preset...</option>';
        PRESET_CMAS.forEach((preset, index) => { cmaSelect.innerHTML += `<option value="${index}">${preset.name}</option>`; });
        cmaSelect.addEventListener('change', (e) => { if(e.target.value !== "") loadCMAPreset(e.target.value); });
    }

    const portSelect = document.getElementById('portfolio-preset-select');
    if (portSelect && typeof PRESET_PORTFOLIOS !== 'undefined') {
        portSelect.innerHTML = '<option value="">Load Library...</option>';
        PRESET_PORTFOLIOS.forEach((preset, index) => { portSelect.innerHTML += `<option value="${index}">${preset.name}</option>`; });
        portSelect.addEventListener('change', (e) => { if(e.target.value !== "") loadPortfolioPreset(e.target.value); });
    }

    const stratSelect = document.getElementById('strategy-preset-select');
    if (stratSelect) {
        stratSelect.innerHTML = '<option value="">Load Preset...</option>';
        
        stratSelect.innerHTML += '<optgroup label="Core Strategies">';
        PRESET_STRATEGIES.forEach((preset, index) => { stratSelect.innerHTML += `<option value="core_${index}">${preset.name}</option>`; });
        stratSelect.innerHTML += '</optgroup>';
        
        stratSelect.innerHTML += '<optgroup label="Provider Strategies">';
        PROVIDER_STRATEGIES.forEach((preset, index) => { stratSelect.innerHTML += `<option value="prov_${index}">${preset.name}</option>`; });
        stratSelect.innerHTML += '</optgroup>';
        
        stratSelect.addEventListener('change', (e) => { 
            if(e.target.value !== "") {
                const parts = e.target.value.split('_');
                loadStrategyPreset(parseInt(parts[1]), parts[0]); 
            }
        });
    }

    const persSelect = document.getElementById('persona-preset-select');
    if (persSelect) {
        persSelect.innerHTML = '<option value="">Load Preset...</option>';
        PRESET_PERSONAS.forEach((preset, index) => { persSelect.innerHTML += `<option value="${index}">${preset.name}</option>`; });
        persSelect.addEventListener('change', (e) => { if(e.target.value !== "") loadPersonaPreset(e.target.value); });
    }
}

function initRunModelInputs() {
    const cmaSelect = document.getElementById('run-cma-select');
    const portCmaSelect = document.getElementById('portfolio-cma-select');
    let html = '<option value="custom">Use "Markets" Tab</option>';
    PRESET_CMAS.forEach((preset, index) => { html += `<option value="${index}">${preset.name}</option>`; });
    if(cmaSelect) cmaSelect.innerHTML = html;
    if(portCmaSelect) portCmaSelect.innerHTML = html;

    const persSelect = document.getElementById('run-persona-select');
    if(persSelect) {
        persSelect.innerHTML = '<option value="custom">Use "Personas" Tab</option>';
        PRESET_PERSONAS.forEach((preset, index) => { persSelect.innerHTML += `<option value="${index}">${preset.name}</option>`; });
    }
    updateStrategySelectors();
}

function updateStrategySelectors() {
    ['run-strat-1', 'run-strat-2', 'run-strat-3'].forEach((id, i) => {
        const sel = document.getElementById(id);
        if(sel) {
            const curr = sel.value;
            let html = i === 0 ? '' : '<option value="">None</option>';
            html += '<option value="custom">Active Strategy Builder</option>'; 
            
            html += '<optgroup label="Core Strategies">';
            PRESET_STRATEGIES.forEach((preset, index) => { html += `<option value="core_${index}">${preset.name}</option>`; });
            html += '</optgroup>';
            
            html += '<optgroup label="Provider Strategies">';
            PROVIDER_STRATEGIES.forEach((preset, index) => { html += `<option value="prov_${index}">${preset.name}</option>`; });
            html += '</optgroup>';

            sel.innerHTML = html;
            if(curr) sel.value = curr;
        }
    });
}

function setupAutoRun() {
    const inputs = ['run-cma-select', 'run-persona-select', 'run-strat-1', 'run-strat-2', 'run-strat-3', 'setting-sim-count', 'setting-inflation', 'setting-sys-kurtosis'];
    inputs.forEach(id => {
        document.getElementById(id)?.addEventListener('change', () => {
            if(!state.autoRun) return;
            updateUIState('Updating...');
            clearTimeout(debounceTimer); debounceTimer = setTimeout(runSimulation, 600); 
        });
    });
}

function loadCMAPreset(index) {
    if (!PRESET_CMAS[index]) return;
    const data = PRESET_CMAS[index].data;
    document.querySelectorAll('#cma-table tbody tr').forEach(tr => {
        tr.querySelectorAll('input:not(.corr-input)').forEach(inp => {
            const key = inp.dataset.key; const field = inp.dataset.field; 
            if (data[field] && data[field][key] !== undefined) {
                const val = data[field][key];
                inp.value = (field === 'r' || field === 'v') ? (val * 100).toFixed(2) : val.toFixed(2);
                inp.dispatchEvent(new Event('input')); 
            }
        });
        
        tr.querySelectorAll('.corr-input').forEach(inp => {
            const row = inp.dataset.row; const col = inp.dataset.col;
            if (data.correlations && data.correlations[row] && data.correlations[row][col] !== undefined) {
                inp.value = data.correlations[row][col].toFixed(2);
                inp.dispatchEvent(new Event('input')); 
            }
        });
    });
}

function loadPersonaPreset(index) {
    if (!PRESET_PERSONAS[index]) return;
    const p = PRESET_PERSONAS[index].data;
    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
    setVal('p-age', p.age); setVal('p-retAge', p.retirementAge);
    setVal('p-pot', p.savings); setVal('p-salary', p.salary);
    setVal('p-contrib', p.contribution); setVal('p-growth', p.realSalaryGrowth);
}

function loadPortfolioPreset(index) {
    if (!PRESET_PORTFOLIOS[index]) return;
    state.portfolios = JSON.parse(JSON.stringify(PRESET_PORTFOLIOS[index].portfolios));
    refreshPortfolioDropdowns();
    
    if(state.portfolios.length > 0) {
        document.getElementById('port-select-left').value = state.portfolios[0].id;
        renderPortfolioPane('left', state.portfolios[0].id);
    }
    document.getElementById('port-select-right').value = 'none';
    renderPortfolioPane('right', 'none');
    
    renderStrategyTable();
    renderStrategyChart();
    if(state.autoRun) runSimulation();
}

function loadStrategyPreset(index, group) {
    let preset;
    if (group === 'core') preset = PRESET_STRATEGIES[index];
    else if (group === 'prov') preset = PROVIDER_STRATEGIES[index];
    
    if(!preset) return;
    
    state.strategyYears = preset.points.map(p => p.years).sort((a,b)=>b-a);
    renderStrategyTable(); 
    
    const table = document.getElementById('strategy-table');
    const selects = table.querySelectorAll('.strat-port-select');
    
    const neededPortIds = new Set();
    preset.points.forEach(pt => Object.keys(pt.weights).forEach(id => neededPortIds.add(id)));
    
    const idsArray = Array.from(neededPortIds);
    idsArray.forEach((id, rowIdx) => { if(selects[rowIdx]) selects[rowIdx].value = id; });

    preset.points.forEach(pt => {
        const colIdx = state.strategyYears.indexOf(pt.years);
        if(colIdx === -1) return;
        Object.entries(pt.weights).forEach(([portId, weight]) => {
            const rowIdx = idsArray.indexOf(portId);
            if(rowIdx !== -1) {
                const input = table.querySelector(`input.strat-weight-input[data-row="${rowIdx}"][data-col="${colIdx}"]`);
                if(input) input.value = (weight * 100).toFixed(0);
            }
        });
    });
    
    renderStrategyChart();
    if(state.autoRun) runSimulation();
}

function refreshPortfolioDropdowns() {
    const leftSel = document.getElementById('port-select-left');
    const rightSel = document.getElementById('port-select-right');
    const stratSels = document.querySelectorAll('.strat-port-select');
    
    let html = '';
    state.portfolios.forEach(p => { html += `<option value="${p.id}">${p.name}</option>`; });
    
    const currLeft = leftSel?.value;
    if(leftSel) leftSel.innerHTML = html;
    if(currLeft && leftSel) leftSel.value = currLeft;

    const currRight = rightSel?.value;
    if(rightSel) rightSel.innerHTML = `<option value="none">-- Select to Compare --</option>` + html;
    if(currRight && rightSel) rightSel.value = currRight;

    stratSels.forEach(sel => {
        const currVal = sel.value;
        sel.innerHTML = `<option value="none">-- Select Portfolio --</option>` + html;
        if(currVal) sel.value = currVal;
    });
}

function createNewPortfolio(side) {
    const num = state.portfolios.length + 1;
    const newPort = { id: `custom_${Date.now()}`, name: `Custom Portfolio ${num}`, weights: {}, alpha: 0, te: 0 };
    state.portfolios.push(newPort);
    refreshPortfolioDropdowns();
    document.getElementById(`port-select-${side}`).value = newPort.id;
    renderPortfolioPane(side, newPort.id);
}

function renderPortfolioPane(side, portId) {
    syncPortfolioInputsVisibility();

    const blankMsg = document.getElementById(`port-blank-${side}`);
    const bodyContainer = document.getElementById(`port-inputs-${side}-container`);
    const visualsContainer = document.getElementById(`port-visuals-${side}`);
    const hr = document.getElementById(`port-hr-${side}`);

    if (portId === 'none') {
        if(bodyContainer) bodyContainer.classList.add('d-none');
        if(visualsContainer) visualsContainer.classList.add('d-none');
        if(hr) hr.classList.add('d-none');
        if(blankMsg) blankMsg.classList.remove('d-none');
        renderStressTests(); 
        return;
    } else {
        if(visualsContainer) visualsContainer.classList.remove('d-none');
        if(blankMsg) blankMsg.classList.add('d-none');
    }

    const portfolio = state.portfolios.find(p => p.id === portId);
    if (!portfolio) return;

    const tbody = document.querySelector(`#port-table-${side} tbody`);
    tbody.innerHTML = '';
    const frag = document.createDocumentFragment();

    const titleRow = document.createElement('tr');
    titleRow.innerHTML = `<td class="fw-bold text-muted text-uppercase" style="width:50%">Name</td>
                          <td><input type="text" class="form-control form-control-sm text-end fw-bold" value="${portfolio.name}"></td>`;
    titleRow.querySelector('input').addEventListener('change', (e) => {
        portfolio.name = e.target.value; refreshPortfolioDropdowns();
        renderStressTests();
    });
    frag.appendChild(titleRow);

    ASSET_CLASSES.forEach(ac => {
        const tr = document.createElement('tr');
        const w = portfolio.weights[ac.key] || 0;
        tr.innerHTML = `<td class="text-muted fw-medium">${ac.name}</td>
            <td><input type="number" class="form-control form-control-sm text-end bg-transparent" value="${(w*100).toFixed(1)}" data-key="${ac.key}" step="0.5"></td>`;
        tr.querySelector('input').addEventListener('input', (e) => {
            portfolio.weights[ac.key] = (parseFloat(e.target.value) || 0) / 100;
            updatePortfolioVisuals(side, portId);
        });
        frag.appendChild(tr);
    });

    const sepRow = document.createElement('tr');
    sepRow.innerHTML = `<td colspan="2"><hr class="my-2 border-light"></td>`;
    frag.appendChild(sepRow);

    const trAlpha = document.createElement('tr');
    trAlpha.innerHTML = `<td class="fw-bold text-primary small"><i class="fas fa-arrow-up me-1"></i> Target Alpha <i class="fas fa-question-circle text-muted ms-1" data-bs-toggle="tooltip" data-bs-title="Expected excess return above the passive benchmark from active management."></i></td>
        <td><input type="number" class="form-control form-control-sm text-end bg-transparent fw-bold" value="${((portfolio.alpha||0)*100).toFixed(2)}" step="0.1"></td>`;
    trAlpha.querySelector('input').addEventListener('input', (e) => {
        portfolio.alpha = (parseFloat(e.target.value)||0)/100;
        updatePortfolioVisuals(side, portId);
    });
    frag.appendChild(trAlpha);

    const trTE = document.createElement('tr');
    trTE.innerHTML = `<td class="fw-bold text-danger small"><i class="fas fa-crosshairs me-1"></i> Tracking Error <i class="fas fa-question-circle text-muted ms-1" data-bs-toggle="tooltip" data-bs-title="Standard deviation of excess returns (Active Risk). Treated as idiosyncratic and uncorrelated to systemic factors."></i></td>
        <td><input type="number" class="form-control form-control-sm text-end bg-transparent fw-bold" value="${((portfolio.te||0)*100).toFixed(2)}" step="0.1"></td>`;
    trTE.querySelector('input').addEventListener('input', (e) => {
        portfolio.te = (parseFloat(e.target.value)||0)/100;
        updatePortfolioVisuals(side, portId);
    });
    frag.appendChild(trTE);

    tbody.appendChild(frag);

    const newTooltips = tbody.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...newTooltips].map(el => new bootstrap.Tooltip(el, {container:'body', html: true}));

    updatePortfolioVisuals(side, portId);
}

function updatePortfolioVisuals(side, portId) {
    const portfolio = state.portfolios.find(p => p.id === portId);
    if (!portfolio) return;

    const cmaSelect = document.getElementById('portfolio-cma-select');
    let cmaData = (cmaSelect && cmaSelect.value !== "custom" && cmaSelect.value !== "") ? PRESET_CMAS[cmaSelect.value].data : getActiveCMA();

    const stats = calcDeterministicStats(portfolio.weights, cmaData, portfolio.alpha || 0, portfolio.te || 0);
    
    document.getElementById(`stat-ret-${side}`).innerText = (stats.arithRet * 100).toFixed(2) + '%';
    document.getElementById(`stat-unit-${side}`).innerText = stats.median20Yr.toFixed(2) + 'x';
    document.getElementById(`stat-vol-${side}`).innerText = (stats.vol * 100).toFixed(2) + '%';

    const ctx = document.getElementById(`pie-${side}`).getContext('2d');
    const labels = []; const data = []; const bgColors = [];
    
    ASSET_CLASSES.forEach(ac => {
        const w = portfolio.weights[ac.key] || 0;
        if(w > 0.001) {
            labels.push(ac.name);
            data.push((w*100).toFixed(1));
            bgColors.push(ac.color); 
        }
    });

    if (state[`pie${side}`]) state[`pie${side}`].destroy();
    state[`pie${side}`] = new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: bgColors, borderWidth: 0, hoverOffset: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    renderStressTests();
}

function renderStressTests() {
    const leftId = document.getElementById('port-select-left')?.value;
    const rightId = document.getElementById('port-select-right')?.value;
    
    const portL = state.portfolios.find(p => p.id === leftId);
    const portR = state.portfolios.find(p => p.id === rightId);
    
    const content = document.getElementById('stress-content');
    
    if (!portL && !portR) {
        content.innerHTML = '<div class="text-center text-muted p-4">Select a portfolio to view stress analysis.</div>';
        return;
    }

    let allVals = [];
    const scenarioResults = STRESS_SCENARIOS.map(sc => {
        let vL = null, vR = null;
        if (portL) {
            vL = 0;
            ASSET_CLASSES.forEach(ac => vL += (portL.weights[ac.key] || 0) * (sc.returns[ac.key] || 0));
            allVals.push(vL);
        }
        if (portR) {
            vR = 0;
            ASSET_CLASSES.forEach(ac => vR += (portR.weights[ac.key] || 0) * (sc.returns[ac.key] || 0));
            allVals.push(vR);
        }
        return { name: sc.name, desc: sc.description, vL, vR };
    });

    let minVal = Math.min(...allVals, 0);
    let maxVal = Math.max(...allVals, 0);
    
    minVal = Math.floor(minVal * 10) / 10 - 0.05;
    maxVal = Math.ceil(maxVal * 10) / 10 + 0.05;
    if(maxVal < 0) maxVal = 0;
    if(minVal > 0) minVal = 0;
    const range = maxVal - minVal || 1;

    const formatStr = (vals) => `${(Math.min(...vals)*100).toFixed(1)}% to ${(Math.max(...vals)*100).toFixed(1)}%`;
    if (portL) document.getElementById('stress-summary-left').innerText = formatStr(scenarioResults.map(s=>s.vL));
    
    const rightContainer = document.getElementById('stress-summary-right-container');
    if (portR) {
        rightContainer.classList.remove('d-none');
        document.getElementById('stress-summary-right').innerText = formatStr(scenarioResults.map(s=>s.vR));
    } else {
        rightContainer.classList.add('d-none');
    }

    let html = '';
    
    html += '<div class="d-flex mb-2" style="padding-left: 220px; position:relative; height: 15px;">';
    for(let i = Math.ceil(minVal*10); i <= Math.floor(maxVal*10); i+=1) {
        const val = i / 10;
        const leftPct = ((val - minVal) / range) * 100;
        html += `<span class="small text-muted" style="position:absolute; left:${leftPct}%; transform:translateX(-50%); font-size:0.65rem;">${(val*100).toFixed(0)}%</span>`;
    }
    html += '</div>';

    scenarioResults.forEach(sc => {
        html += `<div class="d-flex align-items-center mb-3">
            <div class="pe-3 text-truncate" style="width: 220px; font-size: 0.8rem; font-weight: 600; cursor:help; color: var(--text-main);" data-bs-toggle="tooltip" data-bs-title="${sc.desc}">${sc.name}</div>
            <div class="flex-grow-1 position-relative" style="height: 24px;">
                <div class="w-100 position-absolute top-50 start-0 translate-middle-y" style="height:4px; background: #E2E8F0; border-radius:2px;"></div>`;
        
        if (sc.vL !== null && sc.vR !== null) {
            const minDot = Math.min(sc.vL, sc.vR);
            const maxDot = Math.max(sc.vL, sc.vR);
            const leftPct = ((minDot - minVal) / range) * 100;
            const widthPct = ((maxDot - minDot) / range) * 100;
            
            const diff = (sc.vR - sc.vL) * 100;
            const diffStr = diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
            const tooltipHtml = `<div class='text-start'><b>${sc.name}</b><br>${portL.name}: ${(sc.vL*100).toFixed(1)}%<br>${portR.name}: ${(sc.vR*100).toFixed(1)}%<hr class='my-1 border-secondary'>Gap: <b>${diffStr}</b></div>`;

            html += `<div class="dumbbell-line position-absolute top-50 translate-middle-y" style="left:${leftPct}%; width:${widthPct}%; height:6px; background: linear-gradient(90deg, #3B82F6, #8B5CF6); opacity:0.6;" data-bs-toggle="tooltip" data-bs-html="true" data-bs-title="${tooltipHtml}"></div>`;
        }

        if (sc.vL !== null) {
            const leftPct = ((sc.vL - minVal) / range) * 100;
            html += `<div class="dumbbell-dot position-absolute top-50 translate-middle shadow-sm" style="left:${leftPct}%; width:14px; height:14px; background-color:#3B82F6; border: 2px solid #FFF; border-radius:50%; z-index:2;" data-bs-toggle="tooltip" data-bs-title="${portL.name}: ${(sc.vL*100).toFixed(1)}%"></div>`;
        }
        if (sc.vR !== null) {
            const leftPct = ((sc.vR - minVal) / range) * 100;
            html += `<div class="dumbbell-dot position-absolute top-50 translate-middle shadow-sm" style="left:${leftPct}%; width:14px; height:14px; background-color:#8B5CF6; border: 2px solid #FFF; border-radius:50%; z-index:3;" data-bs-toggle="tooltip" data-bs-title="${portR.name}: ${(sc.vR*100).toFixed(1)}%"></div>`;
        }
        html += `</div></div>`;
    });

    html += `
        <div class="d-flex justify-content-center align-items-center gap-4 mt-3 pt-3 border-top">
            ${portL ? `<div class="d-flex align-items-center small fw-bold text-muted"><span style="width:10px;height:10px;background:#3B82F6;border-radius:50%;margin-right:6px;"></span>${portL.name}</div>` : ''}
            ${portR ? `<div class="d-flex align-items-center small fw-bold text-muted"><span style="width:10px;height:10px;background:#8B5CF6;border-radius:50%;margin-right:6px;"></span>${portR.name}</div>` : ''}
        </div>
    `;

    content.innerHTML = html;
    
    setTimeout(() => {
        const newTooltips = content.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...newTooltips].map(el => new bootstrap.Tooltip(el, {container:'body', html: true}));
    }, 50);
}

function getGlobalPortfolio(portId) {
    let found = state.portfolios.find(p => p.id === portId);
    if (found) return found;
    for (const group of PRESET_PORTFOLIOS) {
        found = group.portfolios.find(p => p.id === portId);
        if (found) return found;
    }
    return null;
}

function renderStrategyChart() {
    const ctx = document.getElementById('strategyChart');
    if(!ctx) return;
    if (state.strategyChartInstance) state.strategyChartInstance.destroy();

    const isAssetView = document.getElementById('strat-view-toggle')?.checked;
    const years = [...state.strategyYears].sort((a,b)=>b-a);
    const labels = years.map(y => y + " Yrs");

    let datasets = [];

    if (isAssetView) {
        const resolvedPoints = scrapeAndResolveStrategy(); 
        ASSET_CLASSES.forEach(ac => {
            const data = resolvedPoints.map(pt => (pt.weights[ac.key] || 0) * 100);
            if(data.some(d => d > 0)) {
                datasets.push({
                    label: ac.name,
                    data: data,
                    backgroundColor: ac.color,
                    borderColor: 'transparent',
                    pointRadius: 0,
                    fill: true,
                    tension: 0
                });
            }
        });
    } else {
        const rawPoints = scrapeStrategyUI(); 
        const portfoliosInUse = new Set();
        rawPoints.forEach(pt => Object.keys(pt.weights).forEach(k => { if(pt.weights[k]>0) portfoliosInUse.add(k); }));
        
        const genericColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
        Array.from(portfoliosInUse).forEach((portId, idx) => {
            const pName = getGlobalPortfolio(portId)?.name || portId;
            const data = rawPoints.map(pt => (pt.weights[portId] || 0) * 100);
            datasets.push({
                label: pName,
                data: data,
                backgroundColor: genericColors[idx % genericColors.length], 
                borderColor: 'transparent',
                pointRadius: 0,
                fill: true,
                tension: 0
            });
        });
    }

    state.strategyChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: {size: 11} } },
                tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toFixed(1)}%` } }
            },
            scales: {
                x: { grid: { display: false } },
                y: { stacked: true, min: 0, max: 100, border: { display: false } }
            }
        }
    });
}

function renderStrategyTable() {
    const table = document.getElementById('strategy-table');
    if(!table) return;
    const thead = table.querySelector('thead'); const tbody = table.querySelector('tbody');
    
    let headHTML = '<th style="width: 250px;" class="text-start ps-4">Building Blocks</th>';
    state.strategyYears.forEach((y, i) => {
        headHTML += `<th>
            <div class="input-group input-group-sm justify-content-center">
                <input type="number" class="form-control text-center fw-bold bg-transparent strat-year-header" value="${y}" style="max-width:60px;" data-col="${i}">
                <span class="input-group-text border-0 bg-transparent px-1">Yrs</span>
            </div>
        </th>`;
    });
    thead.innerHTML = `<tr>${headHTML}</tr>`;

    tbody.innerHTML = '';
    const frag = document.createDocumentFragment();
    
    for(let r=0; r<10; r++) {
        const tr = document.createElement('tr');
        const selCell = document.createElement('td');
        selCell.className = "text-start ps-3";
        
        let selHTML = `<select class="form-select form-select-sm strat-port-select bg-transparent text-primary fw-medium border-0 shadow-none"><option value="none">-- Select Portfolio --</option>`;
        
        PRESET_PORTFOLIOS.forEach(group => {
            selHTML += `<optgroup label="${group.name}">`;
            group.portfolios.forEach(p => {
                selHTML += `<option value="${p.id}">${p.name}</option>`;
            });
            selHTML += `</optgroup>`;
        });
        
        const customs = state.portfolios.filter(p => p.id.startsWith('custom_'));
        if(customs.length > 0) {
            selHTML += `<optgroup label="Custom Portfolios">`;
            customs.forEach(p => { selHTML += `<option value="${p.id}">${p.name}</option>`; });
            selHTML += `</optgroup>`;
        }

        selCell.innerHTML = selHTML + `</select>`;
        tr.appendChild(selCell);

        state.strategyYears.forEach((y, i) => {
            const td = document.createElement('td');
            td.innerHTML = `<input type="number" class="form-control form-control-sm text-center bg-transparent border-0 strat-weight-input" data-row="${r}" data-col="${i}" value="0" step="5">`;
            tr.appendChild(td);
        });
        frag.appendChild(tr);
    }
    tbody.appendChild(frag);

    table.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', () => {
            renderStrategyChart(); 
            if(!state.autoRun) return;
            updateUIState('Updating...');
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(runSimulation, 600);
        });
    });
}

function addStrategyYearColumn() {
    const table = document.getElementById('strategy-table');
    const yearInputs = table.querySelectorAll('.strat-year-header');
    
    const portSelections = [];
    for(let r=0; r<10; r++) portSelections.push(table.querySelectorAll('.strat-port-select')[r].value);

    const weightsMatrix = [];
    yearInputs.forEach((yInp, colIdx) => {
        const colWeights = [];
        for(let r=0; r<10; r++) {
            const wInp = table.querySelector(`input.strat-weight-input[data-row="${r}"][data-col="${colIdx}"]`);
            colWeights.push(wInp ? wInp.value : 0);
        }
        weightsMatrix.push({ year: parseFloat(yInp.value), colWeights });
    });

    weightsMatrix.push({ year: 10, colWeights: Array(10).fill(0) });
    weightsMatrix.sort((a,b) => b.year - a.year);

    state.strategyYears = weightsMatrix.map(w => w.year);
    renderStrategyTable();

    const newTable = document.getElementById('strategy-table');
    for(let r=0; r<10; r++) {
        newTable.querySelectorAll('.strat-port-select')[r].value = portSelections[r];
        weightsMatrix.forEach((wm, colIdx) => {
            const wInp = newTable.querySelector(`input.strat-weight-input[data-row="${r}"][data-col="${colIdx}"]`);
            if(wInp) wInp.value = wm.colWeights[r];
        });
    }
    renderStrategyChart();
}

function scrapeStrategyUI() {
    const table = document.getElementById('strategy-table');
    if(!table) return [];
    const yearInputs = table.querySelectorAll('.strat-year-header');
    const points = [];

    yearInputs.forEach((yInp, colIdx) => {
        const years = parseFloat(yInp.value) || 0;
        const weights = {};
        for(let r=0; r<10; r++) {
            const portSelect = table.querySelectorAll('.strat-port-select')[r];
            const weightInput = table.querySelector(`input.strat-weight-input[data-row="${r}"][data-col="${colIdx}"]`);
            if (portSelect && weightInput && portSelect.value !== 'none') {
                weights[portSelect.value] = (parseFloat(weightInput.value) || 0) / 100;
            }
        }
        points.push({ years, weights });
    });
    points.sort((a,b)=>b.years - a.years);
    return points;
}

function scrapeAndResolveStrategy() {
    const rawPoints = scrapeStrategyUI();
    return rawPoints.map(pt => {
        const resolvedAssets = {};
        let alpha = 0; let te = 0;
        
        ASSET_CLASSES.forEach(ac => resolvedAssets[ac.key] = 0);
        
        Object.entries(pt.weights).forEach(([portId, blendWeight]) => {
            const port = getGlobalPortfolio(portId);
            if(port && blendWeight > 0) {
                alpha += (port.alpha || 0) * blendWeight;
                te += (port.te || 0) * blendWeight;
                ASSET_CLASSES.forEach(ac => resolvedAssets[ac.key] += (port.weights[ac.key] || 0) * blendWeight);
            }
        });
        return { years: pt.years, weights: resolvedAssets, alpha, te };
    });
}

function getActiveCMA() {
    const sel = document.getElementById('run-cma-select');
    if (!sel || sel.value === 'custom') {
        const r = {}, v = {}, k = {}, correlations = {};
        
        ASSET_CLASSES.forEach(ac => correlations[ac.key] = {});

        document.querySelectorAll('#cma-table tbody tr').forEach(tr => {
            tr.querySelectorAll('input:not(.corr-input)').forEach(inp => {
                const val = parseFloat(inp.value) || 0;
                if(inp.dataset.field === 'r') r[inp.dataset.key] = val / 100;
                if(inp.dataset.field === 'v') v[inp.dataset.key] = val / 100;
                if(inp.dataset.field === 'k') k[inp.dataset.key] = val; 
            });
            
            tr.querySelectorAll('.corr-input').forEach(inp => {
                const val = parseFloat(inp.value) || 0;
                correlations[inp.dataset.row][inp.dataset.col] = val;
            });
        });
        return { r, v, k, correlations };
    }
    return PRESET_CMAS[sel.value].data;
}

function getActivePersona() {
    const sel = document.getElementById('run-persona-select');
    if (!sel || sel.value === 'custom') {
        return {
            age: parseFloat(document.getElementById('p-age').value),
            retirementAge: parseFloat(document.getElementById('p-retAge').value),
            savings: parseFloat(document.getElementById('p-pot').value),
            salary: parseFloat(document.getElementById('p-salary').value),
            contribution: parseFloat(document.getElementById('p-contrib').value),
            realSalaryGrowth: parseFloat(document.getElementById('p-growth').value)
        };
    }
    return PRESET_PERSONAS[sel.value].data;
}

function getActiveStrategies(months) {
    const strategies = [];
    ['run-strat-1', 'run-strat-2', 'run-strat-3'].forEach(selId => {
        const sel = document.getElementById(selId);
        if(!sel || sel.value === "") return;
        
        let name, resolvedPoints;
        if(sel.value === 'custom') {
            name = "Active Builder Strategy";
            resolvedPoints = scrapeAndResolveStrategy();
        } else {
            const parts = sel.value.split('_');
            const group = parts[0];
            const index = parseInt(parts[1]);
            
            const preset = group === 'core' ? PRESET_STRATEGIES[index] : PROVIDER_STRATEGIES[index];
            name = preset.name; 
            
            resolvedPoints = preset.points.map(pt => {
                const resolvedAssets = {};
                let alpha = 0; let te = 0;
                
                ASSET_CLASSES.forEach(ac => resolvedAssets[ac.key] = 0);
                Object.entries(pt.weights).forEach(([portId, weight]) => {
                    const port = getGlobalPortfolio(portId);
                    if(port) {
                        alpha += (port.alpha || 0) * weight;
                        te += (port.te || 0) * weight;
                        ASSET_CLASSES.forEach(ac => resolvedAssets[ac.key] += (port.weights[ac.key]||0) * weight);
                    }
                });
                return { years: pt.years, weights: resolvedAssets, alpha, te };
            });
        }
        strategies.push({ name, monthlyData: interpolateWeights(resolvedPoints, months), implAdjustments: {} });
    });
    return strategies;
}

function interpolateWeights(points, totalMonths) {
    if(!points || points.length === 0) return [];
    const monthlyData = [];
    for (let m = 0; m < totalMonths; m++) {
        const yearsRemaining = (totalMonths - m) / 12;
        let p1 = points[0], p2 = points[points.length - 1];
        for (let i = 0; i < points.length - 1; i++) {
            if (yearsRemaining <= points[i].years && yearsRemaining >= points[i+1].years) {
                p1 = points[i]; p2 = points[i+1]; break;
            }
        }
        const ratio = (p1.years - p2.years) === 0 ? 0 : (yearsRemaining - p2.years) / (p1.years - p2.years);
        const w = {};
        ASSET_CLASSES.forEach(ac => {
            let w1 = (p1.weights ? p1.weights[ac.key] : p1[ac.key]) || 0;
            let w2 = (p2.weights ? p2.weights[ac.key] : p2[ac.key]) || 0;
            w[ac.key] = w2 + (w1 - w2) * ratio;
        });
        
        const a1 = p1.alpha || 0; const a2 = p2.alpha || 0;
        const alpha = a2 + (a1 - a2) * ratio;
        
        const t1 = p1.te || 0; const t2 = p2.te || 0;
        const te = t2 + (t1 - t2) * ratio;
        
        monthlyData.push({ weights: w, alpha, te });
    }
    return monthlyData;
}

function runSimulation() {
    updateUIState('Running...');
    try {
        const simInput = document.getElementById('setting-sim-count');
        const infInput = document.getElementById('setting-inflation');
        const sysKInput = document.getElementById('setting-sys-kurtosis');
        
        const simCount = simInput ? parseInt(simInput.value) : 2000;
        let inflation = 2.5;
        if(infInput && infInput.value !== "") inflation = parseFloat(infInput.value);
        
        let sysKurtosis = 2.0;
        if(sysKInput && sysKInput.value !== "") sysKurtosis = parseFloat(sysKInput.value);

        const persona = getActivePersona();
        const cma = getActiveCMA();
        const months = Math.max(1, (persona.retirementAge - persona.age) * 12);
        const strategies = getActiveStrategies(months);

        if (strategies.length === 0) { updateUIState('Ready'); return; }

        const payload = { cma, assetKeys: ASSET_CLASSES.map(a => a.key), persona, settings: { simCount, inflation, sysKurtosis }, strategies };
        state.worker.postMessage({ type: 'RUN_SIMULATION', payload });
    } catch(e) {
        console.error("Run Error", e);
        updateUIState('Error');
    }
}

function updateConfidence() {
    const slider = document.getElementById('confidence-slider');
    const val = parseInt(slider.value);
    document.getElementById('confidence-label').innerText = `${val}%`;
    state.worker.postMessage({ type: 'RECALCULATE_STATS', payload: { confidence: val / 100 } });
}

function renderChart(results) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (state.chartInstance) state.chartInstance.destroy();
    
    const startAge = results[0].meta.startAge;
    const months = results[0].percentiles.pMedian.length;
    const labels = Array.from({length: months}, (_, i) => i);

    const datasets = [];
    results.forEach((res, index) => {
        const color = CHART_COLORS[index % CHART_COLORS.length];
        const isPrimary = (index === 0);
        
        if (!isPrimary) {
            datasets.push({ label: res.name, data: res.percentiles.pMedian, borderColor: color.border, backgroundColor: color.border, pointRadius: 0, borderWidth: 3, borderDash: [5, 5], tension: 0.4 });
            datasets.push({ label: `${res.name} Range`, data: res.percentiles.pUpper, borderColor: color.border, backgroundColor: 'transparent', pointRadius: 0, borderDash: [2, 4], borderWidth: 1.5, tension: 0.4 });
            datasets.push({ label: `${res.name} Lower`, data: res.percentiles.pLower, borderColor: color.border, backgroundColor: 'transparent', pointRadius: 0, borderDash: [2, 4], borderWidth: 1.5, tension: 0.4 });
        } else {
            datasets.push({ label: `${res.name} Range`, data: res.percentiles.pUpper, borderColor: 'transparent', backgroundColor: color.gradientStart, pointRadius: 0, fill: '+1', tension: 0.4, order: 2 });
            datasets.push({ label: `${res.name} Lower`, data: res.percentiles.pLower, borderColor: 'transparent', pointRadius: 0, fill: false, tension: 0.4, order: 3 });
            datasets.push({ label: res.name, data: res.percentiles.pMedian, borderColor: color.border, backgroundColor: color.border, pointRadius: 0, borderWidth: 3, tension: 0.4, order: 1 });
        }
    });

    state.chartInstance = new Chart(ctx, {
        type: 'line', data: { labels, datasets },
        options: {
            responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { labels: { usePointStyle: true, boxWidth: 8, font: { family: 'Inter', size: 11 }, filter: item => !item.text.includes('Range') && !item.text.includes('Lower') } },
                tooltip: { backgroundColor: '#1E293B', padding: 12, cornerRadius: 8, titleFont: { family: 'Inter', size: 13 }, bodyFont: { family: 'Inter', size: 13 }, callbacks: { title: (ctx) => `Age ${Math.floor(startAge + ctx[0].dataIndex/12)}`, label: (ctx) => ctx.dataset.label.includes('Range') || ctx.dataset.label.includes('Lower') ? null : `${ctx.dataset.label}: £${Math.round(ctx.raw).toLocaleString()}` } }
            },
            scales: {
                x: { grid: { display: false }, ticks: { font: { family: 'Inter' }, callback: (val, i) => i % 60 === 0 ? Math.floor(startAge + i/12) : null } },
                y: { border: { display: false }, grid: { color: '#F1F5F9' }, ticks: { font: { family: 'Inter' } } }
            }
        }
    });
}

function renderResultsTable(results) {
    const tbody = document.querySelector('#results-table tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    const baseRes = results[0];
    const lastIdx = baseRes.percentiles.pMedian.length - 1;
    const baseLow = baseRes.percentiles.pLower[lastIdx];
    const baseMed = baseRes.percentiles.pMedian[lastIdx];
    const baseHigh = baseRes.percentiles.pUpper[lastIdx];
    
    results.forEach((res, index) => {
        const color = CHART_COLORS[index % CHART_COLORS.length];
        const last = res.percentiles.pMedian.length - 1;
        const currLow = res.percentiles.pLower[last];
        const currMed = res.percentiles.pMedian[last];
        const currHigh = res.percentiles.pUpper[last];

        const formatDiff = (val, base) => {
            if(index === 0) return '';
            const diff = ((val - base)/base)*100;
            return `<span class="small ${diff>=0?'text-success':'text-danger'} fw-bold" style="font-size:0.75rem;">(${diff>=0?'+':''}${diff.toFixed(1)}%)</span>`;
        };

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-weight:600; color: var(--text-main); border-bottom: 1px solid var(--border-light);">
                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background-color:${color.border}; margin-right:8px;"></span>
                ${res.name}
            </td>
            <td class="text-end text-muted border-bottom border-light pe-3">
                <div class="d-flex justify-content-end align-items-center gap-2"><span>£${Math.round(currLow).toLocaleString()}</span>${formatDiff(currLow, baseLow)}</div>
            </td>
            <td class="text-end col-median border-bottom border-light pe-3">
                <div class="d-flex justify-content-end align-items-center gap-2"><span>£${Math.round(currMed).toLocaleString()}</span>${formatDiff(currMed, baseMed)}</div>
            </td>
            <td class="text-end text-muted border-bottom border-light pe-4">
                <div class="d-flex justify-content-end align-items-center gap-2"><span>£${Math.round(currHigh).toLocaleString()}</span>${formatDiff(currHigh, baseHigh)}</div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateUIState(status) {
    const text = document.getElementById('status-text');
    const spinner = document.getElementById('loading-spinner');
    if(text) text.innerText = status;
    if(spinner) status === 'Running...' ? spinner.classList.remove('d-none') : spinner.classList.add('d-none');
}
