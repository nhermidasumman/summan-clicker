import '../infra/number-formatters.js';
import '../content/i18n/index.js';
import '../content/buildings.js';
import '../content/upgrades.js';
import '../content/achievements.js';
import '../content/prestige-upgrades.js';
import '../infra/save-repository.js';
import '../ui/renderer.js';
import '../ui/overlays/tutorial-overlay.js';
import '../ui/overlays/tutorial-controller.js';
import * as Game from '../core/game-loop.js';

import { displayVersion } from './version.js';
import { installBrowserTestApi } from '../test-api/browser-test-api.js';
import { createLogger } from '../infra/logger.js';

const log = createLogger('bootstrap');

function ensureGameInit() {
  if (window.__SUMMAN_GAME_BOOTED__) return;
  window.__SUMMAN_GAME_API__ = Game;
  Game.init();
  window.__SUMMAN_GAME_BOOTED__ = true;
}

export function bootstrap() {
  displayVersion();
  installBrowserTestApi();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureGameInit, { once: true });
  } else {
    ensureGameInit();
  }

  log.info('Application bootstrapped');
}
