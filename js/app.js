// js/app.js
import { ASSET_CLASSES, PRESET_PORTFOLIOS, PRESET_STRATEGIES, PRESET_PERSONAS, PRESET_CMAS, CHART_COLORS } from './config.js?v=6.0';

const state = { worker: null, chartInstance: null };
let debounceTimer;

window.onerror = function(message, source, lineno, colno, error) { console.error("Sys Err:", error); };

console.log("Novara App v6.0 Loading...");

document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById("wrapper");
    const menuBtn = document.getElementById("menu-toggle");
    if (menuBtn) {
        menuBtn.onclick = (e) => {
            e.preventDefault();
            wrapper.classList.toggle("toggled");
        };
    }

    setupEventListeners();

    try {
        initWorker();
        renderAssetRows();
        initPresets();
        initRunModelInputs();
        setupAutoRun();
        
        try {
            if(PRESET_CMAS && PRESET_CMAS.length > 0) loadCMAPreset(0);
            if(PRESET_PORTFOLIOS && PRESET_PORTFOLIOS.length > 0) loadPortfolioPreset(0);
            if(PRESET_STRATEGIES && PRESET_STRATEGIES.length > 0) loadStrategyPreset(0);
            if(PRESET_PERSONAS && PRESET_PERSONAS.length > 0) loadPersonaPreset(0);
            
            setTimeout(runSimulation, 500);
        } catch (dataErr) {
            console.warn("Default Data Load Warning:", dataErr);
        }
    } catch (err) {
        console.error("Critical Init Error:", err);
    }
});

function setupEventListeners() {
    document.querySelectorAll('.list-group-item[data-tab]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const wrapper = document.getElementById("wrapper");
            if (window.innerWidth < 768) wrapper.classList.remove("toggled");

            document.querySelectorAll('.list-group-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.view-section').forEach(i => i.classList.add('d-none'));
            
            e.currentTarget.classList.add('active');
            const target = e.currentTarget.dataset.tab;
            
            // Sync Strategy UI with Portfolio headers if user opens Strategy tab
            if (target === 'strategy') syncStrategyRowsToPortfolios();

            document.getElementById(`tab-${target}`).classList.remove('d-none');
        });
    });

    const runBtn = document.getElementById('run-simulation-btn');
    if(runBtn) runBtn.addEventListener('click', runSimulation);

    const slider = document.getElementById('confidence-slider');
    if(slider) slider.addEventListener('input', updateConfidence);
    
    window.addPortfolioColumn = addPortfolioColumn;
    window.addStrategyColumn = addStrategyColumn;
}

function initWorker() {
    state.worker = new Worker('./js/worker.js?v=6.0');
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

    const portSelect = document.getElementById('portfolio-preset-select');
    if (portSelect) {
        portSelect.innerHTML = '<option value="">Load Library...</option>';
        PRESET_PORTFOLIOS.forEach((preset, index) => {
            const opt = document.createElement('option');
            opt.value = index; opt.text = preset.name;
            portSelect.appendChild(opt);
        });
        portSelect.addEventListener('change', (e) => { if(e.target.value !== "") loadPortfolioPreset(e.target.value); });
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
    if(cmaSelect) {
        cmaSelect.innerHTML = '<option value="custom">Use "Markets" Tab</option>';
        PRESET_CMAS.forEach((preset, index) => {
            const opt = document.createElement('option');
            opt.value = index; opt.text = preset.name;
            cmaSelect.appendChild(opt);
        });
    }

    const persSelect = document.getElementById('run-persona-select');
    if(persSelect) {
        persSelect.innerHTML = '<option value="custom">Use "Personas" Tab</option>';
        PRESET_PERSONAS.forEach((preset, index) => {
            const opt = document.createElement('option');
            opt.value = index; opt.text = preset.name;
            persSelect.appendChild(opt);
        });
    }

    ['run-strat-1', 'run-strat-2', 'run-strat-3'].forEach((id, i) => {
        const sel = document.getElementById(id);
        if(sel) {
            if(i === 0) sel.innerHTML = '<option value="custom">Use "Strategies" Tab</option>';
            else sel.innerHTML = '<option value="">None</option>';
            PRESET_STRATEGIES.forEach((preset, index) => {
                const opt = document.createElement('option');
                opt.value = index; opt.text = preset.name;
                sel.appendChild(opt);
            });
        }
    });
}

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

function loadPortfolioPreset(index) {
    if (!PRESET_PORTFOLIOS[index]) return;
    renderPortfolioTable(PRESET_PORTFOLIOS[index].portfolios);
}

function loadStrategyPreset(index) {
    if (!PRESET_STRATEGIES[index]) return;
    // Before rendering the strategy, ensure the table has the right portfolio rows
    syncStrategyRowsToPortfolios();
    renderStrategyTable(PRESET_STRATEGIES[index].points);
}

function loadPersonaPreset(index) {
    if (!PRESET_PERSONAS[index]) return;
    const p = PRESET_PERSONAS[index].data;
    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
    setVal('p-age', p.age); setVal('p-retAge', p.retirementAge);
    setVal('p-pot', p.savings); setVal('p-salary', p.salary);
    setVal('p-contrib', p.contribution); setVal('p-growth', p.realSalaryGrowth);
}

// --- NEW SCRAPING & RESOLUTION LOGIC ---
function scrapePortfoliosUI() {
    const table = document.getElementById('portfolio-table');
    const headerInputs = table.querySelectorAll('thead input.portfolio-name');
    const portfolios = [];

    headerInputs.forEach((hInput, colIndex) => {
        const name = hInput.value.trim() || `Portfolio ${colIndex + 1}`;
        const weights = {};
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const inputs = row.querySelectorAll('input.weight-input');
            if(inputs[colIndex]) {
                const key = inputs[colIndex].dataset.key;
                weights[key] = parseFloat(inputs[colIndex].value) / 100 || 0;
            }
        });
        portfolios.push({ name, weights });
    });
    return portfolios;
}

