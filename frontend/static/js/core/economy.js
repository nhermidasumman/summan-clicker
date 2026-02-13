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

  for (const upId of state.upgrades || []) {
    const up = Upgrades.getById(upId);
    if (!up) continue;
    const eff = up.effect;
    if (eff.type === 'click_mult') clickMult *= eff.value;
    if (eff.type === 'click_add') clickAdd += eff.value;
    if (eff.type === 'click_dps_percent') dpsPercent += eff.value;
  }

  const prestigeEffects = Prestige.getAggregatedEffects(state.prestigeUpgrades || []);
  clickMult *= prestigeEffects.clickMult;

  for (const eff of state.activeEffects || []) {
    if (eff.type === 'click_mult') clickMult *= eff.multiplier;
  }

  return (baseClick + clickAdd) * clickMult + ((state.dps || 0) * dpsPercent);
}

export function recalculateDps(state) {
  if (!state) return 0;

  let totalDps = 0;
  const buildingMults = {};

  for (const def of Buildings.getAll()) {
    buildingMults[def.id] = 1;
  }

  for (const upId of state.upgrades || []) {
    const up = Upgrades.getById(upId);
    if (!up) continue;
    const eff = up.effect;

    if (eff.type === 'building_mult' && eff.target) {
      buildingMults[eff.target] = (buildingMults[eff.target] || 1) * eff.value;
    }

    if (eff.type === 'synergy' && eff.targets) {
      for (const target of eff.targets) {
        buildingMults[target] = (buildingMults[target] || 1) * eff.value;
      }
    }

    if (eff.type === 'synergy_per' && eff.target && eff.per) {
      const perCount = state.buildings?.[eff.per] || 0;
      if (perCount > 0) {
        buildingMults[eff.target] = (buildingMults[eff.target] || 1) * (1 + eff.value * perCount);
      }
    }
  }

  state.buildingMultipliers = buildingMults;

  for (const def of Buildings.getAll()) {
    const owned = state.buildings?.[def.id] || 0;
    if (owned > 0) {
      totalDps += def.baseDps * owned * (buildingMults[def.id] || 1);
    }
  }

  let globalMult = 1;
  for (const upId of state.upgrades || []) {
    const up = Upgrades.getById(upId);
    if (!up) continue;
    if (up.effect.type === 'global_mult') {
      globalMult *= up.effect.value;
    }
  }
  totalDps *= globalMult;

  totalDps *= Achievements.getTotalBonus(state.achievements || []);

  const prestigeEffects = Prestige.getAggregatedEffects(state.prestigeUpgrades || []);
  totalDps *= prestigeEffects.productionMult;

  const totalInnovMult = Prestige.getBaseMultiplier(state.totalInnovationEarned || 0);
  totalDps *= totalInnovMult;

  for (const eff of state.activeEffects || []) {
    if (eff.type === 'production_mult') {
      totalDps *= eff.multiplier;
    }
  }

  state.dps = totalDps;
  return totalDps;
}

export function getBuildingDiscount(state) {
  if (!state || !state.prestigeUpgrades) return 1;
  const effects = Prestige.getAggregatedEffects(state.prestigeUpgrades);
  return effects.buildingDiscount;
}
