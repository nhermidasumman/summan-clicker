import * as SaveSystem from '../infra/save-repository.js';
import * as Lang from '../content/i18n/index.js';
import * as UI from '../ui/renderer.js';
import * as Tutorial from '../ui/overlays/tutorial-controller.js';
import * as Utils from '../infra/number-formatters.js';
import { LOGIC_TICK_MS, AUTO_SAVE_INTERVAL_MS, EVENT_LOG_LIMIT } from '../infra/constants.js';

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
  publish,
  subscribe,
  resolveRandomEventChoice as resolveRandomChoice,
} from './event-system.js';

import {
  buyBuilding as buyBuildingProgression,
  buyUpgrade as buyUpgradeProgression,
  buyPrestigeUpgrade as buyPrestigeUpgradeProgression,
  performPrestige as performPrestigeProgression,
  getInnovationPointsPreview as getInnovationPointsPreviewForProgression,
} from './progression-system.js';

import { unlockNewAchievements } from './achievement-system.js';
import { updateDebtTick, recomputeDebtState, setBugs as setBugsState } from './debt-system.js';
import {
  maybeTriggerCrash,
  tickCrashState,
  forceCrash as forceCrashState,
  rebootCrash as rebootCrashState,
  clearCrash,
} from './crash-system.js';
import { performRefactor as performRefactorState, getRefactorCost as getRefactorCostFromState } from './refactor-system.js';
import { createAlertAudioSystem } from './audio-alert-system.js';
import { getAggregatedEffects } from '../content/prestige-upgrades.js';

const LOGIC_TICK_SECONDS = LOGIC_TICK_MS / 1000;
const CRASH_RECOVERY_COOLDOWN_MS = 3_000;

