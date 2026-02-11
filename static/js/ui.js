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
            Game.handleClick(x, y);
        });

        // Prevent context menu on click area
        els.clickTarget.addEventListener('contextmenu', (e) => e.preventDefault());

        // Tabs
        els.tabBuildings.addEventListener('click', () => switchTab('buildings'));
        els.tabUpgrades.addEventListener('click', () => switchTab('upgrades'));
        els.tabAchievements.addEventListener('click', () => switchTab('achievements'));

        // Buy amount buttons
        els.buyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseInt(btn.dataset.amount);
                els.buyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                Game.setBuyAmount(amount);
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
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
            if (e.key === 's' && e.ctrlKey) { e.preventDefault(); Game.manualSave(); }
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
        const state = Game.getState();
        const stats = state.stats;
        const totalBuildings = Object.values(state.buildings).reduce((a, b) => a + b, 0);
        const achievementCount = state.achievements ? state.achievements.length : 0;
        const clickVal = Game.calculateClickValue();
        const elapsedSec = (Date.now() - (state.gameStartTime || stats.startDate || Date.now())) / 1000;

        const html = `
            <div class="stats-grid">
                <div class="stats-section">
                    <h3 class="stats-section-title">💰 ${Lang.t('production')}</h3>
                    <div class="stat-row">
                        <span>📊 ${Lang.t('total_data')}</span>
                        <span>${Utils.formatNumber(stats.totalDataEarned)}</span>
                    </div>
                    <div class="stat-row">
                        <span>📈 ${Lang.t('data_per_second')}</span>
                        <span>${Utils.formatDps(state.dps)}/s</span>
                    </div>
                    <div class="stat-row">
                        <span>🖱️ ${Lang.t('data_per_click')}</span>
                        <span>${Utils.formatDps(clickVal)}</span>
                    </div>
                    <div class="stat-row">
                        <span>⚡ ${Lang.t('highest_dps')}</span>
                        <span>${Utils.formatDps(stats.highestDps || 0)}/s</span>
                    </div>
                </div>
                <div class="stats-section">
                    <h3 class="stats-section-title">🎮 ${Lang.getLanguage() === 'es' ? 'Actividad' : 'Activity'}</h3>
                    <div class="stat-row">
                        <span>👆 ${Lang.t('total_clicks')}</span>
                        <span>${Utils.formatNumber(stats.totalClicks)}</span>
                    </div>
                    <div class="stat-row">
                        <span>🏗️ ${Lang.t('total_buildings')}</span>
                        <span>${totalBuildings}</span>
                    </div>
                    <div class="stat-row">
                        <span>⏱️ ${Lang.t('play_time')}</span>
                        <span>${Utils.formatTime(elapsedSec)}</span>
                    </div>
                </div>
                <div class="stats-section">
                    <h3 class="stats-section-title">🏆 ${Lang.getLanguage() === 'es' ? 'Progreso' : 'Progress'}</h3>
                    <div class="stat-row">
                        <span>🎯 ${Lang.t('achievements_unlocked')}</span>
                        <span>${achievementCount} / 28</span>
                    </div>
                    <div class="stat-row">
                        <span>🚀 ${Lang.t('times_prestiged')}</span>
                        <span>${stats.timesPrestiged || 0}</span>
                    </div>
                    <div class="stat-row">
                        <span>💡 ${Lang.t('innovation_earned')}</span>
                        <span>${state.totalInnovationEarned || 0}</span>
                    </div>
                    <div class="stat-row">
                        <span>✨ ${Lang.getLanguage() === 'es' ? 'Datos dorados recogidos' : 'Golden Data collected'}</span>
                        <span>${stats.events?.golden_clicked || 0}</span>
                    </div>
                    <div class="stat-row">
                        <span>🐛 ${Lang.getLanguage() === 'es' ? 'Bugs arreglados' : 'Bugs fixed'}</span>
                        <span>${stats.events?.bug_fixed || 0}</span>
                    </div>
                </div>
            </div>
        `;
        showModal(Lang.t('statistics'), html);
    }

    function showSettingsModal() {
        const html = `
            <div class="settings-group">
                <h3>${Lang.t('language')}</h3>
                <div class="language-switch">
                    <button onclick="Game.setLanguage('es')" class="lang-btn ${Lang.getLanguage() === 'es' ? 'active' : ''}">🇪🇸 ES</button>
                    <button onclick="Game.setLanguage('en')" class="lang-btn ${Lang.getLanguage() === 'en' ? 'active' : ''}">🇺🇸 EN</button>
                </div>
            </div>
            <div class="settings-group">
                <h3>${Lang.t('actions')}</h3>
                <div class="settings-buttons">
                    <button onclick="handleExport()" class="settings-btn">📤 ${Lang.t('export_save')}</button>
                    <button onclick="handleImport()" class="settings-btn">📥 ${Lang.t('import_save')}</button>
                    <button onclick="handleReset()" class="settings-btn danger">🗑️ ${Lang.t('reset_game')}</button>
                </div>
            </div>
        `;
        showModal(Lang.t('settings'), html);
    }

    function showPrestigeModal() {
        const preview = Game.getInnovationPointsPreview();
        const html = `
            <div class="prestige-summary">
                <div class="prestige-info">
                    <p>${Lang.t('prestige_desc')}</p>
                    <div class="prestige-stat">
                        ${Lang.t('innovation_gain')}: <strong>🌟 ${preview}</strong>
                    </div>
                </div>
                <button onclick="handlePrestige()" class="prestige-btn ${preview > 0 ? 'available' : 'disabled'}" ${preview <= 0 ? 'disabled' : ''}>
                    🚀 ${Lang.t('innovate_now')}
                </button>
            </div>
        `;
        showModal(Lang.t('innovation'), html);
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
        els.dataCounter.textContent = Utils.formatNumber(state.dataPoints);

        // Update DPS
        els.dpsDisplay.textContent = `${Utils.formatDps(state.dps)} ${Lang.t('per_second')}`;

        // Update click power
        const clickVal = Game.calculateClickValue();
        els.clickPowerDisplay.textContent = `${Utils.formatDps(clickVal)} ${Lang.t('click_power')}`;

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
        const previewPoints = Game.getInnovationPointsPreview();
        if (previewPoints > 0) {
            els.btnPrestige.classList.add('has-points');
            els.btnPrestige.title = `+${previewPoints} ${Lang.t('innovation_points')}`;
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
        const parent = getScrollParent(els.buildingsList);
        const scrollTop = parent ? parent.scrollTop : 0;

        const visible = Buildings.getVisible(state.stats.totalDataEarned);
        let html = '';

        for (const def of visible) {
            const owned = state.buildings[def.id] || 0;
            const cost = Buildings.getCost(def.id, owned);
            const mult = state.buildingMultipliers?.[def.id] || 1;
            const dps = def.baseDps * mult;
            const totalDps = dps * owned;
            const canAfford = state.dataPoints >= cost;

            html += `
                <div class="building-item ${canAfford ? 'affordable' : 'locked'}"
                     data-building="${def.id}"
                     onclick="Game.buyBuilding('${def.id}')"
                     style="--building-color: ${def.color}">
                    <div class="building-icon">${def.icon}</div>
                    <div class="building-info">
                        <div class="building-name">${Lang.t(def.nameKey)}</div>
                        <div class="building-desc">${Lang.t(def.descKey)}</div>
                        <div class="building-stats">
                            <span class="building-dps">⚡ ${Utils.formatDps(dps)}/s each</span>
                            <span class="building-total-dps">(${Utils.formatDps(totalDps)}/s total)</span>
                        </div>
                    </div>
                    <div class="building-right">
                        <div class="building-cost ${canAfford ? '' : 'too-expensive'}">
                            💠 ${Utils.formatNumber(cost)}
                        </div>
                        <div class="building-owned">${owned}</div>
                    </div>
                </div>
            `;
        }

        // Next building hint
        const allBuildings = Buildings.getAll();
        const nextLocked = allBuildings.find(b => state.stats.totalDataEarned < b.unlockAt);
        if (nextLocked) {
            html += `
                <div class="building-item building-locked">
                    <div class="building-icon">🔒</div>
                    <div class="building-info">
                        <div class="building-name">${Lang.t('locked')}</div>
                        <div class="building-desc">${Lang.t('total')}: ${Utils.formatNumber(nextLocked.unlockAt)} Data Points</div>
                    </div>
                </div>
            `;
        }

        els.buildingsList.innerHTML = html;
        if (parent) parent.scrollTop = scrollTop;
    }

    function updateBuildingAffordability(state) {
        // ... (existing implementation)
        const items = els.buildingsList.querySelectorAll('.building-item[data-building]');
        items.forEach(item => {
            const id = item.dataset.building;
            const owned = state.buildings[id] || 0;
            const cost = Buildings.getCost(id, owned);
            const canAfford = state.dataPoints >= cost;
            item.classList.toggle('affordable', canAfford);
            item.classList.toggle('locked', !canAfford);

            const costEl = item.querySelector('.building-cost');
            if (costEl) {
                costEl.textContent = `💠 ${Utils.formatNumber(cost)}`;
                costEl.classList.toggle('too-expensive', !canAfford);
            }
        });
    }

    // ==================== UPGRADES ====================

    function renderUpgrades(state) {
        const available = Upgrades.getAvailable(state);
        const bar = document.getElementById('upgrades-bar');
        let html = '';

        if (available.length === 0) {
            bar.style.display = 'none';
            els.upgradesList.innerHTML = '';
            return;
        }

        bar.style.display = 'block';

        for (const up of available) {
            const canAfford = state.dataPoints >= up.cost;
            html += `
                <div class="upgrade-tile ${canAfford ? 'affordable' : 'locked'}"
                     data-upgrade="${up.id}"
                     onclick="Game.buyUpgrade('${up.id}')"
                     title="${Upgrades.getName(up)}: ${Upgrades.getDesc(up)}&#10;💠 ${Utils.formatNumber(up.cost)}">
                    <div class="upgrade-tile-icon">${up.icon}</div>
                    <div class="upgrade-tile-cost">${Utils.formatNumber(up.cost)}</div>
                </div>
            `;
        }

        els.upgradesList.innerHTML = html;
    }

    function updateUpgradeAffordability(state) {
        const list = document.getElementById('upgrades-list');
        if (!list) return;

        const items = list.querySelectorAll('.upgrade-tile');
        for (const item of items) {
            const id = item.dataset.upgrade;
            const upgrade = Upgrades.getById(id);
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
        const all = Achievements.getAll().slice().sort((a, b) => {
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
                        <div class="ach-name">${Achievements.getName(ach)}</div>
                        <div class="ach-desc">${Achievements.getDesc(ach)}</div>
                    </div>
                    ${unlocked ? '<div class="ach-check">✓</div>' : ''}
                </div>
            `;
        }).join('');

        els.achievementsList.innerHTML = html;

        // Update stats header
        const unlockedCount = state.achievements.length;
        const totalCount = all.length;
        const multiplier = Achievements.getTotalBonus(state.achievements);
        const multText = `x${Math.floor(multiplier)}`;

        // Insert stats if not exists
        let statsDiv = document.getElementById('ach-stats');
        if (!statsDiv && els.tabAchievements) {
            // els.tabAchievements matches the tab button, not content. 
            // We usually put this in the panel header if possible, or prepended to list
        }
    }

    function renderActiveEffects(state) {
        const container = document.getElementById('active-effects');
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

    function animateClick() {
        els.clickOrb.classList.add('clicked');
        setTimeout(() => els.clickOrb.classList.remove('clicked'), 150);

        // Create click ripple ring
        const ring = document.createElement('div');
        ring.className = 'click-ring';
        const target = document.getElementById('click-target');
        const orbRect = els.clickOrb.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        ring.style.left = (orbRect.left - targetRect.left + orbRect.width / 2) + 'px';
        ring.style.top = (orbRect.top - targetRect.top + orbRect.height / 2) + 'px';
        target.appendChild(ring);
        ring.addEventListener('animationend', () => ring.remove());
    }

    function showSaveIndicator() {
        els.saveIndicator.classList.add('visible');
        setTimeout(() => els.saveIndicator.classList.remove('visible'), 2000);
    }

    function showAchievement(ach) {
        achievementQueue.push(ach);
        processAchievementQueue();

        // Also update achievements list if visible
        renderAchievements(Game.getState());
    }

    function processAchievementQueue() {
        if (isShowingAchievement || achievementQueue.length === 0) return;

        const ach = achievementQueue.shift();
        isShowingAchievement = true;
        const popup = els.achievementPopup;

        popup.innerHTML = `
            <div class="ach-popup-icon">${ach.icon}</div>
            <div class="ach-popup-info">
                <div class="ach-popup-title">${Lang.getLanguage() === 'en' ? 'Achievement!' : '¡Logro!'}</div>
                <div class="ach-popup-name">${Achievements.getName(ach)}</div>
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
        const x = Utils.randomRange(20, rect.width - 60);
        const y = Utils.randomRange(20, rect.height - 60);

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
        el.innerHTML = `<span>🐛</span><span>${Lang.t('event_bug_report_desc')}</span>`;

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
                <p>${Lang.t('offline_earned')}</p>
                <div class="offline-amount">+${Utils.formatNumber(dataEarned)} Data Points</div>
                <p class="offline-time">(${Utils.formatTime(secondsAway)})</p>
            </div>
        `;
        showModal(Lang.t('offline_progress'), html);
    }

    function showPrestigeAnimation() {
        const overlay = document.createElement('div');
        overlay.className = 'prestige-flash';
        document.body.appendChild(overlay);
        setTimeout(() => overlay.remove(), 1500);
    }

    function updateAllText() {
        // Update static text elements
        const title = document.getElementById('game-title');
        if (title) title.textContent = Lang.t('game_title');

        const subtitle = document.getElementById('game-subtitle');
        if (subtitle) subtitle.textContent = Lang.t('game_subtitle');

        // Tab labels
        if (els.tabBuildings) els.tabBuildings.textContent = Lang.t('buildings');
        if (els.tabUpgrades) els.tabUpgrades.textContent = Lang.t('upgrades');
        if (els.tabAchievements) els.tabAchievements.textContent = Lang.t('achievements');
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
    if (confirm(Lang.t('confirm_prestige'))) {
        Game.performPrestige();
        UI.closeModal();
    }
}

function handleReset() {
    if (confirm(Lang.t('confirm_reset'))) {
        Game.resetGame();
        UI.closeModal();
    }
}

function handleExport() {
    const save = Game.exportSave();
    if (save && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(save).then(() => {
            Utils.showToast('📋 ' + (Lang.getLanguage() === 'en' ? 'Save copied to clipboard!' : '¡Guardado copiado al portapapeles!'), 'info', 3000);
        }).catch(() => {
            prompt(Lang.getLanguage() === 'en' ? 'Copy your save data:' : 'Copia tus datos de guardado:', save);
        });
    } else {
        prompt(Lang.getLanguage() === 'en' ? 'Copy your save data:' : 'Copia tus datos de guardado:', save);
    }
}

function handleImport() {
    const data = prompt(Lang.getLanguage() === 'en' ? 'Paste save data:' : 'Pega los datos de guardado:');
    if (data) {
        Game.importSave(data);
        UI.closeModal();
    }
}
