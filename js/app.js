// js/app.js
import { ASSET_CLASSES, INITIAL_PORTFOLIOS, PRESET_PORTFOLIOS, PRESET_STRATEGIES, PRESET_PERSONAS, PRESET_CMAS, CHART_COLORS, PIE_COLORS } from './config.js?v=11.1';

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
        initPresets();
        initRunModelInputs();
        setupAutoRun();
        
        refreshPortfolioDropdowns();
        renderPortfolioPane('left', state.portfolios[0].id);
        renderStrategyTable();

        // FIX: Force Tooltips to render on the body so they don't get clipped by parent cards
        initTooltips();

        try {
            if(PRESET_CMAS && PRESET_CMAS.length > 0) loadCMAPreset(0);
            if(PRESET_PERSONAS && PRESET_PERSONAS.length > 0) loadPersonaPreset(0);
            if(PRESET_STRATEGIES && PRESET_STRATEGIES.length > 0) loadStrategyPreset(0);
            
            setTimeout(runSimulation, 500);
        } catch (dataErr) {
            console.warn("Default Data Load Warning:", dataErr);
        }
    } catch (err) {
        console.error("Critical Init Error:", err);
    }
});

function initTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, {
        container: 'body' 
    }));
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

// Math logic for accurate distribution splines
function logGamma(z) {
    let co = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let x = z, y = z, tmp = x + 5.5, ser = 1.000000000190015;
    tmp -= (x + 0.5) * Math.log(tmp);
    for (let j = 0; j < 6; j++) ser += co[j] / ++y;
    return Math.log(2.5066282746310005 * ser / x) - tmp;
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
    const tbody = document.querySelector('#cma-table tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    ASSET_CLASSES.forEach(asset => {
        const tr = document.createElement('tr');
        // FIX: Now rendering exactly 7 <td> cells to match the 7 <th> headers. 
        // CE and CC step at 0.01 as they are -1.0 to 1.0 correlations, not percentages.
        tr.innerHTML = `
            <td class="fw-medium text-muted">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${asset.color}; margin-right:6px;"></span>
                ${asset.name}
            </td>
            <td class="text-center"><canvas id="dist-${asset.key}" class="dist-canvas" width="80" height="30"></canvas></td>
            <td class="text-end"><input type="number" step="0.1" class="form-control form-control-sm text-end bg-transparent border-0" data-key="${asset.key}" data-field="r" value="${(asset.defaultR * 100).toFixed(2)}"></td>
            <td class="text-end"><input type="number" step="0.1" class="form-control form-control-sm text-end bg-transparent border-0" data-key="${asset.key}" data-field="v" value="${(asset.defaultV * 100).toFixed(2)}"></td>
            <td class="text-end"><input type="number" step="0.1" class="form-control form-control-sm text-end bg-transparent border-0" data-key="${asset.key}" data-field="k" value="${(asset.defaultK).toFixed(2)}"></td>
            <td class="text-end"><input type="number" step="0.01" class="form-control form-control-sm text-end bg-transparent border-0" data-key="${asset.key}" data-field="ce" value="0.00"></td>
            <td class="text-end"><input type="number" step="0.01" class="form-control form-control-sm text-end bg-transparent border-0" data-key="${asset.key}" data-field="cc" value="0.00"></td>
        `;
        tbody.appendChild(tr);
        
        const inputs = tr.querySelectorAll('input[data-field="r"], input[data-field="v"], input[data-field="k"]');
        inputs.forEach(inp => {
            inp.addEventListener('input', () => {
                const r = parseFloat(tr.querySelector('input[data-field="r"]').value)/100 || 0;
                const v = parseFloat(tr.querySelector('input[data-field="v"]').value)/100 || 0;
                const k = parseFloat(tr.querySelector('input[data-field="k"]').value) || 0;
                drawDistributionChart(asset.key, r, v, k, asset.color);
            });
        });
        setTimeout(() => drawDistributionChart(asset.key, asset.defaultR, asset.defaultV, asset.defaultK, asset.color), 0);
    });
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
    state.worker = new Worker('./js/worker.js?v=11.1'); 
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
        PRESET_STRATEGIES.forEach((preset, index) => { stratSelect.innerHTML += `<option value="${index}">${preset.name}</option>`; });
        stratSelect.addEventListener('change', (e) => { if(e.target.value !== "") loadStrategyPreset(e.target.value); });
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
            PRESET_STRATEGIES.forEach((preset, index) => { html += `<option value="${index}">${preset.name}</option>`; });
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

