import { refactorCostFromDps, refactorBugs } from '../infra/formulas.js';
import { recomputeDebtState } from './debt-system.js';

export function getRefactorCost(state) {
  if (!state) return 0;
  return refactorCostFromDps(state.dps || 0);
}

export function canRefactor(state) {
  if (!state) return false;
  const cost = getRefactorCost(state);
  return cost > 0 && (state.dataPoints || 0) >= cost && (state.bugs || 0) > 0;
}

export function performRefactor(state) {
  if (!canRefactor(state)) return { ok: false, cost: getRefactorCost(state) };

  const cost = getRefactorCost(state);
  const beforeBugs = Math.floor(state.bugs || 0);

  state.dataPoints -= cost;
  state.bugs = refactorBugs(state.bugs || 0);
  recomputeDebtState(state);

  state.stats.totalRefactors = (state.stats.totalRefactors || 0) + 1;

  return {
    ok: true,
    cost,
    bugsBefore: beforeBugs,
    bugsAfter: Math.floor(state.bugs || 0),
    reducedBy: Math.max(0, beforeBugs - Math.floor(state.bugs || 0)),
  };
}

