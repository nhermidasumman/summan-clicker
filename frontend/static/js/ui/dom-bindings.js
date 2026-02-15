export function bindDomEvents(elements, handlers = {}) {
  if (!elements) return;

  const clickTarget = elements.clickTarget;
  const clickOrb = elements.clickOrb;
  const activeOrbPointers = new Set();

  function releasePointer(pointerId) {
    if (!activeOrbPointers.has(pointerId)) return false;
    activeOrbPointers.delete(pointerId);
    handlers.onClickTargetRelease?.(pointerId);
    return true;
  }

  function isOrbInteraction(event) {
    if (!clickOrb || !event?.target) return false;
    return event.target === clickOrb || clickOrb.contains(event.target);
  }

  if (clickTarget) {
    clickTarget.addEventListener('click', (event) => {
      const rect = clickTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      handlers.onClickTarget?.(x, y);
    });

    clickTarget.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      if (!isOrbInteraction(event)) return;

      activeOrbPointers.add(event.pointerId);
      if (clickTarget.setPointerCapture) {
        try {
          clickTarget.setPointerCapture(event.pointerId);
        } catch {
          // Ignore capture failures on browser edge-cases.
        }
      }
      handlers.onClickTargetPress?.(event.pointerId);
    });

    clickTarget.addEventListener('pointerup', (event) => {
      releasePointer(event.pointerId);
    });

    clickTarget.addEventListener('pointercancel', (event) => {
      releasePointer(event.pointerId);
    });

    clickTarget.addEventListener('lostpointercapture', (event) => {
      releasePointer(event.pointerId);
    });

    clickTarget.addEventListener('pointerleave', (event) => {
      if (event.buttons !== 0) return;
      releasePointer(event.pointerId);
    });

    clickTarget.addEventListener('contextmenu', (event) => event.preventDefault());

    window.addEventListener('pointerup', (event) => {
      releasePointer(event.pointerId);
    });

    window.addEventListener('pointercancel', (event) => {
      releasePointer(event.pointerId);
    });
  }

  if (elements.tabBuildings) {
    elements.tabBuildings.addEventListener('click', () => handlers.onSwitchTab?.('buildings'));
  }

  if (elements.tabAchievements) {
    elements.tabAchievements.addEventListener('click', () => handlers.onSwitchTab?.('achievements'));
  }

  for (const button of elements.buyBtns || []) {
    button.addEventListener('click', () => {
      const amount = parseInt(button.dataset.amount, 10);
      handlers.onSetBuyAmount?.(amount);
    });
  }

  if (elements.btnStats) elements.btnStats.addEventListener('click', () => handlers.onShowStats?.());
  if (elements.btnSettings) elements.btnSettings.addEventListener('click', () => handlers.onShowSettings?.());
  if (elements.btnPrestige) elements.btnPrestige.addEventListener('click', () => handlers.onShowPrestige?.());

  if (elements.modalClose) elements.modalClose.addEventListener('click', () => handlers.onCloseModal?.());
  if (elements.modal) {
    elements.modal.addEventListener('click', (event) => {
      if (event.target === elements.modal) handlers.onCloseModal?.();
    });
  }

  if (elements.buildingsList) {
    elements.buildingsList.addEventListener('click', (event) => {
      const item = event.target.closest('.building-item[data-building][data-action="buy-building"]');
      if (!item) return;
      handlers.onBuyBuilding?.(item.dataset.building);
    });
  }

  if (elements.upgradesList) {
    elements.upgradesList.addEventListener('click', (event) => {
      const tile = event.target.closest('.upgrade-tile[data-upgrade][data-action="buy-upgrade"]');
      if (!tile) return;
      handlers.onBuyUpgrade?.(tile.dataset.upgrade);
    });
  }

  if (elements.modalBody) {
    elements.modalBody.addEventListener('click', (event) => {
      const actionElement = event.target.closest('[data-action]');
      if (!actionElement) return;
      handlers.onModalAction?.(actionElement);
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') handlers.onCloseModal?.();

    if (event.key.toLowerCase() === 's' && event.ctrlKey) {
      event.preventDefault();
      handlers.onManualSave?.();
    }
  });
}
