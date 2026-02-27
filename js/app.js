// js/app.js
import { ASSET_CLASSES, INITIAL_PORTFOLIOS, PRESET_STRATEGIES, PRESET_PERSONAS, PRESET_CMAS, CHART_COLORS, PIE_COLORS } from './config.js?v=7.1';

const state = {
    worker: null,
    chartInstance: null,
    pieLeft: null,
    pieRight: null,
    portfolios: [], 
    strategyYears: [50, 15, 0] 
};

let debounceTimer;

window.onerror = function(message, source, lineno, colno, error) { 
    console.error("Sys Err:", error); 
};

console.log("Novara App v7.1 Loading...");

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Toggle
    const wrapper = document.getElementById("wrapper");
    const menuBtn = document.getElementById("menu-toggle");
    if (menuBtn) menuBtn.onclick = (e) => { e.preventDefault(); wrapper.classList.toggle("toggled"); };

    // 2. Load State
    state.portfolios = JSON.parse(JSON.stringify(INITIAL_PORTFOLIOS));

    // 3. Attach Listeners
    setupEventListeners();

    // 4. Initialize Core Systems
    try {
        initWorker();
        renderAssetRows();
        initPresets();
        initRunModelInputs();
        setupAutoRun();
        
        // Init Builders
        refreshPortfolioDropdowns();
        renderPortfolioPane('left', state.portfolios[0].id);
        renderStrategyTable();

        // Load Defaults
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

function setupEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.list-group-item[data-tab]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.innerWidth < 768) document.getElementById("wrapper").classList.remove("toggled");
            document.querySelectorAll('.list-group-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.view-section').forEach(i => i.classList.add('d-none'));
            e.currentTarget.classList.add('active');
            document.getElementById(`tab-${e.currentTarget.dataset.tab}`).classList.remove('d-none');
        });
    });

    // Main Actions
    document.getElementById('run-simulation-btn')?.addEventListener('click', runSimulation);
    document.getElementById('confidence-slider')?.addEventListener('input', updateConfidence);
    
    // Portfolio Builder UI
    document.getElementById('portfolio-cma-select')?.addEventListener('change', () => {
        const leftId = document.getElementById('port-select-left').value;
        const rightId = document.getElementById('port-select-right').value;
        if(leftId && leftId !== 'none') updatePortfolioVisuals('left', leftId);
        if(rightId && rightId !== 'none') updatePortfolioVisuals('right', rightId);
    });

    document.getElementById('port-select-left')?.addEventListener('change', (e) => renderPortfolioPane('left', e.target.value));
    document.getElementById('port-select-right')?.addEventListener('change', (e) => renderPortfolioPane('right', e.target.value));

    document.getElementById('toggle-portfolio-inputs')?.addEventListener('click', () => {
        document.getElementById('port-inputs-left-container').classList.toggle('d-none');
        document.getElementById('port-inputs-right-container').classList.toggle('d-none');
    });

    // Globals for Inline HTML calls
    window.addStrategyYearColumn = addStrategyYearColumn;
    window.createNewPortfolio = createNewPortfolio;
}

// --- INITIALIZERS ---
function initWorker() {
    state.worker = new Worker('./js/worker.js?v=7.1');
    state.worker.onmessage = (e) => {
        const { type, payload } = e.data;
        if (type === 'SIMULATION_COMPLETE') {
            updateUIState('Ready');
            renderChart(payload);
            renderResultsTable(payload);
        } else if (type === 'ERROR') {
            updateUIState('Error');
        }
    };
}

function setupAutoRun() {
    const inputs = [
        'run-cma-select', 'run-persona-select', 
        'run-strat-1', 'run-strat-2', 'run-strat-3',
        'setting-sim-count', 'setting-inflation'
    ];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener('change', () => {
                updateUIState('Updating...');
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(runSimulation, 600); 
            });
        }
    });
}

