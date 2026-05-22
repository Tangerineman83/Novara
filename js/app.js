// js/app.js
import { ASSET_CLASSES, PRESET_PORTFOLIOS, STRATEGY_GROUPS, PRESET_PERSONAS, PRESET_CMAS, CHART_COLORS, STRESS_SCENARIOS } from './config.js?v=23.0';
import { logGamma, getMatrixHeatmapBg, getCorrHeatmapBg, calcDeterministicStats } from './mathUtils.js';
import { getAvatarSVG, getAvatarBgColor, getAvatarLabel } from './avatars.js';
import { COMMENTARY_FALLBACK } from './commentary-fallback.js';

// --- LOCAL STORAGE ENGINE ---
const UserDataEngine = {
    load: () => {
        try {
            const raw = localStorage.getItem('novara_user_data');
            return raw ? JSON.parse(raw) : { cmas: [], portfolios: [], strategies: [], personas: [] };
        } catch(e) { 
            return { cmas: [], portfolios: [], strategies: [], personas: [] }; 
        }
    },
    save: (data) => {
        try { localStorage.setItem('novara_user_data', JSON.stringify(data)); }
        catch(e) { console.warn('Storage quota exceeded; user data could not be saved.', e); }
    },
    saveItem: (type, item) => {
        let d = UserDataEngine.load();
        const idx = d[type].findIndex(x => x.id === item.id);
        if(idx > -1) d[type][idx] = item;
        else d[type].push(item);
        UserDataEngine.save(d);
    },
    deleteItem: (type, id) => {
        let d = UserDataEngine.load();
        d[type] = d[type].filter(x => x.id !== id);
        UserDataEngine.save(d);
    }
};

const state = {
    worker: null,
    chartInstance: null,
    strategyChartInstance: null,
    pie_left: null,
    pie_right: null,
    portfolios: [], 
    workingPort_left: null, 
    workingPort_right: null,
    personas: [],
    activePersonaId: null,
    strategyYears: [50, 15, 0],
    autoRun: true,
    portInputsCollapsed_left: true,  // Default collapsed
    portInputsCollapsed_right: true, // Default collapsed
    advLeft: false,
    advRight: false
};

let debounceTimer;

window.onerror = function(message, source, lineno, colno, error) { console.error("Sys Err:", error); };
window.addEventListener('beforeunload', () => { if (state.worker) state.worker.terminate(); });

document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById("wrapper");
    const menuBtn = document.getElementById("menu-toggle");
    if (menuBtn) menuBtn.onclick = (e) => { e.preventDefault(); wrapper.classList.toggle("toggled"); };
    document.getElementById('asset-detail-overlay')?.addEventListener('click', closeAssetDetailPanelOnOverlay);

    state.portfolios = UserDataEngine.load().portfolios || [];
    
    state.personas = JSON.parse(JSON.stringify(PRESET_PERSONAS));
    UserDataEngine.load().personas.forEach(p => state.personas.push(p));
    if(state.personas.length > 0) state.activePersonaId = state.personas[0].id;

    buildSharedLegend();
    setupEventListeners();

    try {
        initWorker();
        renderAssetRows();
        renderStressAssumptionsTable(); 
        initPresets();
        initRunModelInputs();
        renderPersonaCards();
        setupAutoRun();
        
        refreshPortfolioDropdowns();
        
        const defaultPortId = state.portfolios.length > 0 ? state.portfolios[0].id : PRESET_PORTFOLIOS[0].portfolios[0].id;
        renderPortfolioPane('left', defaultPortId);
        
        renderStrategyTable(1);
        initTooltips();

        try {
            if(PRESET_CMAS && PRESET_CMAS.length > 0) loadCMAPreset('preset_0');
            if(STRATEGY_GROUPS && STRATEGY_GROUPS.length > 0 && STRATEGY_GROUPS[0].strategies.length > 0) loadStrategyPreset('preset_0_0');
        } catch (dataErr) {
            console.warn("Default Data Load Warning:", dataErr);
        }
        
        setTimeout(runSimulation, 500);
    } catch (err) {
        console.error("Critical Init Error:", err);
    }
});

function initTooltips() {
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, {
            container: 'body',
            html: true
        }));
    }
}

// Avatar helpers are provided by avatars.js (getAvatarSVG, getAvatarBgColor, getAvatarLabel)

// Escapes a string for safe use inside an HTML attribute value.
function escAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Marks a save section as having unsaved changes by showing a small label
// next to the save button. Pass dirtyId=null to clear the indicator.
function setDirty(indicatorId, isDirty) {
    const el = document.getElementById(indicatorId);
    if (!el) return;
    if (isDirty) {
        el.classList.add('visible');
    } else {
        el.classList.remove('visible');
    }
}

function setupEventListeners() {
    // Top Tabs
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
                    if(state.pie_left) state.pie_left.resize();
                    if(state.pie_right) state.pie_right.resize();
                }, 50);
            }
            
            document.getElementById(`tab-${target}`).classList.remove('d-none');
        });
    });

    // File Manager Controls
    document.getElementById('btn-export-data')?.addEventListener('click', () => {
        const data = UserDataEngine.load();
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `novara_user_data.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('btn-import-data')?.addEventListener('click', () => {
        document.getElementById('file-import-data').click();
    });

    document.getElementById('file-import-data')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const json = JSON.parse(evt.target.result);
                if(json && typeof json === 'object') {
                    if(!json.cmas) json.cmas = [];
                    if(!json.portfolios) json.portfolios = [];
                    if(!json.strategies) json.strategies = [];
                    if(!json.personas) json.personas = [];
                    UserDataEngine.save(json);
                    showToast('Data imported successfully. Reloading to apply changes…', 'success');
                    setTimeout(() => location.reload(), 1200);
                } else {
                    showToast('Invalid file format. Please use a valid Novara save file.', 'error');
                }
            } catch(err) {
                showToast('Could not parse file. Please ensure it is a valid Novara JSON save file.', 'error');
            }
            e.target.value = ''; 
        };
        reader.readAsText(file);
    });

    document.getElementById('run-simulation-btn')?.addEventListener('click', runSimulation);
    document.getElementById('confidence-slider')?.addEventListener('input', updateConfidence);
    document.getElementById('auto-update-toggle')?.addEventListener('change', (e) => { state.autoRun = e.target.checked; });
    
    document.getElementById('cma-preset-select')?.addEventListener('change', (e) => { if(e.target.value !== "") loadCMAPreset(e.target.value); });
    document.getElementById('strategy-preset-select')?.addEventListener('change', (e) => { if(e.target.value !== "") loadStrategyPreset(e.target.value); });
    
    document.getElementById('portfolio-cma-select')?.addEventListener('change', () => {
        const leftId = document.getElementById('port-select-left').value;
        const rightId = document.getElementById('port-select-right').value;
        if(leftId && leftId !== 'none') updatePortfolioVisuals('left');
        if(rightId && rightId !== 'none') updatePortfolioVisuals('right');
    });

    document.getElementById('port-select-left')?.addEventListener('change', (e) => renderPortfolioPane('left', e.target.value));
    document.getElementById('port-select-right')?.addEventListener('change', (e) => renderPortfolioPane('right', e.target.value));
    
    document.querySelectorAll('.btn-toggle-strat').forEach(btn => {
        btn.addEventListener('click', () => document.getElementById('strategy-table-container').classList.toggle('d-none'));
    });
    
    document.getElementById('strat-view-toggle')?.addEventListener('change', renderStrategyChart);

    window.addStrategyYearColumn = addStrategyYearColumn;
    window.addStrategyRow = addStrategyRow;
    window.createNewPortfolio = createNewPortfolio;
    window.toggleAdv = toggleAdv;
    window.removeStrategyRow = removeStrategyRow; 
    window.togglePortfolioInputs = togglePortfolioInputs;
}

function togglePortfolioInputs(side) {
    state[`portInputsCollapsed_${side}`] = !state[`portInputsCollapsed_${side}`];
    syncPortfolioInputsVisibilitySide(side);
}

function syncPortfolioInputsVisibilitySide(side) {
    const container = document.getElementById(`port-inputs-${side}-container`);
    const hr = document.getElementById(`port-hr-${side}`);
    const icon = document.getElementById(`icon-toggle-${side}`);
    const nameContainer = document.getElementById(`port-name-container-${side}`);
    
    if(container && hr) {
        if (state[`portInputsCollapsed_${side}`]) {
            container.classList.add('d-none'); 
            hr.classList.add('d-none');
            if(nameContainer) {
                nameContainer.classList.remove('d-flex');
                nameContainer.classList.add('d-none');
            }
            if(icon) { icon.classList.remove('fa-chevron-up'); icon.classList.add('fa-chevron-down'); }
        } else {
            container.classList.remove('d-none'); 
            hr.classList.remove('d-none');
            if(nameContainer) {
                nameContainer.classList.remove('d-none');
                nameContainer.classList.add('d-flex');
            }
            if(icon) { icon.classList.remove('fa-chevron-down'); icon.classList.add('fa-chevron-up'); }
        }
    }
}

// --- TOAST NOTIFICATION ---
function showToast(message, type = 'info') {
    const existing = document.getElementById('novara-toast');
    if (existing) existing.remove();

    const colorMap = {
        success: 'var(--accent-green)',
        error: 'var(--accent-purple)',
        warning: '#D97706',
        info: 'var(--accent-blue)'
    };
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-triangle',
        warning: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.id = 'novara-toast';
    toast.style.cssText = `
        position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 9999;
        background: var(--bg-surface); color: var(--text-main);
        border-left: 4px solid ${colorMap[type] || colorMap.info};
        border-radius: var(--radius-md); padding: 0.85rem 1.25rem;
        box-shadow: var(--shadow-soft); max-width: 380px;
        display: flex; align-items: flex-start; gap: 0.75rem;
        font-size: 0.875rem; font-weight: 500; font-family: 'Inter', sans-serif;
        animation: toastIn 0.25s ease;
    `;
    toast.innerHTML = `
        <i class="fas ${iconMap[type] || iconMap.info}" style="color:${colorMap[type] || colorMap.info}; margin-top:2px; flex-shrink:0;"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="margin-left:auto; background:none; border:none; color:var(--text-muted); cursor:pointer; padding:0; line-height:1; flex-shrink:0;">
            <i class="fas fa-times"></i>
        </button>
    `;

    if (!document.getElementById('novara-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'novara-toast-styles';
        style.textContent = `@keyframes toastIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => { if (document.body.contains(toast)) toast.remove(); }, 5000);
}



function initPresets() {
    refreshCMADropdowns();
    refreshStrategyDropdowns();
    
    document.getElementById('btn-save-cma')?.addEventListener('click', saveCMA);
    document.getElementById('btn-delete-cma')?.addEventListener('click', deleteCMA);
    
    document.getElementById('btn-save-strat')?.addEventListener('click', saveStrategy);
    document.getElementById('btn-delete-strat')?.addEventListener('click', deleteStrategy);
}

