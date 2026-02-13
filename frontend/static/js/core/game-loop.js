import * as SaveSystem from '../infra/save-repository.js';
import * as Lang from '../content/i18n/index.js';
import * as UI from '../ui/renderer.js';
import * as Tutorial from '../ui/overlays/tutorial-controller.js';
import * as Utils from '../infra/number-formatters.js';

import {
  calculateClickValue as calculateClickValueForState,
  recalculateDps as recalculateDpsForState,
  getBuildingDiscount as getBuildingDiscountForState,
} from './economy.js';

import {
  addActiveEffect as addEffectToState,
  updateActiveEffects as updateEffectsInState,
} from './effects-system.js';

import {
  calculateOfflineProgress as applyOfflineProgress,
  computeNextGoldenDataTime,
  spawnGoldenData as spawnGoldenDataEvent,
  computeNextRandomEventTime,
  triggerRandomEvent as triggerRandomGameEvent,
} from './event-system.js';

import {
  buyBuilding as buyBuildingProgression,
  buyUpgrade as buyUpgradeProgression,
  buyPrestigeUpgrade as buyPrestigeUpgradeProgression,
  performPrestige as performPrestigeProgression,
  getInnovationPointsPreview as getInnovationPointsPreviewForProgression,
} from './progression-system.js';

import { unlockNewAchievements } from './achievement-system.js';

const AUTO_SAVE_INTERVAL_MS = 30000;

