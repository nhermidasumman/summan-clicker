/* ==========================================================================
   Summan Data Clicker - Core Game Engine
   ========================================================================== */

const Game = (() => {
    let state = null;
    let lastFrameTime = 0;
    let animationFrameId = null;
    let autoSaveInterval = null;

    // Event timers
    let nextGoldenDataTime = 0;
    let nextRandomEventTime = 0;

    /**
     * Initialize or load game.
     */
    function init() {
        const savedState = SaveSystem.load();
        if (savedState) {
            state = savedState;
            Lang.setLanguage(state.settings.language);
            calculateOfflineProgress();
        } else {
            state = SaveSystem.createDefaultState();
        }

        recalculateDps();
        UI.init(state);
        UI.renderAll(state);

        // Schedule events
        scheduleGoldenData();
        scheduleRandomEvent();

        // Start game loop
        lastFrameTime = performance.now();
        animationFrameId = requestAnimationFrame(gameLoop);

        // Auto-save every 30 seconds
        autoSaveInterval = setInterval(() => {
            SaveSystem.save(state);
            UI.showSaveIndicator();
        }, 30000);

        console.log('Summan Data Clicker initialized!');
    }

    /**
     * Main game loop (requestAnimationFrame-based).
     */
    function gameLoop(timestamp) {
        const deltaMs = timestamp - lastFrameTime;
        lastFrameTime = timestamp;

        // Cap delta to avoid huge jumps (e.g., tab unfocused)
        const deltaSec = Math.min(deltaMs / 1000, 1);

        update(deltaSec);
        UI.update(state, deltaSec);

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    /**
     * Core update tick.
     */
    function update(deltaSec) {
        // Update play time
        state.stats.playTimeSeconds += deltaSec;

        // Generate data from buildings
        const dataGenerated = state.dps * deltaSec;
        if (dataGenerated > 0) {
            state.dataPoints += dataGenerated;
            state.stats.totalDataEarned += dataGenerated;
            state.stats.totalDataAllTime += dataGenerated;
        }

        // Update active effects
        updateActiveEffects();

        // Check achievements
        const newAchievements = Achievements.checkAll(state);
        if (newAchievements.length > 0) {
            for (const id of newAchievements) {
                state.achievements.push(id);
                const ach = Achievements.getById(id);
                UI.showAchievement(ach);
            }
            recalculateDps(); // Achievements give bonuses
        }

        // Check golden data timing
        if (Date.now() >= nextGoldenDataTime) {
            spawnGoldenData();
            scheduleGoldenData();
        }

        // Check random events
        if (Date.now() >= nextRandomEventTime) {
            triggerRandomEvent();
            scheduleRandomEvent();
        }

        // Track highest DPS
        if (state.dps > state.stats.highestDps) {
            state.stats.highestDps = state.dps;
        }

        state.lastTickTime = Date.now();
    }

    /**
     * Handle a click on the main data point.
     */
    function handleClick(x, y) {
        const clickValue = calculateClickValue();
        state.dataPoints += clickValue;
        state.stats.totalDataEarned += clickValue;
        state.stats.totalDataAllTime += clickValue;
        state.stats.totalClicks++;
        state.stats.totalClicksAllTime = (state.stats.totalClicksAllTime || 0) + 1;

        // Visual feedback
        Utils.createParticle(x, y, '+' + Utils.formatDps(clickValue));

        // Check achievements after click
        const newAchievements = Achievements.checkAll(state);
        for (const id of newAchievements) {
            state.achievements.push(id);
            const ach = Achievements.getById(id);
            UI.showAchievement(ach);
        }

        UI.animateClick();
    }

    /**
     * Calculate the value of a single click.
     */
    function calculateClickValue() {
        let baseClick = 1;
        let clickMult = 1;
        let clickAdd = 0;
        let dpsPercent = 0;

        // Apply purchased upgrade effects
        for (const upId of state.upgrades) {
            const up = Upgrades.getById(upId);
            if (!up) continue;
            const eff = up.effect;
            if (eff.type === 'click_mult') clickMult *= eff.value;
            if (eff.type === 'click_add') clickAdd += eff.value;
            if (eff.type === 'click_dps_percent') dpsPercent += eff.value;
        }

        // Prestige effects
        const prestigeEffects = Prestige.getAggregatedEffects(state.prestigeUpgrades);
        clickMult *= prestigeEffects.clickMult;

        // Active effects (Coffee Break)
        for (const eff of state.activeEffects) {
            if (eff.type === 'click_mult') clickMult *= eff.multiplier;
        }

        return (baseClick + clickAdd) * clickMult + (state.dps * dpsPercent);
    }

    /**
     * Buy a building.
     */
    function buyBuilding(buildingId) {
        const def = Buildings.getById(buildingId);
        if (!def) return false;

        const amount = state.settings.buyAmount === -1
            ? Utils.maxAffordable(def.baseCost * getBuildingDiscount(), state.buildings[buildingId] || 0, state.dataPoints, def.growthRate).count
            : (state.settings.buyAmount || 1);

        if (amount <= 0) return false;

        let totalCost = 0;
        const owned = state.buildings[buildingId] || 0;
        for (let i = 0; i < amount; i++) {
            totalCost += Utils.calculateBuildingCost(
                def.baseCost * getBuildingDiscount(), owned + i, def.growthRate
            );
        }

        if (state.dataPoints < totalCost) return false;

        state.dataPoints -= totalCost;
        state.buildings[buildingId] = owned + amount;
        state.stats.totalBuildings = Object.values(state.buildings).reduce((s, c) => s + c, 0);

        recalculateDps();
        UI.renderBuildings(state);
        UI.renderUpgrades(state);
        return true;
    }

    /**
     * Buy an upgrade.
     */
    function buyUpgrade(upgradeId) {
        const upgrade = Upgrades.getById(upgradeId);
        if (!upgrade) return false;
        if (state.upgrades.includes(upgradeId)) return false;
        if (state.dataPoints < upgrade.cost) return false;
        if (!Upgrades.isUnlocked(upgrade, state)) return false;

        state.dataPoints -= upgrade.cost;
        state.upgrades.push(upgradeId);

        recalculateDps();
        UI.renderUpgrades(state);
        Utils.showToast(
            `✅ ${Upgrades.getName(upgrade)}`,
            'success',
            2000
        );
        return true;
    }

    /**
     * Buy a prestige upgrade.
     */
    function buyPrestigeUpgrade(upgradeId) {
        const upgrade = Prestige.getUpgradeById(upgradeId);
        if (!upgrade) return false;
        if (state.prestigeUpgrades.includes(upgradeId)) return false;
        if (state.innovationPoints < upgrade.cost) return false;

        state.innovationPoints -= upgrade.cost;
        state.prestigeUpgrades.push(upgradeId);

        recalculateDps();
        UI.renderPrestige(state);
        Utils.showToast(
            `🌟 ${Prestige.getName(upgrade)}`,
            'success',
            3000
        );
        return true;
    }

    /**
     * Perform prestige (innovate).
     */
    function performPrestige() {
        const pointsToGain = Prestige.calculateInnovationPoints(state.stats.totalDataAllTime)
            - state.totalInnovationEarned;

        if (pointsToGain <= 0) return false;

        // Save persistent data
        const persistent = {
            innovationPoints: state.innovationPoints + pointsToGain,
            totalInnovationEarned: state.totalInnovationEarned + pointsToGain,
            prestigeUpgrades: [...state.prestigeUpgrades],
            stats: {
                ...state.stats,
                timesPrestiged: state.stats.timesPrestiged + 1,
                totalDataEarned: 0,
                totalClicks: 0,
                totalBuildings: 0,
                highestDps: 0,
                playTimeSeconds: 0,
            },
            achievements: [...state.achievements],
            settings: { ...state.settings },
            gameStartTime: state.gameStartTime,
        };

        // Reset to new state
        state = SaveSystem.createDefaultState();
        state.innovationPoints = persistent.innovationPoints;
        state.totalInnovationEarned = persistent.totalInnovationEarned;
        state.prestigeUpgrades = persistent.prestigeUpgrades;
        state.stats = persistent.stats;
        state.stats.totalDataAllTime = persistent.stats.totalDataAllTime;
        state.achievements = persistent.achievements;
        state.settings = persistent.settings;
        state.gameStartTime = persistent.gameStartTime;

        // Apply start bonus
        const effects = Prestige.getAggregatedEffects(state.prestigeUpgrades);
        state.dataPoints = effects.startBonus;
        state.stats.totalDataEarned = effects.startBonus;

        recalculateDps();
        SaveSystem.save(state);
        UI.renderAll(state);
        UI.showPrestigeAnimation();

        Utils.showToast(
            `🚀 +${pointsToGain} ${Lang.t('innovation_points')}!`,
            'prestige',
            5000
        );

        return true;
    }

    /**
     * Recalculate total DPS from all sources.
     */
    function recalculateDps() {
        let totalDps = 0;

        // Building multiplier cache
        const buildingMults = {};
        for (const def of Buildings.getAll()) {
            buildingMults[def.id] = 1;
        }

        // Apply upgrade effects to buildings
        for (const upId of state.upgrades) {
            const up = Upgrades.getById(upId);
            if (!up) continue;
            const eff = up.effect;

            if (eff.type === 'building_mult' && eff.target) {
                buildingMults[eff.target] = (buildingMults[eff.target] || 1) * eff.value;
            }
            if (eff.type === 'synergy' && eff.targets) {
                for (const t of eff.targets) {
                    buildingMults[t] = (buildingMults[t] || 1) * eff.value;
                }
            }
            if (eff.type === 'synergy_per' && eff.target && eff.per) {
                const perCount = state.buildings[eff.per] || 0;
                if (perCount > 0) {
                    buildingMults[eff.target] = (buildingMults[eff.target] || 1) * (1 + eff.value * perCount);
                }
            }
        }

        state.buildingMultipliers = buildingMults;

        // Calculate building DPS
        for (const def of Buildings.getAll()) {
            const owned = state.buildings[def.id] || 0;
            if (owned > 0) {
                totalDps += def.baseDps * owned * (buildingMults[def.id] || 1);
            }
        }

        // Apply global upgrade multipliers
        let globalMult = 1;
        for (const upId of state.upgrades) {
            const up = Upgrades.getById(upId);
            if (!up) continue;
            if (up.effect.type === 'global_mult') {
                globalMult *= up.effect.value;
            }
        }
        totalDps *= globalMult;

        // Apply achievement bonus
        totalDps *= Achievements.getTotalBonus(state.achievements);

        // Apply prestige multiplier
        const prestigeEffects = Prestige.getAggregatedEffects(state.prestigeUpgrades);
        totalDps *= prestigeEffects.productionMult;

        // Apply innovation points base multiplier
        const innovationMult = Prestige.getBaseMultiplier(
            state.innovationPoints + (state.totalInnovationEarned - state.innovationPoints >= 0 ? 0 : 0)
        );
        // Use total innovation earned for base multiplier
        const totalInnovMult = Prestige.getBaseMultiplier(state.totalInnovationEarned);
        totalDps *= totalInnovMult;

        // Apply active effects (Deploy Friday etc.)
        for (const eff of state.activeEffects) {
            if (eff.type === 'production_mult') {
                totalDps *= eff.multiplier;
            }
        }

        state.dps = totalDps;
    }

    /**
     * Get the building cost discount from prestige.
     */
    function getBuildingDiscount() {
        if (!state.prestigeUpgrades) return 1; // Default no discount
        const effects = Prestige.getAggregatedEffects(state.prestigeUpgrades);
        return effects.buildingDiscount;
    }

    /**
     * Calculate offline progress.
     */
    function calculateOfflineProgress() {
        if (!state.lastTickTime) return;

        const now = Date.now();
        const elapsedSec = (now - state.lastTickTime) / 1000;

        if (elapsedSec < 10) return; // Less than 10 sec, skip

        const prestigeEffects = Prestige.getAggregatedEffects(state.prestigeUpgrades);
        const offlineRate = prestigeEffects.offlineRate;

        const offlineData = state.dps * elapsedSec * offlineRate;

        if (offlineData > 0) {
            state.dataPoints += offlineData;
            state.stats.totalDataEarned += offlineData;
            state.stats.totalDataAllTime += offlineData;

            // Show offline progress modal
            setTimeout(() => {
                UI.showOfflineModal(offlineData, elapsedSec);
            }, 500);
        }
    }

    // ==================== EVENTS ====================

    function scheduleGoldenData() {
        const prestigeEffects = Prestige.getAggregatedEffects(state.prestigeUpgrades);
        const baseInterval = 120000; // 2 minutes
        const variance = 60000;     // ±1 minute
        const interval = (baseInterval + Utils.randomRange(-variance, variance)) * prestigeEffects.goldenFrequency;
        nextGoldenDataTime = Date.now() + Math.max(30000, interval);
    }

    function spawnGoldenData() {
        if (state.dps < 0.1 && state.stats.totalDataEarned < 100) return; // Too early
        UI.showGoldenData(() => {
            const prestigeEffects = Prestige.getAggregatedEffects(state.prestigeUpgrades);
            const baseReward = Math.max(
                state.dps * Utils.randomRange(30, 120),
                state.stats.totalDataEarned * 0.05
            );
            const reward = baseReward * prestigeEffects.goldenValue;

            state.dataPoints += reward;
            state.stats.totalDataEarned += reward;
            state.stats.totalDataAllTime += reward;
            state.stats.events.golden_clicked = (state.stats.events.golden_clicked || 0) + 1;

            Utils.showToast(
                `✨ ${Lang.t('event_golden_data_desc', Utils.formatNumber(reward))}`,
                'golden',
                3000
            );
        });
    }

    function scheduleRandomEvent() {
        const interval = Utils.randomRange(180000, 360000); // 3-6 minutes
        nextRandomEventTime = Date.now() + interval;
    }

    function triggerRandomEvent() {
        if (state.dps < 1) return; // Too early

        const events = ['deploy_friday', 'coffee_break', 'bug_report'];
        const event = events[Utils.randomInt(0, events.length - 1)];

        switch (event) {
            case 'deploy_friday': {
                const success = Math.random() > 0.3; // 70% success
                if (success) {
                    addActiveEffect('production_mult', 2, 30000);
                    Utils.showToast(`🚀 ${Lang.t('event_deploy_friday_good')}`, 'success', 4000);
                } else {
                    addActiveEffect('production_mult', 0.5, 10000);
                    Utils.showToast(`💥 ${Lang.t('event_deploy_friday_bad')}`, 'warning', 4000);
                }
                state.stats.events.deploy_friday = (state.stats.events.deploy_friday || 0) + 1;
                break;
            }
            case 'coffee_break': {
                const prestigeEffects = Prestige.getAggregatedEffects(state.prestigeUpgrades);
                const mult = prestigeEffects.coffeeMult;
                addActiveEffect('click_mult', mult, 13000);
                Utils.showToast(`${Lang.t('event_coffee_break_desc')}`, 'info', 4000);
                state.stats.events.coffee_break = (state.stats.events.coffee_break || 0) + 1;
                break;
            }
            case 'bug_report': {
                UI.showBugReport(() => {
                    const reward = state.dps * 60; // 1 minute of production
                    state.dataPoints += reward;
                    state.stats.totalDataEarned += reward;
                    state.stats.totalDataAllTime += reward;
                    state.stats.events.bug_fixed = (state.stats.events.bug_fixed || 0) + 1;
                    Utils.showToast(`🔧 Bug fixed! +${Utils.formatNumber(reward)}`, 'success', 3000);
                });
                break;
            }
        }
    }

    function addActiveEffect(type, multiplier, durationMs) {
        state.activeEffects.push({
            type,
            multiplier,
            endTime: Date.now() + durationMs,
        });
        recalculateDps();
    }

    function updateActiveEffects() {
        const now = Date.now();
        const before = state.activeEffects.length;
        state.activeEffects = state.activeEffects.filter(e => e.endTime > now);
        if (state.activeEffects.length !== before) {
            recalculateDps();
        }
    }

    // ==================== PUBLIC API ====================

    function getState() { return state; }

    function setBuyAmount(amount) {
        state.settings.buyAmount = amount;
        UI.renderBuildings(state);
    }

    function setLanguage(lang) {
        Lang.setLanguage(lang);
        state.settings.language = lang;
        UI.renderAll(state);
    }

    function manualSave() {
        SaveSystem.save(state);
        Utils.showToast('💾 ' + (Lang.getLanguage() === 'en' ? 'Game saved!' : '¡Juego guardado!'), 'info', 2000);
    }

    function exportSave() {
        return SaveSystem.exportSave(state);
    }

    function importSave(data) {
        const newState = SaveSystem.importSave(data);
        if (newState) {
            state = newState;
            Lang.setLanguage(state.settings.language);
            recalculateDps();
            SaveSystem.save(state);
            UI.renderAll(state);
            Utils.showToast('✅ ' + (Lang.getLanguage() === 'en' ? 'Save imported!' : '¡Guardado importado!'), 'success', 3000);
            return true;
        }
        Utils.showToast('❌ ' + (Lang.getLanguage() === 'en' ? 'Invalid save data' : 'Datos de guardado inválidos'), 'error', 3000);
        return false;
    }

    function resetGame() {
        SaveSystem.deleteSave();
        state = SaveSystem.createDefaultState();
        recalculateDps();
        UI.renderAll(state);
        Utils.showToast('🔄 ' + (Lang.getLanguage() === 'en' ? 'Game reset!' : '¡Juego reiniciado!'), 'info', 3000);
    }

    function getInnovationPointsPreview() {
        return Prestige.calculateInnovationPoints(state.stats.totalDataAllTime) - state.totalInnovationEarned;
    }

    return {
        init,
        getState,
        handleClick,
        buyBuilding,
        buyUpgrade,
        buyPrestigeUpgrade,
        performPrestige,
        setBuyAmount,
        setLanguage,
        manualSave,
        exportSave,
        importSave,
        resetGame,
        getInnovationPointsPreview,
        recalculateDps,
        calculateClickValue,
        getBuildingDiscount,
    };
})();

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', () => Game.init());
