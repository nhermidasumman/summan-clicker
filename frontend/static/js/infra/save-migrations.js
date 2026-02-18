import * as Buildings from '../content/buildings.js';
import { SAVE_VERSION } from './constants.js';

const LEGACY_BUILDING_MAP = Object.freeze({
  laptop: 'python_script',
  teamlead: 'senior',
  platform: 'microservice',
  ai: 'ml_algo',
  cloud: 'server_farm',
});

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function decodeEnvelope(rawValue) {
  if (!rawValue || typeof rawValue !== 'object') {
    return {
      version: SAVE_VERSION,
      encoding: 'json',
      payload: {},
    };
  }

  if (Object.prototype.hasOwnProperty.call(rawValue, 'payload')) {
    let payload = rawValue.payload;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        payload = {};
      }
    }

    return {
      version: asNumber(rawValue.version, SAVE_VERSION),
      encoding: String(rawValue.encoding || 'json'),
      payload: payload && typeof payload === 'object' ? payload : {},
    };
  }

  // Legacy (pre-envelope) save format.
  return {
    version: asNumber(rawValue.version, SAVE_VERSION),
    encoding: 'json',
    payload: rawValue,
  };
}

function mergeBuildings(defaultBuildings, rawBuildings) {
  const merged = { ...defaultBuildings };
  if (!rawBuildings || typeof rawBuildings !== 'object') return merged;

  for (const [rawId, rawCount] of Object.entries(rawBuildings)) {
    const targetId = LEGACY_BUILDING_MAP[rawId] || rawId;
    if (!Object.prototype.hasOwnProperty.call(merged, targetId)) continue;
    merged[targetId] += Math.max(0, Math.floor(asNumber(rawCount, 0)));
  }

  return merged;
}

function ensureStats(defaultStats, rawStats) {
  const mergedStats = {
    ...defaultStats,
    ...(rawStats && typeof rawStats === 'object' ? rawStats : {}),
  };

  mergedStats.totalDataEarned = asNumber(mergedStats.totalDataEarned, 0);
  mergedStats.totalDataAllTime = asNumber(mergedStats.totalDataAllTime, 0);
  mergedStats.totalClicks = asNumber(mergedStats.totalClicks, 0);
  mergedStats.totalClicksAllTime = asNumber(mergedStats.totalClicksAllTime, mergedStats.totalClicks);
  mergedStats.totalBuildings = asNumber(mergedStats.totalBuildings, 0);
  mergedStats.timesPrestiged = asNumber(mergedStats.timesPrestiged, 0);
  mergedStats.highestDps = asNumber(mergedStats.highestDps, 0);
  mergedStats.playTimeSeconds = asNumber(mergedStats.playTimeSeconds, 0);
  mergedStats.totalRefactors = asNumber(mergedStats.totalRefactors, 0);
  mergedStats.lastProductionAt = asNumber(mergedStats.lastProductionAt, 0);
  mergedStats.events = {
    ...defaultStats.events,
    ...(mergedStats.events && typeof mergedStats.events === 'object' ? mergedStats.events : {}),
  };

  return mergedStats;
}

function normalizeEventLog(eventLog, maxLength = 50) {
  if (!Array.isArray(eventLog)) return [];
  return eventLog
    .filter((entry) => entry && typeof entry === 'object')
    .slice(0, maxLength)
    .map((entry) => ({
      id: entry.id || `${entry.type || 'event'}-${Date.now()}`,
      timestamp: asNumber(entry.timestamp, Date.now()),
      type: String(entry.type || 'event'),
      level: String(entry.level || 'info'),
      message: String(entry.message || ''),
    }));
}

function normalizeCrashState(defaultCrash, rawCrash) {
  const merged = {
    ...defaultCrash,
    ...(rawCrash && typeof rawCrash === 'object' ? rawCrash : {}),
  };
  merged.active = Boolean(merged.active);
  merged.endsAt = asNumber(merged.endsAt, 0);
  merged.rebootClicks = asNumber(merged.rebootClicks, 0);
  merged.totalCrashes = asNumber(merged.totalCrashes, 0);
  return merged;
}

export function migrateState(rawPayload, defaultState) {
  const defaults = deepClone(defaultState);
  const raw = rawPayload && typeof rawPayload === 'object' ? rawPayload : {};

  const migrated = {
    ...defaults,
    ...raw,
  };

  migrated.version = SAVE_VERSION;
  migrated.dataPoints = asNumber(raw.dataPoints, defaults.dataPoints);
  migrated.innovationPoints = asNumber(raw.innovationPoints, defaults.innovationPoints);
  migrated.totalInnovationEarned = asNumber(raw.totalInnovationEarned, defaults.totalInnovationEarned);

  migrated.upgrades = asArray(raw.upgrades);
  migrated.achievements = asArray(raw.achievements);
  migrated.prestigeUpgrades = asArray(raw.prestigeUpgrades);
  migrated.activeEffects = asArray(raw.activeEffects);

  migrated.buildings = mergeBuildings(defaults.buildings, raw.buildings);
  migrated.settings = {
    ...defaults.settings,
    ...(raw.settings && typeof raw.settings === 'object' ? raw.settings : {}),
  };
  migrated.settings.language = typeof migrated.settings.language === 'string' ? migrated.settings.language : defaults.settings.language;
  migrated.settings.buyAmount = [-1, 1, 10, 100].includes(Number(migrated.settings.buyAmount))
    ? Number(migrated.settings.buyAmount)
    : defaults.settings.buyAmount;

  migrated.stats = ensureStats(defaults.stats, raw.stats);
  migrated.stats.totalBuildings = Object.values(migrated.buildings).reduce((sum, count) => sum + count, 0);

  migrated.lastSaveTime = asNumber(raw.lastSaveTime, Date.now());
  migrated.lastTickTime = asNumber(raw.lastTickTime, Date.now());
  migrated.gameStartTime = asNumber(raw.gameStartTime, Date.now());

  migrated.dps = asNumber(raw.dps, 0);
  migrated.theoreticalDps = asNumber(raw.theoreticalDps, migrated.dps);
  migrated.bugs = Math.max(0, asNumber(raw.bugs, defaults.bugs));
  migrated.baseBugRate = asNumber(raw.baseBugRate, defaults.baseBugRate);
  migrated.bugRate = asNumber(raw.bugRate, defaults.bugRate);
  migrated.efficiency = Math.min(1, Math.max(0, asNumber(raw.efficiency, defaults.efficiency)));

  migrated.crash = normalizeCrashState(defaults.crash, raw.crash);
  migrated.pendingRandomEvent = raw.pendingRandomEvent && typeof raw.pendingRandomEvent === 'object'
    ? { ...raw.pendingRandomEvent }
    : null;

  migrated.eventLog = normalizeEventLog(raw.eventLog, defaults.eventLogMaxSize || 50);

  migrated.tempProductionMultiplier = asNumber(raw.tempProductionMultiplier, defaults.tempProductionMultiplier);
  migrated.tempProductionUntil = asNumber(raw.tempProductionUntil, defaults.tempProductionUntil);
  migrated.tempBugRateMultiplier = asNumber(raw.tempBugRateMultiplier, defaults.tempBugRateMultiplier);
  migrated.tempBugRateUntil = asNumber(raw.tempBugRateUntil, defaults.tempBugRateUntil);

  // Ensure all current buildings exist after migrations.
  for (const building of Buildings.getAll()) {
    if (!Object.prototype.hasOwnProperty.call(migrated.buildings, building.id)) {
      migrated.buildings[building.id] = 0;
    }
  }

  return migrated;
}
