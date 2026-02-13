/* ==========================================================================
   Summan Data Clicker - Save / Load System
   ========================================================================== */

const SaveSystem = (() => {
    const SAVE_KEY = 'summan_clicker_save';
    const SAVE_VERSION = 2;

    /**
     * Create a default (new) game state.
     */
    function createDefaultState() {
        return {
            version: SAVE_VERSION,
            dataPoints: 0,
            buildings: {},       // { intern: 5, laptop: 3, ... }
            upgrades: [],        // ['click_1', 'intern_1', ...]
            achievements: [],    // ['prod_1', 'click_1', ...]
            buildingMultipliers: {}, // calculated cache
            // Prestige
            innovationPoints: 0,
            totalInnovationEarned: 0,
            prestigeUpgrades: [], // ['p_click_boost', ...]
            // Stats
            stats: {
                totalDataEarned: 0,
                totalDataAllTime: 0,  // persists through prestiges
                totalClicks: 0,
                totalClicksAllTime: 0,
                totalBuildings: 0,
                timesPrestiged: 0,
                highestDps: 0,
                playTimeSeconds: 0,
                events: {
                    golden_clicked: 0,
                    coffee_break: 0,
                    bug_fixed: 0,
                    deploy_friday: 0,
                },
            },
            // Timestamps
            lastSaveTime: Date.now(),
            lastTickTime: Date.now(),
            gameStartTime: Date.now(),
            // Settings
            settings: {
                language: 'es',
                buyAmount: 1,     // 1, 10, 100, -1 (max)
            },
            // Active effects
            activeEffects: [],   // { type, multiplier, endTime }
            // DPS cache
            dps: 0,
        };
    }

    /**
     * Save game state to LocalStorage.
     */
    function save(gameState) {
        try {
            gameState.lastSaveTime = Date.now();
            const json = JSON.stringify(gameState);
            localStorage.setItem(SAVE_KEY, json);
            return true;
        } catch (e) {
            console.error('Failed to save:', e);
            return false;
        }
    }

    /**
     * Load game state from LocalStorage.
     * Returns null if no save exists.
     */
    function load() {
        try {
            const json = localStorage.getItem(SAVE_KEY);
            if (!json) return null;

            const state = JSON.parse(json);
            // Migrate if needed
            return migrate(state);
        } catch (e) {
            console.error('Failed to load save:', e);
            return null;
        }
    }

    /**
     * Migrate old save formats to current version.
     */
    function migrate(state) {
        if (!state.version) state.version = 1;
        if (state.version < SAVE_VERSION) state.version = SAVE_VERSION;

        // Ensure all fields exist (forward compatibility)
        const defaults = createDefaultState();

        // Deep merge missing fields
        state.stats = { ...defaults.stats, ...state.stats };
        state.stats.events = { ...defaults.stats.events, ...(state.stats.events || {}) };
        state.settings = { ...defaults.settings, ...state.settings };

        if (!state.activeEffects) state.activeEffects = [];
        if (!state.prestigeUpgrades) state.prestigeUpgrades = [];
        if (!state.buildingMultipliers) state.buildingMultipliers = {};
        if (state.innovationPoints === undefined) state.innovationPoints = 0;
        if (state.totalInnovationEarned === undefined) state.totalInnovationEarned = 0;

        return state;
    }

    /**
     * Export save as Base64 string.
     */
    function exportSave(gameState) {
        try {
            const json = JSON.stringify(gameState);
            return btoa(unescape(encodeURIComponent(json)));
        } catch (e) {
            console.error('Failed to export:', e);
            return null;
        }
    }

    /**
     * Import save from Base64 string.
     */
    function importSave(base64String) {
        try {
            const json = decodeURIComponent(escape(atob(base64String.trim())));
            const state = JSON.parse(json);
            return migrate(state);
        } catch (e) {
            console.error('Failed to import:', e);
            return null;
        }
    }

    /**
     * Delete save data.
     */
    function deleteSave() {
        localStorage.removeItem(SAVE_KEY);
    }

    /**
     * Check if a save exists.
     */
    function hasSave() {
        return localStorage.getItem(SAVE_KEY) !== null;
    }

    return {
        createDefaultState,
        save,
        load,
        exportSave,
        importSave,
        deleteSave,
        hasSave,
    };
})();

window.SaveSystem = SaveSystem;

export const createDefaultState = SaveSystem.createDefaultState;
export const save = SaveSystem.save;
export const load = SaveSystem.load;
export const exportSave = SaveSystem.exportSave;
export const importSave = SaveSystem.importSave;
export const deleteSave = SaveSystem.deleteSave;
export const hasSave = SaveSystem.hasSave;
export default SaveSystem;

