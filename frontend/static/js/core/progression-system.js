import * as Buildings from '../content/buildings.js';
import * as Upgrades from '../content/upgrades.js';
import * as Prestige from '../content/prestige-upgrades.js';
import * as Utils from '../infra/number-formatters.js';

export function buyBuilding(state, buildingId, callbacks = {}) {
  const def = Buildings.getById(buildingId);
  if (!def || !state) return false;

  const discount = callbacks.getBuildingDiscount ? callbacks.getBuildingDiscount() : 1;
  const owned = state.buildings[buildingId] || 0;
  const requestedAmount = state.settings.buyAmount || 1;
  const amount = requestedAmount === -1
    ? Utils.maxAffordable(def.baseCost * discount, owned, state.dataPoints, def.growthRate).count
    : requestedAmount;

  if (amount <= 0) return false;

  let totalCost = 0;
  for (let i = 0; i < amount; i += 1) {
    // Keep per-step rounding aligned with the original gameplay formula.
    totalCost += Utils.calculateBuildingCost(
      def.baseCost * discount,
      owned + i,
      def.growthRate,
    );
  }

  if (state.dataPoints < totalCost) return false;

  state.dataPoints -= totalCost;
  state.buildings[buildingId] = owned + amount;
  state.stats.totalBuildings = Object.values(state.buildings).reduce((sum, count) => sum + count, 0);

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

export function performPrestige(state, callbacks = {}) {
  if (!state) return { ok: false, state };

  const pointsToGain = Prestige.calculateInnovationPoints(state.stats.totalDataAllTime)
    - state.totalInnovationEarned;
  if (pointsToGain <= 0) return { ok: false, state };

  const persistent = {
    innovationPoints: state.innovationPoints + pointsToGain,
    totalInnovationEarned: state.totalInnovationEarned + pointsToGain,
    prestigeUpgrades: [...state.prestigeUpgrades],
    achievements: [...state.achievements],
    settings: { ...state.settings },
    gameStartTime: state.gameStartTime,
    stats: {
      ...state.stats,
      timesPrestiged: state.stats.timesPrestiged + 1,
      totalDataEarned: 0,
      totalClicks: 0,
      totalBuildings: 0,
      highestDps: 0,
      playTimeSeconds: 0,
    },
  };

  const nextState = callbacks.createDefaultState
    ? callbacks.createDefaultState()
    : { ...state };

  nextState.innovationPoints = persistent.innovationPoints;
  nextState.totalInnovationEarned = persistent.totalInnovationEarned;
  nextState.prestigeUpgrades = persistent.prestigeUpgrades;
  nextState.achievements = persistent.achievements;
  nextState.settings = persistent.settings;
  nextState.gameStartTime = persistent.gameStartTime;
  nextState.stats = persistent.stats;
  nextState.stats.totalDataAllTime = persistent.stats.totalDataAllTime;

  const effects = Prestige.getAggregatedEffects(nextState.prestigeUpgrades);
  nextState.dataPoints = effects.startBonus;
  nextState.stats.totalDataEarned = effects.startBonus;

  callbacks.onRecalculateDps?.(nextState);
  callbacks.onSave?.(nextState);
  callbacks.onRenderAll?.(nextState);
  callbacks.onPrestigeAnimation?.();
  callbacks.onShowToast?.(pointsToGain);

  return { ok: true, state: nextState, pointsToGain };
}

export function getInnovationPointsPreview(state) {
  if (!state) return 0;
  return Prestige.calculateInnovationPoints(state.stats.totalDataAllTime) - state.totalInnovationEarned;
}
