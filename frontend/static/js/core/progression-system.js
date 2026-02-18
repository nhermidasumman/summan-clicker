import * as Buildings from '../content/buildings.js';
import * as Upgrades from '../content/upgrades.js';
import * as Prestige from '../content/prestige-upgrades.js';
import * as Utils from '../infra/number-formatters.js';
import {
  bulkBuildingCost,
  maxAffordableBuildingCount,
} from '../infra/formulas.js';

function recalculateTotalBuildings(state) {
  state.stats.totalBuildings = Object.values(state.buildings || {}).reduce((sum, count) => sum + (Number(count) || 0), 0);
}

export function buyBuilding(state, buildingId, callbacks = {}) {
  const def = Buildings.getById(buildingId);
  if (!def || !state) return false;

  const discount = callbacks.getBuildingDiscount ? callbacks.getBuildingDiscount() : 1;
  const currentBaseCost = def.baseCost * discount;
  const owned = state.buildings[buildingId] || 0;
  const requestedAmount = state.settings.buyAmount || 1;

  const amount = requestedAmount === -1
    ? maxAffordableBuildingCount(currentBaseCost, owned, state.dataPoints, def.growthRate).count
    : Math.max(0, Number(requestedAmount || 0));

  if (amount <= 0) return false;

  const totalCost = bulkBuildingCost(currentBaseCost, owned, amount, def.growthRate);
  if (state.dataPoints < totalCost) return false;

  state.dataPoints -= totalCost;
  state.buildings[buildingId] = owned + amount;
  recalculateTotalBuildings(state);

  callbacks.onRecalculateDps?.();
  callbacks.onRenderBuildings?.();
  callbacks.onRenderUpgrades?.();
  return true;
}

export function buyUpgrade(state, upgradeId, callbacks = {}) {
  const upgrade = Upgrades.getById(upgradeId);
  if (!upgrade || !state) return false;
  if (state.upgrades.includes(upgradeId)) return false;
  if (state.dataPoints < upgrade.cost) return false;
  if (!Upgrades.isUnlocked(upgrade, state)) return false;

  state.dataPoints -= upgrade.cost;
  state.upgrades.push(upgradeId);

  callbacks.onRecalculateDps?.();
  callbacks.onRenderUpgrades?.();
  callbacks.onShowToast?.(Upgrades.getName(upgrade), 'success', 2000);
  return true;
}

export function buyPrestigeUpgrade(state, upgradeId, callbacks = {}) {
  const upgrade = Prestige.getUpgradeById(upgradeId);
  if (!upgrade || !state) return false;
  if (state.prestigeUpgrades.includes(upgradeId)) return false;
  if (state.innovationPoints < upgrade.cost) return false;

  state.innovationPoints -= upgrade.cost;
  state.prestigeUpgrades.push(upgradeId);

  callbacks.onRecalculateDps?.();
  callbacks.onRenderPrestige?.();
  callbacks.onShowToast?.(Prestige.getName(upgrade), 'success', 3000);
  return true;
}

function applyPrestigeStartBuildings(nextState, previousState, prestigeEffects) {
  const preserved = prestigeEffects.preservedBuildings || {};
  const startBuildings = prestigeEffects.startBuildings || {};

  for (const [buildingId, count] of Object.entries(startBuildings)) {
    nextState.buildings[buildingId] = (nextState.buildings[buildingId] || 0) + Math.max(0, Math.floor(Number(count || 0)));
  }

  for (const [buildingId, keep] of Object.entries(preserved)) {
    if (!keep) continue;
    const prevCount = previousState.buildings?.[buildingId] || 0;
    nextState.buildings[buildingId] = Math.max(nextState.buildings[buildingId] || 0, prevCount);
  }
}

export function performPrestige(state, callbacks = {}) {
  if (!state) return { ok: false, state };

  const totalAllTime = state.stats?.totalDataAllTime || 0;
  const totalEarned = state.totalInnovationEarned || 0;
  const totalByFormula = Prestige.calculateInnovationPoints(totalAllTime);
  const pointsToGain = Math.max(0, totalByFormula - totalEarned);

  if (pointsToGain <= 0) return { ok: false, state };

  const prestigeEffects = Prestige.getAggregatedEffects(state.prestigeUpgrades || []);
  const createDefaultState = callbacks.createDefaultState || (() => ({ ...state }));

  const nextState = createDefaultState();
  nextState.innovationPoints = (state.innovationPoints || 0) + pointsToGain;
  nextState.totalInnovationEarned = totalEarned + pointsToGain;
  nextState.prestigeUpgrades = [...(state.prestigeUpgrades || [])];
  nextState.achievements = [...(state.achievements || [])];
  nextState.settings = { ...nextState.settings, ...(state.settings || {}) };
  nextState.gameStartTime = state.gameStartTime || Date.now();

  nextState.stats.totalDataAllTime = totalAllTime;
  nextState.stats.totalClicksAllTime = state.stats?.totalClicksAllTime || state.stats?.totalClicks || 0;
  nextState.stats.timesPrestiged = (state.stats?.timesPrestiged || 0) + 1;

  applyPrestigeStartBuildings(nextState, state, prestigeEffects);
  recalculateTotalBuildings(nextState);

  if (prestigeEffects.startBonus > 0) {
    nextState.dataPoints = prestigeEffects.startBonus;
    nextState.stats.totalDataEarned = prestigeEffects.startBonus;
  }

  callbacks.onRecalculateDps?.(nextState);
  callbacks.onSave?.(nextState);
  callbacks.onRenderAll?.(nextState);
  callbacks.onPrestigeAnimation?.();
  callbacks.onShowToast?.(pointsToGain);

  return { ok: true, state: nextState, pointsToGain };
}

export function getInnovationPointsPreview(state) {
  if (!state) return 0;
  const totalByFormula = Prestige.calculateInnovationPoints(state.stats?.totalDataAllTime || 0);
  return Math.max(0, totalByFormula - (state.totalInnovationEarned || 0));
}

export function getBuildingPurchasePreview(state, buildingId, amount = 1, discount = 1) {
  const def = Buildings.getById(buildingId);
  if (!state || !def) return { amount: 0, cost: 0 };

  const owned = state.buildings?.[buildingId] || 0;
  const baseCost = def.baseCost * discount;

  if (amount === -1) {
    const max = maxAffordableBuildingCount(baseCost, owned, state.dataPoints || 0, def.growthRate);
    return { amount: max.count, cost: max.totalCost };
  }

  const safeAmount = Math.max(0, Math.floor(Number(amount || 0)));
  return {
    amount: safeAmount,
    cost: bulkBuildingCost(baseCost, owned, safeAmount, def.growthRate),
  };
}

export function getUpgradeNameForToast(id) {
  const upgrade = Upgrades.getById(id);
  return upgrade ? Upgrades.getName(upgrade) : id;
}

export function getPrestigeUpgradeNameForToast(id) {
  const upgrade = Prestige.getUpgradeById(id);
  return upgrade ? Prestige.getName(upgrade) : id;
}

export function formatPrestigeGain(points) {
  return Utils.formatNumber(points || 0);
}
