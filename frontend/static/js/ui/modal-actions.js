import * as Lang from '../content/i18n/index.js';
import * as Utils from '../infra/number-formatters.js';

function handlePrestige(gameApi, closeModal) {
  if (!gameApi) return;
  if (!confirm(Lang.t('confirm_prestige'))) return;
  gameApi.performPrestige();
  closeModal();
}

function handleReset(gameApi, closeModal) {
  if (!gameApi) return;
  if (!confirm(Lang.t('confirm_reset'))) return;
  gameApi.resetGame();
  closeModal();
}

function handleExport(gameApi) {
  if (!gameApi) return;

  const save = gameApi.exportSave();
  if (!save) return;

  const copyPrompt = Lang.getLanguage() === 'en'
    ? 'Copy your save data:'
    : 'Copia tus datos de guardado:';

  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    prompt(copyPrompt, save);
    return;
  }

  navigator.clipboard.writeText(save).then(() => {
    const copiedMessage = Lang.getLanguage() === 'en'
      ? 'Save copied to clipboard!'
      : 'Guardado copiado al portapapeles!';
    Utils.showToast(copiedMessage, 'info', 3000);
  }).catch(() => {
    prompt(copyPrompt, save);
  });
}

function handleImport(gameApi, closeModal) {
  if (!gameApi) return;

  const importPrompt = Lang.getLanguage() === 'en'
    ? 'Paste save data:'
    : 'Pega los datos de guardado:';

  const data = prompt(importPrompt);
  if (!data) return;

  gameApi.importSave(data);
  closeModal();
}

export function handleModalAction(actionElement, callbacks = {}) {
  if (!actionElement) return;

  const gameApi = callbacks.gameApi;
  const closeModal = callbacks.onCloseModal || (() => {});

  switch (actionElement.dataset.action) {
    case 'set-language':
      gameApi?.setLanguage(actionElement.dataset.lang);
      callbacks.onRefreshSettings?.();
      break;
    case 'export-save':
      handleExport(gameApi);
      break;
    case 'import-save':
      handleImport(gameApi, closeModal);
      break;
    case 'reset-game':
      handleReset(gameApi, closeModal);
      break;
    case 'perform-prestige':
      handlePrestige(gameApi, closeModal);
      break;
    default:
      break;
  }
}
