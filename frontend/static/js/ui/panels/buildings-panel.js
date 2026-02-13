const COST_ICON = '&#x1F4A0;';
const LOCK_ICON = '&#x1F512;';
const DPS_ICON = '&#x26A1;';

function getScrollParent(element) {
  if (!element) return null;
  return element.closest('.tab-content');
}

export function renderBuildingsPanel(state, elements) {
  if (!elements?.buildingsList) return;

  try {
    const parent = getScrollParent(elements.buildingsList);
    const scrollTop = parent ? parent.scrollTop : 0;

    const visible = window.Buildings.getVisible(state.stats.totalDataEarned);
    let html = '';

    for (const def of visible) {
      const owned = state.buildings[def.id] || 0;
      const discount = window.__SUMMAN_GAME_API__.getBuildingDiscount
        ? window.__SUMMAN_GAME_API__.getBuildingDiscount()
        : 1;
      const currentPrice = def.baseCost * discount;
      const buyAmount = state.settings.buyAmount || 1;

      let countToBuy = 1;
      let cost = 0;

      if (buyAmount === -1) {
        const max = window.Utils.maxAffordable(currentPrice, owned, state.dataPoints, def.growthRate);
        if (max.count === 0) {
          cost = window.Utils.calculateBuildingCost(currentPrice, owned, def.growthRate);
          countToBuy = 1;
        } else {
          cost = max.totalCost;
          countToBuy = max.count;
        }
      } else {
        countToBuy = buyAmount;
        cost = window.Utils.calculateBulkCost(currentPrice, owned, countToBuy, def.growthRate);
      }

      const multiplier = state.buildingMultipliers?.[def.id] || 1;
      const dps = def.baseDps * multiplier;
      const totalDps = dps * owned;
      const canAfford = state.dataPoints >= cost;
      const amountDisplay = buyAmount !== 1 ? ` (x${countToBuy})` : '';

      html += `
        <div class="building-item ${canAfford ? 'affordable' : 'locked'}"
             data-building="${def.id}"
             data-action="buy-building"
             style="--building-color: ${def.color}">
          <div class="building-icon">${def.icon}</div>
          <div class="building-info">
            <div class="building-name">${window.Lang.t(def.nameKey)}</div>
            <div class="building-desc">${window.Lang.t(def.descKey)}</div>
            <div class="building-stats">
              <span class="building-dps">
                <span style="color: var(--text-muted); font-weight: normal;">${window.Lang.t('produce')}</span>
                <span style="color: var(--green-light)">${DPS_ICON} ${window.Utils.formatDps(dps)}/s</span>
              </span>
              <span class="building-total-dps">(${window.Utils.formatDps(totalDps)}/s total)</span>
            </div>
          </div>
          <div class="building-right">
            <div class="building-cost ${canAfford ? '' : 'too-expensive'}">
              ${COST_ICON} ${window.Utils.formatNumber(cost)}${amountDisplay}
            </div>
            <div class="building-owned">${owned}</div>
          </div>
        </div>
      `;
    }

    const allBuildings = window.Buildings.getAll();
    const nextLocked = allBuildings.find((building) => state.stats.totalDataEarned < building.unlockAt);
    if (nextLocked) {
      html += `
        <div class="building-item building-locked">
          <div class="building-icon">${LOCK_ICON}</div>
          <div class="building-info">
            <div class="building-name">${window.Lang.t('locked')}</div>
            <div class="building-desc">${window.Lang.t('total')}: ${window.Utils.formatNumber(nextLocked.unlockAt)} Data Points</div>
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

export function updateBuildingAffordability(state, elements) {
  if (!elements?.buildingsList) return;

  const items = elements.buildingsList.querySelectorAll('.building-item');
  for (const item of items) {
    const id = item.dataset.building;
    if (!id) continue;

    const def = window.Buildings.getById(id);
    if (!def) continue;

    const owned = state.buildings[id] || 0;
    const discount = window.__SUMMAN_GAME_API__.getBuildingDiscount
      ? window.__SUMMAN_GAME_API__.getBuildingDiscount()
      : 1;
    const currentPrice = def.baseCost * discount;
    const buyAmount = state.settings.buyAmount || 1;

    let cost = 0;
    if (buyAmount === -1) {
      const max = window.Utils.maxAffordable(currentPrice, owned, state.dataPoints, def.growthRate);
      cost = max.count === 0
        ? window.Utils.calculateBuildingCost(currentPrice, owned, def.growthRate)
        : max.totalCost;
    } else {
      cost = window.Utils.calculateBulkCost(currentPrice, owned, buyAmount, def.growthRate);
    }

    const canAfford = state.dataPoints >= cost;
    item.classList.toggle('affordable', canAfford);
    item.classList.toggle('locked', !canAfford);

    const costElement = item.querySelector('.building-cost');
    if (costElement) {
      costElement.classList.toggle('too-expensive', !canAfford);
    }
  }
}
