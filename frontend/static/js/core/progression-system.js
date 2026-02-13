import * as Game from './game-loop.js';

export function buyBuilding(buildingId) {
  return Game.buyBuilding ? Game.buyBuilding(buildingId) : false;
}

export function buyUpgrade(upgradeId) {
  return Game.buyUpgrade ? Game.buyUpgrade(upgradeId) : false;
}

export function performPrestige() {
  return Game.performPrestige ? Game.performPrestige() : false;
}
