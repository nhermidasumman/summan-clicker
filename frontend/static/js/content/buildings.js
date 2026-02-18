/* ==========================================================================
   Summan Data Clicker - Building Definitions (Technical Debt Tycoon)
   ========================================================================== */

import { calculateBuildingCost } from '../infra/number-formatters.js';

const BUILDINGS = Object.freeze([
  {
    id: 'intern',
    nameKey: 'building_intern',
    descKey: 'building_intern_desc',
    baseCost: 15,
    baseDps: 0.5,
    growthRate: 1.15,
    bugRate: 0.05,
    icon: '&#x1F9D1;&#x200D;&#x1F393;',
    color: '#9ac31c',
    unlockAt: 0,
  },
  {
    id: 'python_script',
    nameKey: 'building_python_script',
    descKey: 'building_python_script_desc',
    baseCost: 100,
    baseDps: 4,
    growthRate: 1.15,
    bugRate: 0.01,
    icon: '&#x1F40D;',
    color: '#55B8B2',
    unlockAt: 60,
  },
  {
    id: 'junior',
    nameKey: 'building_junior',
    descKey: 'building_junior_desc',
    baseCost: 1100,
    baseDps: 22,
    growthRate: 1.15,
    bugRate: 0.08,
    icon: '&#x1F9D1;&#x200D;&#x1F4BB;',
    color: '#517BBD',
    unlockAt: 450,
  },
  {
    id: 'basement_server',
    nameKey: 'building_basement_server',
    descKey: 'building_basement_server_desc',
    baseCost: 12000,
    baseDps: 95,
    growthRate: 1.15,
    bugRate: 0.02,
    icon: '&#x1F5A5;',
    color: '#31ADBD',
    unlockAt: 5000,
  },
  {
    id: 'senior',
    nameKey: 'building_senior',
    descKey: 'building_senior_desc',
    baseCost: 130000,
    baseDps: 380,
    growthRate: 1.15,
    bugRate: -0.05,
    icon: '&#x1F468;&#x200D;&#x1F4BC;',
    color: '#919dcf',
    unlockAt: 45_000,
  },
  {
    id: 'microservice',
    nameKey: 'building_microservice',
    descKey: 'building_microservice_desc',
    baseCost: 1_400_000,
    baseDps: 1600,
    growthRate: 1.15,
    bugRate: 0.15,
    icon: '&#x2699;',
    color: '#45B495',
    unlockAt: 300_000,
  },
  {
    id: 'devops',
    nameKey: 'building_devops',
    descKey: 'building_devops_desc',
    baseCost: 20_000_000,
    baseDps: 7200,
    growthRate: 1.15,
    bugRate: -0.10,
    icon: '&#x1F504;',
    color: '#E7481D',
    unlockAt: 1_500_000,
  },
  {
    id: 'server_farm',
    nameKey: 'building_server_farm',
    descKey: 'building_server_farm_desc',
    baseCost: 330_000_000,
    baseDps: 35_000,
    growthRate: 1.15,
    bugRate: 0.05,
    icon: '&#x1F3E2;',
    color: '#483F91',
    unlockAt: 9_000_000,
  },
  {
    id: 'ml_algo',
    nameKey: 'building_ml_algo',
    descKey: 'building_ml_algo_desc',
    baseCost: 5_500_000_000,
    baseDps: 180_000,
    growthRate: 1.15,
    bugRate: 0.5,
    icon: '&#x1F916;',
    color: '#517BBD',
    unlockAt: 50_000_000,
  },
  {
    id: 'blockchain_node',
    nameKey: 'building_blockchain_node',
    descKey: 'building_blockchain_node_desc',
    baseCost: 75_000_000_000,
    baseDps: 950_000,
    growthRate: 1.15,
    bugRate: 0.2,
    icon: '&#x26D3;',
    color: '#F18A00',
    unlockAt: 250_000_000,
  },
  {
    id: 'quantum',
    nameKey: 'building_quantum',
    descKey: 'building_quantum_desc',
    baseCost: 1_000_000_000_000,
    baseDps: 6_500_000,
    growthRate: 1.15,
    bugRate: 0.12,
    randomBugRateRange: { min: -0.2, max: 0.4 },
    icon: '&#x269B;',
    color: '#56d0ff',
    unlockAt: 2_000_000_000,
  },
  {
    id: 'singularity',
    nameKey: 'building_singularity',
    descKey: 'building_singularity_desc',
    baseCost: 150_000_000_000_000,
    baseDps: 55_000_000,
    growthRate: 1.15,
    bugRate: 0,
    icon: '&#x1F31F;',
    color: '#f2d35c',
    unlockAt: 20_000_000_000,
  },
]);

function getAll() {
  return BUILDINGS;
}

function getById(id) {
  return BUILDINGS.find((building) => building.id === id);
}

function getCost(buildingId, owned) {
  const building = getById(buildingId);
  if (!building) return Number.POSITIVE_INFINITY;
  return calculateBuildingCost(building.baseCost, owned, building.growthRate);
}

function getDps(buildingId, owned, multiplier = 1) {
  const building = getById(buildingId);
  if (!building) return 0;
  return building.baseDps * owned * multiplier;
}

function getVisible(totalDataEarned) {
  const total = Number(totalDataEarned || 0);
  return BUILDINGS.filter((building) => total >= building.unlockAt);
}

const Buildings = {
  getAll,
  getById,
  getCost,
  getDps,
  getVisible,
};

window.Buildings = Buildings;

export { getAll, getById, getCost, getDps, getVisible };
export default Buildings;

