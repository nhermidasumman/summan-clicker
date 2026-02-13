export function createStatsModal(state) {
  const stats = state.stats;
  const totalBuildings = Object.values(state.buildings).reduce((sum, count) => sum + count, 0);
  const achievementCount = state.achievements ? state.achievements.length : 0;
  const upgradesBought = state.upgrades ? state.upgrades.length : 0;
  const upgradesTotal = window.Upgrades.getAll().length;
  const clickValue = window.__SUMMAN_GAME_API__.calculateClickValue();
  const elapsedSec = (Date.now() - (state.gameStartTime || stats.startDate || Date.now())) / 1000;

  const html = `
    <div class="stats-grid">
      <div class="stats-section">
        <h3 class="stats-section-title">&#x1F4CA; ${window.Lang.t('production')}</h3>
        <div class="stat-row"><span>&#x1F4C8; ${window.Lang.t('total_data')}</span><span>${window.Utils.formatNumber(stats.totalDataEarned)}</span></div>
        <div class="stat-row"><span>&#x26A1; ${window.Lang.t('data_per_second')}</span><span>${window.Utils.formatDps(state.dps)}/s</span></div>
        <div class="stat-row"><span>&#x1F5B1; ${window.Lang.t('data_per_click')}</span><span>${window.Utils.formatDps(clickValue)}</span></div>
        <div class="stat-row"><span>&#x1F3C6; ${window.Lang.t('highest_dps')}</span><span>${window.Utils.formatDps(stats.highestDps || 0)}/s</span></div>
      </div>
      <div class="stats-section">
        <h3 class="stats-section-title">&#x23F1; ${window.Lang.getLanguage() === 'es' ? 'Actividad' : 'Activity'}</h3>
        <div class="stat-row"><span>&#x1F446; ${window.Lang.t('total_clicks')}</span><span>${window.Utils.formatNumber(stats.totalClicks)}</span></div>
        <div class="stat-row"><span>&#x1F3E2; ${window.Lang.t('total_buildings')}</span><span>${totalBuildings}</span></div>
        <div class="stat-row"><span>&#x23F0; ${window.Lang.t('play_time')}</span><span>${window.Utils.formatTime(elapsedSec)}</span></div>
      </div>
      <div class="stats-section">
        <h3 class="stats-section-title">&#x1F680; ${window.Lang.getLanguage() === 'es' ? 'Progreso' : 'Progress'}</h3>
        <div class="stat-row"><span>&#x1F6E0; ${window.Lang.getLanguage() === 'es' ? 'Mejoras compradas' : 'Upgrades purchased'}</span><span>${upgradesBought} / ${upgradesTotal}</span></div>
        <div class="stat-row"><span>&#x1F3C5; ${window.Lang.t('achievements_unlocked')}</span><span>${achievementCount} / 28</span></div>
        <div class="stat-row"><span>&#x1F504; ${window.Lang.t('times_prestiged')}</span><span>${stats.timesPrestiged || 0}</span></div>
        <div class="stat-row"><span>&#x2728; ${window.Lang.t('innovation_earned')}</span><span>${state.totalInnovationEarned || 0}</span></div>
        <div class="stat-row"><span>&#x1F4A0; ${window.Lang.getLanguage() === 'es' ? 'Datos dorados recogidos' : 'Golden Data collected'}</span><span>${stats.events?.golden_clicked || 0}</span></div>
        <div class="stat-row"><span>&#x1F41B; ${window.Lang.getLanguage() === 'es' ? 'Bugs arreglados' : 'Bugs fixed'}</span><span>${stats.events?.bug_fixed || 0}</span></div>
      </div>
    </div>
  `;

  return { title: window.Lang.t('statistics'), html };
}