function initPresets() {
    const cmaSelect = document.getElementById('cma-preset-select');
    if (cmaSelect) {
        cmaSelect.innerHTML = '<option value="">Load Preset...</option>';
        PRESET_CMAS.forEach((preset, index) => {
            const opt = document.createElement('option');
            opt.value = index; opt.text = preset.name;
            cmaSelect.appendChild(opt);
        });
        cmaSelect.addEventListener('change', (e) => { if(e.target.value !== "") loadCMAPreset(e.target.value); });
    }

    const stratSelect = document.getElementById('strategy-preset-select');
    if (stratSelect) {
        stratSelect.innerHTML = '<option value="">Load Preset Strategy...</option>';
        PRESET_STRATEGIES.forEach((preset, index) => {
            const opt = document.createElement('option');
            opt.value = index; opt.text = preset.name;
            stratSelect.appendChild(opt);
        });
        stratSelect.addEventListener('change', (e) => { if(e.target.value !== "") loadStrategyPreset(e.target.value); });
    }

    const persSelect = document.getElementById('persona-preset-select');
    if (persSelect) {
        persSelect.innerHTML = '<option value="">Load Preset Persona...</option>';
        PRESET_PERSONAS.forEach((preset, index) => {
            const opt = document.createElement('option');
            opt.value = index; opt.text = preset.name;
            persSelect.appendChild(opt);
        });
        persSelect.addEventListener('change', (e) => { if(e.target.value !== "") loadPersonaPreset(e.target.value); });
    }
}

function initRunModelInputs() {
    const cmaSelect = document.getElementById('run-cma-select');
    const portCmaSelect = document.getElementById('portfolio-cma-select');
    
    let html = '<option value="custom">Use "Markets" Tab</option>';
    PRESET_CMAS.forEach((preset, index) => {
        html += `<option value="${index}">${preset.name}</option>`;
    });

    if(cmaSelect) cmaSelect.innerHTML = html;
    if(portCmaSelect) portCmaSelect.innerHTML = html;

    const persSelect = document.getElementById('run-persona-select');
    if(persSelect) {
        persSelect.innerHTML = '<option value="custom">Use "Personas" Tab</option>';
        PRESET_PERSONAS.forEach((preset, index) => {
            persSelect.innerHTML += `<option value="${index}">${preset.name}</option>`;
        });
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
            PRESET_STRATEGIES.forEach((preset, index) => {
                html += `<option value="${index}">${preset.name}</option>`;
            });
            sel.innerHTML = html;
            if(curr) sel.value = curr;
        }
    });
}