function scrapeStrategyUI() {
    const table = document.getElementById('strategy-table');
    const yearInputs = table.querySelectorAll('thead input.year-header');
    const points = [];

    // The rows in the Strategy table represent Portfolios
    const portfolioRows = table.querySelectorAll('tbody tr');

    yearInputs.forEach((yInput, colIndex) => {
        const years = parseFloat(yInput.value) || 0;
        const weights = {};
        
        portfolioRows.forEach(row => {
            const portName = row.dataset.portname;
            const inputs = row.querySelectorAll('input.weight-input');
            if(inputs[colIndex]) {
                weights[portName] = parseFloat(inputs[colIndex].value) / 100 || 0;
            }
        });
        points.push({ years, weights });
    });
    
    points.sort((a, b) => b.years - a.years); 
    return points;
}

// THE MATRIX MULTIPLIER: Turns a blend of portfolios into underlying assets
function resolveStrategyToAssets(strategyPoints, availablePortfolios) {
    const portDict = {};
    availablePortfolios.forEach(p => portDict[p.name] = p.weights);

    return strategyPoints.map(sp => {
        const resolvedWeights = {};
        ASSET_CLASSES.forEach(ac => resolvedWeights[ac.key] = 0);

        // Map through the portfolio allocation
        for (const [portName, portWeight] of Object.entries(sp.weights || {})) {
            const pWeights = portDict[portName];
            if (pWeights) {
                ASSET_CLASSES.forEach(ac => {
                    resolvedWeights[ac.key] += (pWeights[ac.key] || 0) * portWeight;
                });
            }
        }
        return { years: sp.years, weights: resolvedWeights };
    });
}

function getActiveStrategies(months) {
    const strategies = [];
    const uiPortfolios = scrapePortfoliosUI(); // Base blocks from tab

    ['run-strat-1', 'run-strat-2', 'run-strat-3'].forEach(selId => {
        const sel = document.getElementById(selId);
        if(!sel || sel.value === "") return;
        
        let name, rawPoints, resolvedPoints;

        if(sel.value === 'custom') {
            name = "Custom UI Strategy";
            rawPoints = scrapeStrategyUI();
            resolvedPoints = resolveStrategyToAssets(rawPoints, uiPortfolios);
        } else {
            const preset = PRESET_STRATEGIES[sel.value];
            name = preset.name; 
            // For presets, we need to resolve against the Preset Portfolio Library
            // assuming the preset strategy references preset portfolios
            const library = PRESET_PORTFOLIOS[0].portfolios; 
            resolvedPoints = resolveStrategyToAssets(preset.points, library);
        }
        
        strategies.push({ 
            name, 
            monthlyWeights: interpolateWeights(resolvedPoints, months), 
            implAdjustments: {} 
        });
    });
    return strategies;
}

// ... (Rest of logic: interpolate, getCMA, getPersona, worker interaction, chart render stays same)

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

// --- UI TABLE RENDERING (Portfolios & Strategies) ---