const Game = (() => {
  let state = null;
  let lastFrameTime = 0;
  let animationFrameId = null;
  let autoSaveInterval = null;

  let nextGoldenDataTime = 0;
  let nextRandomEventTime = 0;

  function getRuntimeApi() {
    return {
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
      getInnovationPointsPreview: getInnovationPointsPreviewForState,
      recalculateDps,
      calculateClickValue,
      getBuildingDiscount,
    };
  }

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
    const runtimeApi = getRuntimeApi();
    UI.setGameApi(runtimeApi);
    Tutorial.setGameApi(runtimeApi);
    UI.init(state);
    UI.renderAll(state);

    if (Tutorial) Tutorial.init();

    scheduleGoldenData();
    scheduleRandomEvent();

    lastFrameTime = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);

    autoSaveInterval = setInterval(() => {
      SaveSystem.save(state);
      UI.showSaveIndicator();
    }, AUTO_SAVE_INTERVAL_MS);
  }

  function gameLoop(timestamp) {
    const deltaMs = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    const deltaSec = Math.min(deltaMs / 1000, 1);

    update(deltaSec);
    UI.update(state, deltaSec);

    if (Tutorial) Tutorial.update();

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function update(deltaSec) {
    applyProductionTick(deltaSec);
    updateActiveEffects();

    const unlocked = unlockNewAchievements(state, (achievement) => {
      UI.showAchievement(achievement);
    });
    if (unlocked.length > 0) recalculateDps();

    if (Date.now() >= nextGoldenDataTime) {
      spawnGoldenData();
      scheduleGoldenData();
    }

    if (Date.now() >= nextRandomEventTime) {
      triggerRandomEvent();
      scheduleRandomEvent();
    }

    if (state.dps > state.stats.highestDps) {
      state.stats.highestDps = state.dps;
    }

    state.lastTickTime = Date.now();
  }

  function applyProductionTick(deltaSec) {
    state.stats.playTimeSeconds += deltaSec;

    const generatedData = state.dps * deltaSec;
    if (generatedData <= 0) return;

    state.dataPoints += generatedData;
    state.stats.totalDataEarned += generatedData;
    state.stats.totalDataAllTime += generatedData;
  }

  function handleClick(x, y) {
    const clickValue = calculateClickValue();

    state.dataPoints += clickValue;
    state.stats.totalDataEarned += clickValue;
    state.stats.totalDataAllTime += clickValue;
    state.stats.totalClicks += 1;
    state.stats.totalClicksAllTime = (state.stats.totalClicksAllTime || 0) + 1;

    Utils.createParticle(x, y, `+${Utils.formatDps(clickValue)}`);

    unlockNewAchievements(state, (achievement) => {
      UI.showAchievement(achievement);
    });

    UI.animateClick();

    if (Tutorial) Tutorial.update();
  }

  function calculateClickValue() {
    return calculateClickValueForState(state);
  }

  function buyBuilding(buildingId) {
    return buyBuildingProgression(state, buildingId, {
      getBuildingDiscount,
      onRecalculateDps: recalculateDps,
      onRenderBuildings: () => UI.renderBuildings(state),
      onRenderUpgrades: () => UI.renderUpgrades(state),
    });
  }

  function buyUpgrade(upgradeId) {
    return buyUpgradeProgression(state, upgradeId, {
      onRecalculateDps: recalculateDps,
      onRenderUpgrades: () => UI.renderUpgrades(state),
      onShowToast: (message, type, duration) => Utils.showToast(message, type, duration),
    });
  }

  function buyPrestigeUpgrade(upgradeId) {
    return buyPrestigeUpgradeProgression(state, upgradeId, {
      onRecalculateDps: recalculateDps,
      onRenderPrestige: () => UI.renderPrestige(state),
      onShowToast: (message, type, duration) => Utils.showToast(message, type, duration),
    });
  }

  function performPrestige() {
    const result = performPrestigeProgression(state, {
      createDefaultState: SaveSystem.createDefaultState,
      onRecalculateDps: (nextState) => recalculateDpsForState(nextState),
      onSave: (nextState) => SaveSystem.save(nextState),
      onRenderAll: (nextState) => UI.renderAll(nextState),
      onPrestigeAnimation: () => UI.showPrestigeAnimation(),
      onShowToast: (pointsToGain) => {
        Utils.showToast(`+${pointsToGain} ${Lang.t('innovation_points')}!`, 'prestige', 5000);
      },
    });

    if (!result.ok) return false;

    state = result.state;
    return true;
  }

  function recalculateDps() {
    recalculateDpsForState(state);
  }

  function getBuildingDiscount() {
    return getBuildingDiscountForState(state);
  }

  function calculateOfflineProgress() {
    applyOfflineProgress(state);
  }

  function scheduleGoldenData() {
    nextGoldenDataTime = computeNextGoldenDataTime(state);
  }

  function spawnGoldenData() {
    spawnGoldenDataEvent(state);
  }

  function scheduleRandomEvent() {
    nextRandomEventTime = computeNextRandomEventTime();
  }

  function triggerRandomEvent() {
    triggerRandomGameEvent(state, (type, multiplier, durationMs) => {
      addActiveEffect(type, multiplier, durationMs);
    });
  }

  function addActiveEffect(type, multiplier, durationMs) {
    addEffectToState(state, type, multiplier, durationMs, recalculateDps);
  }

  function updateActiveEffects() {
    updateEffectsInState(state, recalculateDps);
  }

  function getState() {
    return state;
  }

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
    const message = Lang.getLanguage() === 'en' ? 'Game saved!' : 'Juego guardado!';
    Utils.showToast(message, 'info', 2000);
  }

  function exportSave() {
    return SaveSystem.exportSave(state);
  }

  function importSave(data) {
    const newState = SaveSystem.importSave(data);
    if (!newState) {
      const invalidMessage = Lang.getLanguage() === 'en' ? 'Invalid save data' : 'Datos de guardado invalidos';
      Utils.showToast(invalidMessage, 'error', 3000);
      return false;
    }

    state = newState;
    Lang.setLanguage(state.settings.language);
    recalculateDps();
    SaveSystem.save(state);
    UI.renderAll(state);

    const successMessage = Lang.getLanguage() === 'en' ? 'Save imported!' : 'Guardado importado!';
    Utils.showToast(successMessage, 'success', 3000);
    return true;
  }

  function resetGame() {
    SaveSystem.deleteSave();
    state = SaveSystem.createDefaultState();
    recalculateDps();
    UI.renderAll(state);

    const message = Lang.getLanguage() === 'en' ? 'Game reset!' : 'Juego reiniciado!';
    Utils.showToast(message, 'info', 3000);

    if (Tutorial) Tutorial.restart();
  }

  function getInnovationPointsPreviewForState() {
    return getInnovationPointsPreviewForProgression(state);
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
    getInnovationPointsPreview: getInnovationPointsPreviewForState,
    recalculateDps,
    calculateClickValue,
    getBuildingDiscount,
  };
})();

window.Game = Game;

export const init = Game.init;
export const getState = Game.getState;
export const handleClick = Game.handleClick;
export const buyBuilding = Game.buyBuilding;
export const buyUpgrade = Game.buyUpgrade;
export const buyPrestigeUpgrade = Game.buyPrestigeUpgrade;
export const performPrestige = Game.performPrestige;
export const setBuyAmount = Game.setBuyAmount;
export const setLanguage = Game.setLanguage;
export const manualSave = Game.manualSave;
export const exportSave = Game.exportSave;
export const importSave = Game.importSave;
export const resetGame = Game.resetGame;
export const getInnovationPointsPreview = Game.getInnovationPointsPreview;
export const recalculateDps = Game.recalculateDps;
export const calculateClickValue = Game.calculateClickValue;
export const getBuildingDiscount = Game.getBuildingDiscount;
export default Game;