// FIX: Explicitly handle which variables are percentages and which are raw scalars
function loadCMAPreset(index) {
    if (!PRESET_CMAS[index]) return;
    const data = PRESET_CMAS[index].data;
    document.querySelectorAll('#cma-table tbody tr').forEach(tr => {
        tr.querySelectorAll('input').forEach(inp => {
            const key = inp.dataset.key; const field = inp.dataset.field; 
            if (data[field] && data[field][key] !== undefined) {
                const val = data[field][key];
                if (field === 'r' || field === 'v') {
                    inp.value = (val * 100).toFixed(2);
                } else {
                    // Kurtosis and Correlations are displayed as raw numbers
                    inp.value = val.toFixed(2);
                }
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

function loadStrategyPreset(index) {
    const preset = PRESET_STRATEGIES[index];
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
    const newPort = { id: `custom_${Date.now()}`, name: `Custom Portfolio ${num}`, weights: {} };
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
        return;
    } else {
        if(visualsContainer) visualsContainer.classList.remove('d-none');
        if(blankMsg) blankMsg.classList.add('d-none');
    }

    const portfolio = state.portfolios.find(p => p.id === portId);
    if (!portfolio) return;

    const tbody = document.querySelector(`#port-table-${side} tbody`);
    tbody.innerHTML = '';

    const titleRow = tbody.insertRow();
    titleRow.innerHTML = `<td class="fw-bold text-muted text-uppercase" style="width:50%">Name</td>
                          <td><input type="text" class="form-control form-control-sm text-end fw-bold" value="${portfolio.name}"></td>`;
    titleRow.querySelector('input').addEventListener('change', (e) => {
        portfolio.name = e.target.value; refreshPortfolioDropdowns();
    });

    ASSET_CLASSES.forEach(ac => {
        const tr = tbody.insertRow();
        const w = portfolio.weights[ac.key] || 0;
        tr.innerHTML = `<td class="text-muted fw-medium">${ac.name}</td>
            <td><input type="number" class="form-control form-control-sm text-end bg-transparent" value="${(w*100).toFixed(1)}" data-key="${ac.key}" step="0.5"></td>`;
        tr.querySelector('input').addEventListener('input', (e) => {
            portfolio.weights[ac.key] = (parseFloat(e.target.value) || 0) / 100;
            updatePortfolioVisuals(side, portId);
        });
    });
    updatePortfolioVisuals(side, portId);
}

function updatePortfolioVisuals(side, portId) {
    const portfolio = state.portfolios.find(p => p.id === portId);
    if (!portfolio) return;

    const cmaSelect = document.getElementById('portfolio-cma-select');
    let cmaData = (cmaSelect && cmaSelect.value !== "custom" && cmaSelect.value !== "") ? PRESET_CMAS[cmaSelect.value].data : getActiveCMA();

    const stats = calcDeterministicStats(portfolio.weights, cmaData);
    document.getElementById(`stat-ret-${side}`).innerText = (stats.arithRet * 100).toFixed(2) + '%';
    document.getElementById(`stat-geo-${side}`).innerText = (stats.geoRet * 100).toFixed(2) + '%';
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
}

function calcDeterministicStats(weights, cma) {
    let ret = 0; let sum_ce = 0; let sum_cc = 0; let sum_basis = 0; let sum_idio_sq = 0;
    
    ASSET_CLASSES.forEach(ac => {
        const w = weights[ac.key] || 0;
        if(w === 0) return;
        const mu = cma.r[ac.key] || 0; 
        const vol = cma.v[ac.key] || 0;
        
        let ce = cma.ce[ac.key] || 0; 
        let cc = cma.cc[ac.key] || 0;
        const sumSq = ce*ce + cc*cc;
        if (sumSq > 1) { ce = ce / Math.sqrt(sumSq); cc = cc / Math.sqrt(sumSq); }
        
        const resid = Math.sqrt(Math.max(0, 1 - ce*ce - cc*cc));
        
        ret += w * mu; 
        sum_ce += w * vol * ce; 
        sum_cc += w * vol * cc; 
        sum_basis += w * vol * resid * Math.sqrt(0.3);
        sum_idio_sq += Math.pow(w * vol * resid * Math.sqrt(0.7), 2);
    });
    
    const portVariance = Math.pow(sum_ce, 2) + Math.pow(sum_cc, 2) + Math.pow(sum_basis, 2) + sum_idio_sq;
    const portVol = Math.sqrt(portVariance);
    const geoRet = ret - (portVariance / 2);
    
    return { arithRet: ret, geoRet: geoRet, vol: portVol };
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
                    tension: 0.4 
                });
            }
        });
    } else {
        const rawPoints = scrapeStrategyUI(); 
        const portfoliosInUse = new Set();
        rawPoints.forEach(pt => Object.keys(pt.weights).forEach(k => { if(pt.weights[k]>0) portfoliosInUse.add(k); }));
        
        const genericColors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
        Array.from(portfoliosInUse).forEach((portId, idx) => {
            const pName = state.portfolios.find(p => p.id === portId)?.name || portId;
            const data = rawPoints.map(pt => (pt.weights[portId] || 0) * 100);
            datasets.push({
                label: pName,
                data: data,
                backgroundColor: genericColors[idx % genericColors.length], 
                borderColor: 'transparent',
                pointRadius: 0,
                fill: true,
                tension: 0.4
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
    for(let r=0; r<10; r++) {
        const tr = tbody.insertRow();
        const selCell = tr.insertCell(); selCell.className = "text-start ps-3";
        let selHTML = `<select class="form-select form-select-sm strat-port-select bg-transparent text-primary fw-medium border-0 shadow-none"><option value="none">-- Select Portfolio --</option>`;
        state.portfolios.forEach(p => { selHTML += `<option value="${p.id}">${p.name}</option>`; });
        selCell.innerHTML = selHTML + `</select>`;

        state.strategyYears.forEach((y, i) => {
            const td = tr.insertCell();
            td.innerHTML = `<input type="number" class="form-control form-control-sm text-center bg-transparent border-0 strat-weight-input" data-row="${r}" data-col="${i}" value="0" step="5">`;
        });
    }

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
            if (portSelect.value !== 'none') {
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
        ASSET_CLASSES.forEach(ac => resolvedAssets[ac.key] = 0);
        
        Object.entries(pt.weights).forEach(([portId, blendWeight]) => {
            const port = state.portfolios.find(p => p.id === portId);
            if(port && blendWeight > 0) {
                ASSET_CLASSES.forEach(ac => resolvedAssets[ac.key] += (port.weights[ac.key] || 0) * blendWeight);
            }
        });
        return { years: pt.years, weights: resolvedAssets };
    });
}

// FIX: Explicitly handle percentage scaling vs. raw scalars (Kurtosis/Correlations)
function getActiveCMA() {
    const sel = document.getElementById('run-cma-select');
    if (!sel || sel.value === 'custom') {
        const r = {}, v = {}, k = {}, ce = {}, cc = {};
        document.querySelectorAll('#cma-table tbody tr').forEach(tr => {
            const inputs = tr.querySelectorAll('input');
            inputs.forEach(inp => {
                const val = parseFloat(inp.value) || 0;
                if(inp.dataset.field === 'r') r[inp.dataset.key] = val / 100;
                if(inp.dataset.field === 'v') v[inp.dataset.key] = val / 100;
                if(inp.dataset.field === 'k') k[inp.dataset.key] = val; // Kurtosis is raw
                if(inp.dataset.field === 'ce') ce[inp.dataset.key] = val; // Correlations are raw
                if(inp.dataset.field === 'cc') cc[inp.dataset.key] = val; // Correlations are raw
            });
        });
        return { r, v, k, ce, cc };
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
            const preset = PRESET_STRATEGIES[sel.value];
            name = preset.name; 
            resolvedPoints = preset.points.map(pt => {
                const resolvedAssets = {};
                ASSET_CLASSES.forEach(ac => resolvedAssets[ac.key] = 0);
                Object.entries(pt.weights).forEach(([portId, weight]) => {
                    const port = state.portfolios.find(p => p.id === portId);
                    if(port) ASSET_CLASSES.forEach(ac => resolvedAssets[ac.key] += (port.weights[ac.key]||0) * weight);
                });
                return { years: pt.years, weights: resolvedAssets };
            });
        }
        strategies.push({ name, monthlyWeights: interpolateWeights(resolvedPoints, months), implAdjustments: {} });
    });
    return strategies;
}

function interpolateWeights(points, totalMonths) {
    if(!points || points.length === 0) return [];
    const monthlyWeights = [];
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
        monthlyWeights.push(w);
    }
    return monthlyWeights;
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
                <div class="d-flex justify-content-end align-items-center gap-2"><span>£${Math.round(currHigh).toLocaleString()}</span></div>
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
