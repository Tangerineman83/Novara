import { ASSET_CLASSES } from './config.js';

// --- State Management ---
const state = {
    cma: {}, // Current CMA data
    lifestyles: {},
    currentTab: 'cma',
    worker: null,
    chartInstance: null
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initWorker();
    renderAssetRows();
    setupEventListeners();
    // Simulate loading default data
    loadDefaults(); 
});

// --- Worker Setup ---
function initWorker() {
    state.worker = new Worker('js/worker.js');
    
    state.worker.onmessage = (e) => {
        const { type, payload } = e.data;
        if (type === 'SIMULATION_COMPLETE') {
            updateUIState('Ready');
            renderChart(payload);
            renderResultsTable(payload);
        } else if (type === 'ERROR') {
            updateUIState('Error');
            alert('Simulation Error: ' + payload);
        }
    };
}

// --- DOM Rendering ---
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

// --- Event Handlers ---
function setupEventListeners() {
    // Tab Navigation
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
    
    // Menu Toggle
    document.getElementById("menu-toggle").onclick = function() {
        var el = document.getElementById("wrapper");
        el.classList.toggle("toggled");
    };
}

// --- Business Logic ---
function getCMAFromInputs() {
    const r = {}, v = {}, ce = {}, cc = {};
    const inputs = document.querySelectorAll('#cma-table input');
    
    inputs.forEach(input => {
        const key = input.dataset.key;
        const field = input.dataset.field;
        const val = parseFloat(input.value) / 100; // Convert % to decimal
        
        if (field === 'r') r[key] = val;
        if (field === 'v') v[key] = val;
        if (field === 'ce') ce[key] = val;
        if (field === 'cc') cc[key] = val;
    });
    
    return { r, v, ce, cc };
}

function runSimulation() {
    updateUIState('Running...');
    
    // Collect Data
    const cma = getCMAFromInputs();
    const assetKeys = ASSET_CLASSES.map(a => a.key);
    
    // Mock Persona/Strategy Data (In real app, read from inputs)
    const persona = { age: 30, retirementAge: 65, savings: 50000, salary: 60000, contribution: 10, realSalaryGrowth: 1 };
    
    // Prepare Payload
    const payload = {
        cma,
        assetKeys,
        persona,
        settings: { simCount: 2000, inflation: 2.5 },
        strategies: [
            { 
                name: "High Growth", 
                // Need to pass full monthly weight map here. 
                // For this demo, I'm mocking a static weight map
                monthlyWeights: generateMockWeights(assetKeys, 0.8), 
                implAdjustments: {}
            },
            { 
                name: "Cautious", 
                monthlyWeights: generateMockWeights(assetKeys, 0.3), 
                implAdjustments: {}
            }
        ]
    };

    // Send to Worker
    state.worker.postMessage({ type: 'RUN_SIMULATION', payload });
}

function generateMockWeights(keys, equityRatio) {
    const months = (65-30)*12;
    const map = [];
    for(let i=0; i<months; i++) {
        const row = {};
        keys.forEach(k => {
            row[k] = k === 'globalEq' ? equityRatio : (1-equityRatio)/(keys.length-1);
        });
        map.push(row);
    }
    return map;
}

function updateUIState(status) {
    const label = document.getElementById('status-text');
    const spinner = document.getElementById('loading-spinner');
    
    label.innerText = status;
    if (status === 'Running...') {
        spinner.classList.remove('d-none');
    } else {
        spinner.classList.add('d-none');
    }
}

// --- Charting ---
function renderChart(results) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    
    if (state.chartInstance) state.chartInstance.destroy();

    const datasets = [];
    // Just rendering the first strategy for brevity
    const strat = results[0]; 
    const labels = Array.from({length: strat.percentiles.p50.length}, (_, i) => i);

    datasets.push({
        label: strat.name + ' Median',
        data: strat.percentiles.p50,
        borderColor: '#0d6efd',
        backgroundColor: 'transparent',
        type: 'line'
    });
    
    // Fan chart area
    datasets.push({
        label: 'Range',
        data: strat.percentiles.p95,
        backgroundColor: 'rgba(13, 110, 253, 0.2)',
        borderColor: 'transparent',
        fill: '+1', // Fill to next dataset
        pointRadius: 0
    });
    datasets.push({
        label: 'Lower',
        data: strat.percentiles.p05,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        pointRadius: 0
    });

    state.chartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: { filler: { propagate: false } }
        }
    });
}

function loadDefaults() {
    // Stub to fill selects
}
