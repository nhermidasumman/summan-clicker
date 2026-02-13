function handlePrestige(closeModal) {
  if (!confirm(window.Lang.t('confirm_prestige'))) return;
  window.__SUMMAN_GAME_API__.performPrestige();
  closeModal();
}

function handleReset(closeModal) {
  if (!confirm(window.Lang.t('confirm_reset'))) return;
  window.__SUMMAN_GAME_API__.resetGame();
  closeModal();
}

function handleExport() {
  const save = window.__SUMMAN_GAME_API__.exportSave();
  if (!save) return;

  const copyPrompt = window.Lang.getLanguage() === 'en'
    ? 'Copy your save data:'
    : 'Copia tus datos de guardado:';

  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    prompt(copyPrompt, save);
    return;
  }

  navigator.clipboard.writeText(save).then(() => {
    const copiedMessage = window.Lang.getLanguage() === 'en'
      ? 'Save copied to clipboard!'
      : 'Guardado copiado al portapapeles!';
    window.Utils.showToast(copiedMessage, 'info', 3000);
  }).catch(() => {
    prompt(copyPrompt, save);
  });
}

function handleImport(closeModal) {
  const importPrompt = window.Lang.getLanguage() === 'en'
    ? 'Paste save data:'
    : 'Pega los datos de guardado:';

  const data = prompt(importPrompt);
  if (!data) return;

  window.__SUMMAN_GAME_API__.importSave(data);
  closeModal();
}

export function handleModalAction(actionElement, callbacks = {}) {
  if (!actionElement) return;

  const action = actionElement.dataset.action;
  const closeModal = callbacks.onCloseModal || (() => {});

  switch (action) {
    case 'set-language':
      window.__SUMMAN_GAME_API__.setLanguage(actionElement.dataset.lang);
      callbacks.onRefreshSettings?.();
      break;
    case 'export-save':
      handleExport();
      break;
    case 'import-save':
      handleImport(closeModal);
      break;
    case 'reset-game':
      handleReset(closeModal);
      break;
    case 'perform-prestige':
      handlePrestige(closeModal);
      break;
    default:
      break;
  }
}
