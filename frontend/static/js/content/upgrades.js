/* ==========================================================================
   Summan Data Clicker - Upgrade Definitions
   ========================================================================== */

import * as Lang from './i18n/index.js';
import * as Buildings from './buildings.js';
import { upgradeCostFromBuildingCost } from '../infra/formulas.js';

function buildingUpgradeCost(buildingId, owned = 10, multiplier = 10) {
  const building = Buildings.getById(buildingId);
  if (!building) return 1000;
  const nextCost = building.baseCost * Math.pow(building.growthRate, owned);
  return upgradeCostFromBuildingCost(nextCost, multiplier);
}

const UPGRADES = Object.freeze([
  {
    id: 'click_keyboard',
    category: 'click',
    icon: '&#x2328;',
    nameEs: 'Teclado Mecánico',
    nameEn: 'Mechanical Keyboard',
    descEs: 'Clicks x2.',
    descEn: 'Clicks x2.',
    cost: 500,
    effect: { type: 'click_mult', value: 2 },
    requirement: { type: 'building_count', target: 'intern', value: 10 },
  },
  {
    id: 'click_pairing',
    category: 'click',
    icon: '&#x1F5B1;',
    nameEs: 'Atajos de IDE',
    nameEn: 'IDE Shortcuts',
    descEs: 'Cada click agrega +1% de DPS actual.',
    descEn: 'Each click adds +1% of current DPS.',
    cost: 4000,
    effect: { type: 'click_dps_percent', value: 0.01 },
    requirement: { type: 'total_data', value: 2500 },
  },
  {
    id: 'intern_x2',
    category: 'efficiency',
    icon: '&#x1F4CB;',
    nameEs: 'Cafeína Intravenosa',
    nameEn: 'Intravenous Caffeine',
    descEs: 'Internos x2.',
    descEn: 'Interns x2.',
    cost: buildingUpgradeCost('intern', 10),
    effect: { type: 'building_mult', target: 'intern', value: 2 },
    requirement: { type: 'building_count', target: 'intern', value: 10 },
  },
  {
    id: 'python_x2',
    category: 'efficiency',
    icon: '&#x1F4DA;',
    nameEs: 'Documentación',
    nameEn: 'Documentation',
    descEs: 'Scripts x2.',
    descEn: 'Scripts x2.',
    cost: buildingUpgradeCost('python_script', 10),
    effect: { type: 'building_mult', target: 'python_script', value: 2 },
    requirement: { type: 'building_count', target: 'python_script', value: 10 },
  },
  {
    id: 'junior_x2',
    category: 'efficiency',
    icon: '&#x1F4A1;',
    nameEs: 'StackOverflow Premium',
    nameEn: 'StackOverflow Premium',
    descEs: 'Juniors x2.',
    descEn: 'Juniors x2.',
    cost: buildingUpgradeCost('junior', 10),
    effect: { type: 'building_mult', target: 'junior', value: 2 },
    requirement: { type: 'building_count', target: 'junior', value: 25 },
  },
  {
    id: 'senior_x2',
    category: 'efficiency',
    icon: '&#x1F319;',
    nameEs: 'Dark Mode',
    nameEn: 'Dark Mode',
    descEs: 'Seniors x2.',
    descEn: 'Seniors x2.',
    cost: buildingUpgradeCost('senior', 10),
    effect: { type: 'building_mult', target: 'senior', value: 2 },
    requirement: { type: 'building_count', target: 'senior', value: 50 },
  },
  {
    id: 'server_farm_x2',
    category: 'efficiency',
    icon: '&#x1F3E2;',
    nameEs: 'Escalado Horizontal',
    nameEn: 'Horizontal Scale',
    descEs: 'Server Farm x2.',
    descEn: 'Server Farms x2.',
    cost: buildingUpgradeCost('server_farm', 10),
    effect: { type: 'building_mult', target: 'server_farm', value: 2 },
    requirement: { type: 'building_count', target: 'server_farm', value: 5 },
  },
  {
    id: 'ml_x2',
    category: 'efficiency',
    icon: '&#x1F52E;',
    nameEs: 'Ajuste de Hiperparámetros',
    nameEn: 'Hyperparameter Tuning',
    descEs: 'ML x2.',
    descEn: 'ML x2.',
    cost: buildingUpgradeCost('ml_algo', 8),
    effect: { type: 'building_mult', target: 'ml_algo', value: 2 },
    requirement: { type: 'building_count', target: 'ml_algo', value: 3 },
  },
  {
    id: 'pair_programming',
    category: 'synergy',
    icon: '&#x1F91D;',
    nameEs: 'Pair Programming',
    nameEn: 'Pair Programming',
    descEs: 'Juniors ganan +5% base por cada Senior.',
    descEn: 'Juniors gain +5% base per Senior.',
    cost: 50_000,
    effect: { type: 'synergy_per', target: 'junior', per: 'senior', value: 0.05 },
    requirement: { type: 'building_count', target: 'senior', value: 1 },
  },
  {
    id: 'devops_culture',
    category: 'synergy',
    icon: '&#x1F517;',
    nameEs: 'DevOps Culture',
    nameEn: 'DevOps Culture',
    descEs: 'Microservicios ganan +3% por cada DevOps.',
    descEn: 'Microservices gain +3% per DevOps.',
    cost: 750_000,
    effect: { type: 'synergy_per', target: 'microservice', per: 'devops', value: 0.03 },
    requirement: { type: 'building_count', target: 'devops', value: 1 },
  },
  {
    id: 'quality_gate',
    category: 'automation',
    icon: '&#x1F6E1;',
    nameEs: 'Unit Tests Automatizados',
    nameEn: 'Automated Unit Tests',
    descEs: 'Reduce generación global de bugs 10%.',
    descEn: 'Reduce global bug generation by 10%.',
    cost: 1_000_000,
    effect: { type: 'bug_mult', value: 0.9 },
    requirement: { type: 'total_data', value: 500_000 },
  },
  {
    id: 'refactor_masivo',
    category: 'automation',
    icon: '&#x1F9F9;',
    nameEs: 'Refactorización Masiva',
    nameEn: 'Massive Refactor',
    descEs: 'Reduce generación global de bugs 20%.',
    descEn: 'Reduce global bug generation by 20%.',
    cost: 10_000_000,
    effect: { type: 'bug_mult', value: 0.8 },
    requirement: { type: 'bugs', value: 100 },
  },
  {
    id: 'auto_linter',
    category: 'automation',
    icon: '&#x1F527;',
    nameEs: 'Auto Linter',
    nameEn: 'Auto Linter',
    descEs: 'Genera 1 click automático por segundo.',
    descEn: 'Generates 1 automatic click per second.',
    cost: 2_500_000,
    effect: { type: 'auto_click', value: 1 },
    requirement: { type: 'total_data', value: 1_000_000 },
  },
  {
    id: 'global_dark_mode',
    category: 'global',
    icon: '&#x1F576;',
    nameEs: 'Dark Mode Global',
    nameEn: 'Global Dark Mode',
    descEs: 'Toda la producción x1.1.',
    descEn: 'All production x1.1.',
    cost: 1_500_000,
    effect: { type: 'global_mult', value: 1.1 },
    requirement: { type: 'building_count', target: 'senior', value: 50 },
  },
  {
    id: 'global_ci',
    category: 'global',
    icon: '&#x1F680;',
    nameEs: 'CI/CD Blindado',
    nameEn: 'Hardened CI/CD',
    descEs: 'Toda la producción x1.25.',
    descEn: 'All production x1.25.',
    cost: 8_000_000,
    effect: { type: 'global_mult', value: 1.25 },
    requirement: { type: 'total_data', value: 2_000_000 },
  },
  {
    id: 'global_kpi',
    category: 'global',
    icon: '&#x1F4CA;',
    nameEs: 'KPIs Claros',
    nameEn: 'Clear KPIs',
    descEs: 'Toda la producción x1.5.',
    descEn: 'All production x1.5.',
    cost: 30_000_000,
    effect: { type: 'global_mult', value: 1.5 },
    requirement: { type: 'total_data', value: 10_000_000 },
  },
]);

