import * as Game from './game-loop.js';

export function getActiveEffects() {
  const state = Game.getState ? Game.getState() : null;
  return state?.activeEffects || [];
}
