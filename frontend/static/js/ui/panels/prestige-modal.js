export function createPrestigeModal(preview) {
  const html = `
    <div class="prestige-summary">
      <div class="prestige-info">
        <p>${window.Lang.t('prestige_desc')}</p>
        <div class="prestige-stat">${window.Lang.t('prestige_gain', preview)}</div>
      </div>
      <button data-action="perform-prestige" class="prestige-btn ${preview > 0 ? 'available' : 'disabled'}" ${preview <= 0 ? 'disabled' : ''}>
        &#x1F680; ${window.Lang.t('prestige')}
      </button>
    </div>
  `;

  return { title: window.Lang.t('innovation'), html };
}
