import * as Prestige from '../../content/prestige-upgrades.js';
import * as Lang from '../../content/i18n/index.js';
import * as Utils from '../../infra/number-formatters.js';

export function renderBoardroomPanel(state, elements) {
  if (!elements?.boardroomList) return;

  const allUpgrades = Prestige.getUpgrades();
  const purchased = new Set(state.prestigeUpgrades || []);

  const html = allUpgrades.map((upgrade) => {
    const bought = purchased.has(upgrade.id);
    const canAfford = !bought && (state.innovationPoints || 0) >= upgrade.cost;
    const statusClass = bought ? 'boardroom-item bought' : (canAfford ? 'boardroom-item affordable' : 'boardroom-item locked');

    return `
      <div class="${statusClass}">
        <div class="boardroom-icon">${upgrade.icon || '&#x1F4BC;'}</div>
        <div class="boardroom-info">
          <div class="boardroom-name">${Prestige.getName(upgrade)}</div>
          <div class="boardroom-desc">${Prestige.getDesc(upgrade)}</div>
        </div>
        <div class="boardroom-right">
          <div class="boardroom-cost">${upgrade.cost}</div>
          <button class="boardroom-buy-btn" data-action="buy-prestige-upgrade" data-upgrade="${upgrade.id}" ${bought ? 'disabled' : ''}>
            ${bought ? Lang.t('unlocked') : Lang.t('buy')}
          </button>
        </div>
      </div>
    `;
  }).join('');

  elements.boardroomList.innerHTML = `
    <div class="boardroom-summary">
      <div class="boardroom-points">${Lang.t('innovation_points')}: ${Utils.formatNumber(state.innovationPoints || 0)}</div>
    </div>
    <div class="boardroom-items">${html}</div>
  `;
}

