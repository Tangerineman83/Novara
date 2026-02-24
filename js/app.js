import { ASSET_CLASSES, PRESET_STRATEGIES, PRESET_PERSONAS } from './config.js';

// --- State Management ---
const state = {
    worker: null,
    chartInstance: null
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initWorker();
    renderAssetRows();
    initPresets();
    
    // Load defaults if table is empty
    if(PRESET_STRATEGIES.length > 0) loadStrategyPreset(0);
    if(PRESET_PERSONAS.length > 0) loadPersonaPreset(0);
    
    setupEventListeners();
});

function initWorker() {
    state.worker = new Worker('./js/worker.js');
    state.worker.onmessage = (e) => {
        const { type, payload } = e.data;
        if (type === 'SIMULATION_COMPLETE') {
            updateUIState('Ready');
            renderChart(payload);
        } else if (type === 'ERROR') {
            updateUIState('Error');
            alert('Error: ' + payload);
        }
    };
}

// --- Rendering Logic ---

function renderAssetRows() {
    const tbody = document.querySelector('#cma-table tbody');
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

function initPresets() {
    // Strategy Select
    const stratSelect = document.getElementById('strategy-preset-select');
    PRESET_STRATEGIES.forEach((preset, index) => {
        const opt = document.createElement('option');
        opt.value = index;
        opt.text = preset.name;
        stratSelect.appendChild(opt);
    });
    stratSelect.addEventListener('change', (e) => {
        if(e.target.value !== "") loadStrategyPreset(e.target.value);
    });

    // Persona Select
    const persSelect = document.getElementById('persona-preset-select');
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

function loadStrategyPreset(index) {
    const preset = PRESET_STRATEGIES[index];
    renderStrategyTable(preset.points);
}

function loadPersonaPreset(index) {
    const p = PRESET_PERSONAS[index].data;
    document.getElementById('p-age').value = p.age;
    document.getElementById('p-retAge').value = p.retirementAge;
    document.getElementById('p-pot').value = p.savings;
    document.getElementById('p-salary').value = p.salary;
    document.getElementById('p-contrib').value = p.contribution;
    document.getElementById('p-growth').value = p.realSalaryGrowth;
}

function renderStrategyTable(points) {
    const table = document.getElementById('strategy-table');
    
    // Build Header based on Assets
    let headerHTML = '<th>Years to Ret</th>';
    ASSET_CLASSES.forEach(ac => headerHTML += `<th style="min-width: 60px;">${ac.name} %</th>`);
    headerHTML += '<th>Total %</th>'; // Validation column
    table.querySelector('thead tr').innerHTML = headerHTML;

    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    
    points.forEach(row => {
        const tr = document.createElement('tr');
        let html = `<td><input type="number" class="form-control form-control-sm years-input" value="${row.years}"></td>`;
        
        let rowSum = 0;
        ASSET_CLASSES.forEach(ac => {
            // Support both direct key access (old) and nested weights object (new)
            let val = 0;
            if(row.weights && row.weights[ac.key] !== undefined) val = row.weights[ac.key];
            else if(row[ac.key] !== undefined) val = row[ac.key];
            
            // Convert decimal to percent for display if < 1, else assume percent
            // The JSON provided has decimals (0.79). The UI inputs expect Percent (79).
            const displayVal = val <= 1 ? (val * 100) : val;
            rowSum += displayVal;

            html += `<td><input type="number" class="form-control form-control-sm weight-input" data-key="${ac.key}" value="${Number(displayVal).toFixed(2)}"></td>`;
        });
        
        html += `<td class="fw-bold ${Math.abs(rowSum - 100) > 0.1 ? 'text-danger' : 'text-success'}">${rowSum.toFixed(0)}%</td>`;
        tr.innerHTML = html;
        tbody.appendChild(tr);
    });

    // Attach listeners to update total on change
    tbody.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', () => validateStrategyTable());
    });
}

