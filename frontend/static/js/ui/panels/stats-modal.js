import * as Upgrades from '../../content/upgrades.js';
import * as Lang from '../../content/i18n/index.js';
import * as Utils from '../../infra/number-formatters.js';

const ACHIEVEMENTS_TOTAL = 28;

export function createStatsModal(state, options = {}) {
  const stats = state.stats;
  const totalBuildings = Object.values(state.buildings).reduce((sum, count) => sum + count, 0);
  const achievementCount = state.achievements ? state.achievements.length : 0;
  const upgradesBought = state.upgrades ? state.upgrades.length : 0;
  const upgradesTotal = Upgrades.getAll().length;
  const clickValue = options.calculateClickValue ? options.calculateClickValue() : 1;
  const elapsedSec = (Date.now() - (state.gameStartTime || stats.startDate || Date.now())) / 1000;
  const language = Lang.getLanguage();

  const html = `
    <div class="stats-grid">
      <div class="stats-section">
        <h3 class="stats-section-title">&#x1F4CA; ${Lang.t('production')}</h3>
        <div class="stat-row"><span>&#x1F4C8; ${Lang.t('total_data')}</span><span>${Utils.formatNumber(stats.totalDataEarned)}</span></div>
        <div class="stat-row"><span>&#x26A1; ${Lang.t('data_per_second')}</span><span>${Utils.formatDps(state.dps)}/s</span></div>
        <div class="stat-row"><span>&#x1F5B1; ${Lang.t('data_per_click')}</span><span>${Utils.formatDps(clickValue)}</span></div>
        <div class="stat-row"><span>&#x1F3C6; ${Lang.t('highest_dps')}</span><span>${Utils.formatDps(stats.highestDps || 0)}/s</span></div>
      </div>
      <div class="stats-section">
        <h3 class="stats-section-title">&#x23F1; ${language === 'es' ? 'Actividad' : 'Activity'}</h3>
        <div class="stat-row"><span>&#x1F446; ${Lang.t('total_clicks')}</span><span>${Utils.formatNumber(stats.totalClicks)}</span></div>
        <div class="stat-row"><span>&#x1F3E2; ${Lang.t('total_buildings')}</span><span>${totalBuildings}</span></div>
        <div class="stat-row"><span>&#x23F0; ${Lang.t('play_time')}</span><span>${Utils.formatTime(elapsedSec)}</span></div>
      </div>
      <div class="stats-section">
        <h3 class="stats-section-title">&#x1F680; ${language === 'es' ? 'Progreso' : 'Progress'}</h3>
        <div class="stat-row"><span>&#x1F6E0; ${language === 'es' ? 'Mejoras compradas' : 'Upgrades purchased'}</span><span>${upgradesBought} / ${upgradesTotal}</span></div>
        <div class="stat-row"><span>&#x1F3C5; ${Lang.t('achievements_unlocked')}</span><span>${achievementCount} / ${ACHIEVEMENTS_TOTAL}</span></div>
        <div class="stat-row"><span>&#x1F504; ${Lang.t('times_prestiged')}</span><span>${stats.timesPrestiged || 0}</span></div>
        <div class="stat-row"><span>&#x2728; ${Lang.t('innovation_earned')}</span><span>${state.totalInnovationEarned || 0}</span></div>
        <div class="stat-row"><span>&#x1F4A0; ${language === 'es' ? 'Datos dorados recogidos' : 'Golden Data collected'}</span><span>${stats.events?.golden_clicked || 0}</span></div>
        <div class="stat-row"><span>&#x1F41B; ${language === 'es' ? 'Bugs arreglados' : 'Bugs fixed'}</span><span>${stats.events?.bug_fixed || 0}</span></div>
      </div>
    </div>
  `;

  return { title: Lang.t('statistics'), html };
}
