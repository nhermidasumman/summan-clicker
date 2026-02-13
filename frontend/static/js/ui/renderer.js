/* ==========================================================================
   Summan Data Clicker - UI Rendering & Interactions
   ========================================================================== */

const UI = (() => {
    // DOM element cache
    let els = {};
    let currentTab = 'buildings';
    let activePanel = null; // 'stats', 'settings', 'prestige', null

    /**
     * Initialize UI - cache elements, bind events.
     */
    function init(state) {
        cacheElements();
        bindEvents(state);
        updateBuyButtons(state.settings.buyAmount || 1);
    }

    function updateBuyButtons(amount) {
        if (!els.buyBtns) return;
        els.buyBtns.forEach(btn => {
            const btnAmount = parseInt(btn.dataset.amount);
            if (btnAmount === amount) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    function cacheElements() {
        els = {
            // Main display
            dataCounter: document.getElementById('data-counter'),
            dpsDisplay: document.getElementById('dps-display'),
            clickPowerDisplay: document.getElementById('click-power-display'),
            clickTarget: document.getElementById('click-target'),
            clickOrb: document.getElementById('click-orb'),
            particleContainer: document.getElementById('particle-container'),

            // Panels
            buildingsList: document.getElementById('buildings-list'),
            upgradesList: document.getElementById('upgrades-list'),
            achievementsList: document.getElementById('achievements-list'),

            // Tabs
            tabBuildings: document.getElementById('tab-buildings'),
            tabUpgrades: document.getElementById('tab-upgrades'),
            tabAchievements: document.getElementById('tab-achievements'),

            // Buy amounts
            buyBtns: document.querySelectorAll('.buy-amount-btn'),

            // Top bar
            btnStats: document.getElementById('btn-stats'),
            btnSettings: document.getElementById('btn-settings'),
            btnPrestige: document.getElementById('btn-prestige'),
            innovationDisplay: document.getElementById('innovation-display'),

            // Modal
            modal: document.getElementById('modal-overlay'),
            modalTitle: document.getElementById('modal-title'),
            modalBody: document.getElementById('modal-body'),
            modalClose: document.getElementById('modal-close'),

            // Toast
            toastContainer: document.getElementById('toast-container'),

            // Achievement popup
            achievementPopup: document.getElementById('achievement-popup'),

            // Active effects bar
            effectsBar: document.getElementById('effects-bar'),

            // Golden data
            goldenData: document.getElementById('golden-data'),

            // Bug report
            bugReport: document.getElementById('bug-report'),

            // Save indicator
            saveIndicator: document.getElementById('save-indicator'),
        };
    }

    function bindEvents() {
        // Click target
        els.clickTarget.addEventListener('click', (e) => {
            const rect = els.clickTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            window.__SUMMAN_GAME_API__.handleClick(x, y);
        });

        // Prevent context menu on click area
        els.clickTarget.addEventListener('contextmenu', (e) => e.preventDefault());

        // Tabs
        if (els.tabBuildings) els.tabBuildings.addEventListener('click', () => switchTab('buildings'));
        // Upgrades tab removed
        if (els.tabAchievements) els.tabAchievements.addEventListener('click', () => switchTab('achievements'));

        // Buy amount buttons
        els.buyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseInt(btn.dataset.amount);
                updateBuyButtons(amount);
                window.__SUMMAN_GAME_API__.setBuyAmount(amount);
            });
        });

        // Top bar buttons
        els.btnStats.addEventListener('click', () => showStatsModal());
        els.btnSettings.addEventListener('click', () => showSettingsModal());
        els.btnPrestige.addEventListener('click', () => showPrestigeModal());

        // Modal close
        els.modalClose.addEventListener('click', closeModal);
        els.modal.addEventListener('click', (e) => {
            if (e.target === els.modal) closeModal();
        });

        // Keyboard shortcuts
                // Building and upgrade click delegation
        if (els.buildingsList) {
            els.buildingsList.addEventListener('click', (e) => {
                const item = e.target.closest('.building-item[data-building][data-action="buy-building"]');
                if (!item) return;
                window.__SUMMAN_GAME_API__.buyBuilding(item.dataset.building);
            });
        }

        if (els.upgradesList) {
            els.upgradesList.addEventListener('click', (e) => {
                const tile = e.target.closest('.upgrade-tile[data-upgrade][data-action="buy-upgrade"]');
                if (!tile) return;
                window.__SUMMAN_GAME_API__.buyUpgrade(tile.dataset.upgrade);
            });
        }

        if (els.modalBody) {
            els.modalBody.addEventListener('click', (e) => {
                const actionEl = e.target.closest('[data-action]');
                if (!actionEl) return;
                const action = actionEl.dataset.action;
                if (action === 'set-language') {
                    window.__SUMMAN_GAME_API__.setLanguage(actionEl.dataset.lang);
                    showSettingsModal();
                } else if (action === 'export-save') {
                    handleExport();
                } else if (action === 'import-save') {
                    handleImport();
                } else if (action === 'reset-game') {
                    handleReset();
                } else if (action === 'perform-prestige') {
                    handlePrestige();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
            if (e.key === 's' && e.ctrlKey) { e.preventDefault(); window.__SUMMAN_GAME_API__.manualSave(); }
        });
    }

    // ==================== MODALS ====================

    function showModal(title, content) {
        if (!els.modalTitle) {
            cacheElements();
        }
        els.modalTitle.textContent = title;
        els.modalBody.innerHTML = content;
        els.modal.classList.add('active');
        activePanel = 'modal';
    }

    function closeModal() {
        els.modal.classList.remove('active');
        activePanel = null;
    }

    function showStatsModal() {
        const state = window.__SUMMAN_GAME_API__.getState();
        const stats = state.stats;
        const totalBuildings = Object.values(state.buildings).reduce((a, b) => a + b, 0);
        const achievementCount = state.achievements ? state.achievements.length : 0;
        const upgradesBought = state.upgrades ? state.upgrades.length : 0;
        const upgradesTotal = window.Upgrades.getAll().length;
        const clickVal = window.__SUMMAN_GAME_API__.calculateClickValue();
        const elapsedSec = (Date.now() - (state.gameStartTime || stats.startDate || Date.now())) / 1000;

        const html = `
            <div class="stats-grid">
                <div class="stats-section">
                    <h3 class="stats-section-title">💰 ${window.Lang.t('production')}</h3>
                    <div class="stat-row">
                        <span>📊 ${window.Lang.t('total_data')}</span>
                        <span>${window.Utils.formatNumber(stats.totalDataEarned)}</span>
                    </div>
                    <div class="stat-row">
                        <span>📈 ${window.Lang.t('data_per_second')}</span>
                        <span>${window.Utils.formatDps(state.dps)}/s</span>
                    </div>
                    <div class="stat-row">
                        <span>🖱️ ${window.Lang.t('data_per_click')}</span>
                        <span>${window.Utils.formatDps(clickVal)}</span>
                    </div>
                    <div class="stat-row">
                        <span>⚡ ${window.Lang.t('highest_dps')}</span>
                        <span>${window.Utils.formatDps(stats.highestDps || 0)}/s</span>
                    </div>
                </div>
                <div class="stats-section">
                    <h3 class="stats-section-title">🎮 ${window.Lang.getLanguage() === 'es' ? 'Actividad' : 'Activity'}</h3>
                    <div class="stat-row">
                        <span>👆 ${window.Lang.t('total_clicks')}</span>
                        <span>${window.Utils.formatNumber(stats.totalClicks)}</span>
                    </div>
                    <div class="stat-row">
                        <span>🏗️ ${window.Lang.t('total_buildings')}</span>
                        <span>${totalBuildings}</span>
                    </div>
                    <div class="stat-row">
                        <span>⏱️ ${window.Lang.t('play_time')}</span>
                        <span>${window.Utils.formatTime(elapsedSec)}</span>
                    </div>
                </div>
                <div class="stats-section">
                    <h3 class="stats-section-title">🏆 ${window.Lang.getLanguage() === 'es' ? 'Progreso' : 'Progress'}</h3>
                    <div class="stat-row">
                        <span>✨ ${window.Lang.getLanguage() === 'es' ? 'Mejoras compradas' : 'Upgrades purchased'}</span>
                        <span>${upgradesBought} / ${upgradesTotal}</span>
                    </div>
                    <div class="stat-row">
                        <span>🎯 ${window.Lang.t('achievements_unlocked')}</span>
                        <span>${achievementCount} / 28</span>
                    </div>
                    <div class="stat-row">
                        <span>🚀 ${window.Lang.t('times_prestiged')}</span>
                        <span>${stats.timesPrestiged || 0}</span>
                    </div>
                    <div class="stat-row">
                        <span>💡 ${window.Lang.t('innovation_earned')}</span>
                        <span>${state.totalInnovationEarned || 0}</span>
                    </div>
                    <div class="stat-row">
                        <span>✨ ${window.Lang.getLanguage() === 'es' ? 'Datos dorados recogidos' : 'Golden Data collected'}</span>
                        <span>${stats.events?.golden_clicked || 0}</span>
                    </div>
                    <div class="stat-row">
                        <span>🐛 ${window.Lang.getLanguage() === 'es' ? 'Bugs arreglados' : 'Bugs fixed'}</span>
                        <span>${stats.events?.bug_fixed || 0}</span>
                    </div>
                </div>
            </div>
        `;
        showModal(window.Lang.t('statistics'), html);
    }

    function showSettingsModal() {
        const html = `
            <div class="settings-group">
                <h3>${window.Lang.t('language')}</h3>
                <div class="language-switch">
                    <button data-action="set-language" data-lang="es" class="lang-btn ${window.Lang.getLanguage() === 'es' ? 'active' : ''}">🇪🇸 ES</button>
                    <button data-action="set-language" data-lang="en" class="lang-btn ${window.Lang.getLanguage() === 'en' ? 'active' : ''}">🇺🇸 EN</button>
                </div>
            </div>
            <div class="settings-group">
                <h3>${window.Lang.t('actions')}</h3>
                <div class="settings-buttons">
                    <button data-action="export-save" class="settings-btn">📤 ${window.Lang.t('export_save')}</button>
                    <button data-action="import-save" class="settings-btn">📥 ${window.Lang.t('import_save')}</button>
                    <button data-action="reset-game" class="settings-btn danger">🗑️ ${window.Lang.t('reset_game')}</button>
                </div>
            </div>
        `;
        showModal(window.Lang.t('settings'), html);
    }

    function showPrestigeModal() {
        const preview = window.__SUMMAN_GAME_API__.getInnovationPointsPreview();
        const html = `
            <div class="prestige-summary">
                <div class="prestige-info">
                    <p>${window.Lang.t('prestige_desc')}</p>
                    <div class="prestige-stat">
                        ${window.Lang.t('prestige_gain', preview)}
                    </div>
                </div>
                <button data-action="perform-prestige" class="prestige-btn ${preview > 0 ? 'available' : 'disabled'}" ${preview <= 0 ? 'disabled' : ''}>
                    🚀 ${window.Lang.t('prestige')}
                </button>
            </div>
        `;
        showModal(window.Lang.t('innovation'), html);
    }

    // ==================== TAB SWITCHING ====================

    function switchTab(tab) {
        currentTab = tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        document.getElementById(`tab-${tab}`).classList.add('active');
        document.getElementById(`panel-${tab}`).classList.add('active');
    }

    // ==================== RENDER ALL ====================

    function renderAll(state) {
        renderBuildings(state);
        renderUpgrades(state);
        renderAchievements(state);
        renderPrestigeButton(state);
        updateAllText();
    }

    /**
     * Called each frame to update dynamic displays.
     */
    function update(state, deltaSec) {
        // Update main counter
        els.dataCounter.textContent = window.Utils.formatNumber(state.dataPoints);

        // Update DPS
        els.dpsDisplay.textContent = `${window.Utils.formatDps(state.dps)} ${window.Lang.t('per_second')}`;

        // Update click power
        const clickVal = window.__SUMMAN_GAME_API__.calculateClickValue();
        els.clickPowerDisplay.textContent = `${window.Utils.formatDps(clickVal)} ${window.Lang.t('click_power')}`;

        // Update innovation display
        if (state.totalInnovationEarned > 0 || state.innovationPoints > 0) {
            els.innovationDisplay.style.display = 'flex';
            els.innovationDisplay.textContent = `🌟 ${state.innovationPoints}`;
        }

        // Update building affordability
        updateBuildingAffordability(state);

        // Update upgrade affordability
        updateUpgradeAffordability(state);

        // Update active effects
        renderActiveEffects(state);

        // Prestige button glow
        const previewPoints = window.__SUMMAN_GAME_API__.getInnovationPointsPreview();
        if (previewPoints > 0) {
            els.btnPrestige.classList.add('has-points');
            els.btnPrestige.title = `+${previewPoints} ${window.Lang.t('innovation_points')}`;
        } else {
            els.btnPrestige.classList.remove('has-points');
        }
    }

    // ==================== BUILDINGS ====================

    // Achievement Queue
    let achievementQueue = [];
    let isShowingAchievement = false;

    // ... (rest of cacheElements/bindEvents)

    // ... (rest of switchTab)

    // ==================== RENDERING UTILS ====================

    function getScrollParent(element) {
        if (!element) return null;
        return element.closest('.tab-content');
    }

    // ==================== BUILDINGS ====================

    function renderBuildings(state) {
        try {
            const parent = getScrollParent(els.buildingsList);
            const scrollTop = parent ? parent.scrollTop : 0;

            const visible = window.Buildings.getVisible(state.stats.totalDataEarned);
            let html = '';

            for (const def of visible) {
                const owned = state.buildings[def.id] || 0;
                let countToBuy = 1;
                let cost = 0;

                // Calculate cost based on buy amount
                const discount = window.__SUMMAN_GAME_API__.getBuildingDiscount ? window.__SUMMAN_GAME_API__.getBuildingDiscount() : 1;
                const currentPrice = def.baseCost * discount;
                const buyAmount = state.settings.buyAmount || 1; // Default to 1 if undefined

                if (buyAmount === -1) {
                    // MAX
                    const max = window.Utils.maxAffordable(currentPrice, owned, state.dataPoints, def.growthRate);
                    if (max.count === 0) {
                        // If can't afford any, show cost for 1
                        cost = window.Utils.calculateBuildingCost(currentPrice, owned, def.growthRate);
                        countToBuy = 1;
                    } else {
                        cost = max.totalCost;
                        countToBuy = max.count;
                    }
                } else {
                    // x1, x10, x100
                    countToBuy = buyAmount;
                    cost = window.Utils.calculateBulkCost(currentPrice, owned, countToBuy, def.growthRate);
                }

                const mult = state.buildingMultipliers?.[def.id] || 1;
                const dps = def.baseDps * mult;
                const totalDps = dps * owned;
                const canAfford = state.dataPoints >= cost;

                // Show (xN) if buying bulk
                const amountDisplay = (buyAmount !== 1) ? ` (x${countToBuy})` : '';

                html += `
                <div class="building-item ${canAfford ? 'affordable' : 'locked'}"
                     data-building="${def.id}"
                     data-action="buy-building"
                     style="--building-color: ${def.color}">
                    <div class="building-icon">${def.icon}</div>
                    <div class="building-info">
                        <div class="building-name">${window.Lang.t(def.nameKey)}</div>
                        <div class="building-desc">${window.Lang.t(def.descKey)}</div>
                        <div class="building-stats">
                            <span class="building-dps">
                                <span style="color: var(--text-muted); font-weight: normal;">${window.Lang.t('produce')}</span>
                                <span style="color: var(--green-light)">⚡ ${window.Utils.formatDps(dps)}/s</span>
                            </span>
                            <span class="building-total-dps">(${window.Utils.formatDps(totalDps)}/s total)</span>
                        </div>
                    </div>
                    <div class="building-right">
                        <div class="building-cost ${canAfford ? '' : 'too-expensive'}">
                            💠 ${window.Utils.formatNumber(cost)}${amountDisplay}
                        </div>
                        <div class="building-owned">${owned}</div>
                    </div>
                </div>
            `;
            }

            // Next building hint
            const allBuildings = window.Buildings.getAll();
            const nextLocked = allBuildings.find(b => state.stats.totalDataEarned < b.unlockAt);
            if (nextLocked) {
                html += `
                <div class="building-item building-locked">
                    <div class="building-icon">🔒</div>
                    <div class="building-info">
                        <div class="building-name">${window.Lang.t('locked')}</div>
                        <div class="building-desc">${window.Lang.t('total')}: ${window.Utils.formatNumber(nextLocked.unlockAt)} Data Points</div>
                    </div>
                </div>
            `;
            }
            els.buildingsList.innerHTML = html;
            if (parent) parent.scrollTop = scrollTop;
        } catch (e) {
            console.error("Error rendering buildings:", e);
        }
    }

    function updateBuildingAffordability(state) {
        if (!els.buildingsList) return;
        const items = els.buildingsList.querySelectorAll('.building-item');
        items.forEach(item => {
            const id = item.dataset.building;
            if (!id) return;

            const def = window.Buildings.getById(id);
            if (!def) return;

            const owned = state.buildings[id] || 0;

            // Re-calculate cost using properly synchronized logic
            const discount = window.__SUMMAN_GAME_API__.getBuildingDiscount ? window.__SUMMAN_GAME_API__.getBuildingDiscount() : 1;
            const currentPrice = def.baseCost * discount;
            const buyAmount = state.settings.buyAmount || 1;

            let cost = 0;

            if (buyAmount === -1) {
                const max = window.Utils.maxAffordable(currentPrice, owned, state.dataPoints, def.growthRate);
                if (max.count === 0) {
                    cost = window.Utils.calculateBuildingCost(currentPrice, owned, def.growthRate);
                } else {
                    cost = max.totalCost;
                }
            } else {
                cost = window.Utils.calculateBulkCost(currentPrice, owned, buyAmount, def.growthRate);
            }

            const canAfford = state.dataPoints >= cost;
            item.classList.toggle('affordable', canAfford);
            item.classList.toggle('locked', !canAfford);

            const costEl = item.querySelector('.building-cost');
            if (costEl) {
                // Do NOT overwrite textContent here, as it destroys the (x10) formatting 
                // and might use incorrect single-unit calculation if not careful.
                // renderBuildings handles the text.
                costEl.classList.toggle('too-expensive', !canAfford);
            }
        });
    }

    // ==================== UPGRADES ====================

    function renderUpgrades(state) {
        // Sort by cost ascending
        const available = window.Upgrades.getAvailable(state).sort((a, b) => a.cost - b.cost);

        // Target container instead of just bar to hide title too
        const container = document.getElementById('upgrades-container');
        // Fallback for old HTML structure if not updated yet (though we just updated it)
        const bar = document.getElementById('upgrades-bar') || container;

        // Use container if exists, otherwise bar
        const targetEl = container || bar;

        if (available.length === 0) {
            targetEl.style.display = 'none';
            els.upgradesList.innerHTML = '';
            return;
        }

        targetEl.style.display = 'block';

        let html = '';
        for (const up of available) {
            const canAfford = state.dataPoints >= up.cost;
            // Escape for safe HTML attribute insertion
            const rawTooltip = `${window.Upgrades.getName(up)}: ${window.Upgrades.getDesc(up)} — 💠 ${window.Utils.formatNumber(up.cost)}`;
            const safeTooltip = rawTooltip.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

            html += `
                <div class="upgrade-tile ${canAfford ? 'affordable' : 'locked'}"
                     data-upgrade="${up.id}"
                     data-action="buy-upgrade"
                     data-tooltip="${safeTooltip}">
                    <div class="upgrade-tile-icon">${up.icon}</div>
                    <div class="upgrade-tile-cost">${window.Utils.formatNumber(up.cost)}</div>
                </div>
            `;
        }

        els.upgradesList.innerHTML = html;
        bindUpgradeTooltips();
    }

    // ---- JS Tooltip System (escapes overflow containers) ----
    let tooltipEl = null;
    let tooltipTimeout = null;

    function getOrCreateTooltip() {
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.className = 'upgrade-tooltip';
            document.body.appendChild(tooltipEl);
        }
        return tooltipEl;
    }

    function showTooltipFor(tile) {
        const text = tile.getAttribute('data-tooltip');
        if (!text) return;

        const tip = getOrCreateTooltip();
        tip.textContent = text;
        tip.classList.add('visible');

        // Position above the tile
        const rect = tile.getBoundingClientRect();
        const tipRect = tip.getBoundingClientRect();
        let left = rect.left + rect.width / 2 - tipRect.width / 2;
        let top = rect.top - tipRect.height - 8;

        // Clamp to viewport
        if (left < 4) left = 4;
        if (left + tipRect.width > window.innerWidth - 4) left = window.innerWidth - tipRect.width - 4;
        if (top < 4) top = rect.bottom + 8; // Flip below if no room above

        tip.style.left = left + 'px';
        tip.style.top = top + 'px';
    }

    function hideTooltip() {
        clearTimeout(tooltipTimeout);
        if (tooltipEl) tooltipEl.classList.remove('visible');
    }

    let _overHandler = null;
    let _outHandler = null;

    function bindUpgradeTooltips() {
        const list = els.upgradesList;
        if (!list) return;

        // Remove old listeners before adding new ones
        if (_overHandler) list.removeEventListener('mouseover', _overHandler);
        if (_outHandler) list.removeEventListener('mouseout', _outHandler);

        _overHandler = (e) => {
            const tile = e.target.closest('.upgrade-tile');
            if (!tile) return;
            clearTimeout(tooltipTimeout);
            tooltipTimeout = setTimeout(() => showTooltipFor(tile), 100);
        };

        _outHandler = (e) => {
            const tile = e.target.closest('.upgrade-tile');
            if (!tile) return;
            const related = e.relatedTarget;
            if (related && tile.contains(related)) return;
            hideTooltip();
        };

        list.addEventListener('mouseover', _overHandler);
        list.addEventListener('mouseout', _outHandler);
    }

    function updateUpgradeAffordability(state) {
        const list = document.getElementById('upgrades-list');
        if (!list) return;

        const items = list.querySelectorAll('.upgrade-tile');
        for (const item of items) {
            const id = item.dataset.upgrade;
            const upgrade = window.Upgrades.getById(id);
            if (!upgrade) continue;

            const canAfford = state.dataPoints >= upgrade.cost;
            if (canAfford) {
                item.classList.add('affordable');
                item.classList.remove('locked');
            } else {
                item.classList.remove('affordable');
                item.classList.add('locked');
            }
        }
    }

    function renderAchievements(state) {
        if (!els.achievementsList) return;

        // Sort: Unlocked first, then by threshold
        const all = window.Achievements.getAll().slice().sort((a, b) => {
            const aUnlocked = state.achievements.includes(a.id);
            const bUnlocked = state.achievements.includes(b.id);
            if (aUnlocked && !bUnlocked) return -1;
            if (!aUnlocked && bUnlocked) return 1;
            return a.threshold - b.threshold; // Proxy for difficulty
        });

        const html = all.map(ach => {
            const unlocked = state.achievements.includes(ach.id);
            const classes = `achievement-item ${unlocked ? 'unlocked' : 'locked'}`;
            return `
                <div class="${classes}">
                    <div class="ach-icon">${ach.icon}</div>
                    <div class="ach-info">
                        <div class="ach-name">${window.Achievements.getName(ach)}</div>
                        <div class="ach-desc">${window.Achievements.getDesc(ach)}</div>
                    </div>
                    ${unlocked ? '<div class="ach-check">✓</div>' : ''}
                </div>
            `;
        }).join('');

        els.achievementsList.innerHTML = html;

        // Update stats header
        const unlockedCount = state.achievements.length;
        const totalCount = all.length;
        const multiplier = window.Achievements.getTotalBonus(state.achievements);
        const multText = `x${Math.floor(multiplier)}`;

        // Insert stats if not exists
        let statsDiv = document.getElementById('ach-stats');
        if (!statsDiv && els.tabAchievements) {
            // els.tabAchievements matches the tab button, not content. 
            // We usually put this in the panel header if possible, or prepended to list
        }
    }

    function renderActiveEffects(state) {
        const container = document.getElementById('effects-bar');
        if (!container) return;

        if (state.activeEffects.length === 0) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }

        container.style.display = 'flex';
        container.innerHTML = state.activeEffects.map(effect => {
            const remaining = Math.max(0, Math.ceil((effect.endTime - Date.now()) / 1000));
            // Find icon based on type
            let icon = '⚡';
            if (effect.type === 'coffee_mult') icon = '☕';
            if (effect.type === 'golden_mult') icon = '✨';

            return `
                <div class="effect-badge">
                    <span class="effect-icon">${icon}</span>
                    <span class="effect-timer">${remaining}s</span>
                </div>
            `;
        }).join('');
    }

    function renderPrestigeButton(state) {
        // Show prestige button if user has enough lifetime earnings (~1b) or has prestiged before
        const canSee = state.stats.totalDataAllTime > 1e8 || state.stats.timesPrestiged > 0;

        if (els.btnPrestige) {
            els.btnPrestige.style.display = canSee ? 'flex' : 'none';
        }
    }

    // ==================== SPECIAL UI ELEMENTS ====================

    function showAchievement(ach) {
        achievementQueue.push(ach);
        processAchievementQueue();

        // Also update achievements list if visible
        renderAchievements(window.__SUMMAN_GAME_API__.getState());
    }

    function processAchievementQueue() {
        if (isShowingAchievement || achievementQueue.length === 0) return;

        const ach = achievementQueue.shift();
        isShowingAchievement = true;
        const popup = els.achievementPopup;

        popup.innerHTML = `
            <div class="ach-popup-icon">${ach.icon}</div>
            <div class="ach-popup-info">
                <div class="ach-popup-title">${window.Lang.getLanguage() === 'en' ? 'Achievement!' : '¡Logro!'}</div>
                <div class="ach-popup-name">${window.Achievements.getName(ach)}</div>
            </div>
        `;
        popup.classList.add('visible');

        setTimeout(() => {
            popup.classList.remove('visible');
            setTimeout(() => {
                isShowingAchievement = false;
                processAchievementQueue();
            }, 400); // Wait for fade out transition
        }, 4000);
    }

    function showGoldenData(onClick) {
        const el = els.goldenData;
        // Random position within game area
        const container = els.clickTarget.parentElement;
        const rect = container.getBoundingClientRect();
        const x = window.Utils.randomRange(20, rect.width - 60);
        const y = window.Utils.randomRange(20, rect.height - 60);

        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.classList.add('visible');
        el.innerHTML = '<div class="golden-data-orb"></div>';

        const handleClick = (e) => {
            e.stopPropagation();
            el.classList.remove('visible');
            el.removeEventListener('click', handleClick);
            onClick();
        };

        el.addEventListener('click', handleClick);

        // Disappear after 10 seconds
        setTimeout(() => {
            el.classList.remove('visible');
            el.removeEventListener('click', handleClick);
        }, 10000);
    }

    function showBugReport(onFix) {
        const el = els.bugReport;
        el.classList.add('visible');
        el.innerHTML = `<span>🐛</span><span>${window.Lang.t('event_bug_report_desc')}</span>`;

        const handleClick = () => {
            el.classList.remove('visible');
            el.removeEventListener('click', handleClick);
            onFix();
        };

        el.addEventListener('click', handleClick);

        // Auto-dismiss after 15 seconds
        setTimeout(() => {
            el.classList.remove('visible');
            el.removeEventListener('click', handleClick);
        }, 15000);
    }

    function showOfflineModal(dataEarned, secondsAway) {
        const html = `
            <div class="offline-progress">
                <div class="offline-icon">🌙</div>
                <p>${window.Lang.t('offline_earned')}</p>
                <div class="offline-amount">+${window.Utils.formatNumber(dataEarned)} Data Points</div>
                <p class="offline-time">(${window.Utils.formatTime(secondsAway)})</p>
            </div>
        `;
        showModal(window.Lang.t('offline_progress'), html);
    }

    function showPrestigeAnimation() {
        const overlay = document.createElement('div');
        overlay.className = 'prestige-flash';
        document.body.appendChild(overlay);
        setTimeout(() => overlay.remove(), 1500);
    }

    function animateClick() {
        if (!els.clickOrb) return;

        els.clickOrb.classList.add('clicked');
        setTimeout(() => els.clickOrb.classList.remove('clicked'), 150);

        // Click ripple ring
        if (els.clickTarget) {
            const ring = document.createElement('div');
            ring.className = 'click-ring';

            // Center in the click target area
            // Since we want it centered on the Orb, and the Orb is centered in Target
            // We can just append and verify CSS centers it
            // CSS: .click-ring { transform: translate(-50%, -50%); top: 50%; left: 50%; }
            // Wait, CSS says: transform: translate(-50%, -50%); 
            // but position is absolute. We need to set top/left.
            const rect = els.clickOrb.getBoundingClientRect();
            const parentRect = els.clickTarget.getBoundingClientRect();

            const x = (rect.left - parentRect.left) + rect.width / 2;
            const y = (rect.top - parentRect.top) + rect.height / 2;

            ring.style.left = x + 'px';
            ring.style.top = y + 'px';

            els.clickTarget.appendChild(ring);
            ring.addEventListener('animationend', () => ring.remove());
        }
    }

    function createParticle(x, y, text, color) {
        window.Utils.createParticle(x, y, text, color);
    }

    function showToast(msg, type, duration) {
        window.Utils.showToast(msg, type, duration);
    }

    function showSaveIndicator() {
        // Simple toast for save
        const msg = window.Lang.getLanguage() === 'es' ? '💾 Juego guardado' : '💾 Game saved';
        window.Utils.showToast(msg, 'success', 2000);
    }

    function updateAllText() {
        // Update static text elements
        const title = document.getElementById('game-title');
        if (title) title.textContent = window.Lang.t('game_title');

        const subtitle = document.getElementById('game-subtitle');
        if (subtitle) subtitle.textContent = window.Lang.t('game_subtitle');

        // Tab labels
        // if (els.tabBuildings) els.tabBuildings.textContent = window.Lang.t('buildings'); // Tabs removed or changed?
        // Buildings tab might still exist. Upgrades tab was replaced by bar.
        // Let's just update what we see
        const bTab = document.getElementById('tab-buildings');
        if (bTab) bTab.textContent = '🏭 ' + window.Lang.t('buildings');

        const aTab = document.getElementById('tab-achievements');
        if (aTab) aTab.textContent = '🏆 ' + window.Lang.t('achievements');
    }

    return {
        init,
        renderAll,
        update,
        renderBuildings,
        renderUpgrades,
        renderAchievements,
        renderPrestige: renderPrestigeButton,
        showModal,
        closeModal,
        showToast,
        showSettingsModal,
        createParticle,
        animateClick,
        showSaveIndicator,
        showAchievement,
        showGoldenData,
        showBugReport,
        showOfflineModal,
        showPrestigeAnimation,
        updateAllText,
    };
})();

