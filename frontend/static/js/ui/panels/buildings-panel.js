import * as Buildings from '../../content/buildings.js';
import * as Lang from '../../content/i18n/index.js';
import * as Utils from '../../infra/number-formatters.js';

const COST_ICON = '&#x1F4A0;';
const LOCK_ICON = '&#x1F512;';
const DPS_ICON = '&#x26A1;';

function getScrollParent(element) {
  if (!element) return null;
  return element.closest('.tab-content');
}

function calculateBuildingCostForBuyMode(state, def, owned, getBuildingDiscount) {
  const discount = getBuildingDiscount ? getBuildingDiscount() : 1;
  const currentPrice = def.baseCost * discount;
  const buyAmount = state.settings.buyAmount || 1;

  if (buyAmount === -1) {
    const max = Utils.maxAffordable(currentPrice, owned, state.dataPoints, def.growthRate);
    if (max.count === 0) {
      return {
        cost: Utils.calculateBuildingCost(currentPrice, owned, def.growthRate),
        countToBuy: 1,
      };
    }

    return {
      cost: max.totalCost,
      countToBuy: max.count,
    };
  }

  return {
    cost: Utils.calculateBulkCost(currentPrice, owned, buyAmount, def.growthRate),
    countToBuy: buyAmount,
  };
}

export function renderBuildingsPanel(state, elements, options = {}) {
  if (!elements?.buildingsList) return;

  try {
    const parent = getScrollParent(elements.buildingsList);
    const scrollTop = parent ? parent.scrollTop : 0;

    const getBuildingDiscount = options.getBuildingDiscount || (() => 1);
    const visibleBuildings = Buildings.getVisible(state.stats.totalDataEarned);
    let html = '';

    for (const def of visibleBuildings) {
      const owned = state.buildings[def.id] || 0;
      const priceInfo = calculateBuildingCostForBuyMode(state, def, owned, getBuildingDiscount);
      const cost = priceInfo.cost;
      const countToBuy = priceInfo.countToBuy;

      const multiplier = state.buildingMultipliers?.[def.id] || 1;
      const dps = def.baseDps * multiplier;
      const totalDps = dps * owned;
      const canAfford = state.dataPoints >= cost;
      const buyAmount = state.settings.buyAmount || 1;
      const amountDisplay = buyAmount !== 1 ? ` (x${countToBuy})` : '';

      html += `
        <div class="building-item ${canAfford ? 'affordable' : 'locked'}"
             data-building="${def.id}"
             data-action="buy-building"
             style="--building-color: ${def.color}">
          <div class="building-icon">${def.icon}</div>
          <div class="building-info">
            <div class="building-name">${Lang.t(def.nameKey)}</div>
            <div class="building-desc">${Lang.t(def.descKey)}</div>
            <div class="building-stats">
              <span class="building-dps">
                <span style="color: var(--text-muted); font-weight: normal;">${Lang.t('produce')}</span>
                <span style="color: var(--green-light)">${DPS_ICON} ${Utils.formatDps(dps)}/s</span>
              </span>
              <span class="building-total-dps">(${Utils.formatDps(totalDps)}/s total)</span>
            </div>
          </div>
          <div class="building-right">
            <div class="building-cost ${canAfford ? '' : 'too-expensive'}">
              ${COST_ICON} ${Utils.formatNumber(cost)}${amountDisplay}
            </div>
            <div class="building-owned">${owned}</div>
          </div>
        </div>
      `;
    }

    const nextLocked = Buildings.getAll().find((building) => state.stats.totalDataEarned < building.unlockAt);
    if (nextLocked) {
      html += `
        <div class="building-item building-locked">
          <div class="building-icon">${LOCK_ICON}</div>
          <div class="building-info">
            <div class="building-name">${Lang.t('locked')}</div>
            <div class="building-desc">${Lang.t('total')}: ${Utils.formatNumber(nextLocked.unlockAt)} Data Points</div>
          </div>
        </div>
      `;
    }

    elements.buildingsList.innerHTML = html;
    if (parent) parent.scrollTop = scrollTop;
  } catch (error) {
    console.error('Error rendering buildings:', error);
  }
}

export function updateBuildingAffordability(state, elements, options = {}) {
  if (!elements?.buildingsList) return;

  const getBuildingDiscount = options.getBuildingDiscount || (() => 1);
  const items = elements.buildingsList.querySelectorAll('.building-item');

  for (const item of items) {
    const id = item.dataset.building;
    if (!id) continue;

    const def = Buildings.getById(id);
    if (!def) continue;

    const owned = state.buildings[id] || 0;
    const cost = calculateBuildingCostForBuyMode(state, def, owned, getBuildingDiscount).cost;
    const canAfford = state.dataPoints >= cost;

    item.classList.toggle('affordable', canAfford);
    item.classList.toggle('locked', !canAfford);

    const costElement = item.querySelector('.building-cost');
    if (costElement) {
      costElement.classList.toggle('too-expensive', !canAfford);
    }
  }
}
