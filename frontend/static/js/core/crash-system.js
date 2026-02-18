import { crashChanceFromBugs } from '../infra/formulas.js';

const BASE_CRASH_DURATION_MS = 10_000;
const REBOOT_REDUCTION_MS = 900;

function ensureCrashState(state) {
  if (!state.crash || typeof state.crash !== 'object') {
    state.crash = {
      active: false,
      endsAt: 0,
      rebootClicks: 0,
      totalCrashes: 0,
    };
  }
}

export function activateCrash(state, durationMs = BASE_CRASH_DURATION_MS) {
  if (!state) return false;
  ensureCrashState(state);

  state.crash.active = true;
  state.crash.endsAt = Date.now() + Math.max(1000, Math.floor(durationMs));
  state.crash.rebootClicks = 0;
  state.crash.totalCrashes = (state.crash.totalCrashes || 0) + 1;
  return true;
}

export function clearCrash(state) {
  if (!state) return;
  ensureCrashState(state);
  state.crash.active = false;
  state.crash.endsAt = 0;
  state.crash.rebootClicks = 0;
}

export function tickCrashState(state) {
  if (!state) return false;
  ensureCrashState(state);
  if (!state.crash.active) return false;
  if (Date.now() >= state.crash.endsAt) {
    clearCrash(state);
    return true;
  }
  return false;
}

export function maybeTriggerCrash(state, options = {}) {
  if (!state) return false;
  ensureCrashState(state);
  if (state.crash.active) return false;
  if ((state.efficiency || 1) >= 0.5) return false;

  const rng = options.rng || Math.random;
  const chance = crashChanceFromBugs(state.bugs || 0);
  if (rng() >= chance) return false;

  const durationMultiplier = Number(options.durationMultiplier || 1);
  return activateCrash(state, BASE_CRASH_DURATION_MS * durationMultiplier);
}

export function rebootCrash(state, reductionMs = REBOOT_REDUCTION_MS) {
  if (!state) return false;
  ensureCrashState(state);
  if (!state.crash.active) return false;

  state.crash.rebootClicks += 1;
  state.crash.endsAt -= Math.max(100, Math.floor(reductionMs));
  if (state.crash.endsAt <= Date.now()) {
    clearCrash(state);
    return true;
  }
  return false;
}

export function forceCrash(state, options = {}) {
  const durationMultiplier = Number(options.durationMultiplier || 1);
  return activateCrash(state, BASE_CRASH_DURATION_MS * durationMultiplier);
}

export function isCrashActive(state) {
  return Boolean(state?.crash?.active);
}

export function getCrashChance(state) {
  return crashChanceFromBugs(state?.bugs || 0);
}

