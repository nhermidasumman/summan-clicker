import * as Buildings from '../content/buildings.js';
import { SAVE_KEY, SAVE_VERSION } from './constants.js';
import { decodeEnvelope, migrateState } from './save-migrations.js';

const SAVE_ENCODING = 'json';

function getDefaultBuildings() {
  const buildings = {};
  for (const building of Buildings.getAll()) {
    buildings[building.id] = 0;
  }
  return buildings;
}

function createDefaultStats() {
  return {
    totalDataEarned: 0,
    totalDataAllTime: 0,
    totalClicks: 0,
    totalClicksAllTime: 0,
    totalBuildings: 0,
    timesPrestiged: 0,
    highestDps: 0,
    playTimeSeconds: 0,
    totalRefactors: 0,
    lastProductionAt: 0,
    events: {
      golden_clicked: 0,
      coffee_break: 0,
      bug_fixed: 0,
      deploy_friday: 0,
    },
  };
}

export function createDefaultState() {
  const now = Date.now();
  return {
    version: SAVE_VERSION,
    dataPoints: 0,
    buildings: getDefaultBuildings(),
    upgrades: [],
    achievements: [],
    buildingMultipliers: {},

    innovationPoints: 0,
    totalInnovationEarned: 0,
    prestigeUpgrades: [],

    stats: createDefaultStats(),

    lastSaveTime: now,
    lastTickTime: now,
    gameStartTime: now,

    settings: {
      language: 'es',
      buyAmount: 1,
      audioEnabled: true,
    },

    activeEffects: [],

    dps: 0,
    theoreticalDps: 0,
    autoClicksPerSecond: 0,

    bugs: 0,
    baseBugRate: 0,
    bugRate: 0,
    efficiency: 1,

    crash: {
      active: false,
      endsAt: 0,
      rebootClicks: 0,
      totalCrashes: 0,
    },

    eventLog: [],
    eventLogMaxSize: 50,
    pendingRandomEvent: null,

    tempProductionMultiplier: 1,
    tempProductionUntil: 0,
    tempBugRateMultiplier: 1,
    tempBugRateUntil: 0,
  };
}

function createEnvelope(payloadState) {
  return {
    version: SAVE_VERSION,
    encoding: SAVE_ENCODING,
    payload: JSON.stringify(payloadState),
  };
}

function parseSaveJson(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function normalizeStateForSave(state) {
  const migrated = migrateState(state, createDefaultState());
  migrated.lastSaveTime = Date.now();
  return migrated;
}

function serializeSave(state) {
  const normalized = normalizeStateForSave(state);
  return JSON.stringify(createEnvelope(normalized));
}

function deserializeSave(json) {
  const parsed = parseSaveJson(json);
  if (!parsed) return null;

  const envelope = decodeEnvelope(parsed);
  const migrated = migrateState(envelope.payload, createDefaultState());
  migrated.version = SAVE_VERSION;
  return migrated;
}

export function save(gameState) {
  try {
    localStorage.setItem(SAVE_KEY, serializeSave(gameState));
    return true;
  } catch (error) {
    console.error('Failed to save:', error);
    return false;
  }
}

export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return deserializeSave(raw);
  } catch (error) {
    console.error('Failed to load save:', error);
    return null;
  }
}

export function exportSave(gameState) {
  try {
    const json = serializeSave(gameState);
    return btoa(unescape(encodeURIComponent(json)));
  } catch (error) {
    console.error('Failed to export save:', error);
    return null;
  }
}

export function importSave(base64String) {
  try {
    const json = decodeURIComponent(escape(atob(String(base64String || '').trim())));
    return deserializeSave(json);
  } catch (error) {
    console.error('Failed to import save:', error);
    return null;
  }
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}

export function hasSave() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

const SaveSystem = {
  createDefaultState,
  save,
  load,
  exportSave,
  importSave,
  deleteSave,
  hasSave,
};

window.SaveSystem = SaveSystem;

export default SaveSystem;