// Global handlers for modal buttons
function handlePrestige() {
    if (confirm(window.Lang.t('confirm_prestige'))) {
        window.__SUMMAN_GAME_API__.performPrestige();
        UI.closeModal();
    }
}

function handleReset() {
    if (confirm(window.Lang.t('confirm_reset'))) {
        window.__SUMMAN_GAME_API__.resetGame();
        UI.closeModal();
    }
}

function handleExport() {
    const save = window.__SUMMAN_GAME_API__.exportSave();
    if (save && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(save).then(() => {
            window.Utils.showToast('📋 ' + (window.Lang.getLanguage() === 'en' ? 'Save copied to clipboard!' : '¡Guardado copiado al portapapeles!'), 'info', 3000);
        }).catch(() => {
            prompt(window.Lang.getLanguage() === 'en' ? 'Copy your save data:' : 'Copia tus datos de guardado:', save);
        });
    } else {
        prompt(window.Lang.getLanguage() === 'en' ? 'Copy your save data:' : 'Copia tus datos de guardado:', save);
    }
}

function handleImport() {
    const data = prompt(window.Lang.getLanguage() === 'en' ? 'Paste save data:' : 'Pega los datos de guardado:');
    if (data) {
        window.__SUMMAN_GAME_API__.importSave(data);
        UI.closeModal();
    }
}




window.UI = UI;

export const init = UI.init;
export const renderAll = UI.renderAll;
export const update = UI.update;
export const renderBuildings = UI.renderBuildings;
export const renderUpgrades = UI.renderUpgrades;
export const renderAchievements = UI.renderAchievements;
export const renderPrestige = UI.renderPrestige;
export const showModal = UI.showModal;
export const closeModal = UI.closeModal;
export const showToast = UI.showToast;
export const showSettingsModal = UI.showSettingsModal;
export const createParticle = UI.createParticle;
export const animateClick = UI.animateClick;
export const showSaveIndicator = UI.showSaveIndicator;
export const showAchievement = UI.showAchievement;
export const showGoldenData = UI.showGoldenData;
export const showBugReport = UI.showBugReport;
export const showOfflineModal = UI.showOfflineModal;
export const showPrestigeAnimation = UI.showPrestigeAnimation;
export const updateAllText = UI.updateAllText;
export default UI;



