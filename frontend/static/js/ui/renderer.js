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

const INNOVATION_ICON = '\u2728';

const UI = (() => {
  let elements = {};
  let currentTab = 'buildings';
  let activePanel = null;
  let feedback = null;
  let areEventsBound = false;

  function init(state) {
    cacheElements();

    if (!feedback) {
      feedback = createUiFeedback({
        elements,
        getState: () => window.__SUMMAN_GAME_API__.getState(),
        renderAchievements: (currentState) => renderAchievements(currentState),
        showModal,
      });
    }

    if (!areEventsBound) {
      bindDomEvents(elements, {
        onClickTarget: (x, y) => window.__SUMMAN_GAME_API__.handleClick(x, y),
        onSwitchTab: switchTab,
        onSetBuyAmount: (amount) => {
          updateBuyButtons(amount);
          window.__SUMMAN_GAME_API__.setBuyAmount(amount);
        },
        onShowStats: showStatsModal,
        onShowSettings: showSettingsModal,
        onShowPrestige: showPrestigeModal,
        onCloseModal: closeModal,
        onBuyBuilding: (buildingId) => window.__SUMMAN_GAME_API__.buyBuilding(buildingId),
        onBuyUpgrade: (upgradeId) => window.__SUMMAN_GAME_API__.buyUpgrade(upgradeId),
        onModalAction: (actionElement) => {
          handleModalAction(actionElement, {
            onCloseModal: closeModal,
            onRefreshSettings: showSettingsModal,
          });
        },
        onManualSave: () => window.__SUMMAN_GAME_API__.manualSave(),
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
    activePanel = 'modal';
  }

  function closeModal() {
    if (!elements.modal) return;
    elements.modal.classList.remove('active');
    activePanel = null;
  }

  function showStatsModal() {
    const state = window.__SUMMAN_GAME_API__.getState();
    const modal = createStatsModal(state);
    showModal(modal.title, modal.html);
  }

  function showSettingsModal() {
    const modal = createSettingsModal();
    showModal(modal.title, modal.html);
  }

  function showPrestigeModal() {
    const preview = window.__SUMMAN_GAME_API__.getInnovationPointsPreview();
    const modal = createPrestigeModal(preview);
    showModal(modal.title, modal.html);
  }

  function switchTab(tab) {
    currentTab = tab;

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
    updateAllText();
  }

  function update(state) {
    if (elements.dataCounter) {
      elements.dataCounter.textContent = window.Utils.formatNumber(state.dataPoints);
    }

    if (elements.dpsDisplay) {
      elements.dpsDisplay.textContent = `${window.Utils.formatDps(state.dps)} ${window.Lang.t('per_second')}`;
    }

    if (elements.clickPowerDisplay) {
      const clickValue = window.__SUMMAN_GAME_API__.calculateClickValue();
      elements.clickPowerDisplay.textContent = `${window.Utils.formatDps(clickValue)} ${window.Lang.t('click_power')}`;
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

    const previewPoints = window.__SUMMAN_GAME_API__.getInnovationPointsPreview();
    if (elements.btnPrestige) {
      if (previewPoints > 0) {
        elements.btnPrestige.classList.add('has-points');
        elements.btnPrestige.title = `+${previewPoints} ${window.Lang.t('innovation_points')}`;
      } else {
        elements.btnPrestige.classList.remove('has-points');
      }
    }
  }

  function renderBuildings(state) {
    renderBuildingsPanel(state, elements);
  }

  function updateBuildingAffordability(state) {
    updateBuildingAffordabilityPanel(state, elements);
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

  function renderPrestigeButton(state) {
    const canSee = state.stats.totalDataAllTime > 1e8 || state.stats.timesPrestiged > 0;
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
    window.Utils.createParticle(x, y, text, color);
  }

  function showToast(message, type, duration) {
    window.Utils.showToast(message, type, duration);
  }

  function showSaveIndicator() {
    feedback?.showSaveIndicator();
  }

  function updateAllText() {
    const title = document.getElementById('game-title');
    if (title) title.textContent = window.Lang.t('game_title');

    const subtitle = document.getElementById('game-subtitle');
    if (subtitle) subtitle.textContent = window.Lang.t('game_subtitle');

    const buildingsTab = document.getElementById('tab-buildings');
    if (buildingsTab) buildingsTab.innerHTML = `&#x1F3ED; ${window.Lang.t('buildings')}`;

    const achievementsTab = document.getElementById('tab-achievements');
    if (achievementsTab) achievementsTab.innerHTML = `&#x1F3C6; ${window.Lang.t('achievements')}`;
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