// --- LOADERS ---
function loadCMAPreset(index) {
    if (!PRESET_CMAS[index]) return;
    const data = PRESET_CMAS[index].data;
    const rows = document.querySelectorAll('#cma-table tbody tr');
    rows.forEach(tr => {
        const inputs = tr.querySelectorAll('input');
        inputs.forEach(inp => {
            const key = inp.dataset.key; const field = inp.dataset.field; 
            if (data[field] && data[field][key] !== undefined) inp.value = (data[field][key] * 100).toFixed(2);
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

function loadStrategyPreset(index) {
    const preset = PRESET_STRATEGIES[index];
    if(!preset) return;
    
    state.strategyYears = preset.points.map(p => p.years).sort((a,b)=>b-a);
    renderStrategyTable(); // Reset Grid
    
    const table = document.getElementById('strategy-table');
    const selects = table.querySelectorAll('.strat-port-select');
    
    const neededPortIds = new Set();
    preset.points.forEach(pt => Object.keys(pt.weights).forEach(id => neededPortIds.add(id)));
    
    const idsArray = Array.from(neededPortIds);
    idsArray.forEach((id, rowIdx) => {
        if(selects[rowIdx]) selects[rowIdx].value = id;
    });

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
    runSimulation();
}

// --- PORTFOLIO BUILDER LOGIC ---
function refreshPortfolioDropdowns() {
    const leftSel = document.getElementById('port-select-left');
    const rightSel = document.getElementById('port-select-right');
    const stratSels = document.querySelectorAll('.strat-port-select');
    
    let html = '';
    state.portfolios.forEach(p => { html += `<option value="${p.id}">${p.name}</option>`; });
    
    const currLeft = leftSel.value;
    leftSel.innerHTML = html;
    if(currLeft) leftSel.value = currLeft;

    const currRight = rightSel.value;
    rightSel.innerHTML = `<option value="none">-- Blank --</option>` + html;
    if(currRight) rightSel.value = currRight;

    stratSels.forEach(sel => {
        const currVal = sel.value;
        sel.innerHTML = `<option value="none">-- Select Portfolio --</option>` + html;
        if(currVal) sel.value = currVal;
    });
}

function createNewPortfolio(side) {
    const num = state.portfolios.length + 1;
    const newPort = {
        id: `custom_${Date.now()}`,
        name: `Custom Portfolio ${num}`,
        weights: {}
    };
    state.portfolios.push(newPort);
    refreshPortfolioDropdowns();
    
    const selId = `port-select-${side}`;
    document.getElementById(selId).value = newPort.id;
    renderPortfolioPane(side, newPort.id);
}

function renderPortfolioPane(side, portId) {
    const bodyContainer = document.getElementById(`port-inputs-${side}-container`);
    const visualsContainer = document.getElementById(`port-visuals-${side}`);
    const blankMsg = document.getElementById(`port-blank-${side}`);
    const hr = document.getElementById(`port-hr-${side}`);

    if (portId === 'none') {
        if(bodyContainer) bodyContainer.classList.add('d-none');
        if(visualsContainer) visualsContainer.classList.add('d-none');
        if(hr) hr.classList.add('d-none');
        if(blankMsg) blankMsg.classList.remove('d-none');
        return;
    } else {
        if(bodyContainer) bodyContainer.classList.remove('d-none');
        if(visualsContainer) visualsContainer.classList.remove('d-none');
        if(hr) hr.classList.remove('d-none');
        if(blankMsg) blankMsg.classList.add('d-none');
    }

    const portfolio = state.portfolios.find(p => p.id === portId);
    if (!portfolio) return;

    const tbody = document.querySelector(`#port-table-${side} tbody`);
    tbody.innerHTML = '';

    const titleRow = tbody.insertRow();
    titleRow.innerHTML = `<td class="fw-bold text-secondary" style="width:60%">Portfolio Name</td>
                          <td><input type="text" class="form-control form-control-sm text-end fw-bold" value="${portfolio.name}"></td>`;
    
    titleRow.querySelector('input').addEventListener('change', (e) => {
        portfolio.name = e.target.value;
        refreshPortfolioDropdowns();
    });

    ASSET_CLASSES.forEach(ac => {
        const tr = tbody.insertRow();
        const w = portfolio.weights[ac.key] || 0;
        tr.innerHTML = `
            <td class="text-secondary">${ac.name}</td>
            <td><input type="number" class="form-control form-control-sm text-end border-0 bg-transparent" value="${(w*100).toFixed(1)}" data-key="${ac.key}" step="0.5"></td>
        `;
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
    let cmaData;
    if (cmaSelect && cmaSelect.value !== "custom" && cmaSelect.value !== "") {
        cmaData = PRESET_CMAS[cmaSelect.value].data;
    } else {
        cmaData = getActiveCMA();
    }

    const stats = calcDeterministicStats(portfolio.weights, cmaData);
    
    document.getElementById(`stat-ret-${side}`).innerText = (stats.arithRet * 100).toFixed(2) + '%';
    document.getElementById(`stat-geo-${side}`).innerText = (stats.geoRet * 100).toFixed(2) + '%';
    document.getElementById(`stat-vol-${side}`).innerText = (stats.vol * 100).toFixed(2) + '%';

    const ctx = document.getElementById(`pie-${side}`).getContext('2d');
    const labels = []; const data = []; const bgColors = [];
    
    let colorIdx = 0;
    ASSET_CLASSES.forEach(ac => {
        const w = portfolio.weights[ac.key] || 0;
        if(w > 0.001) {
            labels.push(ac.name);
            data.push((w*100).toFixed(1));
            bgColors.push(PIE_COLORS[colorIdx % PIE_COLORS.length]);
            colorIdx++;
        }
    });

    if (state[`pie${side}`]) state[`pie${side}`].destroy();
    
    state[`pie${side}`] = new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: bgColors, borderWidth: 1 }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: {size: 10} } } }
        }
    });
}

