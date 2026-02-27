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
    ['run-strat-1', 'run-strat-2', 'run-strat-3
