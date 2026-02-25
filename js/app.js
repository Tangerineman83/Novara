// js/app.js
import { ASSET_CLASSES, PRESET_STRATEGIES, PRESET_PERSONAS, PRESET_CMAS, CHART_COLORS } from './config.js';

const state = {
    worker: null,
    chartInstance: null
};

// Global Error Handler
window.onerror = function(message, source, lineno, colno, error) {
    alert(`System Error: ${message}\nLine: ${lineno}`);
    console.error(error);
};

console.log("Novara App v3.3 Loading...");

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Toggle
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
        
        // --- LOAD DEFAULTS ---
        if(PRESET_CMAS && PRESET_CMAS.length > 0) loadCMAPreset(0);
        if(PRESET_STRATEGIES && PRESET_STRATEGIES.length > 0) loadStrategyPreset(0);
        if(PRESET_PERSONAS && PRESET_PERSONAS.length > 0) loadPersonaPreset(0);
        
        setupEventListeners();
        console.log("App Init Complete.");
        
    } catch (err) {
        console.error("App Init Crash:", err);
        alert("App Initialization Failed:\n" + err.message);
    }
});

function initWorker() {
    state.worker = new Worker('./js/worker.js');
    state.worker.onmessage = (e) => {
        const { type, payload } = e.data;
        if (type === 'SIMULATION_COMPLETE') {
            updateUIState('Ready');
            const slider = document.getElementById('confidence-slider');
            if(slider) slider.disabled = false;
            renderChart(payload);
            renderResultsTable(payload);
        } else if (type === 'ERROR') {
            updateUIState('Error');
            alert('Simulation Error: ' + payload);
        }
    };
    state.worker.onerror = (e) => {
        console.error("Worker File Error:", e);
        updateUIState('Worker Failed');
    };
}

