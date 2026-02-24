import { ASSET_CLASSES } from './config.js';

// --- State Management ---
const state = {
    worker: null,
    chartInstance: null
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initWorker();
    renderAssetRows();
    renderLifestyleTable();
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

function renderLifestyleTable() {
    const table = document.getElementById('lifestyle-table');
    // Header
    let headerHTML = '<th>Years to Ret</th>';
    ASSET_CLASSES.forEach(ac => headerHTML += `<th>${ac.name.split(' ')[0]} %</th>`);
    table.querySelector('thead tr').innerHTML = headerHTML;

    // Default Rows (High Growth -> De-risking)
    const defaults = [
        { years: 30, weights: [80, 0, 0, 0, 0, 20, 0, 0] },
        { years: 10, weights: [60, 0, 0, 0, 0, 40, 0, 0] },
        { years: 0,  weights: [20, 0, 0, 0, 0, 60, 0, 20] }
    ];

    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    
    defaults.forEach(row => {
        const tr = document.createElement('tr');
        let html = `<td><input type="number" class="form-control form-control-sm years-input" value="${row.years}"></td>`;
        
        ASSET_CLASSES.forEach((ac, idx) => {
            // Check if we have a default for this col, else 0
            const val = row.weights[idx] || 0;
            html += `<td><input type="number" class="form-control form-control-sm weight-input" data-key="${ac.key}" value="${val}"></td>`;
        });
        tr.innerHTML = html;
        tbody.appendChild(tr);
    });
}

window.addLifestyleRow = function() {
    const tbody = document.querySelector('#lifestyle-table tbody');
    const tr = document.createElement('tr');
    let html = `<td><input type="number" class="form-control form-control-sm years-input" value="15"></td>`;
    ASSET_CLASSES.forEach(ac => {
        html += `<td><input type="number" class="form-control form-control-sm weight-input" data-key="${ac.key}" value="0"></td>`;
    });
    tr.innerHTML = html;
    tbody.appendChild(tr);
};

// --- Data Gathering ---

function getPersona() {
    return {
        age: parseFloat(document.getElementById('p-age').value),
        retirementAge: parseFloat(document.getElementById('p-retAge').value),
        savings: parseFloat(document.getElementById('p-pot').value),
        salary: parseFloat(document.getElementById('p-salary').value),
        contribution: parseFloat(document.getElementById('p-contrib').value),
        realSalaryGrowth: 1.0 // Fixed for now
    };
}

function getLifestylePoints() {
    const rows = document.querySelectorAll('#lifestyle-table tbody tr');
    const points = [];
    rows.forEach(row => {
        const years = parseFloat(row.querySelector('.years-input').value);
        const weights = {};
        row.querySelectorAll('.weight-input').forEach(input => {
            weights[input.dataset.key] = parseFloat(input.value) / 100;
        });
        points.push({ years, weights });
    });
    return points.sort((a, b) => b.years - a.years); // Sort descending (30 years -> 0 years)
}

function interpolateWeights(points, totalMonths) {
    const monthlyWeights = [];
    
    for (let m = 0; m < totalMonths; m++) {
        // Convert month index to "Years to Retirement"
        // Month 0 = Start (e.g. 30 years to go). Month Max = Retirement (0 years to go).
        const yearsRemaining = (totalMonths - m) / 12;
        
        // Find surrounding points
        // Points are sorted descending: [30, 20, 10, 0]
        let p1 = points[0];
        let p2 = points[points.length - 1];
        
        for (let i = 0; i < points.length - 1; i++) {
            if (yearsRemaining <= points[i].years && yearsRemaining >= points[i+1].years) {
                p1 = points[i];
                p2 = points[i+1];
                break;
            }
        }
        
        // Linear Interpolation
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
    const lifestylePoints = getLifestylePoints();
    const months = Math.max(1, (persona.retirementAge - persona.age) * 12);
    
    // Generate the full monthly weight map for the worker
    const weightMap = interpolateWeights(lifestylePoints, months);

    const payload = {
        cma,
        assetKeys: ASSET_CLASSES.map(a => a.key),
        persona,
        settings: { simCount: 2000, inflation: 2.5 },
        strategies: [
            { 
                name: "Custom Strategy", 
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
    // Tab Switching
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
    
    // Run Button
    document.getElementById('run-simulation-btn').addEventListener('click', runSimulation);
    
    // Sidebar Toggle
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
