import * as Game from './game-loop.js';

export function calculateClickValue() {
  return Game.calculateClickValue ? Game.calculateClickValue() : 0;
}

export function getBuildingDiscount() {
  return Game.getBuildingDiscount ? Game.getBuildingDiscount() : 1;
}