const Game = (() => {
  let state = null;
  let animationFrameId = null;
  let autoSaveInterval = null;
  let lastFrameTime = 0;
  let accumulatorMs = 0;

  let nextGoldenDataTime = 0;
  let nextRandomEventTime = 0;
  let crashRecoveryUntil = 0;

  const unsubscribeHandlers = [];
  const alertAudio = createAlertAudioSystem();

  function appendEventLog(type, message, level = 'info') {
    if (!state) return;
    const entry = {
      id: `${type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      timestamp: Date.now(),
      type,
      level,
      message,
    };

    state.eventLog = [entry, ...(state.eventLog || [])].slice(0, EVENT_LOG_LIMIT);
  }

  function startCrashRecoveryCooldown(durationMs = CRASH_RECOVERY_COOLDOWN_MS) {
    const safeDurationMs = Math.max(LOGIC_TICK_MS, Math.floor(Number(durationMs || 0)));
    crashRecoveryUntil = Math.max(crashRecoveryUntil, Date.now() + safeDurationMs);
  }

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
      setBugs,
      triggerRefactor,
      runLogicTicks,
      forceCrash,
      rebootCrash,
      resolveRandomEventChoice,
      getRefactorCost: () => getRefactorCostFromState(state),
    };
  }

  function setupEventSubscriptions() {
    unsubscribeHandlers.splice(0, unsubscribeHandlers.length).forEach((unsubscribe) => unsubscribe());

    unsubscribeHandlers.push(subscribe('ON_EVENT', (payload) => {
      const message = payload?.message || payload?.type || 'event';
      appendEventLog(payload?.type || 'event', String(message), 'info');
      UI.renderAll(state);
    }));
  }

  function init() {
    state = SaveSystem.load() || SaveSystem.createDefaultState();
    Lang.setLanguage(state.settings.language);

    applyOfflineProgress(state);
    recomputeDebtState(state);
    recalculateDps();

    setupEventSubscriptions();

    const runtimeApi = getRuntimeApi();
    UI.setGameApi(runtimeApi);
    Tutorial.setGameApi(runtimeApi);

    UI.init(state);
    UI.renderAll(state);
    Tutorial.init();

    scheduleGoldenData();
    scheduleRandomEvent();

    lastFrameTime = performance.now();
    accumulatorMs = 0;
    crashRecoveryUntil = 0;
    animationFrameId = requestAnimationFrame(gameLoop);

    autoSaveInterval = setInterval(() => {
      SaveSystem.save(state);
      UI.showSaveIndicator();
    }, AUTO_SAVE_INTERVAL_MS);

    appendEventLog('session_start', Lang.getLanguage() === 'en' ? 'Session started' : 'Sesion iniciada');
  }

  function gameLoop(timestamp) {
    const deltaMs = Math.max(0, Math.min(1000, timestamp - lastFrameTime));
    lastFrameTime = timestamp;
    accumulatorMs += deltaMs;

    let safety = 0;
    while (accumulatorMs >= LOGIC_TICK_MS && safety < 20) {
      runLogicTick(LOGIC_TICK_SECONDS);
      accumulatorMs -= LOGIC_TICK_MS;
      safety += 1;
    }

    UI.update(state, deltaMs / 1000);
    Tutorial.update();

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  function applyProductionTick(deltaSec) {
    state.stats.playTimeSeconds += deltaSec;

    const generatedData = (state.dps || 0) * deltaSec;
    if (generatedData > 0) {
      state.dataPoints += generatedData;
      state.stats.totalDataEarned += generatedData;
      state.stats.totalDataAllTime += generatedData;
      state.stats.lastProductionAt = Date.now();
    }
  }

  function applyAutoClickTick(deltaSec) {
    const autoClicksPerSecond = Number(state.autoClicksPerSecond || 0);
    if (autoClicksPerSecond <= 0) return;

    const autoClickValue = calculateClickValue();
    const generatedData = autoClickValue * autoClicksPerSecond * deltaSec;

    if (generatedData <= 0) return;

    state.dataPoints += generatedData;
    state.stats.totalDataEarned += generatedData;
    state.stats.totalDataAllTime += generatedData;
  }

  function applyTimedTemporaryModifiers() {
    const now = Date.now();
    let changed = false;

    if ((state.tempProductionUntil || 0) > 0 && now >= state.tempProductionUntil) {
      state.tempProductionMultiplier = 1;
      state.tempProductionUntil = 0;
      changed = true;
    }

    if ((state.tempBugRateUntil || 0) > 0 && now >= state.tempBugRateUntil) {
      state.tempBugRateMultiplier = 1;
      state.tempBugRateUntil = 0;
      changed = true;
    }

    if (changed) {
      recomputeDebtState(state);
      recalculateDps();
    }
  }

  function runLogicTick(deltaSec = LOGIC_TICK_SECONDS) {
    if (!state) return;

    applyTimedTemporaryModifiers();

    const crashEndedByTimer = tickCrashState(state);
    if (crashEndedByTimer) {
      startCrashRecoveryCooldown();
      appendEventLog('crash_end', Lang.getLanguage() === 'en' ? 'System recovered' : 'Sistema recuperado', 'success');
      publish('ON_CRASH_END', { reason: 'timer' });
      alertAudio.notifyCrashEnd();
      recalculateDps();
    }

    if (!state.crash.active) {
      applyProductionTick(deltaSec);
      applyAutoClickTick(deltaSec);
    }

    updateDebtTick(state, deltaSec);

    const inCrashRecovery = Date.now() < crashRecoveryUntil;
    let triggeredCrash = false;
    if (!inCrashRecovery) {
      const crashDurationMult = getAggregatedEffects(state.prestigeUpgrades || []).crashDurationMult || 1;
      triggeredCrash = maybeTriggerCrash(state, { durationMultiplier: crashDurationMult });
    }
    if (triggeredCrash) {
      appendEventLog('crash_start', Lang.t('crash_active'), 'danger');
      publish('ON_CRASH_START', { bugs: state.bugs, efficiency: state.efficiency });
      alertAudio.notifyCrashStart(state);
    }

    updateEffectsInState(state, recalculateDps);
    recalculateDps();

    const unlocked = unlockNewAchievements(state, (achievement) => {
      UI.showAchievement(achievement);
      appendEventLog('achievement', achievement?.nameEn || achievement?.nameEs || 'achievement', 'success');
    });
    if (unlocked.length > 0) {
      recalculateDps();
    }

    const now = Date.now();

    if (now >= nextGoldenDataTime) {
      spawnGoldenDataEvent(state);
      scheduleGoldenData(now);
      publish('ON_GOLDEN_DATA', { at: now });
    }

    if (now >= nextRandomEventTime) {
      triggerRandomGameEvent(state, (type, multiplier, durationMs) => {
        addActiveEffect(type, multiplier, durationMs);
      });
      scheduleRandomEvent(now);
      publish('ON_RANDOM_EVENT', { at: now });
    }

    if (state.dps > state.stats.highestDps) {
      state.stats.highestDps = state.dps;
    }

    state.lastTickTime = now;

    alertAudio.notifyDebt(state.efficiency, state);

    publish('ON_TICK', {
      deltaSec,
      dps: state.dps,
      theoreticalDps: state.theoreticalDps,
      bugs: state.bugs,
      efficiency: state.efficiency,
      crashActive: Boolean(state.crash?.active),
    });
  }

  function handleClick(x, y) {
    alertAudio.unlock();
    if (!state || state.crash.active) return;

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
    Tutorial.update();
    publish('ON_CLICK', { value: clickValue });
  }

  function calculateClickValue() {
    return calculateClickValueForState(state);
  }

  function buyBuilding(buildingId) {
    const bought = buyBuildingProgression(state, buildingId, {
      getBuildingDiscount,
      onRecalculateDps: recalculateDps,
      onRenderBuildings: () => UI.renderBuildings(state),
      onRenderUpgrades: () => UI.renderUpgrades(state),
    });

    if (bought) {
      publish('ON_BUY', { kind: 'building', id: buildingId });
    }

    return bought;
  }

  function buyUpgrade(upgradeId) {
    const bought = buyUpgradeProgression(state, upgradeId, {
      onRecalculateDps: recalculateDps,
      onRenderUpgrades: () => UI.renderUpgrades(state),
      onShowToast: (message, type, duration) => Utils.showToast(message, type, duration),
    });

    if (bought) {
      publish('ON_BUY', { kind: 'upgrade', id: upgradeId });
    }

    return bought;
  }

  function buyPrestigeUpgrade(upgradeId) {
    const bought = buyPrestigeUpgradeProgression(state, upgradeId, {
      onRecalculateDps: recalculateDps,
      onRenderPrestige: () => UI.renderAll(state),
      onShowToast: (message, type, duration) => Utils.showToast(message, type, duration),
    });

    if (bought) {
      appendEventLog('boardroom', `${Lang.t('innovation_points')}: -${upgradeId}`, 'info');
      publish('ON_BUY', { kind: 'prestige_upgrade', id: upgradeId });
      UI.renderAll(state);
    }

    return bought;
  }

  function performPrestige() {
    const result = performPrestigeProgression(state, {
      createDefaultState: SaveSystem.createDefaultState,
      onRecalculateDps: (nextState) => {
        recomputeDebtState(nextState);
        recalculateDpsForState(nextState);
      },
      onSave: (nextState) => SaveSystem.save(nextState),
      onRenderAll: (nextState) => UI.renderAll(nextState),
      onPrestigeAnimation: () => UI.showPrestigeAnimation(),
      onShowToast: (pointsToGain) => {
        Utils.showToast(`+${pointsToGain} ${Lang.t('innovation_points')}!`, 'prestige', 4500);
      },
    });

    if (!result.ok) return false;

    state = result.state;
    state.pendingRandomEvent = null;
    clearCrash(state);
    crashRecoveryUntil = 0;

    appendEventLog('prestige', `+${result.pointsToGain} ${Lang.t('innovation_points')}`, 'success');
    publish('ON_PRESTIGE', { points: result.pointsToGain });

    UI.renderAll(state);
    return true;
  }

  function recalculateDps() {
    recalculateDpsForState(state);
  }

  function getBuildingDiscount() {
    return getBuildingDiscountForState(state);
  }

  function scheduleGoldenData(now = Date.now()) {
    nextGoldenDataTime = computeNextGoldenDataTime(state, now);
  }

  function scheduleRandomEvent(now = Date.now()) {
    nextRandomEventTime = computeNextRandomEventTime(now);
  }

  function addActiveEffect(type, multiplier, durationMs) {
    addEffectToState(state, type, multiplier, durationMs, recalculateDps);
  }

  function getState() {
    return state;
  }

  function setBuyAmount(amount) {
    state.settings.buyAmount = amount;
    UI.renderBuildings(state);
  }

  function setLanguage(language) {
    Lang.setLanguage(language);
    state.settings.language = language;
    UI.renderAll(state);
  }

  function setBugs(bugs) {
    setBugsState(state, bugs);
    recalculateDps();
    UI.renderAll(state);
    publish('ON_DEBUG_SET_BUGS', { bugs: state.bugs });
  }

  function triggerRefactor() {
    const result = performRefactorState(state);
    if (!result.ok) return result;

    recalculateDps();
    appendEventLog('refactor', `${Lang.t('refactor')}: -${Utils.formatNumber(result.reducedBy)} ${Lang.t('bugs')}`, 'success');
    publish('ON_REFACTOR', result);
    UI.renderAll(state);
    return result;
  }

  function forceCrash() {
    const durationMultiplier = getAggregatedEffects(state.prestigeUpgrades || []).crashDurationMult || 1;
    const triggered = forceCrashState(state, { durationMultiplier });
    if (!triggered) return false;

    recalculateDps();
    appendEventLog('crash_start', Lang.t('crash_active'), 'danger');
    publish('ON_CRASH_START', { forced: true });
    alertAudio.notifyCrashStart(state);
    UI.renderAll(state);
    return true;
  }

  function rebootCrash() {
    const wasActive = Boolean(state.crash?.active);
    const ended = rebootCrashState(state);
    if (!wasActive) return false;

    if (!state.crash.active || ended) {
      startCrashRecoveryCooldown();
      appendEventLog('crash_end', Lang.getLanguage() === 'en' ? 'Reboot complete' : 'Reinicio completo', 'success');
      publish('ON_CRASH_END', { reason: 'reboot' });
      alertAudio.notifyCrashEnd();
      recalculateDps();
    }

    UI.renderAll(state);
    return true;
  }

  function resolveRandomEventChoice(eventId, choiceId) {
    const message = resolveRandomChoice(state, eventId, choiceId);
    if (!message) return false;

    Utils.showToast(message, 'info', 3500);
    appendEventLog(eventId, message, 'info');
    recalculateDps();
    UI.renderAll(state);
    return true;
  }

  function runLogicTicks(ticks = 1) {
    const safeTicks = Math.max(0, Math.floor(Number(ticks || 0)));
    for (let i = 0; i < safeTicks; i += 1) {
      runLogicTick(LOGIC_TICK_SECONDS);
    }
    UI.renderAll(state);
    return true;
  }

  function manualSave() {
    SaveSystem.save(state);
    const message = Lang.getLanguage() === 'en' ? 'Game saved!' : 'Juego guardado!';
    Utils.showToast(message, 'info', 1800);
  }

  function exportSave() {
    return SaveSystem.exportSave(state);
  }

  function importSave(data) {
    const newState = SaveSystem.importSave(data);
    if (!newState) {
      const message = Lang.getLanguage() === 'en' ? 'Invalid save data' : 'Datos de guardado invalidos';
      Utils.showToast(message, 'error', 3000);
      return false;
    }

    state = newState;
    Lang.setLanguage(state.settings.language);
    recomputeDebtState(state);
    recalculateDps();
    SaveSystem.save(state);
    UI.renderAll(state);

    const success = Lang.getLanguage() === 'en' ? 'Save imported!' : 'Guardado importado!';
    Utils.showToast(success, 'success', 2500);
    return true;
  }

  function stopLoop() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (autoSaveInterval !== null) {
      clearInterval(autoSaveInterval);
      autoSaveInterval = null;
    }
  }

  function resetGame() {
    SaveSystem.deleteSave();
    state = SaveSystem.createDefaultState();
    Lang.setLanguage(state.settings.language);
    recomputeDebtState(state);
    recalculateDps();

    scheduleGoldenData();
    scheduleRandomEvent();
    crashRecoveryUntil = 0;

    UI.renderAll(state);
    appendEventLog('reset', Lang.getLanguage() === 'en' ? 'Game reset' : 'Juego reiniciado', 'warning');

    const message = Lang.getLanguage() === 'en' ? 'Game reset!' : 'Juego reiniciado!';
    Utils.showToast(message, 'info', 2500);

    Tutorial.restart();
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
    setBugs,
    triggerRefactor,
    runLogicTicks,
    forceCrash,
    rebootCrash,
    resolveRandomEventChoice,
    getRefactorCost: () => getRefactorCostFromState(state),
    stopLoop,
  };
})();

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
export const setBugs = Game.setBugs;
export const triggerRefactor = Game.triggerRefactor;
export const runLogicTicks = Game.runLogicTicks;
export const forceCrash = Game.forceCrash;
export const rebootCrash = Game.rebootCrash;
export const resolveRandomEventChoice = Game.resolveRandomEventChoice;
export const getRefactorCost = Game.getRefactorCost;
export default Game;