function showSavedFeedback(btnId) {
    const btn = document.getElementById(btnId);
    if(!btn) return;
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => btn.innerHTML = orig, 1500);
}

function refreshCMADropdowns() {
    const customCMAs = UserDataEngine.load().cmas;
    
    let presetHtml = '<optgroup label="Presets">';
    PRESET_CMAS.forEach((p, i) => presetHtml += `<option value="preset_${i}">${p.name}</option>`);
    presetHtml += '</optgroup>';
    
    let customHtml = '';
    if(customCMAs.length > 0) {
        customHtml = '<optgroup label="My Markets">';
        customCMAs.forEach(c => customHtml += `<option value="${c.id}">${c.name}</option>`);
        customHtml += '</optgroup>';
    }

    const editorSel = document.getElementById('cma-preset-select');
    if(editorSel) {
        const currEd = editorSel.value;
        editorSel.innerHTML = '<option value="">Load Preset...</option>' + presetHtml + customHtml;
        if(currEd) editorSel.value = currEd;
    }

    const runHtml = '<option value="custom">Use "Markets" Tab</option>' + presetHtml + customHtml;
    const runSel = document.getElementById('run-cma-select');
    if(runSel) { const c = runSel.value; runSel.innerHTML = runHtml; if(c) runSel.value = c; }
    
    const portSel = document.getElementById('portfolio-cma-select');
    if(portSel) { const c = portSel.value; portSel.innerHTML = runHtml; if(c) portSel.value = c; }
}

function loadCMAPreset(id) {
    if(!id) return;
    let cmaObj;
    if(id.startsWith('preset_')) {
        cmaObj = PRESET_CMAS[parseInt(id.split('_')[1])];
    } else {
        cmaObj = UserDataEngine.load().cmas.find(c => c.id === id);
    }
    if(!cmaObj) return;

    const sel = document.getElementById('cma-preset-select');
    if(sel) sel.value = id;
    
    const nameInput = document.getElementById('cma-custom-name');
    if(nameInput) {
        nameInput.value = cmaObj.name;
        nameInput.dataset.originalName = cmaObj.name;
    }
    
    const delBtn = document.getElementById('btn-delete-cma');
    if(delBtn) {
        if(id.startsWith('custom_')) delBtn.classList.remove('d-none');
        else delBtn.classList.add('d-none');
    }

    const data = cmaObj.data;
    document.querySelectorAll('#cma-table tbody tr').forEach(tr => {
        tr.querySelectorAll('input:not(.corr-input)').forEach(inp => {
            const key = inp.dataset.key; const field = inp.dataset.field; 
            if (data[field] && data[field][key] !== undefined) {
                const val = data[field][key];
                inp.value = (field === 'r' || field === 'v') ? (val * 100).toFixed(2) : val.toFixed(2);
                inp.dispatchEvent(new Event('input')); 
            }
        });
        
        tr.querySelectorAll('.corr-input').forEach(inp => {
            const row = inp.dataset.row; const col = inp.dataset.col;
            if (data.correlations && data.correlations[row] && data.correlations[row][col] !== undefined) {
                inp.value = data.correlations[row][col].toFixed(2);
                inp.dispatchEvent(new Event('input')); 
            }
        });
    });
}

function saveCMA() {
    const nameInput = document.getElementById('cma-custom-name');
    let newName = nameInput.value.trim() || 'Custom Market';
    const oldName = nameInput.dataset.originalName;
    let id = document.getElementById('cma-preset-select').value;
    
    if (!id.startsWith('custom_') || newName !== oldName) {
        id = 'custom_cma_' + Date.now();
    }
    
    UserDataEngine.saveItem('cmas', { id, name: newName, data: scrapeCMATable() });
    refreshCMADropdowns();
    loadCMAPreset(id);
    setDirty('cma-dirty-indicator', false);
    showSavedFeedback('btn-save-cma');
}

function deleteCMA() {
    const id = document.getElementById('cma-preset-select').value;
    if(id.startsWith('custom_')) {
        UserDataEngine.deleteItem('cmas', id);
        refreshCMADropdowns();
        loadCMAPreset('preset_0'); // Fall back to May 2026
    }
}

function scrapeCMATable() {
    const r = {}, v = {}, k = {}, correlations = {};
    ASSET_CLASSES.forEach(ac => correlations[ac.key] = {});

    document.querySelectorAll('#cma-table tbody tr').forEach(tr => {
        tr.querySelectorAll('input:not(.corr-input)').forEach(inp => {
            const val = parseFloat(inp.value) || 0;
            if(inp.dataset.field === 'r') r[inp.dataset.key] = val / 100;
            if(inp.dataset.field === 'v') v[inp.dataset.key] = val / 100;
            if(inp.dataset.field === 'k') k[inp.dataset.key] = val; 
        });
        
        tr.querySelectorAll('.corr-input').forEach(inp => {
            const val = parseFloat(inp.value) || 0;
            correlations[inp.dataset.row][inp.dataset.col] = val;
        });
    });
    return { r, v, k, correlations };
}

function refreshStrategyDropdowns() {
    const customStrats = UserDataEngine.load().strategies;
    
    let presetHtml = '';
    STRATEGY_GROUPS.forEach((group, gIdx) => {
        presetHtml += `<optgroup label="${group.name}">`;
        group.strategies.forEach((strat, sIdx) => {
            presetHtml += `<option value="preset_${gIdx}_${sIdx}">${strat.name}</option>`;
        });
        presetHtml += `</optgroup>`;
    });

    let customHtml = '';
    if(customStrats.length > 0) {
        customHtml = '<optgroup label="My Strategies">';
        customStrats.forEach(s => customHtml += `<option value="${s.id}">${s.name}</option>`);
        customHtml += '</optgroup>';
    }

    const editorSel = document.getElementById('strategy-preset-select');
    if(editorSel) {
        const currEd = editorSel.value;
        editorSel.innerHTML = '<option value="">Load Preset...</option>' + presetHtml + customHtml;
        if(currEd) editorSel.value = currEd;
    }

    const runHtml = '<option value="custom">Active Strategy Builder</option>' + presetHtml + customHtml;
    ['run-strat-1', 'run-strat-2', 'run-strat-3'].forEach((id, i) => {
        const sel = document.getElementById(id);
        if(sel) {
            const c = sel.value;
            sel.innerHTML = i === 0 ? runHtml : '<option value="">None</option>' + runHtml;
            if(c) sel.value = c;
        }
    });
}

