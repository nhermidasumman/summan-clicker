import * as Achievements from '../content/achievements.js';
import * as Upgrades from '../content/upgrades.js';
import * as Prestige from '../content/prestige-upgrades.js';
import * as Buildings from '../content/buildings.js';

export function calculateClickValue(state) {
  if (!state) return 0;

  let baseClick = 1;
  let clickMult = 1;
  let clickAdd = 0;
  let dpsPercent = 0;

  for (const upgradeId of state.upgrades || []) {
    const upgrade = Upgrades.getById(upgradeId);
    if (!upgrade) continue;
    const effect = upgrade.effect || {};

    if (effect.type === 'click_mult') clickMult *= effect.value || 1;
    if (effect.type === 'click_add') clickAdd += effect.value || 0;
    if (effect.type === 'click_dps_percent') dpsPercent += effect.value || 0;
  }

  const prestigeEffects = Prestige.getAggregatedEffects(state.prestigeUpgrades || []);
  clickMult *= prestigeEffects.clickMult;

  for (const effect of state.activeEffects || []) {
    if (effect.type === 'click_mult') clickMult *= effect.multiplier;
  }

  return (baseClick + clickAdd) * clickMult + ((state.dps || 0) * dpsPercent);
}

export function recalculateDps(state) {
  if (!state) return 0;

  let theoreticalDps = 0;
  const buildingMultipliers = {};
  let autoClicksPerSecond = 0;
  let globalMult = 1;

  for (const building of Buildings.getAll()) {
    buildingMultipliers[building.id] = 1;
  }

  for (const upgradeId of state.upgrades || []) {
    const upgrade = Upgrades.getById(upgradeId);
    if (!upgrade) continue;
    const effect = upgrade.effect || {};

    if (effect.type === 'building_mult' && effect.target) {
      buildingMultipliers[effect.target] = (buildingMultipliers[effect.target] || 1) * (effect.value || 1);
    }

    if (effect.type === 'synergy' && effect.targets) {
      for (const target of effect.targets) {
        buildingMultipliers[target] = (buildingMultipliers[target] || 1) * (effect.value || 1);
      }
    }

    if (effect.type === 'synergy_per' && effect.target && effect.per) {
      const count = state.buildings?.[effect.per] || 0;
      if (count > 0) {
        buildingMultipliers[effect.target] = (buildingMultipliers[effect.target] || 1) * (1 + ((effect.value || 0) * count));
      }
    }

    if (effect.type === 'global_mult') globalMult *= (effect.value || 1);
    if (effect.type === 'auto_click') autoClicksPerSecond += (effect.value || 0);
  }

  for (const building of Buildings.getAll()) {
    const owned = state.buildings?.[building.id] || 0;
    if (owned <= 0) continue;
    theoreticalDps += building.baseDps * owned * (buildingMultipliers[building.id] || 1);
  }

  theoreticalDps *= globalMult;
  theoreticalDps *= Achievements.getTotalBonus(state.achievements || []);

  const prestigeEffects = Prestige.getAggregatedEffects(state.prestigeUpgrades || []);
  theoreticalDps *= prestigeEffects.productionMult;
  theoreticalDps *= Prestige.getBaseMultiplier(state.totalInnovationEarned || 0);
  theoreticalDps *= Number(state.tempProductionMultiplier || 1);

  for (const effect of state.activeEffects || []) {
    if (effect.type === 'production_mult') {
      theoreticalDps *= effect.multiplier;
    }
  }

  const efficiency = Math.max(0, Math.min(1, Number(state.efficiency ?? 1)));
  const crashActive = Boolean(state.crash?.active);
  const effectiveDps = crashActive ? 0 : (theoreticalDps * efficiency);

  state.buildingMultipliers = buildingMultipliers;
  state.autoClicksPerSecond = autoClicksPerSecond;
  state.theoreticalDps = theoreticalDps;
  state.dps = effectiveDps;
  return effectiveDps;
}

export function getBuildingDiscount(state) {
  if (!state || !state.prestigeUpgrades) return 1;
  const effects = Prestige.getAggregatedEffects(state.prestigeUpgrades);
  return effects.buildingDiscount;
}

