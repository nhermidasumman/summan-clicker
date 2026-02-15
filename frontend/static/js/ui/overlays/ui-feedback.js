import * as Achievements from '../../content/achievements.js';
import * as Lang from '../../content/i18n/index.js';
import * as Utils from '../../infra/number-formatters.js';
import { createClickSfx } from './click-sfx.js';

export function createUiFeedback({ elements, getState, renderAchievements, showModal }) {
  let achievementQueue = [];
  let isShowingAchievement = false;
  const clickSfx = createClickSfx();

  function playClickPress(pointerId) {
    clickSfx.playPress(pointerId);
  }

  function playClickRelease(pointerId) {
    clickSfx.playRelease(pointerId);
  }

  function showAchievement(achievement) {
    achievementQueue.push(achievement);
    processAchievementQueue();

    const currentState = getState?.();
    if (currentState) renderAchievements?.(currentState);
  }

  function processAchievementQueue() {
    if (isShowingAchievement || achievementQueue.length === 0) return;

    const popup = elements?.achievementPopup;
    if (!popup) return;

    const achievement = achievementQueue.shift();
    isShowingAchievement = true;

    const title = Lang.getLanguage() === 'en' ? 'Achievement!' : 'Logro!';
    popup.innerHTML = `
      <div class="ach-popup-icon">${achievement.icon}</div>
      <div class="ach-popup-info">
        <div class="ach-popup-title">${title}</div>
        <div class="ach-popup-name">${Achievements.getName(achievement)}</div>
      </div>
    `;

    popup.classList.add('visible');

    setTimeout(() => {
      popup.classList.remove('visible');
      setTimeout(() => {
        isShowingAchievement = false;
        processAchievementQueue();
      }, 400);
    }, 4000);
  }

  function showGoldenData(onClick) {
    const element = elements?.goldenData;
    const clickTarget = elements?.clickTarget;
    if (!element || !clickTarget) return;

    const container = clickTarget.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = Utils.randomRange(20, rect.width - 60);
    const y = Utils.randomRange(20, rect.height - 60);

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.classList.add('visible');
    element.innerHTML = '<div class="golden-data-orb"></div>';

    const handleClick = (event) => {
      event.stopPropagation();
      element.classList.remove('visible');
      element.removeEventListener('click', handleClick);
      onClick?.();
    };

    element.addEventListener('click', handleClick);

    setTimeout(() => {
      element.classList.remove('visible');
      element.removeEventListener('click', handleClick);
    }, 10000);
  }

  function showBugReport(onFix) {
    const element = elements?.bugReport;
    if (!element) return;

    element.classList.add('visible');
    element.innerHTML = `<span>&#x1F41B;</span><span>${Lang.t('event_bug_report_desc')}</span>`;

    const handleClick = () => {
      element.classList.remove('visible');
      element.removeEventListener('click', handleClick);
      onFix?.();
    };

    element.addEventListener('click', handleClick);

    setTimeout(() => {
      element.classList.remove('visible');
      element.removeEventListener('click', handleClick);
    }, 15000);
  }

  function showOfflineModal(dataEarned, secondsAway) {
    const html = `
      <div class="offline-progress">
        <div class="offline-icon">&#x1F319;</div>
        <p>${Lang.t('offline_earned')}</p>
        <div class="offline-amount">+${Utils.formatNumber(dataEarned)} Data Points</div>
        <p class="offline-time">(${Utils.formatTime(secondsAway)})</p>
      </div>
    `;

    showModal?.(Lang.t('offline_progress'), html);
  }

  function showPrestigeAnimation() {
    const overlay = document.createElement('div');
    overlay.className = 'prestige-flash';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 1500);
  }

  function animateClick() {
    const clickOrb = elements?.clickOrb;
    const clickTarget = elements?.clickTarget;
    if (!clickOrb) return;

    clickOrb.classList.add('clicked');
    setTimeout(() => clickOrb.classList.remove('clicked'), 150);

    if (!clickTarget) return;

    const ring = document.createElement('div');
    ring.className = 'click-ring';

    const orbRect = clickOrb.getBoundingClientRect();
    const targetRect = clickTarget.getBoundingClientRect();

    const x = (orbRect.left - targetRect.left) + (orbRect.width / 2);
    const y = (orbRect.top - targetRect.top) + (orbRect.height / 2);

    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;

    clickTarget.appendChild(ring);
    ring.addEventListener('animationend', () => ring.remove());
  }

  function showSaveIndicator() {
    const message = Lang.getLanguage() === 'en' ? 'Game saved' : 'Juego guardado';
    Utils.showToast(message, 'success', 2000);
  }

  return {
    showAchievement,
    showGoldenData,
    showBugReport,
    showOfflineModal,
    showPrestigeAnimation,
    playClickPress,
    playClickRelease,
    animateClick,
    showSaveIndicator,
  };
}
