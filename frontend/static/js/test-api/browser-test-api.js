import * as Game from '../core/game-loop.js';
import * as UI from '../ui/renderer.js';
import * as TutorialOverlay from '../ui/overlays/tutorial-overlay.js';

function safeState() {
  return Game.getState ? Game.getState() : null;
}

function dispatch(action) {
  if (!action || typeof action !== 'object') return false;

  switch (action.type) {
    case 'CLICK': {
      const x = Number(action.x ?? 0);
      const y = Number(action.y ?? 0);
      Game.handleClick(x, y);
      return true;
    }
    case 'BUY_BUILDING':
      return Game.buyBuilding(action.buildingId);
    case 'BUY_UPGRADE':
      return Game.buyUpgrade(action.upgradeId);
    case 'SET_LANGUAGE':
      Game.setLanguage(action.language);
      return true;
    case 'SET_BUY_AMOUNT':
      Game.setBuyAmount(action.amount);
      return true;
    case 'PRESTIGE':
      return Game.performPrestige();
    case 'RESET':
      Game.resetGame();
      return true;
    case 'SAVE':
      Game.manualSave();
      return true;
    case 'SHOW_GOLDEN_DATA':
      UI.showGoldenData(() => {});
      return true;
    case 'SHOW_BUG_REPORT':
      UI.showBugReport(() => {});
      return true;
    case 'SHOW_OFFLINE_MODAL':
      UI.showOfflineModal(Number(action.dataEarned ?? 0), Number(action.secondsAway ?? 0));
      return true;
    case 'SHOW_TUTORIAL_NARRATIVE':
      TutorialOverlay.init();
      TutorialOverlay.render(null, null, String(action.text ?? ''), Number(action.step ?? 2));
      return true;
    default:
      return false;
  }
}

function setState(partialState) {
  const state = safeState();
  if (!state) return null;
  Object.assign(state, partialState || {});
  if (Game.recalculateDps) Game.recalculateDps();
  if (UI.renderAll) UI.renderAll(state);
  return state;
}

export function installBrowserTestApi() {
  window.__SUMMAN_TEST_API__ = {
    getState: () => safeState(),
    setState,
    dispatch,
    reset: () => {
      Game.resetGame();
      return true;
    },
    isReady: () => Boolean(Game.getState && UI.renderAll && safeState()),
  };
}
