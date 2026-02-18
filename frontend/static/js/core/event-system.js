import * as Lang from '../content/i18n/index.js';
import * as Prestige from '../content/prestige-upgrades.js';
import * as Utils from '../infra/number-formatters.js';
import * as UI from '../ui/renderer.js';
import * as RandomEvents from '../content/random-events.js';

const listeners = new Map();

function ensureBucket(eventName) {
  if (!listeners.has(eventName)) {
    listeners.set(eventName, new Set());
  }
  return listeners.get(eventName);
}

export function subscribe(eventName, handler) {
  if (!eventName || typeof handler !== 'function') return () => {};
  const bucket = ensureBucket(eventName);
  bucket.add(handler);
  return () => bucket.delete(handler);
}

export function publish(eventName, payload = {}) {
  const bucket = listeners.get(eventName);
  if (!bucket) return;
  for (const handler of bucket) {
    try {
      handler(payload);
    } catch (error) {
      console.error('[event-system] handler failed:', eventName, error);
    }
  }
}

export function clearAllListeners() {
  listeners.clear();
}

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
  }, 300);
}

export function computeNextGoldenDataTime(state, now = Date.now()) {
  const prestigeEffects = Prestige.getAggregatedEffects(state?.prestigeUpgrades || []);
  const baseIntervalMs = 120_000;
  const varianceMs = 60_000;
  const interval = (baseIntervalMs + Utils.randomRange(-varianceMs, varianceMs)) * prestigeEffects.goldenFrequency;
  return now + Math.max(25_000, interval);
}

export function spawnGoldenData(state) {
  if ((state.dps || 0) < 0.1 && (state.stats?.totalDataEarned || 0) < 100) return;

  UI.showGoldenData(() => {
    const prestigeEffects = Prestige.getAggregatedEffects(state.prestigeUpgrades || []);
    const baseReward = Math.max(
      (state.dps || 0) * Utils.randomRange(25, 110),
      (state.stats?.totalDataEarned || 0) * 0.05,
    );
    const reward = baseReward * prestigeEffects.goldenValue;

    state.dataPoints += reward;
    state.stats.totalDataEarned += reward;
    state.stats.totalDataAllTime += reward;
    state.stats.events.golden_clicked = (state.stats.events.golden_clicked || 0) + 1;

    Utils.showToast(Lang.t('event_golden_data_desc', Utils.formatNumber(reward)), 'golden', 3000);
    publish('ON_EVENT', { type: 'golden_data', reward });
  });
}

export function computeNextRandomEventTime(now = Date.now()) {
  return now + Utils.randomRange(180_000, 360_000);
}

function renderDecisionModal(state, eventDefinition) {
  const choicesHtml = eventDefinition.choices.map((choice) => `
    <button class="settings-btn" data-action="random-event-choice" data-event-id="${eventDefinition.id}" data-choice-id="${choice.id}">
      ${Lang.t(choice.labelKey)}
    </button>
  `).join('');

  const html = `
    <div class="random-event-modal">
      <p>${Lang.t(eventDefinition.descriptionKey)}</p>
      <div class="settings-buttons">${choicesHtml}</div>
    </div>
  `;

  UI.showModal(Lang.t(eventDefinition.titleKey), html);
  state.pendingRandomEvent = {
    id: eventDefinition.id,
    createdAt: Date.now(),
  };
}

export function resolveRandomEventChoice(state, eventId, choiceId) {
  if (!state) return null;

  const eventDefinition = RandomEvents.getRandomEvents().find((entry) => entry.id === eventId);
  if (!eventDefinition) return null;

  const choice = eventDefinition.choices.find((entry) => entry.id === choiceId);
  if (!choice) return null;

  const message = choice.apply(state);
  state.pendingRandomEvent = null;

  publish('ON_EVENT', {
    type: eventId,
    choice: choiceId,
    message,
  });

  return message;
}

export function triggerRandomEvent(state, addActiveEffect) {
  if (!state) return;
  if ((state.dps || 0) < 1) return;

  // Pending modal choices are persistent until resolved or reset.
  if (state.pendingRandomEvent) return;

  const randomEvent = RandomEvents.pickRandomEvent(state);
  if (randomEvent) {
    renderDecisionModal(state, randomEvent);
    publish('ON_EVENT', { type: randomEvent.id, pending: true });
    return;
  }

  const events = ['deploy_friday', 'coffee_break', 'bug_report'];
  const eventType = events[Utils.randomInt(0, events.length - 1)];

  switch (eventType) {
    case 'deploy_friday': {
      const success = Math.random() > 0.3;
      if (success) {
        addActiveEffect('production_mult', 2, 30_000);
        Utils.showToast(Lang.t('event_deploy_friday_good'), 'success', 3500);
      } else {
        addActiveEffect('production_mult', 0.5, 10_000);
        Utils.showToast(Lang.t('event_deploy_friday_bad'), 'warning', 3500);
      }
      state.stats.events.deploy_friday = (state.stats.events.deploy_friday || 0) + 1;
      publish('ON_EVENT', { type: eventType, success });
      break;
    }
    case 'coffee_break': {
      const prestigeEffects = Prestige.getAggregatedEffects(state.prestigeUpgrades || []);
      addActiveEffect('click_mult', prestigeEffects.coffeeMult, 13_000);
      Utils.showToast(Lang.t('event_coffee_break_desc'), 'info', 3500);
      state.stats.events.coffee_break = (state.stats.events.coffee_break || 0) + 1;
      publish('ON_EVENT', { type: eventType });
      break;
    }
    case 'bug_report': {
      UI.showBugReport(() => {
        const reward = (state.dps || 0) * 60;
        state.dataPoints += reward;
        state.stats.totalDataEarned += reward;
        state.stats.totalDataAllTime += reward;
        state.stats.events.bug_fixed = (state.stats.events.bug_fixed || 0) + 1;

        Utils.showToast(Lang.t('event_bug_report_desc'), 'success', 2500);
        publish('ON_EVENT', { type: eventType, reward });
      });
      break;
    }
    default:
      break;
  }
}
