import * as Buildings from '../content/buildings.js';
import * as Upgrades from '../content/upgrades.js';
import { bugsDeltaPerSecond, debtEfficiency } from '../infra/formulas.js';

function collectBuildingBugEntries(state) {
  const entries = [];
  for (const building of Buildings.getAll()) {
    const qty = state.buildings?.[building.id] || 0;
    if (!qty) continue;
    entries.push({ qty, bugRate: building.bugRate || 0 });
  }
  return entries;
}

function getBugMultiplier(state) {
  let multiplier = 1;
  for (const upgradeId of state.upgrades || []) {
    const upgrade = Upgrades.getById(upgradeId);
    if (!upgrade) continue;
    if (upgrade.effect?.type === 'bug_mult') {
      multiplier *= Number(upgrade.effect.value || 1);
    }
  }
  multiplier *= Number(state.tempBugRateMultiplier || 1);
  return multiplier;
}

export function updateDebtTick(state, deltaSec) {
  if (!state) return;
  const baseBugRate = bugsDeltaPerSecond(collectBuildingBugEntries(state));
  const multiplier = getBugMultiplier(state);
  const bugDelta = baseBugRate * multiplier * deltaSec;

  state.baseBugRate = baseBugRate;
  state.bugRate = baseBugRate * multiplier;
  state.bugs = Math.max(0, (state.bugs || 0) + bugDelta);
  state.efficiency = debtEfficiency(state.bugs);
}

export function recomputeDebtState(state) {
  if (!state) return;
  const baseBugRate = bugsDeltaPerSecond(collectBuildingBugEntries(state));
  const multiplier = getBugMultiplier(state);
  state.baseBugRate = baseBugRate;
  state.bugRate = baseBugRate * multiplier;
  state.efficiency = debtEfficiency(state.bugs || 0);
}

export function setBugs(state, bugs) {
  if (!state) return;
  state.bugs = Math.max(0, Number(bugs || 0));
  state.efficiency = debtEfficiency(state.bugs);
}

