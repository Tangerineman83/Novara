import { ASSET_CLASSES, PRESET_STRATEGIES, PRESET_PERSONAS, PRESET_CMAS, CHART_COLORS } from './config.js';

const state = {
    worker: null,
    chartInstance: null
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Menu Toggle Logic (Auto-close on mobile)
    const wrapper = document.getElementById("wrapper");
    const menuBtn = document.getElementById("menu-toggle");
    
    if (menuBtn) {
        menuBtn.onclick = (e) => {
            e.preventDefault();
            wrapper.classList.toggle("toggled");
        };
    }

    // Close sidebar when a menu item is clicked (User request)
    document.querySelectorAll('#sidebar-wrapper .list-group-item').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) { // Only on mobile/tablet
                wrapper.classList.remove("toggled");
            }
        });
    });

    // 2. Initialize App
    try {
        initWorker();
        renderAssetRows();
        initPresets(); // Populates Tab dropdowns
        initRunModelInputs(); // Populates Run Model dropdowns
        
        // Load Defaults into Tabs
        if(PRESET_STRATEGIES.length > 0) loadStrategyPreset(0);
        if(PRESET_PERSONAS.length > 0) loadPersonaPreset(0);
        
        setupEventListeners();
    } catch (err) {
        console.error("App Init Error:", err);
    }
});

function initWorker() {
    state.worker = new Worker('./js/worker.js');
    state.worker.onmessage = (e) => {
        const { type, payload } = e.data;
        if (type === 'SIMULATION_COMPLETE') {
            updateUIState('Ready');
            renderChart(payload);
            renderResultsTable(payload);
        } else if (type === 'ERROR') {
            updateUIState('Error');
            alert('Error: ' + payload);
        }
    };
}

// --- Inputs & Populators ---

function initPresets() {
    // 1. Strategies Tab Dropdown
    const stratSelect = document.getElementById('strategy-preset-select');
    if (stratSelect && PRESET_STRATEGIES) {
        PRESET_STRATEGIES.forEach((preset, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.text = preset.name;
            stratSelect.appendChild(opt);
        });
        stratSelect.addEventListener('change', (e) => {
            if(e.target.value !== "") loadStrategyPreset(e.target.value);
        });
    }

    // 2. Persona Tab Dropdown
    const persSelect = document.getElementById('persona-preset-select');
    if (persSelect && PRESET_PERSONAS) {
        PRESET_PERSONAS.forEach((preset, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.text = preset.name;
            persSelect.appendChild(opt);
        });
        persSelect.addEventListener('change', (e) => {
            if(e.target.value !== "") loadPersonaPreset(e.target.value);
        });
    }
}

function initRunModelInputs() {
    // Populate Run Model CMA Select
    const cmaSelect = document.getElementById('run-cma-select');
    if(cmaSelect && PRESET_CMAS) {
        PRESET_CMAS.forEach((preset, index) => {
            const opt = document.createElement('option');
            opt.value = index; // index in PRESET_CMAS
            opt.text = preset.name;
            cmaSelect.appendChild(opt);
        });
    }

    // Populate Run Model Persona Select
    const persSelect = document.getElementById('run-persona-select');
    if(persSelect && PRESET_PERSONAS) {
        PRESET_PERSONAS.forEach((preset, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.text = preset.name;
            persSelect.appendChild(opt);
        });
    }

    // Populate Strategy Selectors (1, 2, 3)
    ['run-strat-1', 'run-strat-2', 'run-strat-3'].forEach(id => {
        const sel = document.getElementById(id);
        if(sel && PRESET_STRATEGIES) {
            PRESET_STRATEGIES.forEach((preset, index) => {
                const opt = document.createElement('option');
                opt.value = index;
                opt.text = preset.name;
                sel.appendChild(opt);
            });
        }
    });
}

function loadStrategyPreset(index) {
    if (!PRESET_STRATEGIES[index]) return;
    renderStrategyTable(PRESET_STRATEGIES[index].points);
}

function loadPersonaPreset(index) {
    if (!PRESET_PERSONAS[index]) return;
    const p = PRESET_PERSONAS[index].data;
    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
    setVal('p-age', p.age);
    setVal('p-retAge', p.retirementAge);
    setVal('p-pot', p.savings);
    setVal('p-salary', p.salary);
    setVal('p-contrib', p.contribution);
    setVal('p-growth', p.realSalaryGrowth);
}

// --- Data Gathering Logic ---

function getActiveCMA() {
    const sel = document.getElementById('run-cma-select');
    if (sel.value === 'custom') {
        // Scrape from Table
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
    } else {
        return PRESET_CMAS[sel.value].data;
    }
}

function getActivePersona() {
    const sel = document.getElementById('run-persona-select');
    if (sel.value === 'custom') {
        return {
            age: parseFloat(document.getElementById('p-age').value),
            retirementAge: parseFloat(document.getElementById('p-retAge').value),
            savings: parseFloat(document.getElementById('p-pot').value),
            salary: parseFloat(document.getElementById('p-salary').value),
            contribution: parseFloat(document.getElementById('p-contrib').value),
            realSalaryGrowth: parseFloat(document.getElementById('p-growth').value)
        };
    } else {
        return PRESET_PERSONAS[sel.value].data;
    }
}

