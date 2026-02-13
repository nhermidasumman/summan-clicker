import * as Upgrades from '../../content/upgrades.js';
import * as Utils from '../../infra/number-formatters.js';

let tooltipElement = null;
let tooltipTimeout = null;
let overHandler = null;
let outHandler = null;

function getOrCreateTooltip() {
  if (!tooltipElement) {
    tooltipElement = document.createElement('div');
    tooltipElement.className = 'upgrade-tooltip';
    document.body.appendChild(tooltipElement);
  }
  return tooltipElement;
}

function showTooltipFor(tile) {
  const text = tile.getAttribute('data-tooltip');
  if (!text) return;

  const tooltip = getOrCreateTooltip();
  tooltip.textContent = text;
  tooltip.classList.add('visible');

  const rect = tile.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
  let top = rect.top - tooltipRect.height - 8;

  if (left < 4) left = 4;
  if (left + tooltipRect.width > window.innerWidth - 4) {
    left = window.innerWidth - tooltipRect.width - 4;
  }
  if (top < 4) top = rect.bottom + 8;

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

function hideTooltip() {
  clearTimeout(tooltipTimeout);
  if (tooltipElement) tooltipElement.classList.remove('visible');
}

function bindUpgradeTooltips(upgradesList) {
  if (!upgradesList) return;

  if (overHandler) upgradesList.removeEventListener('mouseover', overHandler);
  if (outHandler) upgradesList.removeEventListener('mouseout', outHandler);

  overHandler = (event) => {
    const tile = event.target.closest('.upgrade-tile');
    if (!tile) return;
    clearTimeout(tooltipTimeout);
    tooltipTimeout = setTimeout(() => showTooltipFor(tile), 100);
  };

  outHandler = (event) => {
    const tile = event.target.closest('.upgrade-tile');
    if (!tile) return;
    const related = event.relatedTarget;
    if (related && tile.contains(related)) return;
    hideTooltip();
  };

  upgradesList.addEventListener('mouseover', overHandler);
  upgradesList.addEventListener('mouseout', outHandler);
}

function escapeAttributeValue(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function renderUpgradesBar(state, elements) {
  if (!elements?.upgradesList) return;

  const available = Upgrades.getAvailable(state).sort((a, b) => a.cost - b.cost);
  const container = document.getElementById('upgrades-container');
  const bar = document.getElementById('upgrades-bar') || container;
  const target = container || bar;

  if (available.length === 0) {
    target.style.display = 'none';
    elements.upgradesList.innerHTML = '';
    return;
  }

  target.style.display = 'block';

  let html = '';
  for (const upgrade of available) {
    const canAfford = state.dataPoints >= upgrade.cost;
    const tooltip = `${Upgrades.getName(upgrade)}: ${Upgrades.getDesc(upgrade)} - Cost: ${Utils.formatNumber(upgrade.cost)}`;

    html += `
      <div class="upgrade-tile ${canAfford ? 'affordable' : 'locked'}"
           data-upgrade="${upgrade.id}"
           data-action="buy-upgrade"
           data-tooltip="${escapeAttributeValue(tooltip)}">
        <div class="upgrade-tile-icon">${upgrade.icon}</div>
        <div class="upgrade-tile-cost">${Utils.formatNumber(upgrade.cost)}</div>
      </div>
    `;
  }

  elements.upgradesList.innerHTML = html;
  bindUpgradeTooltips(elements.upgradesList);
}

export function updateUpgradeAffordability(state, elements) {
  const list = elements?.upgradesList || document.getElementById('upgrades-list');
  if (!list) return;

  for (const item of list.querySelectorAll('.upgrade-tile')) {
    const id = item.dataset.upgrade;
    const upgrade = Upgrades.getById(id);
    if (!upgrade) continue;

    const canAfford = state.dataPoints >= upgrade.cost;
    item.classList.toggle('affordable', canAfford);
    item.classList.toggle('locked', !canAfford);
  }
}
