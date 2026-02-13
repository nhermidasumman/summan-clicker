import * as Lang from '../content/i18n/index.js';
import * as Prestige from '../content/prestige-upgrades.js';
import * as Utils from '../infra/number-formatters.js';
import * as UI from '../ui/renderer.js';

export function calculateOfflineProgress(state) {
  if (!state?.lastTickTime) return;

  const now = Date.now();
  const elapsedSec = (now - state.lastTickTime) / 1000;
  if (elapsedSec < 10) return;

  const prestigeEffects = Prestige.getAggregatedEffects(state.prestigeUpgrades || []);
  const offlineRate = prestigeEffects.offlineRate;
  const offlineData = (state.dps || 0) * elapsedSec * offlineRate;

  if (offlineData <= 0) return;

  state.dataPoints += offlineData;
  state.stats.totalDataEarned += offlineData;
  state.stats.totalDataAllTime += offlineData;

  setTimeout(() => {
    UI.showOfflineModal(offlineData, elapsedSec);
  }, 500);
}

export function computeNextGoldenDataTime(state, now = Date.now()) {
  const prestigeEffects = Prestige.getAggregatedEffects(state?.prestigeUpgrades || []);
  const baseInterval = 120000;
  const variance = 60000;
  const interval = (baseInterval + Utils.randomRange(-variance, variance)) * prestigeEffects.goldenFrequency;
  return now + Math.max(30000, interval);
}

export function spawnGoldenData(state) {
  if ((state.dps || 0) < 0.1 && (state.stats.totalDataEarned || 0) < 100) return;

  UI.showGoldenData(() => {
    const prestigeEffects = Prestige.getAggregatedEffects(state.prestigeUpgrades || []);
    const baseReward = Math.max(
      (state.dps || 0) * Utils.randomRange(30, 120),
      (state.stats.totalDataEarned || 0) * 0.05,
    );
    const reward = baseReward * prestigeEffects.goldenValue;

    state.dataPoints += reward;
    state.stats.totalDataEarned += reward;
    state.stats.totalDataAllTime += reward;
    state.stats.events.golden_clicked = (state.stats.events.golden_clicked || 0) + 1;

    Utils.showToast(Lang.t('event_golden_data_desc', Utils.formatNumber(reward)), 'golden', 3000);
  });
}

export function computeNextRandomEventTime(now = Date.now()) {
  const interval = Utils.randomRange(180000, 360000);
  return now + interval;
}

export function triggerRandomEvent(state, addActiveEffect) {
  if ((state.dps || 0) < 1) return;

  const events = ['deploy_friday', 'coffee_break', 'bug_report'];
  const event = events[Utils.randomInt(0, events.length - 1)];

  switch (event) {
    case 'deploy_friday': {
      const success = Math.random() > 0.3;
      if (success) {
        addActiveEffect('production_mult', 2, 30000);
        Utils.showToast(Lang.t('event_deploy_friday_good'), 'success', 4000);
      } else {
        addActiveEffect('production_mult', 0.5, 10000);
        Utils.showToast(Lang.t('event_deploy_friday_bad'), 'warning', 4000);
      }
      state.stats.events.deploy_friday = (state.stats.events.deploy_friday || 0) + 1;
      break;
    }
    case 'coffee_break': {
      const prestigeEffects = Prestige.getAggregatedEffects(state.prestigeUpgrades || []);
      addActiveEffect('click_mult', prestigeEffects.coffeeMult, 13000);
      Utils.showToast(Lang.t('event_coffee_break_desc'), 'info', 4000);
      state.stats.events.coffee_break = (state.stats.events.coffee_break || 0) + 1;
      break;
    }
    case 'bug_report': {
      UI.showBugReport(() => {
        const reward = (state.dps || 0) * 60;
        state.dataPoints += reward;
        state.stats.totalDataEarned += reward;
        state.stats.totalDataAllTime += reward;
        state.stats.events.bug_fixed = (state.stats.events.bug_fixed || 0) + 1;
        Utils.showToast(`Bug fixed! +${Utils.formatNumber(reward)}`, 'success', 3000);
      });
      break;
    }
    default:
      break;
  }
}