function loadStrategyPreset(id) {
    if(!id) return;
    let stratObj;
    if(id.startsWith('preset_')) {
        const parts = id.split('_');
        stratObj = STRATEGY_GROUPS[parseInt(parts[1])]?.strategies[parseInt(parts[2])];
    } else {
        stratObj = UserDataEngine.load().strategies.find(s => s.id === id);
    }
    if(!stratObj) return;

    const sel = document.getElementById('strategy-preset-select');
    if(sel) sel.value = id;
    
    const nameInput = document.getElementById('strat-custom-name');
    if(nameInput) {
        nameInput.value = stratObj.name;
        nameInput.dataset.originalName = stratObj.name;
    }
    
    const delBtn = document.getElementById('btn-delete-strat');
    if(delBtn) {
        if(id.startsWith('custom_')) delBtn.classList.remove('d-none');
        else delBtn.classList.add('d-none');
    }

    state.strategyYears = stratObj.points.map(p => p.years).sort((a,b)=>b-a);
    const neededPortIds = new Set();
    stratObj.points.forEach(pt => Object.keys(pt.weights).forEach(pid => neededPortIds.add(pid)));
    const idsArray = Array.from(neededPortIds);
    
    renderStrategyTable(Math.max(1, idsArray.length)); 
    
    const table = document.getElementById('strategy-table');
    const selects = table.querySelectorAll('.strat-port-select');
    idsArray.forEach((pid, rowIdx) => { if(selects[rowIdx]) selects[rowIdx].value = pid; });

    stratObj.points.forEach(pt => {
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

function saveStrategy() {
    const nameInput = document.getElementById('strat-custom-name');
    let newName = nameInput.value.trim() || 'Custom Strategy';
    const oldName = nameInput.dataset.originalName;
    let id = document.getElementById('strategy-preset-select').value;
    
    if (!id.startsWith('custom_') || newName !== oldName) {
        id = 'custom_strat_' + Date.now();
    }
    
    UserDataEngine.saveItem('strategies', { id, name: newName, points: scrapeStrategyUI() });
    refreshStrategyDropdowns();
    loadStrategyPreset(id);
    setDirty('strat-dirty-indicator', false);
    showSavedFeedback('btn-save-strat');
}

function deleteStrategy() {
    const id = document.getElementById('strategy-preset-select').value;
    if(id.startsWith('custom_')) {
        UserDataEngine.deleteItem('strategies', id);
        refreshStrategyDropdowns();
        loadStrategyPreset('preset_0_0'); 
    }
}

// --- STANDARD UI LOGIC ---

function toggleAdv(side) {
    state[`adv${side}`] = !state[`adv${side}`];
    const cols = document.querySelectorAll(`.adv-col-${side}`);
    if (state[`adv${side}`]) {
        cols.forEach(el => el.classList.remove('d-none'));
    } else {
        cols.forEach(el => el.classList.add('d-none'));
    }
}

function hexToRgba(hex, alpha) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ── CMA Commentary System ──────────────────────────────────────────────────
// Loads cma_commentary.md once, caches it, then extracts the block matching
// the active CMA's cma_id and the clicked asset's key.

let _commentaryCache = null;

async function loadCommentary() {
    if (_commentaryCache !== null) return _commentaryCache;
    try {
        const res = await fetch('./commentary/cma_commentary.md');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        // Strip HTML comment header if present, keep only block body
        const start = text.indexOf('-->\n\n');
        _commentaryCache = start >= 0 ? text.slice(start + 5) : text;
    } catch(e) {
        // Fetch unavailable (e.g. file:// protocol) — use inline fallback.
        // COMMENTARY_FALLBACK is already the body content with no HTML header.
        console.info('Commentary fetch unavailable, using inline fallback:', e.message);
        _commentaryCache = COMMENTARY_FALLBACK;
    }
    return _commentaryCache;
}

function extractCommentaryBlock(markdown, cmaId, assetId) {
    // _commentaryCache is always clean body content (HTML header already stripped).
    // Split on block boundaries and find the matching cma_id + asset_id pair.
    const blockPattern = /---\ncma_id:\s*(\S+)\nasset_id:\s*(\S+)\n---\n([\s\S]*?)(?=\n---\ncma_id:|\s*$)/g;
    let match;
    while ((match = blockPattern.exec(markdown)) !== null) {
        if (match[1] === cmaId && match[2] === assetId) {
            return match[3].trim();
        }
    }
    return null;
}

function renderMarkdown(md) {
    if (!md) return '<p class="text-muted fst-italic">No commentary available for this asset in the selected CMA.</p>';
    let html = md
        // Pipe tables
        .replace(/^\|(.+)\|$/gm, (line) => {
            const cells = line.split('|').slice(1,-1).map(c => c.trim());
            return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
        })
        .replace(/^\|[-| :]+\|$/gm, '') // remove separator rows
        // Wrap consecutive <tr> lines in a table
        .replace(/((?:<tr>.*<\/tr>\n?)+)/g, (rows) => {
            const rowArr = rows.trim().split('\n');
            const header = rowArr[0].replace(/<td>/g,'<th>').replace(/<\/td>/g,'</th>');
            const body   = rowArr.slice(1).join('\n');
            return `<table class="table table-sm table-borderless commentary-table mb-3"><thead>${header}</thead><tbody>${body}</tbody></table>`;
        })
        // H2 headings
        .replace(/^## (.+)$/gm, '<h6 class="commentary-heading mt-3 mb-2">$1</h6>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Bullet lists — collect consecutive items
        .replace(/((?:^- .+\n?)+)/gm, (block) => {
            const items = block.trim().split('\n').map(l => `<li>${l.replace(/^- /,'')}</li>`).join('');
            return `<ul class="commentary-list mb-2">${items}</ul>`;
        })
        // Paragraphs (double newline separated)
        .replace(/\n{2,}/g, '</p><p>')
        .replace(/\n/g, ' ');
    return `<p>${html}</p>`.replace(/<p><\/p>/g,'').replace(/<p>(<[uth])/g,'$1').replace(/(<\/[uth][^>]*>)<\/p>/g,'$1');
}

// ── Asset Detail Panel ────────────────────────────────────────────────────────

function getActiveCMAId() {
    const sel = document.getElementById('cma-preset-select');
    const id = sel?.value;
    if (!id) return null;
    if (id.startsWith('preset_')) {
        const idx = parseInt(id.split('_')[1]);
        return PRESET_CMAS[idx]?.cma_id || null;
    }
    const custom = UserDataEngine.load().cmas?.find(c => c.id === id);
    return custom?.cma_id || null;
}

function getAssetCMAValues(assetKey) {
    // Read current live values from the CMA table inputs
    const rInp = document.querySelector(`#cma-table input[data-key="${assetKey}"][data-field="r"]`);
    const vInp = document.querySelector(`#cma-table input[data-key="${assetKey}"][data-field="v"]`);
    const kInp = document.querySelector(`#cma-table input[data-key="${assetKey}"][data-field="k"]`);
    return {
        r: rInp ? parseFloat(rInp.value) / 100 : 0,
        v: vInp ? parseFloat(vInp.value) / 100 : 0,
        k: kInp ? parseFloat(kInp.value) : 0
    };
}

const CONVICTION_MAP  = { low: 1, medium: 2, 'medium-high': 3, high: 4 };
const RISK_COLOR_MAP  = { low: '#059669', moderate: '#D97706', elevated: '#DC2626', high: '#7C3AED' };

async function openAssetDetailPanel(asset) {
    const panel     = document.getElementById('asset-detail-panel');
    const overlay   = document.getElementById('asset-detail-overlay');
    if (!panel || !overlay) return;

    const { r, v, k } = getAssetCMAValues(asset.key);
    const cmaId       = getActiveCMAId();
    const markdown    = await loadCommentary();
    const commentary  = cmaId ? extractCommentaryBlock(markdown, cmaId, asset.key) : null;

    // Derive distribution stats for panel chart labels
    const df      = k > 0.05 ? (6 / k) + 4 : 1000;
    const sigma1  = v;
    const sigma2  = v * 2;

    // Conviction text from positioning section
    const convictionMatch = commentary?.match(/\*\*((?:high|medium[- ]?high|medium|low[- ]?medium|low) conviction)/i);
    const convictionText  = convictionMatch ? convictionMatch[1] : '';
    const convictionLevel = convictionText.toLowerCase().replace(/\s+conviction/,'').trim();
    const convictionDots  = Array.from({length:4}, (_,i) =>
        `<span style="display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:3px;background:${i < (CONVICTION_MAP[convictionLevel]||2) ? asset.color : '#E2E8F0'};"></span>`
    ).join('');

    // Tooltip text for risk level and conviction
    const riskTooltip = {
        low:      'Low risk: vol < 8%, kurtosis < 1.5. Near-Gaussian return distribution; tail events rare and modest (e.g. Money Markets).',
        moderate: 'Moderate risk: vol 8–15%, kurtosis 1.5–2.5. Meaningful but manageable drawdowns; limited fat-tail exposure (e.g. IG Credit).',
        elevated: 'Elevated risk: vol 15–25% or kurtosis 2.5–4.0. Significant drawdown potential; fat tails present (e.g. most Equities, REITs).',
        high:     'High risk: vol ≥ 25% or kurtosis ≥ 4.0. Large and frequent extreme outcomes; crisis drawdowns can be severe (e.g. EM Equity, Digital Assets).'
    }[riskLevel] || '';
    const convTooltip = 'Conviction reflects the research team\'s confidence in the return assumption: 1 dot = low, 2 = medium, 3 = medium-high, 4 = high. Derived from the Positioning section of the CMA commentary.';

    // Risk level — derived from a composite of annualised volatility and kurtosis.
    // Both dimensions matter: vol measures the width of the distribution (how often
    // returns are far from the mean); kurtosis measures tail heaviness (how extreme
    // the worst outcomes can be). A low-vol asset with high kurtosis (e.g. Private
    // Credit) can still be elevated risk; a high-vol asset with low kurtosis
    // (e.g. Developed Equities) is a different kind of risk.
    //
    // Thresholds (vol p.a. / kurtosis):
    //   low      — vol < 8%  AND k < 1.5   (Money Markets, Short Duration Credit)
    //   moderate — vol < 15% AND k < 2.5   (IG Credit, Global Sovereign, Infla Linked)
    //   elevated — vol < 25% OR  k < 4.0   (most equities, REITs, Private Credit)
    //   high     — vol >= 25% OR k >= 4.0  (EM Equity, Digital Assets, Private Equity)
    const riskLevel = (v >= 0.25 || k >= 4.0) ? 'high'
                    : (v >= 0.15 || k >= 2.5) ? 'elevated'
                    : (v >= 0.08 || k >= 1.5) ? 'moderate'
                    : 'low';
    const riskColor = RISK_COLOR_MAP[riskLevel];

    panel.innerHTML = `
        <div class="d-flex align-items-start justify-content-between mb-3">
            <div class="d-flex align-items-center gap-2">
                <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${asset.color};flex-shrink:0;"></span>
                <div>
                    <h5 class="mb-0 fw-bold" style="font-size:1rem;color:var(--text-main);">${asset.name}</h5>
                    <span class="text-muted" style="font-size:0.75rem;font-weight:600;">${asset.category}</span>
                </div>
            </div>
            <div class="d-flex align-items-center gap-2">
                <span style="font-size:0.7rem;font-weight:700;padding:2px 8px;border-radius:20px;background:${riskColor}20;color:${riskColor};text-transform:uppercase;letter-spacing:0.5px;cursor:help;" data-bs-toggle="tooltip" data-bs-placement="bottom" title="${riskTooltip}">${riskLevel} risk</span>
                <button id="close-asset-panel" class="btn btn-sm btn-light border rounded-circle" style="width:28px;height:28px;padding:0;line-height:28px;text-align:center;">
                    <i class="fas fa-times" style="font-size:0.7rem;"></i>
                </button>
            </div>
        </div>

        <!-- Key metrics strip -->
        <div class="d-flex gap-2 mb-3 flex-wrap">
            <div class="flex-fill text-center py-2 px-1 rounded" style="background:var(--bg-main);min-width:70px;">
                <div class="fw-bold" style="font-size:1rem;color:${asset.color};">${(r*100).toFixed(2)}%</div>
                <div class="text-muted" style="font-size:0.65rem;font-weight:600;">Return p.a.</div>
            </div>
            <div class="flex-fill text-center py-2 px-1 rounded" style="background:var(--bg-main);min-width:70px;">
                <div class="fw-bold" style="font-size:1rem;color:var(--text-main);">${(v*100).toFixed(1)}%</div>
                <div class="text-muted" style="font-size:0.65rem;font-weight:600;">Volatility p.a.</div>
            </div>
            <div class="flex-fill text-center py-2 px-1 rounded" style="background:var(--bg-main);min-width:70px;">
                <div class="fw-bold" style="font-size:1rem;color:var(--text-main);">${k.toFixed(2)}</div>
                <div class="text-muted" style="font-size:0.65rem;font-weight:600;">Kurtosis</div>
            </div>
            <div class="flex-fill text-center py-2 px-1 rounded" style="background:var(--bg-main);min-width:70px;cursor:help;" data-bs-toggle="tooltip" data-bs-placement="bottom" title="${convTooltip}">
                <div class="fw-bold d-flex justify-content-center align-items-center" style="font-size:0.85rem;height:24px;">${convictionDots}</div>
                <div class="text-muted" style="font-size:0.65rem;font-weight:600;">Conviction</div>
            </div>
        </div>

        <!-- Distribution chart with labelled axes -->
        <div class="mb-3">
            <div class="text-muted mb-1" style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Annual Return Distribution</div>
            <div style="position:relative;">
                <canvas id="panel-dist-chart" width="340" height="140" style="width:100%;height:140px;display:block;"></canvas>
                <div id="panel-dist-axis" style="display:flex;justify-content:space-between;padding:0 4px;margin-top:2px;">
                </div>
            </div>
        </div>

        <!-- Commentary -->
        <div class="commentary-body" style="font-size:0.82rem;line-height:1.6;color:var(--text-main);">
            ${renderMarkdown(commentary)}
        </div>

        <!-- Footer -->
        <div class="mt-3 pt-2 border-top" style="font-size:0.68rem;color:var(--text-muted);">
            ${cmaId ? `CMA: ${cmaId.replace(/_/g,' ')}` : 'No CMA ID available'}
            ${!commentary ? ' · <em>No commentary available — add a block to cma_commentary.md</em>' : ''}
        </div>
    `;

    // Draw enlarged distribution chart with axis labels
    requestAnimationFrame(() => {
        drawPanelDistributionChart(asset.key, r, v, k, asset.color);
        // Initialise Bootstrap tooltips on the newly rendered panel
        panel.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el =>
            new bootstrap.Tooltip(el, { container: 'body', html: false })
        );
    });

    document.getElementById('close-asset-panel')?.addEventListener('click', closeAssetDetailPanel);

    overlay.classList.remove('d-none');
    panel.classList.remove('d-none');
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        panel.style.transform = 'translateX(0)';
        panel.style.opacity   = '1';
    });
}

function closeAssetDetailPanel() {
    const panel   = document.getElementById('asset-detail-panel');
    const overlay = document.getElementById('asset-detail-overlay');
    if (!panel || !overlay) return;
    panel.style.transform = 'translateX(24px)';
    panel.style.opacity   = '0';
    overlay.style.opacity = '0';
    setTimeout(() => {
        panel.classList.add('d-none');
        overlay.classList.add('d-none');
    }, 220);
}

function drawPanelDistributionChart(assetKey, r, v, kurtosis, colorHex) {
    const canvas = document.getElementById('panel-dist-chart');
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    const W      = canvas.offsetWidth  || 340;
    const H      = 140;
    canvas.width  = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    const PAD_L = 8, PAD_R = 8, PAD_T = 8, PAD_B = 28;
    const chartW = W - PAD_L - PAD_R;
    const chartH = H - PAD_T - PAD_B;

    const vol  = Math.max(v, 0.001);
    const k    = Math.max(kurtosis, 0.01);
    const df   = k > 0.05 ? (6 / k) + 4 : 1000;
    const s    = vol * Math.sqrt((df - 2) / df);

    // import logGamma from mathUtils via module scope
    const coef  = Math.exp(logGamma((df+1)/2) - logGamma(df/2)) / (Math.sqrt(Math.PI*df)*s);
    const exp_  = -(df+1)/2;

    const minX = Math.min(-0.6, r - 3.5*vol);
    const maxX = Math.max( 0.6, r + 3.5*vol);

    const pts = [];
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
        const x  = minX + (maxX-minX)*(i/steps);
        const y  = coef * Math.pow(1 + Math.pow((x-r)/s,2)/df, exp_);
        pts.push({x, y});
    }
    const maxY = Math.max(...pts.map(p=>p.y));

    const toCanvasX = x => PAD_L + ((x-minX)/(maxX-minX))*chartW;
    const toCanvasY = y => PAD_T + chartH - (y/maxY)*chartH*0.92;

    // ±1σ shaded band
    const x1L = toCanvasX(r - vol), x1R = toCanvasX(r + vol);
    ctx.fillStyle = hexToRgba(colorHex, 0.12);
    ctx.fillRect(x1L, PAD_T, x1R-x1L, chartH);

    // ±2σ lighter band
    const x2L = toCanvasX(r - 2*vol), x2R = toCanvasX(r + 2*vol);
    ctx.fillStyle = hexToRgba(colorHex, 0.06);
    ctx.fillRect(x2L, PAD_T, x2R-x2L, chartH);

    // Distribution fill
    ctx.beginPath();
    ctx.moveTo(toCanvasX(pts[0].x), PAD_T+chartH);
    pts.forEach(p => ctx.lineTo(toCanvasX(p.x), toCanvasY(p.y)));
    ctx.lineTo(toCanvasX(pts[pts.length-1].x), PAD_T+chartH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, PAD_T, 0, PAD_T+chartH);
    grad.addColorStop(0, hexToRgba(colorHex, 0.55));
    grad.addColorStop(1, hexToRgba(colorHex, 0.05));
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = colorHex; ctx.lineWidth = 1.8; ctx.stroke();

    // Mean line
    const meanX = toCanvasX(r);
    ctx.beginPath(); ctx.moveTo(meanX, PAD_T); ctx.lineTo(meanX, PAD_T+chartH);
    ctx.strokeStyle = hexToRgba(colorHex, 0.6); ctx.lineWidth = 1.2;
    ctx.setLineDash([3,3]); ctx.stroke(); ctx.setLineDash([]);

    // X-axis labels
    ctx.fillStyle = '#94A3B8'; ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'center';
    const labelValues = [];
    for (let pct = Math.ceil(minX*100/10)*10; pct <= Math.floor(maxX*100); pct+=10) {
        labelValues.push(pct/100);
    }
    // Max 7 labels to avoid crowding
    const step = Math.ceil(labelValues.length/7);
    labelValues.filter((_,i)=>i%step===0).forEach(val => {
        const cx = toCanvasX(val);
        if (cx < PAD_L+8 || cx > W-PAD_R-8) return;
        ctx.fillText((val*100).toFixed(0)+'%', cx, H-6);
        ctx.beginPath(); ctx.moveTo(cx, PAD_T+chartH); ctx.lineTo(cx, PAD_T+chartH+3);
        ctx.strokeStyle='#CBD5E1'; ctx.lineWidth=1; ctx.setLineDash([]); ctx.stroke();
    });

    // Legend: mean and ±1σ
    ctx.textAlign='left'; ctx.font='9px Inter,sans-serif'; ctx.fillStyle='#64748B';
    ctx.fillText(`μ=${(r*100).toFixed(1)}%  ±1σ=${(vol*100).toFixed(1)}%  k=${kurtosis.toFixed(2)}`, PAD_L, PAD_T+10);
}