function calcDeterministicStats(weights, cma) {
    let ret = 0; let sum_ce = 0; let sum_cc = 0; let sum_resid_sq = 0;

    ASSET_CLASSES.forEach(ac => {
        const w = weights[ac.key] || 0;
        if(w === 0) return;
        const mu = cma.r[ac.key] || 0;
        const vol = cma.v[ac.key] || 0;
        const ce = cma.ce[ac.key] || 0;
        const cc = cma.cc[ac.key] || 0;
        const resid = Math.sqrt(Math.max(0, 1 - ce*ce - cc*cc));

        ret += w * mu;
        sum_ce += w * vol * ce;
        sum_cc += w * vol * cc;
        sum_resid_sq += Math.pow(w * vol * resid, 2);
    });

    const portVariance = Math.pow(sum_ce, 2) + Math.pow(sum_cc, 2) + sum_resid_sq;
    const portVol = Math.sqrt(portVariance);
    const rebalBonus = portVol > 0.05 ? 0.002 : 0; 
    const geoRet = ret - (portVariance / 2) + rebalBonus;

    return { arithRet: ret, geoRet: geoRet, vol: portVol };
}

// --- STRATEGY BUILDER LOGIC ---
function renderStrategyTable() {
    const table = document.getElementById('strategy-table');
    if(!table) return;
    
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    
    let headHTML = '<th style="width: 250px;" class="text-start bg-light align-middle">Underlying Portfolio</th>';
    state.strategyYears.forEach((y, i) => {
        headHTML += `<th class="bg-light">
            <div class="input-group input-group-sm justify-content-center">
                <input type="number" class="form-control text-center fw-bold text-primary strat-year-header" value="${y}" style="max-width:60px;" data-col="${i}">
                <span class="input-group-text border-0 bg-transparent px-1">Yrs</span>
            </div>
        </th>`;
    });
    thead.innerHTML = `<tr>${headHTML}</tr>`;

    tbody.innerHTML = '';
    for(let r=0; r<10; r++) {
        const tr = tbody.insertRow();
        const selCell = tr.insertCell();
        selCell.className = "text-start";
        
        let selHTML = `<select class="form-select form-select-sm strat-port-select border-0 bg-transparent text-primary fw-medium"><option value="none">-- Select Portfolio --</option>`;
        state.portfolios.forEach(p => { selHTML += `<option value="${p.id}">${p.name}</option>`; });
        selHTML += `</select>`;
        selCell.innerHTML = selHTML;

        state.strategyYears.forEach((y, i) => {
            const td = tr.insertCell();
            td.innerHTML = `<input type="number" class="form-control form-control-sm text-center border-0 bg-transparent strat-weight-input" data-row="${r}" data-col="${i}" value="0" step="5">`;
        });
    }

    table.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', () => {
            updateUIState('Updating...');
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(runSimulation, 600);
        });
    });
}

function addStrategyYearColumn() {
    state.strategyYears.push(10);
    state.strategyYears.sort((a,b)=> b-a);
    renderStrategyTable();
}

