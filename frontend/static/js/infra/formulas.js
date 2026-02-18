import { toDecimal, toNumber, ceilToNumber, floorToNumber } from './decimal-adapter.js';

export const DEFAULT_GROWTH_RATE = 1.15;
export const COST_ROUNDING = 'ceil';

function roundCost(value) {
  if (COST_ROUNDING === 'floor') return floorToNumber(value);
  return ceilToNumber(value);
}

function sanitizeOwned(owned) {
  return Math.max(0, Math.floor(Number(owned || 0)));
}

function sanitizeCount(count) {
  return Math.max(0, Math.floor(Number(count || 0)));
}

export function nextBuildingCost(baseCost, owned, growthRate = DEFAULT_GROWTH_RATE) {
  const base = toDecimal(baseCost);
  const rate = toDecimal(growthRate);
  const n = sanitizeOwned(owned);
  return roundCost(base.mul(rate.pow(n)));
}

export function bulkBuildingCost(baseCost, owned, count, growthRate = DEFAULT_GROWTH_RATE) {
  const k = sanitizeCount(count);
  if (k <= 0) return 0;

  const base = toDecimal(baseCost);
  const rate = toDecimal(growthRate);
  const n = sanitizeOwned(owned);

  if (rate.eq(1)) {
    return roundCost(base.mul(k));
  }

  // CostoTotal = PrecioBase * r^CantidadActual * (r^k - 1) / (r - 1)
  const geometricNumerator = rate.pow(k).sub(1);
  const geometricDenominator = rate.sub(1);
  const firstCost = base.mul(rate.pow(n));
  return roundCost(firstCost.mul(geometricNumerator.div(geometricDenominator)));
}

function maxAffordableForLinear(baseCost, owned, budget) {
  const first = nextBuildingCost(baseCost, owned, 1);
  if (first <= 0) return { count: 0, totalCost: 0 };
  const count = Math.floor(Math.max(0, Number(budget || 0)) / first);
  return { count, totalCost: count * first };
}

export function maxAffordableBuildingCount(baseCost, owned, budget, growthRate = DEFAULT_GROWTH_RATE) {
  const safeBudget = Math.max(0, Number(budget || 0));
  if (safeBudget <= 0) return { count: 0, totalCost: 0 };

  const n = sanitizeOwned(owned);
  const rate = Number(growthRate || DEFAULT_GROWTH_RATE);

  if (!Number.isFinite(rate) || rate <= 0) {
    return { count: 0, totalCost: 0 };
  }

  const firstCost = nextBuildingCost(baseCost, n, rate);
  if (firstCost > safeBudget) return { count: 0, totalCost: 0 };

  if (Math.abs(rate - 1) < 1e-12) {
    return maxAffordableForLinear(baseCost, n, safeBudget);
  }

  const geometricStart = Number(baseCost || 0) * (rate ** n);
  if (!Number.isFinite(geometricStart) || geometricStart <= 0) {
    return { count: 0, totalCost: 0 };
  }

  const ratio = 1 + ((safeBudget * (rate - 1)) / geometricStart);
  let count = Math.floor(Math.log(Math.max(1, ratio)) / Math.log(rate));
  if (!Number.isFinite(count)) count = 0;
  count = Math.max(0, count);

  let totalCost = bulkBuildingCost(baseCost, n, count, rate);

  // Small correction loop for rounding error; bounded and independent of k.
  for (let i = 0; i < 8 && totalCost > safeBudget && count > 0; i += 1) {
    count -= 1;
    totalCost = bulkBuildingCost(baseCost, n, count, rate);
  }

  for (let i = 0; i < 8; i += 1) {
    const candidateCount = count + 1;
    const candidateCost = bulkBuildingCost(baseCost, n, candidateCount, rate);
    if (candidateCost > safeBudget) break;
    count = candidateCount;
    totalCost = candidateCost;
  }

  return {
    count,
    totalCost,
  };
}

export function upgradeCostFromBuildingCost(nextBuildingCostValue, multiplier = 10) {
  const cost = toDecimal(nextBuildingCostValue).mul(multiplier);
  return roundCost(cost);
}

export function applySynergyPerBase(baseProduction, ratio, count) {
  const safeBase = Math.max(0, Number(baseProduction || 0));
  const safeRatio = Math.max(0, Number(ratio || 0));
  const safeCount = sanitizeCount(count);
  return safeBase * (1 + (safeRatio * safeCount));
}

export function bugsDeltaPerSecond(buildingEntries) {
  let total = 0;
  for (const entry of buildingEntries || []) {
    const qty = Number(entry?.qty || 0);
    const bugRate = Number(entry?.bugRate || 0);
    total += qty * bugRate;
  }
  return total;
}

export function debtEfficiency(totalBugs) {
  const bugs = Math.max(0, Number(totalBugs || 0));
  return 1000 / (1000 + Math.sqrt(bugs));
}

export function applyDebtPenalty(theoreticalProduction, totalBugs) {
  return Math.max(0, Number(theoreticalProduction || 0)) * debtEfficiency(totalBugs);
}

export function crashChanceFromBugs(totalBugs) {
  const bugs = Number(totalBugs || 0);
  return 1 / (1 + Math.exp(-0.01 * (bugs - 1000)));
}

export function refactorCostFromDps(currentDps) {
  const dps = Math.max(0, Number(currentDps || 0));
  return Math.ceil(dps * 60);
}

export function refactorBugs(totalBugs) {
  return Math.floor(Math.max(0, Number(totalBugs || 0)) * 0.6);
}

export function stockOptionsFromLifetimeLoc(totalLoc) {
  const loc = Math.max(0, Number(totalLoc || 0));
  return Math.floor(150 * Math.cbrt(loc / 1e9));
}

export function toSerializableNumber(value) {
  const parsed = Number(value);
  if (Number.isFinite(parsed)) return parsed;
  return toNumber(value);
}