function closeAssetDetailPanelOnOverlay(e) {
    if (e.target.id === 'asset-detail-overlay') closeAssetDetailPanel();
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
    const thead = document.querySelector('#cma-table thead tr');
    const tbody = document.querySelector('#cma-table tbody');
    if(!tbody || !thead) return;
    
    let headerHTML = `
        <th style="min-width: 180px;">Asset Class</th>
        <th class="text-center" style="width: 100px;">Profile</th>
        <th class="text-end" style="min-width: 90px;">Return (%)</th>
        <th class="text-end" style="min-width: 90px;">Vol (%)</th>
        <th class="text-end pe-4" style="min-width: 90px;">Kurtosis</th>
    `;
    ASSET_CLASSES.forEach(ac => {
        headerHTML += `<th class="text-center corr-col d-none" style="min-width: 50px;" title="${ac.name}">${ac.key.substring(0,6)}</th>`;
    });
    thead.innerHTML = headerHTML;

    tbody.innerHTML = '';
    const frag = document.createDocumentFragment();
    
    ASSET_CLASSES.forEach(asset => {
        const tr = document.createElement('tr');
        let rowHTML = `
            <td class="fw-medium text-muted" style="position: sticky; left: 0; background: var(--bg-surface); z-index: 1;">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${asset.color}; margin-right:6px;"></span>
                ${asset.name}
            </td>
            <td class="text-center"><canvas id="dist-${asset.key}" class="dist-canvas" width="80" height="30"></canvas></td>
            <td class="text-end"><input type="number" step="0.1" class="form-control form-control-sm text-end bg-transparent border-0 px-1" data-key="${asset.key}" data-field="r" value="${(asset.defaultR * 100).toFixed(2)}"></td>
            <td class="text-end"><input type="number" step="0.1" class="form-control form-control-sm text-end bg-transparent border-0 px-1" data-key="${asset.key}" data-field="v" value="${(asset.defaultV * 100).toFixed(2)}"></td>
            <td class="text-end pe-4"><input type="number" step="0.1" class="form-control form-control-sm text-end bg-transparent border-0 px-1" data-key="${asset.key}" data-field="k" value="${(asset.defaultK).toFixed(2)}"></td>
        `;
        
        ASSET_CLASSES.forEach(colAsset => {
            const isSelf = asset.key === colAsset.key;
            const val = isSelf ? "1.00" : "0.00";
            const readOnly = isSelf ? 'readonly tabindex="-1"' : '';
            const bgClass = isSelf ? 'bg-dark text-white' : 'bg-transparent';
            
            rowHTML += `<td class="text-center corr-col d-none p-0 heatmap-cell">
                <input type="number" step="0.05" class="form-control form-control-sm text-center border-0 w-100 h-100 rounded-0 ${bgClass} corr-input" 
                data-row="${asset.key}" data-col="${colAsset.key}" value="${val}" style="font-size: 0.75rem; font-weight: 600;" ${readOnly}>
            </td>`;
        });
        
        tr.innerHTML = rowHTML;
        frag.appendChild(tr);

        // Click on asset name cell opens the detail panel
        tr.querySelector('td:first-child').style.cursor = 'pointer';
        tr.querySelector('td:first-child').addEventListener('click', () => openAssetDetailPanel(asset));
        
        const inputs = tr.querySelectorAll('input[data-field="r"], input[data-field="v"], input[data-field="k"]');
        inputs.forEach(inp => {
            inp.addEventListener('input', () => {
                const r = parseFloat(tr.querySelector('input[data-field="r"]').value)/100 || 0;
                const v = parseFloat(tr.querySelector('input[data-field="v"]').value)/100 || 0;
                const k = parseFloat(tr.querySelector('input[data-field="k"]').value) || 0;
                drawDistributionChart(asset.key, r, v, k, asset.color);
                setDirty('cma-dirty-indicator', true);
            });
        });
        
        const corrInputs = tr.querySelectorAll('.corr-input:not([readonly])');
        corrInputs.forEach(inp => {
            inp.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) || 0;
                const rowKey = e.target.dataset.row;
                const colKey = e.target.dataset.col;
                
                e.target.parentElement.style = getCorrHeatmapBg(val);
                
                if (rowKey !== colKey) {
                    const symmetricCell = document.querySelector(`.corr-input[data-row="${colKey}"][data-col="${rowKey}"]`);
                    if(symmetricCell && symmetricCell.value !== e.target.value) {
                        symmetricCell.value = e.target.value;
                        symmetricCell.parentElement.style = getCorrHeatmapBg(val);
                    }
                }
                setDirty('cma-dirty-indicator', true);
            });
        });
        
        setTimeout(() => drawDistributionChart(asset.key, asset.defaultR, asset.defaultV, asset.defaultK, asset.color), 0);
    });
    tbody.appendChild(frag);

    document.getElementById('toggle-corr-matrix')?.addEventListener('change', (e) => {
        const cols = document.querySelectorAll('.corr-col');
        if (e.target.checked) {
            cols.forEach(el => el.classList.remove('d-none'));
        } else {
            cols.forEach(el => el.classList.add('d-none'));
        }
    });
}

