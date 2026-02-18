/* ==========================================================================
   Summan Data Clicker - Prestige / Boardroom System
   ========================================================================== */

import * as Lang from './i18n/index.js';
import { stockOptionsFromLifetimeLoc } from '../infra/formulas.js';

const PRESTIGE_UPGRADES = Object.freeze([
  {
    id: 'agile_coach',
    cost: 75,
    icon: '&#x1F9D1;&#x200D;&#x1F4BC;',
    nameEs: 'Agile Coach',
    nameEn: 'Agile Coach',
    descEs: 'Reduce duración de crash en 5%.',
    descEn: 'Reduces crash duration by 5%.',
    effect: { type: 'crash_duration_mult', value: 0.95 },
  },
  {
    id: 'legacy_codebase',
    cost: 120,
    icon: '&#x1F4DA;',
    nameEs: 'Legacy Codebase',
    nameEn: 'Legacy Codebase',
    descEs: 'Cada run inicia con 10 Internos.',
    descEn: 'Each run starts with 10 Interns.',
    effect: { type: 'start_building_bonus', buildingId: 'intern', value: 10 },
  },
  {
    id: 'golden_handcuffs',
    cost: 180,
    icon: '&#x1F4BC;',
    nameEs: 'Golden Handcuffs',
    nameEn: 'Golden Handcuffs',
    descEs: 'Conserva Seniors en prestigio.',
    descEn: 'Keeps Senior Devs through prestige.',
    effect: { type: 'preserve_building', buildingId: 'senior', value: true },
  },
  {
    id: 'tax_evasion',
    cost: 220,
    icon: '&#x1F4B8;',
    nameEs: 'Tax Evasion',
    nameEn: 'Tax Evasion',
    descEs: 'Todos los edificios cuestan 10% menos.',
    descEn: 'All buildings cost 10% less.',
    effect: { type: 'building_discount', value: 0.9 },
  },
  {
    id: 'boardroom_incentive',
    cost: 140,
    icon: '&#x2728;',
    nameEs: 'Boardroom Incentive',
    nameEn: 'Boardroom Incentive',
    descEs: '+20% producción global permanente.',
    descEn: '+20% permanent global production.',
    effect: { type: 'production_mult', value: 1.2 },
  },
  {
    id: 'midas',
    cost: 90,
    icon: '&#x1F4B0;',
    nameEs: 'Midas Touch',
    nameEn: 'Midas Touch',
    descEs: 'Eventos dorados dan x2 recompensa.',
    descEn: 'Golden events give x2 reward.',
    effect: { type: 'golden_value', value: 2 },
  },
  {
    id: 'night_ops',
    cost: 110,
    icon: '&#x1F319;',
    nameEs: 'Night Ops',
    nameEn: 'Night Ops',
    descEs: 'Progreso offline al 75%.',
    descEn: 'Offline progress at 75%.',
    effect: { type: 'offline_rate', value: 0.75 },
  },
]);

function calculateInnovationPoints(totalLifetimeData) {
  return Math.max(0, stockOptionsFromLifetimeLoc(totalLifetimeData || 0));
}

function getBaseMultiplier(innovationPoints) {
  return 1 + ((Number(innovationPoints || 0)) * 0.01);
}

function dataForNextPoint(currentPoints) {
  const next = Math.max(0, Number(currentPoints || 0)) + 1;
  // Inversión de 150*cuberoot(x/1e9): x = ((points/150)^3)*1e9
  return Math.floor(((next / 150) ** 3) * 1e9);
}

function getUpgrades() {
  return PRESTIGE_UPGRADES;
}

function getUpgradeById(id) {
  return PRESTIGE_UPGRADES.find((upgrade) => upgrade.id === id);
}

function getName(upgrade) {
  return Lang.getLanguage() === 'en' ? (upgrade.nameEn || upgrade.nameEs) : upgrade.nameEs;
}

function getDesc(upgrade) {
  return Lang.getLanguage() === 'en' ? (upgrade.descEn || upgrade.descEs) : upgrade.descEs;
}

function getAvailable(purchasedIds) {
  return PRESTIGE_UPGRADES.filter((upgrade) => !purchasedIds.includes(upgrade.id));
}

function getAggregatedEffects(purchasedIds) {
  const effects = {
    startBonus: 0,
    clickMult: 1,
    productionMult: 1,
    goldenFrequency: 1,
    goldenValue: 1,
    buildingDiscount: 1,
    offlineRate: 0.5,
    coffeeMult: 7,
    crashDurationMult: 1,
    startBuildings: {},
    preservedBuildings: {},
  };

  for (const id of purchasedIds || []) {
    const upgrade = getUpgradeById(id);
    if (!upgrade) continue;

    const effect = upgrade.effect || {};
    switch (effect.type) {
      case 'start_bonus':
        effects.startBonus = Math.max(effects.startBonus, effect.value || 0);
        break;
      case 'click_mult':
        effects.clickMult *= effect.value || 1;
        break;
      case 'production_mult':
        effects.productionMult *= effect.value || 1;
        break;
      case 'golden_frequency':
        effects.goldenFrequency *= (1 - (effect.value || 0));
        break;
      case 'golden_value':
        effects.goldenValue *= effect.value || 1;
        break;
      case 'building_discount':
        effects.buildingDiscount *= effect.value || 1;
        break;
      case 'offline_rate':
        effects.offlineRate = Math.max(effects.offlineRate, effect.value || 0);
        break;
      case 'coffee_mult':
        effects.coffeeMult = Math.max(effects.coffeeMult, effect.value || 0);
        break;
      case 'crash_duration_mult':
        effects.crashDurationMult *= effect.value || 1;
        break;
      case 'start_building_bonus': {
        const current = effects.startBuildings[effect.buildingId] || 0;
        effects.startBuildings[effect.buildingId] = current + (effect.value || 0);
        break;
      }
      case 'preserve_building':
        effects.preservedBuildings[effect.buildingId] = true;
        break;
      default:
        break;
    }
  }

  return effects;
}

const Prestige = {
  calculateInnovationPoints,
  getBaseMultiplier,
  dataForNextPoint,
  getUpgrades,
  getUpgradeById,
  getName,
  getDesc,
  getAvailable,
  getAggregatedEffects,
};

window.Prestige = Prestige;

export {
  calculateInnovationPoints,
  getBaseMultiplier,
  dataForNextPoint,
  getUpgrades,
  getUpgradeById,
  getName,
  getDesc,
  getAvailable,
  getAggregatedEffects,
};
export default Prestige;

