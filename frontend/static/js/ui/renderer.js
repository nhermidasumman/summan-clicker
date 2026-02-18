import * as Lang from '../content/i18n/index.js';
import * as Utils from '../infra/number-formatters.js';

import { bindDomEvents } from './dom-bindings.js';
import { handleModalAction } from './modal-actions.js';
import { renderActiveEffectsBar } from './overlays/effects-bar.js';
import { createUiFeedback } from './overlays/ui-feedback.js';

import {
  renderBuildingsPanel,
  updateBuildingAffordability as updateBuildingAffordabilityPanel,
} from './panels/buildings-panel.js';
import {
  renderUpgradesBar,
  updateUpgradeAffordability as updateUpgradeAffordabilityPanel,
} from './panels/upgrades-bar.js';
import { renderAchievementsPanel } from './panels/achievements-panel.js';
import { createStatsModal } from './panels/stats-modal.js';
import { createSettingsModal } from './panels/settings-modal.js';
import { createPrestigeModal } from './panels/prestige-modal.js';
import { renderBoardroomPanel } from './panels/boardroom-panel.js';

const INNOVATION_ICON = '\u2728';

const UI = (() => {
  let gameApi = null;
  let elements = {};
  let feedback = null;
  let areEventsBound = false;

  function setGameApi(api) {
    gameApi = api;
  }

  function init(state) {
    cacheElements();

    if (!feedback) {
      feedback = createUiFeedback({
        elements,
        getState: () => gameApi?.getState?.() || null,
        renderAchievements: (currentState) => renderAchievements(currentState),
        showModal,
      });
    }

    if (!areEventsBound) {
      bindDomEvents(elements, {
        onClickTarget: (x, y) => gameApi?.handleClick?.(x, y),
        onClickTargetPress: (pointerId) => feedback?.playClickPress?.(pointerId),
        onClickTargetRelease: (pointerId) => feedback?.playClickRelease?.(pointerId),
        onSwitchTab: switchTab,
        onSetBuyAmount: (amount) => {
          updateBuyButtons(amount);
          gameApi?.setBuyAmount?.(amount);
        },
        onShowStats: showStatsModal,
        onShowSettings: showSettingsModal,
        onShowPrestige: showPrestigeModal,
        onCloseModal: closeModal,
        onBuyBuilding: (buildingId) => gameApi?.buyBuilding?.(buildingId),
        onBuyUpgrade: (upgradeId) => gameApi?.buyUpgrade?.(upgradeId),
        onRefactor: () => gameApi?.triggerRefactor?.(),
        onRebootCrash: () => gameApi?.rebootCrash?.(),
        onModalAction: (actionElement) => {
          handleModalAction(actionElement, {
            gameApi,
            onCloseModal: closeModal,
            onRefreshSettings: showSettingsModal,
          });
        },
        onManualSave: () => gameApi?.manualSave?.(),
      });
      areEventsBound = true;
    }

    updateBuyButtons(state.settings.buyAmount || 1);
  }

  function cacheElements() {
    elements = {
      dataCounter: document.getElementById('data-counter'),
      dpsDisplay: document.getElementById('dps-display'),
      clickPowerDisplay: document.getElementById('click-power-display'),
      clickTarget: document.getElementById('click-target'),
      clickOrb: document.getElementById('click-orb'),
      particleContainer: document.getElementById('particle-container'),

      buildingsList: document.getElementById('buildings-list'),
      upgradesList: document.getElementById('upgrades-list'),
      achievementsList: document.getElementById('achievements-list'),

      tabBuildings: document.getElementById('tab-buildings'),
      tabAchievements: document.getElementById('tab-achievements'),

      buyBtns: document.querySelectorAll('.buy-amount-btn'),

      btnStats: document.getElementById('btn-stats'),
      btnSettings: document.getElementById('btn-settings'),
      btnPrestige: document.getElementById('btn-prestige'),
      innovationDisplay: document.getElementById('innovation-display'),

      btnRefactor: document.getElementById('btn-refactor'),
      bugCounter: document.getElementById('bug-counter'),
      techDebtMeter: document.getElementById('tech-debt-meter'),
      techDebtFill: document.getElementById('tech-debt-fill'),
      eventLog: document.getElementById('event-log'),
      rightPanel: document.getElementById('right-panel'),
      boardroomList: document.getElementById('boardroom-list'),
      crashOverlay: document.getElementById('crash-overlay'),
      rebootButton: document.getElementById('reboot-button'),
      crashCountdown: document.getElementById('crash-countdown'),

      modal: document.getElementById('modal-overlay'),
      modalTitle: document.getElementById('modal-title'),
      modalBody: document.getElementById('modal-body'),
      modalClose: document.getElementById('modal-close'),

      toastContainer: document.getElementById('toast-container'),
      achievementPopup: document.getElementById('achievement-popup'),
      effectsBar: document.getElementById('effects-bar'),
      goldenData: document.getElementById('golden-data'),
      bugReport: document.getElementById('bug-report'),
      saveIndicator: document.getElementById('save-indicator'),
    };
  }

  function updateBuyButtons(amount) {
    if (!elements.buyBtns) return;

    for (const button of elements.buyBtns) {
      const buttonAmount = parseInt(button.dataset.amount, 10);
      button.classList.toggle('active', buttonAmount === amount);
    }
  }

  function showModal(title, content) {
    if (!elements.modalTitle || !elements.modalBody || !elements.modal) {
      cacheElements();
    }

    elements.modalTitle.textContent = title;
    elements.modalBody.innerHTML = content;
    elements.modal.classList.add('active');
  }

  function closeModal() {
    if (!elements.modal) return;
    elements.modal.classList.remove('active');
  }

  function showStatsModal() {
    const state = gameApi?.getState?.();
    if (!state) return;
    const modal = createStatsModal(state, {
      calculateClickValue: () => gameApi?.calculateClickValue?.() || 1,
    });
    showModal(modal.title, modal.html);
  }

  function showSettingsModal() {
    const modal = createSettingsModal();
    showModal(modal.title, modal.html);
  }

  function showPrestigeModal() {
    const preview = gameApi?.getInnovationPointsPreview?.() || 0;
    const modal = createPrestigeModal(preview);
    showModal(modal.title, modal.html);
  }

  function switchTab(tab) {
    for (const button of document.querySelectorAll('.tab-btn')) {
      button.classList.remove('active');
    }

    for (const panel of document.querySelectorAll('.tab-content')) {
      panel.classList.remove('active');
    }

    document.getElementById(`tab-${tab}`)?.classList.add('active');
    document.getElementById(`panel-${tab}`)?.classList.add('active');
  }

  function renderAll(state) {
    renderBuildings(state);
    renderUpgrades(state);
    renderAchievements(state);
    renderPrestigeButton(state);
    renderActiveEffects(state);
    renderDebtPanel(state);
    renderCrashOverlay(state);
    renderEventLog(state);
    renderBoardroom(state);
    updateAllText();
    update(state);
  }

  function update(state) {
    if (elements.dataCounter) {
      elements.dataCounter.textContent = Utils.formatNumber(state.dataPoints);
    }

    if (elements.dpsDisplay) {
      elements.dpsDisplay.textContent = `${Utils.formatDps(state.dps)} ${Lang.t('per_second')}`;
    }

    if (elements.clickPowerDisplay) {
      const clickValue = gameApi?.calculateClickValue?.() || 1;
      elements.clickPowerDisplay.textContent = `${Utils.formatDps(clickValue)} ${Lang.t('click_power')}`;
    }

    if (elements.innovationDisplay) {
      const visible = state.totalInnovationEarned > 0 || state.innovationPoints > 0;
      elements.innovationDisplay.style.display = visible ? 'flex' : 'none';
      if (visible) {
        elements.innovationDisplay.textContent = `${INNOVATION_ICON} ${state.innovationPoints}`;
      }
    }

    updateBuildingAffordability(state);
    updateUpgradeAffordability(state);
    renderActiveEffects(state);
    renderDebtPanel(state);
    renderCrashOverlay(state);

    const previewPoints = gameApi?.getInnovationPointsPreview?.() || 0;
    if (elements.btnPrestige) {
      if (previewPoints > 0) {
        elements.btnPrestige.classList.add('has-points');
        elements.btnPrestige.title = `+${previewPoints} ${Lang.t('innovation_points')}`;
      } else {
        elements.btnPrestige.classList.remove('has-points');
      }
    }
  }

  function renderBuildings(state) {
    renderBuildingsPanel(state, elements, {
      getBuildingDiscount: () => gameApi?.getBuildingDiscount?.() || 1,
    });
  }

  function updateBuildingAffordability(state) {
    updateBuildingAffordabilityPanel(state, elements, {
      getBuildingDiscount: () => gameApi?.getBuildingDiscount?.() || 1,
    });
  }

  function renderUpgrades(state) {
    renderUpgradesBar(state, elements);
  }

  function updateUpgradeAffordability(state) {
    updateUpgradeAffordabilityPanel(state, elements);
  }

  function renderAchievements(state) {
    renderAchievementsPanel(state, elements);
  }

  function renderActiveEffects(state) {
    renderActiveEffectsBar(state, elements.effectsBar);
  }

  function renderDebtPanel(state) {
    if (!elements.bugCounter || !elements.techDebtMeter || !elements.techDebtFill) return;

    const bugs = Math.floor(state.bugs || 0);
    const efficiency = Math.max(0, Math.min(1, Number(state.efficiency ?? 1)));
    const debtPercent = 100 - (efficiency * 100);
    const refactorCost = gameApi?.getRefactorCost?.() || 0;

    elements.bugCounter.textContent = `${Lang.t('bugs')}: ${Utils.formatNumber(bugs)} | ${Lang.t('efficiency')}: ${(efficiency * 100).toFixed(1)}%`;
    elements.techDebtFill.style.width = `${Math.max(0, Math.min(100, debtPercent))}%`;

    elements.techDebtMeter.classList.remove('debt-green', 'debt-yellow', 'debt-red', 'debt-critical');
    if (debtPercent >= 90) {
      elements.techDebtMeter.classList.add('debt-critical');
    } else if (debtPercent >= 70) {
      elements.techDebtMeter.classList.add('debt-red');
    } else if (debtPercent >= 40) {
      elements.techDebtMeter.classList.add('debt-yellow');
    } else {
      elements.techDebtMeter.classList.add('debt-green');
    }

    if (elements.btnRefactor) {
      elements.btnRefactor.textContent = `${Lang.t('refactor')} (${Utils.formatNumber(refactorCost)})`;
      elements.btnRefactor.disabled = !((state.dataPoints || 0) >= refactorCost && (state.bugs || 0) > 0 && (state.crash?.active !== true));
    }
  }

  function renderCrashOverlay(state) {
    if (!elements.crashOverlay) return;
    const active = Boolean(state.crash?.active);
    elements.crashOverlay.classList.toggle('active', active);

    if (active && elements.crashCountdown) {
      const remainingMs = Math.max(0, Number(state.crash.endsAt || 0) - Date.now());
      elements.crashCountdown.textContent = `${(remainingMs / 1000).toFixed(1)}s`;
    } else if (elements.crashCountdown) {
      elements.crashCountdown.textContent = '0.0s';
    }
  }

  function renderEventLog(state) {
    if (!elements.eventLog) return;
    const logs = state.eventLog || [];

    if (logs.length === 0) {
      elements.eventLog.innerHTML = `<li class="event-log-empty">${Lang.getLanguage() === 'en' ? 'No events yet' : 'Sin eventos aun'}</li>`;
      return;
    }

    elements.eventLog.innerHTML = logs.map((entry) => {
      const date = new Date(entry.timestamp || Date.now());
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      const levelClass = `event-${entry.level || 'info'}`;
      return `<li class="event-log-item ${levelClass}">[${hh}:${mm}] ${entry.message}</li>`;
    }).join('');
  }

  function renderBoardroom(state) {
    renderBoardroomPanel(state, elements);
  }

  function renderPrestigeButton(state) {
    const canSee = state.stats.totalDataAllTime >= 1e9 || state.stats.timesPrestiged > 0;
    if (elements.btnPrestige) {
      elements.btnPrestige.style.display = canSee ? 'flex' : 'none';
    }
  }

  function showAchievement(achievement) {
    feedback?.showAchievement(achievement);
  }

  function showGoldenData(onClick) {
    feedback?.showGoldenData(onClick);
  }

  function showBugReport(onFix) {
    feedback?.showBugReport(onFix);
  }

  function showOfflineModal(dataEarned, secondsAway) {
    feedback?.showOfflineModal(dataEarned, secondsAway);
  }

  function showPrestigeAnimation() {
    feedback?.showPrestigeAnimation();
  }

  function animateClick() {
    feedback?.animateClick();
  }

  function createParticle(x, y, text, color) {
    Utils.createParticle(x, y, text, color);
  }

  function showToast(message, type, duration) {
    Utils.showToast(message, type, duration);
  }

  function showSaveIndicator() {
    feedback?.showSaveIndicator();
  }

  function updateAllText() {
    const title = document.getElementById('game-title');
    if (title) title.textContent = Lang.t('game_title');

    const subtitle = document.getElementById('game-subtitle');
    if (subtitle) subtitle.textContent = Lang.t('game_subtitle');

    const buildingsTab = document.getElementById('tab-buildings');
    if (buildingsTab) buildingsTab.textContent = Lang.t('buildings');

    const achievementsTab = document.getElementById('tab-achievements');
    if (achievementsTab) achievementsTab.textContent = Lang.t('achievements');

    const eventLogTitle = document.getElementById('event-log-title');
    if (eventLogTitle) eventLogTitle.textContent = Lang.t('event_log');

    const boardroomTitle = document.getElementById('boardroom-title');
    if (boardroomTitle) boardroomTitle.textContent = Lang.t('boardroom');

    const crashTitle = document.getElementById('crash-title');
    if (crashTitle) crashTitle.textContent = Lang.t('crash_active');

    const rebootButton = document.getElementById('reboot-button');
    if (rebootButton) rebootButton.textContent = Lang.t('reboot');
  }

  return {
    init,
    setGameApi,
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

export const init = UI.init;
export const setGameApi = UI.setGameApi;
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