function renderStressAssumptionsTable() {
    const theadTr = document.getElementById('cma-stress-thead-tr');
    const tbody = document.querySelector('#cma-stress-table tbody');
    if (!theadTr || !tbody) return;

    let headHTML = `
        <th class="border-end" style="min-width: 120px; position: sticky; left: 0; background: var(--bg-surface); z-index: 3;">Category</th>
        <th class="border-end" style="min-width: 200px; position: sticky; left: 120px; background: var(--bg-surface); z-index: 3;">Asset Class</th>
    `;
    STRESS_SCENARIOS.forEach(sc => {
        headHTML += `<th class="text-center" style="min-width: 100px; font-size:0.7rem; font-weight:700;">
            <span style="cursor:help; border-bottom:1px dotted #94A3B8;" data-bs-toggle="tooltip" data-bs-title="${sc.description}">${sc.name}</span>
        </th>`;
    });
    theadTr.innerHTML = headHTML;

    const grouped = {};
    ASSET_CLASSES.forEach(ac => {
        if(!grouped[ac.category]) grouped[ac.category] = [];
        grouped[ac.category].push(ac);
    });

    let bodyHTML = '';
    Object.keys(grouped).forEach(cat => {
        const assets = grouped[cat];
        assets.forEach((ac, idx) => {
            bodyHTML += `<tr>`;
            
            if(idx === 0) {
                bodyHTML += `<td rowspan="${assets.length}" class="cat-header text-center border-end" style="position: sticky; left: 0; z-index: 2; background: var(--bg-surface);">${cat}</td>`;
            }
            
            bodyHTML += `
                <td class="fw-medium text-muted border-end" style="position: sticky; left: 120px; background: var(--bg-surface); z-index: 2;">
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${ac.color}; margin-right:6px;"></span>
                    ${ac.name}
                </td>`;
            
            STRESS_SCENARIOS.forEach(sc => {
                const val = sc.returns[ac.key] || 0;
                const valPct = (val * 100).toFixed(1);
                const style = getMatrixHeatmapBg(val);
                
                bodyHTML += `<td class="heatmap-cell" style="${style}">${val > 0 ? '+' : ''}${valPct}%</td>`;
            });
            bodyHTML += `</tr>`;
        });
    });
    
    tbody.innerHTML = bodyHTML;

    setTimeout(() => {
        const newTooltips = document.getElementById('cma-stress-collapse').querySelectorAll('[data-bs-toggle="tooltip"]');
        [...newTooltips].map(el => new bootstrap.Tooltip(el, {container:'body', html: true}));
    }, 100);
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
    state.worker = new Worker('./js/worker.js?v=23.0'); 
    state.worker.onmessage = (e) => {
        const { type, payload } = e.data;
        if (type === 'SIMULATION_COMPLETE') {
            updateUIState('Ready');
            renderChart(payload);
            renderResultsTable(payload);
        } else if (type === 'ERROR') {
            updateUIState('Error');
            if (payload === 'CORRELATION_NOT_PSD') {
                showToast(
                    'Mathematical error: the correlation values provided are contradictory and cannot be simulated. Please review the correlation matrix and correct any inconsistencies before re-running.',
                    'error'
                );
            } else if (payload === 'NO_STRATEGIES') {
                showToast('Please select at least one strategy before running the simulation.', 'warning');
            } else if (payload === 'INVALID_CMA') {
                showToast('Invalid market assumptions — please reload a CMA preset and try again.', 'error');
            } else {
                showToast(
                    `Simulation error: ${payload || 'unknown'}. Please check your inputs and try again.`,
                    'error'
                );
            }
        }
    };
}

function renderPersonaCards() {
    const container = document.getElementById('persona-cards-container');
    if(!container) return;
    container.innerHTML = '';
    
    state.personas.forEach(p => {
        const isActive = state.activePersonaId === p.id;
        const isCustom = p.id.startsWith('custom_');
        const bandLabel = getAvatarLabel(p.data.age);
        const bgColor   = getAvatarBgColor(p.data.age);
        const avatarSVG = getAvatarSVG(p.data.age);

        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6';
        col.innerHTML = `
            <div class="card h-100 persona-card shadow-sm ${isActive ? 'active-persona' : ''}" style="cursor:pointer; transition:all 0.3s ease;" data-id="${p.id}">
                <div class="card-header border-0 d-flex align-items-center gap-3 pt-4 pb-3 pe-none" style="background:${bgColor};">
                    <div id="avatar-wrap-${p.id}" class="persona-avatar flex-shrink-0" style="width:64px; height:64px; border-radius:50%; overflow:hidden; background:${bgColor}; box-shadow:var(--shadow-soft); transition:opacity 0.25s ease;">${avatarSVG}</div>
                    <div class="d-flex flex-column w-100 pe-auto" style="pointer-events:auto;">
                        <div class="d-flex align-items-center justify-content-between w-100">
                            <div class="d-flex flex-column flex-grow-1 w-100">
                                <input type="text" class="form-control form-control-sm fw-bold text-dark border-0 px-0 bg-transparent shadow-none persona-name-input text-start" value="${p.name}" style="font-size:1rem; width:100%; min-width:0;">
                                <span class="persona-band-label" style="font-size:0.7rem; font-weight:700; color:var(--text-muted); letter-spacing:0.3px;">${bandLabel}</span>
                            </div>
                            <div class="d-flex gap-1 ms-2 flex-shrink-0">
                                <button class="btn btn-sm btn-light border rounded-circle shadow-sm btn-save-persona" title="Save Persona"><i class="fas fa-save text-primary"></i></button>
                                ${isCustom ? `<button class="btn btn-sm btn-light border rounded-circle shadow-sm text-danger btn-delete-persona" title="Delete Persona"><i class="fas fa-trash"></i></button>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card-body pt-0">
                    <div class="row g-2 pe-auto" style="pointer-events:auto;">
                        <div class="col-6"><label class="form-label mb-1" style="font-size:0.7rem">Current Age</label><input type="number" class="form-control form-control-sm persona-data-input" data-field="age" value="${p.data.age}"></div>
                        <div class="col-6"><label class="form-label mb-1" style="font-size:0.7rem">Retire Age</label><input type="number" class="form-control form-control-sm persona-data-input" data-field="retirementAge" value="${p.data.retirementAge}"></div>
                        <div class="col-6"><label class="form-label mb-1" style="font-size:0.7rem">Salary (\u00a3)</label><input type="number" class="form-control form-control-sm persona-data-input" data-field="salary" value="${p.data.salary}"></div>
                        <div class="col-6"><label class="form-label mb-1" style="font-size:0.7rem">Current Pot (\u00a3)</label><input type="number" class="form-control form-control-sm persona-data-input" data-field="savings" value="${p.data.savings}"></div>
                        <div class="col-6"><label class="form-label mb-1" style="font-size:0.7rem">Contrib (%)</label><input type="number" class="form-control form-control-sm persona-data-input" data-field="contribution" value="${p.data.contribution}"></div>
                        <div class="col-6"><label class="form-label mb-1" style="font-size:0.7rem">Real Salary Gr. (%)</label><input type="number" step="0.1" class="form-control form-control-sm persona-data-input" data-field="realSalaryGrowth" value="${p.data.realSalaryGrowth}"></div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(col);

        const cardEl = col.querySelector('.persona-card');
        cardEl.addEventListener('click', (e) => {
            if(e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'button' || e.target.tagName.toLowerCase() === 'i') return;
            state.activePersonaId = p.id;
            document.querySelectorAll('.persona-card').forEach(c => c.classList.remove('active-persona'));
            cardEl.classList.add('active-persona');
            updateActivePersonaDisplay();
            if(state.autoRun) { updateUIState('Updating...'); clearTimeout(debounceTimer); debounceTimer = setTimeout(runSimulation, 600); }
        });

        col.querySelectorAll('.persona-data-input').forEach(inp => {
            inp.addEventListener('change', (e) => {
                const field = e.target.dataset.field;
                p.data[field] = parseFloat(e.target.value) || 0;
                if (field === 'age') {
                    updatePersonaAvatar(p.id, p.data.age);
                    renderPersonaDropdown();
                }
                if(state.autoRun && state.activePersonaId === p.id) runSimulation();
            });
        });

        col.querySelector('.btn-save-persona').onclick = (e) => {
            e.stopPropagation();
            const newName = col.querySelector('.persona-name-input').value.trim() || 'Custom Persona';
            let targetId = p.id;
            if (!targetId.startsWith('custom_') || p.name !== newName) targetId = 'custom_pers_' + Date.now();
            const newP = JSON.parse(JSON.stringify(p));
            newP.id = targetId; newP.name = newName;
            UserDataEngine.saveItem('personas', newP);
            const idx = state.personas.findIndex(x => x.id === targetId);
            if(idx > -1) state.personas[idx] = newP; else state.personas.push(newP);
            state.activePersonaId = targetId;
            renderPersonaCards(); renderPersonaDropdown();
            const btn = e.currentTarget; const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check text-success"></i>';
            setTimeout(() => { if(document.body.contains(btn)) btn.innerHTML = orig; }, 1500);
        };

        const delBtn = col.querySelector('.btn-delete-persona');
        if(delBtn) {
            delBtn.onclick = (e) => {
                e.stopPropagation();
                UserDataEngine.deleteItem('personas', p.id);
                state.personas = state.personas.filter(x => x.id !== p.id);
                if(state.activePersonaId === p.id) state.activePersonaId = state.personas[0].id;
                renderPersonaCards(); renderPersonaDropdown();
            };
        }
    });

    setTimeout(() => {
        const newTooltips = container.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...newTooltips].map(el => new bootstrap.Tooltip(el, {container:'body', html:true}));
    }, 50);
}

// Crossfades the avatar to the correct age band on tab-out — no card rebuild.
function updatePersonaAvatar(personaId, age) {
    const wrap = document.getElementById(`avatar-wrap-${personaId}`);
    if (!wrap) return;
    wrap.style.opacity = '0';
    setTimeout(() => {
        wrap.innerHTML = getAvatarSVG(age);
        wrap.style.background = getAvatarBgColor(age);
        const header = wrap.closest('.card-header');
        if (header) header.style.background = getAvatarBgColor(age);
        const bandEl = wrap.closest('.card').querySelector('.persona-band-label');
        if (bandEl) bandEl.textContent = getAvatarLabel(age);
        wrap.style.opacity = '1';
        updateActivePersonaDisplay();
    }, 220);
}

function initRunModelInputs() {
    renderPersonaDropdown();
}

function renderPersonaDropdown() {
    const menu = document.getElementById('run-persona-dropdown-menu');
    if(!menu) return;
    menu.innerHTML = '';
    state.personas.forEach(p => {
        const li = document.createElement('li');
        const avatarHtml = `<div style="width:24px;height:24px;border-radius:50%;overflow:hidden;flex-shrink:0;background:${getAvatarBgColor(p.data.age)};">${getAvatarSVG(p.data.age)}</div>`;
        li.innerHTML = `<a class="dropdown-item d-flex align-items-center gap-2 py-2" href="#" data-id="${p.id}">
            ${avatarHtml}
            <div class="d-flex flex-column">
                <span class="fw-bold small text-dark">${p.name}</span>
                <span style="font-size:0.68rem;color:var(--text-muted);font-weight:600;">${getAvatarLabel(p.data.age)}</span>
            </div>
        </a>`;
        li.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            state.activePersonaId = p.id;
            document.querySelectorAll('.persona-card').forEach(c => c.classList.remove('active-persona'));
            const activeCard = document.querySelector(`.persona-card[data-id="${p.id}"]`);
            if (activeCard) activeCard.classList.add('active-persona');
            updateActivePersonaDisplay();
            if(state.autoRun) { updateUIState('Updating...'); clearTimeout(debounceTimer); debounceTimer = setTimeout(runSimulation, 600); }
        });
        menu.appendChild(li);
    });
    updateActivePersonaDisplay();
}

function updateActivePersonaDisplay() {
    const p = state.personas.find(x => x.id === state.activePersonaId);
    const content = document.getElementById('active-persona-content');
    if(p && content) {
        const avatarHtml = `<div style="width:22px;height:22px;border-radius:50%;overflow:hidden;flex-shrink:0;background:${getAvatarBgColor(p.data.age)};">${getAvatarSVG(p.data.age)}</div>`;
        content.innerHTML = `${avatarHtml}<span class="fw-bold text-dark" style="font-size:0.85rem;white-space:nowrap;">${p.name}</span>`;
    }
}


