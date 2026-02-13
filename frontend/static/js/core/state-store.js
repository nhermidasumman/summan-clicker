import * as Game from './game-loop.js';
import * as UI from '../ui/renderer.js';

export function getState() {
  return Game.getState ? Game.getState() : null;
}

export function setState(partialState) {
  const state = getState();
  if (!state) return null;
  Object.assign(state, partialState || {});
  if (Game.recalculateDps) Game.recalculateDps();
  if (UI.renderAll) UI.renderAll(state);
  return state;
}
