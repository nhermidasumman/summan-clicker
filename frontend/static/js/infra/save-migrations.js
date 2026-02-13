import { SAVE_VERSION } from './constants.js';

export function migrateToV2(state) {
  if (!state || typeof state !== 'object') return null;
  const migrated = { ...state };
  if (!migrated.version || migrated.version < SAVE_VERSION) {
    migrated.version = SAVE_VERSION;
  }
  if (!migrated.stats) {
    migrated.stats = {
      totalDataEarned: 0,
      totalDataAllTime: 0,
      totalClicks: 0,
      totalClicksAllTime: 0,
      totalBuildings: 0,
      timesPrestiged: 0,
      highestDps: 0,
      playTimeSeconds: 0,
      events: {},
    };
  }
  if (!migrated.settings) {
    migrated.settings = { language: 'es', buyAmount: 1 };
  }
  return migrated;
}