// --- Inputs & Populators ---
function initPresets() {
    // CMA Selector
    const cmaSelect = document.getElementById('cma-preset-select');
    if (cmaSelect && PRESET_CMAS) {
        cmaSelect.innerHTML = '<option value="">Load Preset...</option>';
        PRESET_CMAS.forEach((preset, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.text = preset.name;
            cmaSelect.appendChild(opt);
        });
        cmaSelect.addEventListener('change', (e) => {
            if(e.target.value !== "") loadCMAPreset(e.target.value);
        });
    }

    // Strategy Selector
    const stratSelect = document.getElementById('strategy-preset-select');
    if (stratSelect && PRESET_STRATEGIES) {
        stratSelect.innerHTML = '<option value="">Load Preset Strategy...</option>';
        PRESET_STRATEGIES.forEach((preset, index) => {
            const opt = document.createElement('option');
            opt.value = index; opt.text = preset.name;
            stratSelect.appendChild(opt);
        });
        stratSelect.addEventListener('change', (e) => {
            if(e.target.value !== "") loadStrategyPreset(e.target.value);
        });
    }

    // Persona Selector
    const persSelect = document.getElementById('persona-preset-select');
    if (persSelect && PRESET_PERSONAS) {
        persSelect.innerHTML = '<option value="">Load Preset Persona...</option>';
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
        cmaSelect.innerHTML = '<option value="custom">Use "Markets" Tab Values</option>';
        PRESET_CMAS.forEach((preset, index) => {
            const opt = document.createElement('option');
            opt.value = index; opt.text = preset.name;
            cmaSelect.appendChild(opt);
        });
    }

    const persSelect = document.getElementById('run-persona-select');
    if(persSelect && PRESET_PERSONAS) {
        persSelect.innerHTML = '<option value="custom">Use "Personas" Tab Values</option>';
        PRESET_PERSONAS.forEach((preset, index) => {
            const opt = document.createElement('option');
            opt.value = index; opt.text = preset.name;
            persSelect.appendChild(opt);
        });
    }

    ['run-strat-1', 'run-strat-2', 'run-strat-3'].forEach((id, i) => {
        const sel = document.getElementById(id);
        if(sel && PRESET_STRATEGIES) {
            if(i === 0) sel.innerHTML = '<option value="custom">Use "Strategies" Tab Values</option>';
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
    if (rows.length === 0) return;

    rows.forEach(tr => {
        const inputs = tr.querySelectorAll('input');
        inputs.forEach(inp => {
            const key = inp.dataset.key; 
            const field = inp.dataset.field; 
            if (data[field] && data[field][key] !== undefined) {
                const val = data[field][key] * 100;
                inp.value = val.toFixed(2);
            }
        });
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

// --- Data Gathering ---
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
    } else {
        return PRESET_CMAS[sel.value].data;
    }
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
            name = "Custom Strategy";
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

// --- Execution & Rendering ---
function runSimulation() {
    updateUIState('Running...');
    const tbody = document.querySelector('#results-table tbody');
    if(tbody) tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Calculating...</td></tr>';
    
    const slider = document.getElementById('confidence-slider');
    if(slider) slider.disabled = true;

    try {
        // GET SETTINGS FROM MODAL
        const simCountInput = document.getElementById('setting-sim-count');
        const inflationInput = document.getElementById('setting-inflation');
        const simCount = simCountInput ? parseInt(simCountInput.value) : 2000;
        const inflation = inflationInput ? parseFloat(inflationInput.value) : 2.5;

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
            persona, 
            settings: { simCount: simCount, inflation: inflation }, 
            strategies
        };
        state.worker.postMessage({ type: 'RUN_SIMULATION', payload });
    } catch(e) {
        console.error("Run Error:", e);
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

function renderChart(results) {
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (state.chartInstance) state.chartInstance.destroy();
    
    const startAge = results[0].meta.startAge;
    const months = results[0].percentiles.pMedian.length;
    const labels = [];
    
    for(let i=0; i<months; i++) {
        if (i % 60 === 0 || i === months - 1) {
            labels.push(Math.floor(startAge + i/12));
        } else {
            labels.push(''); 
        }
    }

    const datasets = [];
    results.forEach((res, index) => {
        const color = CHART_COLORS[index % CHART_COLORS.length];
        
        datasets.push({
            label: res.name, 
            data: res.percentiles.pMedian,
            borderColor: color.border,
            backgroundColor: color.fill,
            pointRadius: 0,
            borderWidth: 2,
            tension: 0.1
        });
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
        data: { labels: Array.from({length: months}, (_, i) => i), datasets }, 
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { 
                legend: {
                    labels: {
                        usePointStyle: false,
                        boxWidth: 20,
                        filter: function(item) {
                            return !item.text.includes('Upper') && !item.text.includes('Lower');
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const monthIndex = context[0].dataIndex;
                            const age = Math.floor(startAge + monthIndex/12);
                            return `Age ${age}`;
                        },
                        label: function(context) {
                            return context.dataset.label + ': £' + Math.round(context.raw).toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: { 
                    display: true, 
                    title: { display: true, text: 'Age' },
                    ticks: {
                        callback: function(val, index) {
                            const age = startAge + index/12;
                            if (index % 60 === 0) return Math.floor(age);
                            return null;
                        }
                    }
                },
                y: { display: true, title: { display: true, text: 'Pot Value (£)' } }
            }
        }
    });
}

function renderResultsTable(results) {
    const tbody = document.querySelector('#results-table tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    
    const stats = results[0].stats;
    const lowerHeader = document.getElementById('th-lower');
    const upperHeader = document.getElementById('th-upper');
    if(lowerHeader) lowerHeader.innerText = `Lower (${stats.lowerBoundLabel}th %ile)`;
    if(upperHeader) upperHeader.innerText = `Upper (${stats.upperBoundLabel}th %ile)`;

    const baseStrat = results[0];
    const baseLastIdx = baseStrat.percentiles.pMedian.length - 1;
    const baseLow = baseStrat.percentiles.pLower[baseLastIdx];
    const baseMed = baseStrat.percentiles.pMedian[baseLastIdx];
    const baseHigh = baseStrat.percentiles.pUpper[baseLastIdx];

    results.forEach((res, index) => {
        const color = CHART_COLORS[index % CHART_COLORS.length];
        const lastIdx = res.percentiles.pMedian.length - 1;
        
        const currLow = res.percentiles.pLower[lastIdx];
        const currMed = res.percentiles.pMedian[lastIdx];
        const currHigh = res.percentiles.pUpper[lastIdx];

        const formatDiff = (curr, base) => {
            if (index === 0 || base === 0) return '';
            const diff = ((curr - base) / base) * 100;
            const sign = diff >= 0 ? '+' : '';
            const css = diff >= 0 ? 'text-success' : 'text-danger';
            return `<br><span class="small ${css}">(${sign}${diff.toFixed(1)}%)</span>`;
        };

        const lowStr = `£${Math.round(currLow).toLocaleString()}${formatDiff(currLow, baseLow)}`;
        const medStr = `£${Math.round(currMed).toLocaleString()}${formatDiff(currMed, baseMed)}`;
        const highStr = `£${Math.round(currHigh).toLocaleString()}${formatDiff(currHigh, baseHigh)}`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="border-left: 5px solid ${color.border}; font-weight: 500;">${res.name}</td>
            <td>${lowStr}</td>
            <td><strong>${medStr}</strong></td>
            <td>${highStr}</td>
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
    document.querySelectorAll('.list-group-item[data-tab]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.list-group-item').forEach(i => i