function setupAutoRun() {
    const inputs = ['run-cma-select', 'run-strat-1', 'run-strat-2', 'run-strat-3', 'setting-sim-count', 'setting-inflation'];
    inputs.forEach(id => {
        document.getElementById(id)?.addEventListener('change', () => {
            if(!state.autoRun) return;
            updateUIState('Updating...');
            clearTimeout(debounceTimer); debounceTimer = setTimeout(runSimulation, 600); 
        });
    });
}

function refreshPortfolioDropdowns() {
    const leftSel = document.getElementById('port-select-left');
    const rightSel = document.getElementById('port-select-right');
    
    let presetHtml = '';
    PRESET_PORTFOLIOS.forEach(group => {
        presetHtml += `<optgroup label="${group.name}">`;
        group.portfolios.forEach(p => {
            presetHtml += `<option value="${p.id}">${p.name}</option>`;
        });
        presetHtml += `</optgroup>`;
    });

    let customHtml = '';
    const customs = state.portfolios.filter(p => p.id.startsWith('custom_'));
    if(customs.length > 0) {
        customHtml += `<optgroup label="My Portfolios">`;
        customs.forEach(p => { customHtml += `<option value="${p.id}">${p.name}</option>`; });
        customHtml += `</optgroup>`;
    }
    
    const currLeft = leftSel?.value;
    if(leftSel) leftSel.innerHTML = presetHtml + customHtml;
    if(currLeft && leftSel) leftSel.value = currLeft;

    const currRight = rightSel?.value;
    if(rightSel) rightSel.innerHTML = `<option value="none">-- Select to Compare --</option>` + presetHtml + customHtml;
    if(currRight && rightSel) rightSel.value = currRight;
}

function createNewPortfolio(side) {
    const newPort = { id: `custom_port_${Date.now()}`, name: `Custom Portfolio`, weights: {}, alphas: {}, tes: {} };
    UserDataEngine.saveItem('portfolios', newPort);
    state.portfolios.push(newPort);
    refreshPortfolioDropdowns();
    document.getElementById(`port-select-${side}`).value = newPort.id;
    
    state[`portInputsCollapsed_${side}`] = false; // Auto-expand when a new portfolio is created
    
    renderPortfolioPane(side, newPort.id);
}

function renderPortfolioPane(side, portId) {
    syncPortfolioInputsVisibilitySide(side);

    const blankMsg = document.getElementById(`port-blank-${side}`);
    const bodyContainer = document.getElementById(`port-inputs-${side}-container`);
    const visualsContainer = document.getElementById(`port-visuals-${side}`);
    const hr = document.getElementById(`port-hr-${side}`);

    if (portId === 'none') {
        state[`workingPort_${side}`] = null;
        if(bodyContainer) bodyContainer.classList.add('d-none');
        if(visualsContainer) visualsContainer.classList.add('d-none');
        if(hr) hr.classList.add('d-none');
        if(blankMsg) blankMsg.classList.remove('d-none');
        renderStressTests(); 
        return;
    } else {
        if(visualsContainer) visualsContainer.classList.remove('d-none');
        if(blankMsg) blankMsg.classList.add('d-none');
    }

    const original = getGlobalPortfolio(portId);
    if (!original) return;
    
    state[`workingPort_${side}`] = JSON.parse(JSON.stringify(original));
    const portfolio = state[`workingPort_${side}`];

    const table = document.querySelector(`#port-table-${side}`);
    table.innerHTML = '';
    
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th class="text-muted small text-uppercase fw-bold border-0">Asset Class</th>
            <th class="text-end text-muted small text-uppercase fw-bold border-0" style="width: 80px;">Weight</th>
            <th class="text-end text-muted small text-uppercase fw-bold border-0 adv-col-${side} ${state[`adv${side}`] ? '' : 'd-none'} text-primary" style="width: 80px;">Alpha</th>
            <th class="text-end text-muted small text-uppercase fw-bold border-0 adv-col-${side} ${state[`adv${side}`] ? '' : 'd-none'} text-danger" style="width: 80px;">TE</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.className = "small";

    const isCustom = portfolio.id.startsWith('custom_');
    const nameContainer = document.getElementById(`port-name-container-${side}`);
    if(nameContainer) {
        nameContainer.innerHTML = `
            <input type="text" class="form-control form-control-sm text-start fw-bold port-name-input rounded-pill border-0 shadow-sm w-100" value="${portfolio.name}" placeholder="Portfolio Name...">
            <button class="btn btn-sm btn-primary rounded-pill shadow-sm btn-save-port flex-shrink-0 px-3" title="Save Portfolio"><i class="fas fa-save"></i></button>
            ${isCustom ? `<button class="btn btn-sm btn-danger rounded-pill shadow-sm btn-delete-port flex-shrink-0 px-3" title="Delete"><i class="fas fa-trash"></i></button>` : ''}
        `;
            
        nameContainer.querySelector('.btn-save-port').onclick = (e) => {
            const newName = nameContainer.querySelector('.port-name-input').value.trim() || 'Custom Portfolio';
            let targetId = portfolio.id;
            
            if (!targetId.startsWith('custom_') || portfolio.name !== newName) {
                targetId = 'custom_port_' + Date.now();
            }
            
            portfolio.name = newName;
            portfolio.id = targetId;
            
            UserDataEngine.saveItem('portfolios', portfolio);
            
            const idx = state.portfolios.findIndex(p => p.id === targetId);
            if(idx > -1) state.portfolios[idx] = JSON.parse(JSON.stringify(portfolio));
            else state.portfolios.push(JSON.parse(JSON.stringify(portfolio)));
            
            refreshPortfolioDropdowns();
            document.getElementById(`port-select-${side}`).value = targetId;
            renderPortfolioPane(side, targetId); 
            
            const btn = e.currentTarget;
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => { if(document.body.contains(btn)) btn.innerHTML = orig; }, 1500);
        };

        const delBtn = nameContainer.querySelector('.btn-delete-port');
        if(delBtn) {
            delBtn.onclick = () => {
                UserDataEngine.deleteItem('portfolios', portfolio.id);
                state.portfolios = state.portfolios.filter(p => p.id !== portfolio.id);
                refreshPortfolioDropdowns();
                const fallback = PRESET_PORTFOLIOS[0].portfolios[0].id;
                document.getElementById(`port-select-${side}`).value = fallback;
                renderPortfolioPane(side, fallback);
            };
        }
    }

    ASSET_CLASSES.forEach(ac => {
        const tr = document.createElement('tr');
        const w = portfolio.weights[ac.key] || 0;
        const alpha = (portfolio.alphas && portfolio.alphas[ac.key]) ? portfolio.alphas[ac.key] : 0;
        const te = (portfolio.tes && portfolio.tes[ac.key]) ? portfolio.tes[ac.key] : 0;

        tr.innerHTML = `
            <td class="text-muted fw-medium border-0 align-middle">${ac.name}</td>
            <td class="border-0"><input type="number" class="form-control form-control-sm text-end bg-transparent fw-bold" value="${(w*100).toFixed(1)}" data-key="${ac.key}" data-type="weight" step="0.5"></td>
            <td class="border-0 adv-col-${side} ${state[`adv${side}`] ? '' : 'd-none'}"><input type="number" class="form-control form-control-sm text-end bg-transparent text-primary" value="${(alpha*100).toFixed(2)}" data-key="${ac.key}" data-type="alpha" step="0.1"></td>
            <td class="border-0 adv-col-${side} ${state[`adv${side}`] ? '' : 'd-none'}"><input type="number" class="form-control form-control-sm text-end bg-transparent text-danger" value="${(te*100).toFixed(2)}" data-key="${ac.key}" data-type="te" step="0.1"></td>
        `;
        
        tr.querySelectorAll('input').forEach(inp => {
            inp.addEventListener('input', (e) => {
                const val = (parseFloat(e.target.value) || 0) / 100;
                const type = e.target.dataset.type;
                if (type === 'weight') portfolio.weights[ac.key] = val;
                if (type === 'alpha') { if(!portfolio.alphas) portfolio.alphas={}; portfolio.alphas[ac.key] = val; }
                if (type === 'te') { if(!portfolio.tes) portfolio.tes={}; portfolio.tes[ac.key] = val; }
                updatePortfolioVisuals(side);
            });
        });
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    const newTooltips = table.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...newTooltips].map(el => new bootstrap.Tooltip(el, {container:'body', html: true}));

    updatePortfolioVisuals(side);
}

