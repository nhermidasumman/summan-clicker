const DEFAULT_EFFECT_ICON = '&#x26A1;';

const EFFECT_ICON_BY_TYPE = {
  coffee_mult: '&#x2615;',
  golden_mult: '&#x2728;',
  click_mult: '&#x1F5B1;',
  production_mult: '&#x26A1;',
};

function getEffectIcon(type) {
  return EFFECT_ICON_BY_TYPE[type] || DEFAULT_EFFECT_ICON;
}

export function renderActiveEffectsBar(state, container) {
  if (!container) return;

  const effects = state?.activeEffects || [];
  if (effects.length === 0) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  container.style.display = 'flex';
  container.innerHTML = effects.map((effect) => {
    const remainingSeconds = Math.max(0, Math.ceil((effect.endTime - Date.now()) / 1000));
    const icon = getEffectIcon(effect.type);

    return `
      <div class="effect-badge">
        <span class="effect-icon">${icon}</span>
        <span class="effect-timer">${remainingSeconds}s</span>
      </div>
    `;
  }).join('');
}