window.addStrategyRow = function() {
    const tbody = document.querySelector('#strategy-table tbody');
    const tr = document.createElement('tr');
    let html = `<td><input type="number" class="form-control form-control-sm years-input" value="10"></td>`;
    ASSET_CLASSES.forEach(ac => {
        html += `<td><input type="number" class="form-control form-control-sm weight-input" data-key="${ac.key}" value="0"></td>`;
    });
    html += `<td class="fw-bold text-danger">0%</td>`;
    tr.innerHTML = html;
    tbody.appendChild(tr);
    
    // Re-attach listeners (simple approach)
    tbody.querySelectorAll('input').forEach(inp => {
        inp.oninput = validateStrategyTable;
    });
};

function validateStrategyTable() {
    const rows = document.querySelectorAll('#strategy-table tbody tr');
    rows.forEach(row => {
        let sum = 0;
        row.querySelectorAll('.weight-input').forEach(inp => sum += parseFloat(inp.value) || 0);
        const cell = row.lastElementChild;
        cell.innerText = sum.toFixed(1) + '%';
        if(Math.abs(sum - 100) > 0.1) {
            cell.className = 'fw-bold text-danger';
        } else {
            cell.className = 'fw-bold text-success';
        }
    });
}

// --- Data Gathering ---

function getPersona() {
    return {
        age: parseFloat(document.getElementById('p-age').value),
        retirementAge: parseFloat(document.getElementById('p-retAge').value),
        savings: parseFloat(document.getElementById('p-pot').value),
        salary: parseFloat(document.getElementById('p-salary').value),
        contribution: parseFloat(document.getElementById('p-contrib').value),
        realSalaryGrowth: parseFloat(document.getElementById('p-growth').value)
    };
}

function getStrategyPoints() {
    const rows = document.querySelectorAll('#strategy-table tbody tr');
    const points = [];
    rows.forEach(row => {
        const years = parseFloat(row.querySelector('.years-input').value);
        const weights = {};
        row.querySelectorAll('.weight-input').forEach(input => {
            weights[input.dataset.key] = parseFloat(input.value) / 100;
        });
        points.push({ years, weights });
    });
    return points.sort((a, b) => b.years - a.years);
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
            const w1 = p1.weights[ac.key] || 0;
            const w2 = p2.weights[ac.key] || 0;
            w[ac.key] = w2 + (w1 - w2) * ratio;
        });
        monthlyWeights.push(w);
    }
    return monthlyWeights;
}

function getCMA() {
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

// --- Execution ---

function runSimulation() {
    updateUIState('Running...');
    const persona = getPersona();
    const cma = getCMA();
    const stratPoints = getStrategyPoints();
    const months = Math.max(1, (persona.retirementAge - persona.age) * 12);
    
    const weightMap = interpolateWeights(stratPoints, months);

    const payload = {
        cma,
        assetKeys: ASSET_CLASSES.map(a => a.key),
        persona,
        settings: { simCount: 2000, inflation: 2.5 },
        strategies: [
            { 
                name: "Active Strategy", 
                monthlyWeights: weightMap, 
                implAdjustments: {} 
            }
        ]
    };

    state.worker.postMessage({ type: 'RUN_SIMULATION', payload });
}

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
    
    document.getElementById('run-simulation-btn').addEventListener('click', runSimulation);
    document.getElementById("menu-toggle").onclick = function() {
        document.getElementById("wrapper").classList.toggle("toggled");
    };
}

function renderChart(results) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (state.chartInstance) state.chartInstance.destroy();
    
    const strat = results[0];
    const labels = Array.from({length: strat.percentiles.p50.length}, (_, i) => i);
    
    state.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Median Pot',
                    data: strat.percentiles.p50,
                    borderColor: '#0d6efd',
                    backgroundColor: 'transparent',
                    pointRadius: 0
                },
                {
                    label: '95th %',
                    data: strat.percentiles.p95,
                    borderColor: 'transparent',
                    backgroundColor: 'rgba(13, 110, 253, 0.2)',
                    fill: '+1',
                    pointRadius: 0
                },
                {
                    label: '5th %',
                    data: strat.percentiles.p05,
                    borderColor: 'transparent',
                    backgroundColor: 'transparent',
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: { filler: { propagate: false } },
            scales: {
                x: { display: true, title: { display: true, text: 'Months' } },
                y: { display: true, title: { display: true, text: 'Pot Value (£)' } }
            }
        }
    });
}