function updatePortfolioVisuals(side) {
    const portfolio = state[`workingPort_${side}`];
    if (!portfolio) return;

    let cmaData;
    const cmaSel = document.getElementById('portfolio-cma-select');
    if (!cmaSel || cmaSel.value === 'custom') {
        cmaData = scrapeCMATable();
    } else if (cmaSel.value.startsWith('preset_')) {
        const idx = parseInt(cmaSel.value.replace('preset_',''));
        cmaData = PRESET_CMAS[idx].data;
    } else {
        const custom = UserDataEngine.load().cmas.find(c => c.id === cmaSel.value);
        cmaData = custom ? custom.data : PRESET_CMAS[0].data;
    }

    const stats = calcDeterministicStats(portfolio.weights, portfolio.alphas, portfolio.tes, cmaData);
    
    document.getElementById(`stat-ret-${side}`).innerText = (stats.arithRet * 100).toFixed(2) + '%';
    document.getElementById(`stat-unit-${side}`).innerText = stats.median20Yr.toFixed(2) + 'x';
    document.getElementById(`stat-vol-${side}`).innerText = (stats.vol * 100).toFixed(2) + '%';

    let totalImpact = 0;
    STRESS_SCENARIOS.forEach(sc => {
        let scenarioImpact = 0;
        ASSET_CLASSES.forEach(ac => {
            scenarioImpact += (portfolio.weights[ac.key] || 0) * (sc.returns[ac.key] || 0);
        });
        totalImpact += scenarioImpact;
    });
    const avgImpact = (totalImpact / STRESS_SCENARIOS.length) * 100;
    const impactEl = document.getElementById(`stat-stress-${side}`);
    if (impactEl) {
        impactEl.innerText = `${avgImpact.toFixed(1)}%`;
        impactEl.className = `val fw-bold ${avgImpact < 0 ? 'text-danger' : 'text-success'}`;
    }

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

    if (state[`pie_${side}`]) state[`pie_${side}`].destroy();
    state[`pie_${side}`] = new Chart(ctx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: bgColors, borderWidth: 0, hoverOffset: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    renderStressTests();
}

function renderStressTests() {
    const portL = state.workingPort_left;
    const portR = state.workingPort_right;
    
    const content = document.getElementById('stress-content');
    
    if (!portL && !portR) {
        content.innerHTML = '<div class="text-center text-muted p-4">Select a portfolio to view stress analysis.</div>';
        return;
    }

    let allVals = [];
    const scenarioResults = STRESS_SCENARIOS.map(sc => {
        let vL = null, vR = null;
        if (portL) {
            vL = 0;
            ASSET_CLASSES.forEach(ac => vL += (portL.weights[ac.key] || 0) * (sc.returns[ac.key] || 0));
            allVals.push(vL);
        }
        if (portR) {
            vR = 0;
            ASSET_CLASSES.forEach(ac => vR += (portR.weights[ac.key] || 0) * (sc.returns[ac.key] || 0));
            allVals.push(vR);
        }
        return { name: sc.name, desc: sc.description, vL, vR };
    });

    let minVal = Math.min(...allVals, 0);
    let maxVal = Math.max(...allVals, 0);
    
    minVal = Math.floor(minVal * 10) / 10 - 0.05;
    maxVal = Math.ceil(maxVal * 10) / 10 + 0.05;
    if(maxVal < 0) maxVal = 0;
    if(minVal > 0) minVal = 0;
    const range = maxVal - minVal || 1;

    let html = '';
    
    html += '<div class="d-flex mb-2" style="padding-left: 220px; position:relative; height: 15px;">';
    for(let i = Math.ceil(minVal*10); i <= Math.floor(maxVal*10); i+=1) {
        const val = i / 10;
        const leftPct = ((val - minVal) / range) * 100;
        html += `<span class="small text-muted" style="position:absolute; left:${leftPct}%; transform:translateX(-50%); font-size:0.65rem;">${(val*100).toFixed(0)}%</span>`;
    }
    html += '</div>';

    scenarioResults.forEach(sc => {
        html += `<div class="d-flex align-items-center mb-3">
            <div class="pe-3 text-truncate" style="width: 220px; font-size: 0.8rem; font-weight: 600; cursor:help; color: var(--text-main);" data-bs-toggle="tooltip" data-bs-title="${sc.desc}">${sc.name}</div>
            <div class="flex-grow-1 position-relative" style="height: 24px;">
                <div class="w-100 position-absolute top-50 start-0 translate-middle-y" style="height:4px; background: var(--border-light); border-radius:2px;"></div>`;
        
        if (sc.vL !== null && sc.vR !== null) {
            const minDot = Math.min(sc.vL, sc.vR);
            const maxDot = Math.max(sc.vL, sc.vR);
            const leftPct = ((minDot - minVal) / range) * 100;
            const widthPct = ((maxDot - minDot) / range) * 100;
            
            const diff = (sc.vR - sc.vL) * 100;
            const diffStr = diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
            const tooltipHtml = `<div class='text-start'><b>${escAttr(sc.name)}</b><br>${escAttr(portL.name)}: ${(sc.vL*100).toFixed(1)}%<br>${escAttr(portR.name)}: ${(sc.vR*100).toFixed(1)}%<hr class='my-1 border-secondary'>Gap: <b>${diffStr}</b></div>`;

            html += `<div class="dumbbell-line position-absolute top-50 translate-middle-y" style="left:${leftPct}%; width:${widthPct}%; height:6px; background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple)); opacity:0.6;" data-bs-toggle="tooltip" data-bs-html="true" data-bs-title="${escAttr(tooltipHtml)}"></div>`;
        }

        if (sc.vL !== null) {
            const leftPct = ((sc.vL - minVal) / range) * 100;
            html += `<div class="dumbbell-dot position-absolute top-50 translate-middle shadow-sm" style="left:${leftPct}%; width:14px; height:14px; background-color:var(--accent-blue); border: 2px solid #FFF; border-radius:50%; z-index:2;" data-bs-toggle="tooltip" data-bs-title="${escAttr(portL.name)}: ${(sc.vL*100).toFixed(1)}%"></div>`;
        }
        if (sc.vR !== null) {
            const leftPct = ((sc.vR - minVal) / range) * 100;
            html += `<div class="dumbbell-dot position-absolute top-50 translate-middle shadow-sm" style="left:${leftPct}%; width:14px; height:14px; background-color:var(--accent-purple); border: 2px solid #FFF; border-radius:50%; z-index:3;" data-bs-toggle="tooltip" data-bs-title="${escAttr(portR.name)}: ${(sc.vR*100).toFixed(1)}%"></div>`;
        }
        html += `</div></div>`;
    });

    html += `
        <div class="d-flex justify-content-center align-items-center gap-4 mt-3 pt-3 border-top" style="border-color: var(--border-light) !important;">
            ${portL ? `<div class="d-flex align-items-center small fw-bold text-muted"><span style="width:10px;height:10px;background:var(--accent-blue);border-radius:50%;margin-right:6px;"></span>${portL.name}</div>` : ''}
            ${portR ? `<div class="d-flex align-items-center small fw-bold text-muted"><span style="width:10px;height:10px;background:var(--accent-purple);border-radius:50%;margin-right:6px;"></span>${portR.name}</div>` : ''}
        </div>
    `;

    content.innerHTML = html;
    
    setTimeout(() => {
        const newTooltips = content.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...newTooltips].map(el => new bootstrap.Tooltip(el, {container:'body', html: true}));
    }, 50);
}