function getAll() {
  return UPGRADES;
}

function getById(id) {
  return UPGRADES.find((upgrade) => upgrade.id === id);
}

function getName(upgrade) {
  return Lang.getLanguage() === 'en' ? (upgrade.nameEn || upgrade.nameEs) : upgrade.nameEs;
}

function getDesc(upgrade) {
  return Lang.getLanguage() === 'en' ? (upgrade.descEn || upgrade.descEs) : upgrade.descEs;
}

function isUnlocked(upgrade, gameState) {
  const req = upgrade.requirement;
  if (!req) return true;

  switch (req.type) {
    case 'building_count':
      return (gameState.buildings?.[req.target] || 0) >= req.value;
    case 'total_data':
      return (gameState.stats?.totalDataEarned || 0) >= req.value;
    case 'click_count':
      return (gameState.stats?.totalClicks || 0) >= req.value;
    case 'bugs':
      return (gameState.bugs || 0) >= req.value;
    case 'upgrade':
      return (gameState.upgrades || []).includes(req.target);
    default:
      return false;
  }
}

function getAvailable(gameState) {
  return UPGRADES.filter((upgrade) => {
    if ((gameState.upgrades || []).includes(upgrade.id)) return false;
    return isUnlocked(upgrade, gameState);
  });
}

const Upgrades = {
  getAll,
  getById,
  getName,
  getDesc,
  isUnlocked,
  getAvailable,
};

window.Upgrades = Upgrades;

export { getAll, getById, getName, getDesc, isUnlocked, getAvailable };
export default Upgrades;