function getActiveStrategies(months) {
    const strategies = [];
    
    // Helper to process a selection
    const processStrat = (selId, defaultName) => {
        const sel = document.getElementById(selId);
        if(!sel || sel.value === "") return null;

        let name, points;
        
        if(sel.value === 'custom') {
            name = "Custom (From Tab)";
            // Scrape table
            const rows = document.querySelectorAll('#strategy-table tbody tr');
            points = [];
            rows.forEach(row => {
                const years = parseFloat(row.querySelector('.years-input').value);
                const weights = {};
                row.querySelectorAll('.weight-input').forEach(input => {
                    weights[input.dataset.key] = parseFloat(input.value) / 100;
                });
                points.push({ years, weights });
            });
            points.sort((a, b) => b.years - a.years);
        } else {
            const preset = PRESET_STRATEGIES[sel.value];
            name = preset.name;
            points = preset.points;
        }

        // Interpolate
        const monthlyWeights = interpolateWeights(points, months);
        return { name, monthlyWeights, implAdjustments: {} };
    };

    const s1 = processStrat('run-strat-1');
    if(s1) strategies.push(s1);

    const s2 = processStrat('run-strat-2');
    if(s2) strategies.push(s2);

    const s3 = processStrat('run-strat-3');
    if(s3) strategies.push(s3);

    return strategies;
}

function interpolateWeights(points, totalMonths) {
    const monthlyWeights = [];
    for (let m = 0; m < totalMonths; m++) {
        const yearsRemaining = (totalMonths - m) / 12;
        let p1 = points[0];
        let p2 = points[points.length - 1];
        
        for (let i = 0; i < points.length - 1; i++) {
            if (yearsRemaining <= points[i].years && yearsRemaining >= points[i+1].years) {
                p1 = points[i];
                p2 = points[i+1];
                break;
            }
        }
        
        const range = p1.years - p2.years;
        const ratio = range === 0 ? 0 : (yearsRemaining - p2.years) / range;
        
        const w = {};
        ASSET_CLASSES.forEach(ac => {
            // Handle both structure types (direct or nested)
            let w1 = 0, w2 = 0;
            if (p1.weights && p1.weights[ac.key] !== undefined) w1 = p1.weights[ac.key];
            else if (p1[ac.key] !== undefined) w1 = p1[ac.key];

            if (p2.weights && p2.weights[ac.key] !== undefined) w2 = p2.weights[ac.key];
            else if (p2[ac.key] !== undefined) w2 = p2[ac.key];

            w[ac.key] = w2 + (w1 - w2) * ratio;
        });
        monthlyWeights.push(w);
    }
    return monthlyWeights;
}

// --- Execution & Rendering ---

function runSimulation() {
    updateUIState('Running...');
    
    const persona = getActivePersona();
    const cma = getActiveCMA();
    const months = Math.max(1, (persona.retirementAge - persona.age) * 12);
    const strategies = getActiveStrategies(months);

    if (strategies.length === 0) {
        alert("Please select at least one strategy.");
        updateUIState('Ready');
        return;
    }

    const payload = {
        cma,
        assetKeys: ASSET_CLASSES.map(a => a.key),
        persona,
        settings: { simCount: 2000, inflation: 2.5 },
        strategies
    };

    state.worker.postMessage({ type: 'RUN_SIMULATION', payload });
}

function renderChart(results) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (state.chartInstance) state.chartInstance.destroy();
    
    // Assumes all strategies have same length (based on persona)
    const labels = Array.from({length: results[0].percentiles.p50.length}, (_, i) => i);
    
    const datasets = [];

    results.forEach((res, index) => {
        const color = CHART_COLORS[index % CHART_COLORS.length];
        
        // Median Line
        datasets.push({
            label: `${res.name} (Median)`,
            data: res.percentiles.p50,
            borderColor: color.border,
            backgroundColor: 'transparent',
            pointRadius: 0,
            borderWidth: 2,
            tension: 0.1
        });

        // Range (Fill)
        // We push Upper first, then Lower, utilizing chart.js fill logic if needed.
        // For multi-strategy, complex overlapping fills can be messy. 
        // We will add them but make them very transparent.
        datasets.push({
            label: `${res.name} Range`,
            data: res.percentiles.p95,
            borderColor: 'transparent',
            backgroundColor: color.fill,
            pointRadius: 0,
            fill: '+1' // fill to next dataset
        });
        datasets.push({
            label: `${res.name} Lower`,
            data: res.percentiles.p05,
            borderColor: 'transparent',
            backgroundColor: 'transparent',
            pointRadius: 0,
            fill: false // End of fill group
        });
    });

    state.chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: { 
                filler: { propagate: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            // Only show tooltips for the Median lines to reduce clutter
                            if (context.dataset.label.includes('Range') || context.dataset.label.includes('Lower')) return null;
                            return context.dataset.label + ': £' + Math.round(context.raw).toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: { display: true, title: { display: true, text: 'Months' } },
                y: { display: true, title: { display: true, text: 'Pot Value (£)' } }
            }
        }
    });
}