function getGlobalPortfolio(portId) {
    let found = state.portfolios.find(p => p.id === portId);
    if (found) return found;
    for (const group of PRESET_PORTFOLIOS) {
        found = group.portfolios.find(p => p.id === portId);
        if (found) return found;
    }
    return null;
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
                    tension: 0
                });
            }
        });
    } else {
        const rawPoints = scrapeStrategyUI(); 
        const portfoliosInUse = new Set();
        rawPoints.forEach(pt => Object.keys(pt.weights).forEach(k => { if(pt.weights[k]>0) portfoliosInUse.add(k); }));
        
        const genericColors = ['#3730A3', '#059669', '#D97706', '#6D28D9', '#0E7490'];
        Array.from(portfoliosInUse).forEach((portId, idx) => {
            const pName = getGlobalPortfolio(portId)?.name || portId;
            const data = rawPoints.map(pt => (pt.weights[portId] || 0) * 100);
            datasets.push({
                label: pName,
                data: data,
                backgroundColor: genericColors[idx % genericColors.length], 
                borderColor: 'transparent',
                pointRadius: 0,
                fill: true,
                tension: 0
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

function bindStrategyTableEvents() {
    const table = document.getElementById('strategy-table');
    table.querySelectorAll('input, select').forEach(el => {
        const newEl = el.cloneNode(true);
        el.parentNode.replaceChild(newEl, el);
        newEl.addEventListener('change', () => {
            if (newEl.classList.contains('strat-year-header')) {
               const colIdx = newEl.dataset.col;
               state.strategyYears[colIdx] = parseFloat(newEl.value) || 0;
            }
            setDirty('strat-dirty-indicator', true);
            renderStrategyChart(); 
            if(!state.autoRun) return;
            updateUIState('Updating...');
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(runSimulation, 600);
        });
    });
}

function appendStrategyRow(tbody, r) {
    const tr = document.createElement('tr');
    const selCell = document.createElement('td');
    selCell.className = "text-start ps-3 align-middle border-0";
    
    let selHTML = `<select class="form-select form-select-sm strat-port-select bg-transparent text-primary fw-bold border-0 shadow-none"><option value="none">-- Select Portfolio --</option>`;
    
    PRESET_PORTFOLIOS.forEach(group => {
        selHTML += `<optgroup label="${group.name}">`;
        group.portfolios.forEach(p => {
            selHTML += `<option value="${p.id}">${p.name}</option>`;
        });
        selHTML += `</optgroup>`;
    });
    
    const customs = state.portfolios.filter(p => p.id.startsWith('custom_'));
    if(customs.length > 0) {
        selHTML += `<optgroup label="My Portfolios">`;
        customs.forEach(p => { selHTML += `<option value="${p.id}">${p.name}</option>`; });
        selHTML += `</optgroup>`;
    }
    
    selCell.innerHTML = selHTML + `</select>`;
    tr.appendChild(selCell);

    state.strategyYears.forEach((y, i) => {
        const td = document.createElement('td');
        td.className = "align-middle border-0";
        td.innerHTML = `<input type="number" class="form-control form-control-sm text-center bg-transparent border-0 strat-weight-input" data-row="${r}" data-col="${i}" value="0" step="5">`;
        tr.appendChild(td);
    });

    const delTd = document.createElement('td');
    delTd.className = "align-middle border-0";
    const delBtn = document.createElement('button');
    delBtn.className = "btn btn-sm btn-link text-danger border-0 shadow-none p-0";
    delBtn.title = "Remove Portfolio";
    delBtn.innerHTML = '<i class="fas fa-times"></i>';
    delBtn.addEventListener('click', () => removeStrategyRow(r));
    delTd.appendChild(delBtn);
    tr.appendChild(delTd);

    tbody.appendChild(tr);
}

function renderStrategyTable(rowCount = 1) {
    const table = document.getElementById('strategy-table');
    if(!table) return;
    const thead = table.querySelector('thead'); 
    const tbody = table.querySelector('tbody');
    
    let headHTML = '<th style="width: 250px;" class="text-start ps-4">Building Blocks</th>';
    state.strategyYears.forEach((y, i) => {
        headHTML += `<th>
            <div class="input-group input-group-sm justify-content-center">
                <input type="number" class="form-control text-center fw-bold bg-transparent strat-year-header border-0 shadow-none" value="${y}" style="max-width:60px;" data-col="${i}">
                <span class="input-group-text border-0 bg-transparent px-1 text-muted">Yrs</span>
            </div>
        </th>`;
    });
    headHTML += `<th style="width: 40px;"></th>`; 
    thead.innerHTML = `<tr>${headHTML}</tr>`;

    tbody.innerHTML = '';
    for(let r=0; r<rowCount; r++) {
        appendStrategyRow(tbody, r);
    }
    bindStrategyTableEvents();
}

function addStrategyRow() {
    const tbody = document.querySelector('#strategy-table tbody');
    appendStrategyRow(tbody, tbody.children.length);
    bindStrategyTableEvents();
}

function removeStrategyRow(rowIdx) {
    const table = document.getElementById('strategy-table');
    const numRows = table.querySelectorAll('tbody tr').length;
    if (numRows <= 1) return; 

    const portSelections = [];
    for(let r=0; r<numRows; r++) portSelections.push(table.querySelectorAll('.strat-port-select')[r].value);

    const weightsMatrix = [];
    state.strategyYears.forEach((y, colIdx) => {
        const colWeights = [];
        for(let r=0; r<numRows; r++) {
            const wInp = table.querySelector(`input.strat-weight-input[data-row="${r}"][data-col="${colIdx}"]`);
            colWeights.push(wInp ? wInp.value : 0);
        }
        weightsMatrix.push({ year: y, colWeights });
    });

    portSelections.splice(rowIdx, 1);
    weightsMatrix.forEach(wm => wm.colWeights.splice(rowIdx, 1));

    renderStrategyTable(numRows - 1);

    const newTable = document.getElementById('strategy-table');
    for(let r=0; r<numRows - 1; r++) {
        newTable.querySelectorAll('.strat-port-select')[r].value = portSelections[r];
        weightsMatrix.forEach((wm, colIdx) => {
            const wInp = newTable.querySelector(`input.strat-weight-input[data-row="${r}"][data-col="${colIdx}"]`);
            if(wInp) wInp.value = wm.colWeights[r];
        });
    }
    renderStrategyChart();
    if(state.autoRun) runSimulation();
}

function addStrategyYearColumn() {
    const table = document.getElementById('strategy-table');
    const numRows = table.querySelectorAll('tbody tr').length;
    
    const portSelections = [];
    for(let r=0; r<numRows; r++) portSelections.push(table.querySelectorAll('.strat-port-select')[r].value);

    const weightsMatrix = [];
    state.strategyYears.forEach((y, colIdx) => {
        const colWeights = [];
        for(let r=0; r<numRows; r++) {
            const wInp = table.querySelector(`input.strat-weight-input[data-row="${r}"][data-col="${colIdx}"]`);
            colWeights.push(wInp ? wInp.value : 0);
        }
        weightsMatrix.push({ year: y, colWeights });
    });

    // Find the pair of adjacent columns with the smallest gap and insert their
    // midpoint — prevents the fixed "10 Yrs" hardcode and avoids duplicates.
    const sorted = [...state.strategyYears].sort((a, b) => b - a);
    let insertYear = Math.round(sorted[sorted.length - 1] / 2);
    let smallestGap = Infinity;
    for (let i = 0; i < sorted.length - 1; i++) {
        const gap = sorted[i] - sorted[i + 1];
        if (gap < smallestGap) {
            smallestGap = gap;
            insertYear = Math.round((sorted[i] + sorted[i + 1]) / 2);
        }
    }
    // Guarantee no duplicate
    while (state.strategyYears.includes(insertYear)) insertYear = Math.max(0, insertYear - 1);

    weightsMatrix.push({ year: insertYear, colWeights: Array(numRows).fill(0) });
    weightsMatrix.sort((a,b) => b.year - a.year);

    state.strategyYears = weightsMatrix.map(w => w.year);
    renderStrategyTable(numRows);

    const newTable = document.getElementById('strategy-table');
    for(let r=0; r<numRows; r++) {
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
    const numRows = table.querySelectorAll('tbody tr').length;
    const points = [];

    yearInputs.forEach((yInp, colIdx) => {
        const years = parseFloat(yInp.value) || 0;
        const weights = {};
        for(let r=0; r<numRows; r++) {
            const portSelect = table.querySelectorAll('.strat-port-select')[r];
            const weightInput = table.querySelector(`input.strat-weight-input[data-row="${r}"][data-col="${colIdx}"]`);
            if (portSelect && weightInput && portSelect.value !== 'none') {
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
        const resolvedAlphas = {};
        const resolvedTEs = {};
        
        ASSET_CLASSES.forEach(ac => {
            resolvedAssets[ac.key] = 0;
            resolvedAlphas[ac.key] = 0;
            resolvedTEs[ac.key] = 0;
        });
        
        Object.entries(pt.weights).forEach(([portId, blendWeight]) => {
            const port = getGlobalPortfolio(portId);
            if(port && blendWeight > 0) {
                ASSET_CLASSES.forEach(ac => {
                    resolvedAssets[ac.key] += (port.weights[ac.key] || 0) * blendWeight;
                    resolvedAlphas[ac.key] += (port.alphas && port.alphas[ac.key] ? port.alphas[ac.key] : 0) * blendWeight;
                    resolvedTEs[ac.key] += (port.tes && port.tes[ac.key] ? port.tes[ac.key] : 0) * blendWeight;
                });
            }
        });
        return { years: pt.years, weights: resolvedAssets, alphas: resolvedAlphas, tes: resolvedTEs };
    });
}

function getActiveCMA() {
    const sel = document.getElementById('run-cma-select');
    if (!sel || sel.value === 'custom') return scrapeCMATable();
    
    if (sel.value.startsWith('preset_')) {
        const idx = parseInt(sel.value.replace('preset_', ''));
        return PRESET_CMAS[idx].data;
    } else {
        const custom = UserDataEngine.load().cmas.find(c => c.id === sel.value);
        return custom ? custom.data : PRESET_CMAS[0].data;
    }
}

function getActivePersona() {
    if (state.activePersonaId) {
        const p = state.personas.find(x => x.id === state.activePersonaId);
        if (p) return p.data;
    }
    return state.personas[0].data;
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
            let preset;
            if(sel.value.startsWith('preset_')) {
                const parts = sel.value.split('_');
                preset = STRATEGY_GROUPS[parseInt(parts[1])]?.strategies[parseInt(parts[2])];
            } else {
                preset = UserDataEngine.load().strategies.find(s => s.id === sel.value);
            }
            if (!preset) return;
            
            name = preset.name; 
            
            resolvedPoints = preset.points.map(pt => {
                const resolvedAssets = {};
                const resolvedAlphas = {};
                const resolvedTEs = {};
                
                ASSET_CLASSES.forEach(ac => {
                    resolvedAssets[ac.key] = 0;
                    resolvedAlphas[ac.key] = 0;
                    resolvedTEs[ac.key] = 0;
                });
                
                Object.entries(pt.weights).forEach(([portId, weight]) => {
                    const port = getGlobalPortfolio(portId);
                    if(port) {
                        ASSET_CLASSES.forEach(ac => {
                            resolvedAssets[ac.key] += (port.weights[ac.key]||0) * weight;
                            resolvedAlphas[ac.key] += (port.alphas && port.alphas[ac.key] ? port.alphas[ac.key] : 0) * weight;
                            resolvedTEs[ac.key] += (port.tes && port.tes[ac.key] ? port.tes[ac.key] : 0) * weight;
                        });
                    }
                });
                return { years: pt.years, weights: resolvedAssets, alphas: resolvedAlphas, tes: resolvedTEs };
            });
        }
        strategies.push({ name, monthlyData: interpolateWeights(resolvedPoints, months), implAdjustments: {} });
    });
    return strategies;
}

function interpolateWeights(points, totalMonths) {
    if(!points || points.length === 0) return [];
    const monthlyData = [];
    for (let m = 0; m < totalMonths; m++) {
        const yearsRemaining = (totalMonths - m) / 12;
        
        let clampedYears = yearsRemaining;
        if (clampedYears > points[0].years) clampedYears = points[0].years;
        if (clampedYears < points[points.length - 1].years) clampedYears = points[points.length - 1].years;

        let p1 = points[0], p2 = points[points.length - 1];
        for (let i = 0; i < points.length - 1; i++) {
            if (clampedYears <= points[i].years && clampedYears >= points[i+1].years) {
                p1 = points[i]; p2 = points[i+1]; break;
            }
        }
        
        const ratio = (p1.years - p2.years) === 0 ? 0 : (clampedYears - p2.years) / (p1.years - p2.years);
        
        const w = {};
        const alphas = {};
        const tes = {};
        
        ASSET_CLASSES.forEach(ac => {
            let w1 = (p1.weights ? p1.weights[ac.key] : p1[ac.key]) || 0;
            let w2 = (p2.weights ? p2.weights[ac.key] : p2[ac.key]) || 0;
            w[ac.key] = w2 + (w1 - w2) * ratio;
            
            let a1 = (p1.alphas && p1.alphas[ac.key]) ? p1.alphas[ac.key] : 0;
            let a2 = (p2.alphas && p2.alphas[ac.key]) ? p2.alphas[ac.key] : 0;
            alphas[ac.key] = a2 + (a1 - a2) * ratio;
            
            let t1 = (p1.tes && p1.tes[ac.key]) ? p1.tes[ac.key] : 0;
            let t2 = (p2.tes && p2.tes[ac.key]) ? p2.tes[ac.key] : 0;
            tes[ac.key] = t2 + (t1 - t2) * ratio;
        });
        
        monthlyData.push({ weights: w, alphas: alphas, tes: tes });
    }
    return monthlyData;
}

function runSimulation() {
    updateUIState('Running...');
    try {
        const simInput = document.getElementById('setting-sim-count');
        const infInput = document.getElementById('setting-inflation');
        
        const simCount = simInput ? parseInt(simInput.value) : 10000;
        let inflation = 2.5;
        if(infInput && infInput.value !== "") inflation = parseFloat(infInput.value);

        const persona = getActivePersona();
        const cma = getActiveCMA();
        const months = Math.max(1, (persona.retirementAge - persona.age) * 12);
        const strategies = getActiveStrategies(months);

        if (strategies.length === 0) { updateUIState('Ready'); return; }

        const payload = { 
            cma, 
            assetKeys: ASSET_CLASSES.map(a => a.key), 
            assetCategories: ASSET_CLASSES.map(a => ({ key: a.key, category: a.category })),
            persona, 
            settings: { simCount, inflation }, 
            strategies 
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
    document.getElementById('confidence-label').innerText = `${val}%`;
    // RECALCULATE_STATS is handled by the coordinator as pure index reads
    // on the pre-sorted column cache — no simulation, no sort, instant response.
    if (state.worker) {
        state.worker.postMessage({ type: 'RECALCULATE_STATS', payload: { confidence: val / 100 } });
    }
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
    
    // Rounds output table values to a magnitude-appropriate step.
    // Chart hover tooltips intentionally bypass this and show raw figures.
    //
    // Rounding ladder:
    //   < £100k          → nearest £1,000
    //   £100k – £999k    → nearest £10,000
    //   £1m – £9.99m     → nearest £50,000
    //   £10m+            → nearest £100,000
    //
    // At 10,000 sims the p95 band has ~±£14k run-to-run variation,
    // so nearest £10k makes that noise invisible to the user.
    function formatTableValue(v) {
        const abs = Math.abs(v);
        let step;
        if      (abs <  100_000)   step =   1_000;
        else if (abs <  1_000_000) step =  10_000;
        else if (abs < 10_000_000) step =  50_000;
        else                       step = 100_000;
        const rounded = Math.round(v / step) * step;
        return '£' + rounded.toLocaleString();
    }

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
            if(index === 0) return '<span style="display:block; height: 16px;"></span>';
            const diff = ((val - base)/base)*100;
            return `<span class="small ${diff>=0?'text-success':'text-danger'} fw-bold" style="font-size:0.7rem; display:block; line-height:16px;">(${diff>=0?'+':''}${diff.toFixed(1)}%)</span>`;
        };

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="align-middle ps-3" style="font-weight:600; color: var(--text-main); border-bottom: 1px solid var(--border-light); font-size:0.85rem;">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${color.border}; margin-right:6px;"></span>
                ${res.name}
            </td>
            <td class="text-end align-middle text-muted border-bottom border-light px-2 px-md-3">
                <span style="font-size:0.85rem; display:block; line-height:1.2;">${formatTableValue(currLow)}</span>
                ${formatDiff(currLow, baseLow)}
            </td>
            <td class="text-end align-middle col-median border-bottom border-light px-2 px-md-3">
                <span class="median-val" style="font-size:0.85rem; display:block; line-height:1.2;">${formatTableValue(currMed)}</span>
                ${formatDiff(currMed, baseMed)}
            </td>
            <td class="text-end align-middle text-muted border-bottom border-light pe-3 pe-md-4 ps-2 ps-md-3">
                <span style="font-size:0.85rem; display:block; line-height:1.2;">${formatTableValue(currHigh)}</span>
                ${formatDiff(currHigh, baseHigh)}
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
