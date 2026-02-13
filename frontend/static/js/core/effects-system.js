export function addActiveEffect(state, type, multiplier, durationMs, onRecalculate = () => {}) {
  if (!state) return;
  state.activeEffects.push({
    type,
    multiplier,
    endTime: Date.now() + durationMs,
  });
  onRecalculate();
}

export function updateActiveEffects(state, onRecalculate = () => {}) {
  if (!state) return;
  const now = Date.now();
  const before = state.activeEffects.length;
  state.activeEffects = state.activeEffects.filter((effect) => effect.endTime > now);
  if (state.activeEffects.length !== before) {
    onRecalculate();
  }
}

export function getActiveEffects(state) {
  return state?.activeEffects || [];
}