function scrapeAndResolveStrategy() {
    const table = document.getElementById('strategy-table');
    if(!table) return [];

    const yearInputs = table.querySelectorAll('.strat-year-header');
    const points = [];

    yearInputs.forEach((yInp, colIdx) => {
        const years = parseFloat(yInp.value);
        const resolvedAssets = {};
        ASSET_CLASSES.forEach(ac => resolvedAssets[ac.key] = 0);

        for(let r=0; r<10; r++) {
            const portSelect = table.querySelectorAll('.strat-port-select')[r];
            const weightInput = table.querySelector(`input.strat-weight-input[data-row="${r}"][data-col="${colIdx}"]`);
            
            const portId = portSelect.value;
            const blendWeight = (parseFloat(weightInput.value) || 0) / 100;

            if (portId !== 'none' && blendWeight > 0) {
                const port = state.portfolios.find(p => p.id === portId);
                if (port) {
                    ASSET_CLASSES.forEach(ac => {
                        resolvedAssets[ac.key] += (port.weights[ac.key] || 0) * blendWeight;
                    });
                }
            }
        }
        points.push({ years, weights: resolvedAssets });
    });

    points.sort((a,b)=>b.years - a.years);
    return points;
}

// --- DATA FETCHERS ---
function getActiveCMA() {
    const sel = document.getElementById('run-cma-select');
    if (!sel || sel.value === 'custom') {
        const r = {}, v = {}, ce = {}, cc = {};
        document.querySelectorAll('#cma-table tbody tr').forEach(tr => {
            const inputs = tr.querySelectorAll('input');
            inputs.forEach(inp => {
                const val = parseFloat(inp.value) / 100;
                if(inp.dataset.field === 'r') r[inp.dataset.key] = val;
                if(inp.dataset.field === 'v') v[inp.dataset.key] = val;
                if(inp.dataset.field === 'ce') ce[inp.dataset.key] = val;
                if(inp.dataset.field === 'cc') cc[inp.dataset.key] = val;
            });
        });
        return { r, v, ce, cc };
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
                    if(port) {
                        ASSET_CLASSES.forEach(ac => resolvedAssets[ac.key] += (port.weights[ac.key]||0) * weight);
                    }
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

// --- EXECUTION ---
function runSimulation() {
    updateUIState('Running...');
    try {
        const simInput = document.getElementById('setting-sim-count');
        const infInput = document.getElementById('setting-inflation');
        const simCount = simInput ? parseInt(simInput.value) : 2000;
        let inflation = 2.5;
        if(infInput && infInput.value !== "") inflation = parseFloat(infInput.value);

        const persona = getActivePersona();
        const cma = getActiveCMA();
        const months = Math.max(1, (persona.retirementAge - persona.age) * 12);
        const strategies = getActiveStrategies(months);

        if (strategies.length === 0) {
            updateUIState('Ready'); return;
        }

        const payload = {
            cma, assetKeys: ASSET_CLASSES.map(a => a.key),
            persona, settings: { simCount, inflation }, strategies
        };
        state.worker.postMessage({ type: 'RUN_SIMULATION', payload });
    } catch(e) {
        console.error("Run Error", e);
        updateUIState('Error');
    }
}

function updateConfidence() {
    const slider = document.getElementById('confidence-slider');
    const val = parseInt(slider.value);
    const alpha = (100 - val) / 2;
    const low = Math.round(alpha);
    const high = Math.round(100 - alpha);
    document.getElementById('confidence-label').innerText = `Confidence: ${val}% (${low}th - ${high}th)`;
    state.worker.postMessage({ type: 'RECALCULATE_STATS', payload: { confidence: val / 100 } });
}

// --- RENDERING ---
function renderChart(results) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (state.chartInstance) state.chartInstance.destroy();
    
    const startAge = results[0].meta.startAge;
    const months = results[0].percentiles.pMedian.length;
    const labels = Array.from({length: months}, (_, i) => i);
    const isMulti = results.length > 1;

    const datasets = [];
    results.forEach((res, index) => {
        const color = CHART_COLORS[index % CHART_COLORS.length];
        
        if (isMulti) {
            datasets.push({ label: res.name, data: res.percentiles.pMedian, borderColor: color.border, backgroundColor: color.border, pointRadius: 0, borderWidth: 2.5, tension: 0.1 });
            datasets.push({ label: `${res.name} Range`, data: res.percentiles.pUpper, borderColor: color.border, backgroundColor: 'transparent', pointRadius: 0, borderDash: [5, 5], borderWidth: 1.5, tension: 0.1 });
            datasets.push({ label: `${res.name} Lower`, data: res.percentiles.pLower, borderColor: color.border, backgroundColor: 'transparent', pointRadius: 0, borderDash: [5, 5], borderWidth: 1.5, tension: 0.1 });
        } else {
            datasets.push({ label: `${res.name} Range`, data: res.percentiles.pUpper, borderColor: 'transparent', backgroundColor: color.gradientStart, pointRadius: 0, fill: '+1', tension: 0.1, order: 2 });
            datasets.push({ label: `${res.name} Lower`, data: res.percentiles.pLower, borderColor: 'transparent', pointRadius: 0, fill: false, tension: 0.1, order: 3 });
            datasets.push({ label: res.name, data: res.percentiles.pMedian, borderColor: color.border, backgroundColor: color.border, pointRadius: 0, borderWidth: 2.5, tension: 0.1, order: 1 });
        }
    });

    state.chartInstance = new Chart(ctx, {
        type: 'line', data: { labels, datasets },
        options: {
            responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { labels: { usePointStyle: true, filter: item => !item.text.includes('Range') && !item.text.includes('Lower') } },
                tooltip: { callbacks: { title: (ctx) => `Age ${Math.floor(startAge + ctx[0].dataIndex/12)}`, label: (ctx) => ctx.dataset.label.includes('Range') || ctx.dataset.label.includes('Lower') ? null : `${ctx.dataset.label}: £${Math.round(ctx.raw).toLocaleString()}` } }
            },
            scales: { x: { display: true, ticks: { callback: (val, i) => i % 60 === 0 ? Math.floor(startAge + i/12) : null } }, y: { display: true } }
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
            return `<br><span class="small ${diff>=0?'text-success':'text-danger'}" style="font-size:0.75rem">(${diff>=0?'+':''}${diff.toFixed(1)}%)</span>`;
        };

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="border-left: 4px solid ${color.border}; font-weight:600;">${res.name}</td>
            <td class="text-end text-secondary">£${Math.round(currLow).toLocaleString()}${formatDiff(currLow, baseLow)}</td>
            <td class="text-end col-median">£${Math.round(currMed).toLocaleString()}${formatDiff(currMed, baseMed)}</td>
            <td class="text-end text-secondary">£${Math.round(currHigh).toLocaleString()}${formatDiff(currHigh, baseHigh)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderAssetRows() {
    const tbody = document.querySelector('#cma-table tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    ASSET_CLASSES.forEach(asset => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-medium">${asset.name}</td>
            <td class="text-end"><input type="number" step="0.1" class="form-control form-control-sm text-end border-0 bg-transparent" data-key="${asset.key}" data-field="r" value="${(asset.defaultR * 100).toFixed(2)}"></td>
            <td class="text-end"><input type="number" step="0.1" class="form-control form-control-sm text-end border-0 bg-transparent" data-key="${asset.key}" data-field="v" value="${(asset.defaultV * 100).toFixed(2)}"></td>
            <td class="text-end"><input type="number" step="0.1" class="form-control form-control-sm text-end border-0 bg-transparent" data-key="${asset.key}" data-field="ce" value="0"></td>
            <td class="text-end"><input type="number" step="0.1" class="form-control form-control-sm text-end border-0 bg-transparent" data-key="${asset.key}" data-field="cc" value="0"></td>
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
