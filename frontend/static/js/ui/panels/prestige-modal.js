import * as Lang from '../../content/i18n/index.js';

export function createPrestigeModal(preview) {
  const html = `
    <div class="prestige-summary">
      <div class="prestige-info">
        <p>${Lang.t('prestige_desc')}</p>
        <div class="prestige-stat">${Lang.t('prestige_gain', preview)}</div>
      </div>
      <button data-action="perform-prestige" class="prestige-btn ${preview > 0 ? 'available' : 'disabled'}" ${preview <= 0 ? 'disabled' : ''}>
        &#x1F680; ${Lang.t('prestige')}
      </button>
    </div>
  `;

  return { title: Lang.t('innovation'), html };
}