function renderPortfolioTable(portfolios) {
    const table = document.getElementById('portfolio-table');
    if(!table) return;
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    thead.innerHTML = ''; tbody.innerHTML = '';

    const headerRow = thead.insertRow();
    const labelTh = document.createElement('th');
    labelTh.className = "bg-light text-start"; labelTh.style.width = "200px"; labelTh.innerText = "Asset Class";
    headerRow.appendChild(labelTh);

    portfolios.forEach((p, i) => {
        const th = document.createElement('th');
        th.innerHTML = `<input type="text" class="form-control form-control-sm text-center fw-bold text-primary portfolio-name" value="${p.name}" data-col="${i}" style="min-width: 120px;">`;
        // Listen to name changes to sync Strategy tab
        th.querySelector('input').addEventListener('change', syncStrategyRowsToPortfolios);
        headerRow.appendChild(th);
    });

    ASSET_CLASSES.forEach(ac => {
        const tr = tbody.insertRow();
        const nameCell = tr.insertCell();
        nameCell.className = "text-start fw-medium"; nameCell.innerText = ac.name;

        portfolios.forEach((p, i) => {
            const td = tr.insertCell();
            let val = p.weights[ac.key] || 0;
            const displayVal = val <= 1 ? (val * 100) : val;
            td.innerHTML = `<input type="number" class="form-control form-control-sm text-center border-0 bg-transparent weight-input" data-key="${ac.key}" data-col="${i}" value="${Number(displayVal).toFixed(2)}">`;
        });
    });
    
    syncStrategyRowsToPortfolios();
}

function addPortfolioColumn() {
    let portfolios = scrapePortfoliosUI();
    if(portfolios.length >= 10) { alert("Maximum 10 portfolios allowed."); return; }
    portfolios.push({ name: `Portfolio ${portfolios.length + 1}`, weights: {} });
    renderPortfolioTable(portfolios);
}

function syncStrategyRowsToPortfolios() {
    const portfolios = scrapePortfoliosUI();
    const stratTable = document.getElementById('strategy-table');
    if(!stratTable || portfolios.length === 0) return;
    
    const tbody = stratTable.querySelector('tbody');
    // If empty, initialize standard columns
    if(stratTable.querySelector('thead').children.length === 0) {
        renderStrategyTable([{years: 50, weights:{}}, {years: 0, weights:{}}]);
        return;
    }

    // Capture existing strategy data so we don't wipe it
    const existingData = scrapeStrategyUI();

    tbody.innerHTML = '';
    portfolios.forEach((p, rowIndex) => {
        const tr = tbody.insertRow();
        tr.dataset.portname = p.name;
        
        const nameCell = tr.insertCell();
        nameCell.className = "text-start fw-medium text-primary";
        nameCell.innerText = p.name;

        // Add inputs for each existing time column
        existingData.forEach((colData, colIndex) => {
            const td = tr.insertCell();
            let val = colData.weights[p.name] || 0;
            const displayVal = val <= 1 ? (val * 100) : val;
            td.innerHTML = `<input type="number" class="form-control form-control-sm text-center border-0 bg-transparent weight-input" data-col="${colIndex}" value="${Number(displayVal).toFixed(0)}">`;
        });
    });
}

function renderStrategyTable(points) {
    const table = document.getElementById('strategy-table');
    if(!table) return;
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    thead.innerHTML = ''; tbody.innerHTML = '';

    const portfolios = scrapePortfoliosUI();

    const headerRow = thead.insertRow();
    const labelTh = document.createElement('th');
    labelTh.className = "bg-light text-start"; labelTh.style.width = "200px"; labelTh.innerText = "Portfolio Allocation";
    headerRow.appendChild(labelTh);

    points.forEach((p, i) => {
        const th = document.createElement('th');
        th.innerHTML = `
            <div class="input-group input-group-sm justify-content-center">
                <input type="number" class="form-control text-center year-header fw-bold" value="${p.years}" style="max-width:60px;" data-col="${i}">
                <span class="input-group-text border-0 bg-transparent px-1">Yrs</span>
            </div>`;
        headerRow.appendChild(th);
    });

    portfolios.forEach((port) => {
        const tr = tbody.insertRow();
        tr.dataset.portname = port.name;
        const nameCell = tr.insertCell();
        nameCell.className = "text-start fw-medium text-primary"; nameCell.innerText = port.name;

        points.forEach((p, i) => {
            const td = tr.insertCell();
            let val = p.weights[port.name] || 0;
            const displayVal = val <= 1 ? (val * 100) : val;
            td.innerHTML = `<input type="number" class="form-control form-control-sm text-center border-0 bg-transparent weight-input" data-col="${i}" value="${Number(displayVal).toFixed(0)}">`;
        });
    });
}

function addStrategyColumn() {
    let points = scrapeStrategyUI();
    points.push({ years: 10, weights: {} });
    points.sort((a, b) => b.years - a.years);
    renderStrategyTable(points);
}

// ... (renderChart and renderResultsTable identical to v5.4) ...
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
