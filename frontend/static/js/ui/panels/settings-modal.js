import * as Lang from '../../content/i18n/index.js';

export function createSettingsModal() {
  const html = `
    <div class="settings-group">
      <h3>${Lang.t('language')}</h3>
      <div class="language-switch">
        <button data-action="set-language" data-lang="es" class="lang-btn ${Lang.getLanguage() === 'es' ? 'active' : ''}">&#x1F1EA;&#x1F1F8; ES</button>
        <button data-action="set-language" data-lang="en" class="lang-btn ${Lang.getLanguage() === 'en' ? 'active' : ''}">&#x1F1FA;&#x1F1F8; EN</button>
      </div>
    </div>
    <div class="settings-group">
      <h3>${Lang.t('actions')}</h3>
      <div class="settings-buttons">
        <button data-action="export-save" class="settings-btn">&#x1F4E4; ${Lang.t('export_save')}</button>
        <button data-action="import-save" class="settings-btn">&#x1F4E5; ${Lang.t('import_save')}</button>
        <button data-action="reset-game" class="settings-btn danger">&#x21BB; ${Lang.t('reset_game')}</button>
      </div>
    </div>
  `;

  return { title: Lang.t('settings'), html };
}