function renderResultsTable(results) {
    const tbody = document.querySelector('#results-table tbody');
    tbody.innerHTML = '';

    results.forEach((res, index) => {
        const color = CHART_COLORS[index % CHART_COLORS.length];
        const lastIdx = res.percentiles.p50.length - 1;
        
        const low = Math.round(res.percentiles.p05[lastIdx]).toLocaleString();
        const med = Math.round(res.percentiles.p50[lastIdx]).toLocaleString();
        const high = Math.round(res.percentiles.p95[lastIdx]).toLocaleString();

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="border-left: 5px solid ${color.border}; font-weight: 500;">${res.name}</td>
            <td>£${low}</td>
            <td><strong>£${med}</strong></td>
            <td>£${high}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Basic Rendering (Asset Rows & Tables) ---
function renderAssetRows() {
    const tbody = document.querySelector('#cma-table tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    ASSET_CLASSES.forEach(asset => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${asset.name}</td>
            <td><input type="number" step="0.1" class="form-control form-control-sm" data-key="${asset.key}" data-field="r" value="${(asset.defaultR * 100).toFixed(2)}"></td>
            <td><input type="number" step="0.1" class="form-control form-control-sm" data-key="${asset.key}" data-field="v" value="${(asset.defaultV * 100).toFixed(2)}"></td>
            <td><input type="number" step="0.1" class="form-control form-control-sm" data-key="${asset.key}" data-field="ce" value="${asset.key === 'globalEq' ? 100 : 50}"></td>
            <td><input type="number" step="0.1" class="form-control form-control-sm" data-key="${asset.key}" data-field="cc" value="${asset.key === 'igCredit' ? 100 : 20}"></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderStrategyTable(points) {
    const table = document.getElementById('strategy-table');
    if(!table) return;
    
    let headerHTML = '<th>Years to Ret</th>';
    ASSET_CLASSES.forEach(ac => headerHTML += `<th style="min-width: 60px;">${ac.name} %</th>`);
    headerHTML += '<th>Total %</th>';
    table.querySelector('thead tr').innerHTML = headerHTML;

    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    
    points.forEach(row => {
        const tr = document.createElement('tr');
        let html = `<td><input type="number" class="form-control form-control-sm years-input" value="${row.years}"></td>`;
        let rowSum = 0;
        ASSET_CLASSES.forEach(ac => {
            let val = 0;
            if(row.weights && row.weights[ac.key] !== undefined) val = row.weights[ac.key];
            else if(row[ac.key] !== undefined) val = row[ac.key];
            const displayVal = val <= 1 ? (val * 100) : val;
            rowSum += displayVal;
            html += `<td><input type="number" class="form-control form-control-sm weight-input" data-key="${ac.key}" value="${Number(displayVal).toFixed(2)}"></td>`;
        });
        html += `<td class="fw-bold ${Math.abs(rowSum - 100) > 0.1 ? 'text-danger' : 'text-success'}">${rowSum.toFixed(0)}%</td>`;
        tr.innerHTML = html;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', () => validateStrategyTable());
    });
}

function validateStrategyTable() {
    const rows = document.querySelectorAll('#strategy-table tbody tr');
    rows.forEach(row => {
        let sum = 0;
        row.querySelectorAll('.weight-input').forEach(inp => sum += parseFloat(inp.value) || 0);
        const cell = row.lastElementChild;
        cell.innerText = sum.toFixed(1) + '%';
        cell.className = Math.abs(sum - 100) > 0.1 ? 'fw-bold text-danger' : 'fw-bold text-success';
    });
}

window.addStrategyRow = function() {
    const tbody = document.querySelector('#strategy-table tbody');
    if(!tbody) return;
    const tr = document.createElement('tr');
    let html = `<td><input type="number" class="form-control form-control-sm years-input" value="10"></td>`;
    ASSET_CLASSES.forEach(ac => html += `<td><input type="number" class="form-control form-control-sm weight-input" data-key="${ac.key}" value="0"></td>`);
    html += `<td class="fw-bold text-danger">0%</td>`;
    tr.innerHTML = html;
    tbody.appendChild(tr);
    tbody.querySelectorAll('input').forEach(inp => inp.oninput = validateStrategyTable);
};

function updateUIState(status) {
    document.getElementById('status-text').innerText = status;
    const spinner = document.getElementById('loading-spinner');
    if(status === 'Running...') spinner.classList.remove('d-none');
    else spinner.classList.add('d-none');
}

function setupEventListeners() {
    document.querySelectorAll('.list-group-item').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.list-group-item').forEach(i => i.classList.remove('active'));
            document.querySelectorAll('.view-section').forEach(i => i.classList.add('d-none'));
            e.currentTarget.classList.add('active');
            const target = e.currentTarget.dataset.tab;
            document.getElementById(`tab-${target}`).classList.remove('d-none');
        });
    });
    
    const runBtn = document.getElementById('run-simulation-btn');
    if(runBtn) runBtn.addEventListener('click', runSimulation);
}
