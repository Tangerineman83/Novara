import { ASSET_CLASSES, PRESET_STRATEGIES, PRESET_PERSONAS, PRESET_CMAS, CHART_COLORS } from './config.js';

const state = {
    worker: null,
    chartInstance: null
};

document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById("wrapper");
    const menuBtn = document.getElementById("menu-toggle");
    if (menuBtn) {
        menuBtn.onclick = (e) => {
            e.preventDefault();
            wrapper.classList.toggle("toggled");
        };
    }
    document.querySelectorAll('#sidebar-wrapper .list-group-item').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) wrapper.classList.remove("toggled");
        });
    });

    try {
        initWorker();
        renderAssetRows();
        initPresets();
        initRunModelInputs();
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
            // Enable slider now that data is loaded
            document.getElementById('confidence-slider').disabled = false;
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
    const stratSelect = document.getElementById('strategy-preset-select');
    if (stratSelect && PRESET_STRATEGIES) {
        PRESET_STRATEGIES.forEach((preset, index) => {
            const opt = document.createElement('option');
            opt.value = index; opt.text = preset.name;
            stratSelect.appendChild(opt);
        });
        stratSelect.addEventListener('change', (e) => {
            if(e.target.value !== "") loadStrategyPreset(e.target.value);
        });
    }

    const persSelect = document.getElementById('persona-preset-select');
    if (persSelect && PRESET_PERSONAS) {
        PRESET_PERSONAS.forEach((preset, index) => {
            const opt = document.createElement('option');
            opt.value = index; opt.text = preset.name;
            persSelect.appendChild(opt);
        });
        persSelect.addEventListener('change', (e) => {
            if(e.target.value !== "") loadPersonaPreset(e.target.value);
        });
    }
}

function initRunModelInputs() {
    const cmaSelect = document.getElementById('run-cma-select');
    if(cmaSelect && PRESET_CMAS) {
        PRESET_CMAS.forEach((preset, index) => {
            const opt = document.createElement('option');
            opt.value = index; opt.text = preset.name;
            cmaSelect.appendChild(opt);
        });
    }

    const persSelect = document.getElementById('run-persona-select');
    if(persSelect && PRESET_PERSONAS) {
        PRESET_PERSONAS.forEach((preset, index) => {
            const opt = document.createElement('option');
            opt.value = index; opt.text = preset.name;
            persSelect.appendChild(opt);
        });
    }

    ['run-strat-1', 'run-strat-2', 'run-strat-3'].forEach(id => {
        const sel = document.getElementById(id);
        if(sel && PRESET_STRATEGIES) {
            PRESET_STRATEGIES.forEach((preset, index) => {
                const opt = document.createElement('option');
                opt.value = index; opt.text = preset.name;
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

// --- Data Logic ---
function getActiveCMA() {
    const sel = document.getElementById('run-cma-select');
    if (sel.value === 'custom') {
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
    const processStrat = (selId) => {
        const sel = document.getElementById(selId);
        if(!sel || sel.value === "") return null;

        let name, points;
        if(sel.value === 'custom') {
            name = "Custom (Strategies Tab)";
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

// --- Execution & Rendering ---

function runSimulation() {
    updateUIState('Running...');
    const tbody = document.querySelector('#results-table tbody');
    if(tbody) tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Calculating...</td></tr>';
    document.getElementById('confidence-slider').disabled = true;

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
        cma, assetKeys: ASSET_CLASSES.map(a => a.key),
        persona, settings: { simCount: 2000, inflation: 2.5 }, strategies
    };
    state.worker.postMessage({ type: 'RUN_SIMULATION', payload });
}

function updateConfidence() {
    const slider = document.getElementById('confidence-slider');
    const val = parseInt(slider.value);
    
    // Update Label
    const alpha = (100 - val) / 2;
    const low = Math.round(alpha);
    const high = Math.round(100 - alpha);
    document.getElementById('confidence-label').innerText = `Confidence: ${val}% (${low}th - ${high}th)`;

    // Request new stats from worker (FAST)
    state.worker.postMessage({ 
        type: 'RECALCULATE_STATS', 
        payload: { confidence: val / 100 } 
    });
}

function renderChart(results) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (state.chartInstance) state.chartInstance.destroy();
    
    const labels = Array.from({length: results[0].percentiles.pMedian.length}, (_, i) => i);
    const datasets = [];

    results.forEach((res, index) => {
        const color = CHART_COLORS[index % CHART_COLORS.length];
        
        // 1. Median (Solid)
        datasets.push({
            label: res.name, // Simplified Name
            data: res.percentiles.pMedian,
            borderColor: color.border,
            backgroundColor: 'transparent',
            pointRadius: 0,
            borderWidth: 2,
            tension: 0.1
        });

        // 2. Upper Bound (Dashed)
        datasets.push({
            label: `${res.name} Upper`,
            data: res.percentiles.pUpper,
            borderColor: color.border,
            backgroundColor: 'transparent',
            pointRadius: 0,
            borderWidth: 1.5,
            borderDash: [5, 5],
            tension: 0.1
        });

        // 3. Lower Bound (Dashed)
        datasets.push({
            label: `${res.name} Lower`,
            data: res.percentiles.pLower,
            borderColor: color.border,
            backgroundColor: 'transparent',
            pointRadius: 0,
            borderWidth: 1.5,
            borderDash: [5, 5],
            tension: 0.1
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
                legend: {
                    labels: {
                        // Filter out Upper/Lower from legend to keep it clean
                        filter: function(item, chart) {
                            return !item.text.includes('Upper') && !item.text.includes('Lower');
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
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
    if(!tbody) return;
    tbody.innerHTML = '';
    
    // Update headers based on returned stats
    const stats = results[0].stats;
    document.getElementById('th-lower').innerText = `Lower (${stats.lowerBoundLabel}th %ile)`;
    document.getElementById('th-upper').innerText = `Upper (${stats.upperBoundLabel}th %ile)`;

    results.forEach((res, index) => {
        const color = CHART_COLORS[index % CHART_COLORS.length];
        const lastIdx = res.percentiles.pMedian.length - 1;
        
        const low = Math.round(res.percentiles.pLower[lastIdx]).toLocaleString();
        const med = Math.round(res.percentiles.pMedian[lastIdx]).toLocaleString();
        const high = Math.round(res.percentiles.pUpper[lastIdx]).toLocaleString();

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
    tbody.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => validateStrategyTable()));
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
    const statText = document.getElementById('status-text');
    const spinner = document.getElementById('loading-spinner');
    if(statText) statText.innerText = status;
    if(spinner) {
        if(status === 'Running...') spinner.classList.remove('d-none');
        else spinner.classList.add('d-none');
    }
}

function setupEventListeners() {
    const runBtn = document.getElementById('run-simulation-btn');
    if(runBtn) runBtn.addEventListener('click', runSimulation);

    // Slider Listener
    const slider = document.getElementById('confidence-slider');
    if(slider) {
        slider.addEventListener('input', updateConfidence);
    }
}
