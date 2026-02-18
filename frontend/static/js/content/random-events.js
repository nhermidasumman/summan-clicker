import * as Lang from './i18n/index.js';

const RANDOM_EVENTS = Object.freeze([
  {
    id: 'ceo_blockchain',
    titleKey: 'event_ceo_blockchain_title',
    descriptionKey: 'event_ceo_blockchain_desc',
    minDps: 5,
    choices: [
      {
        id: 'implement',
        labelKey: 'event_choice_implement',
        apply(state) {
          const instant = Math.max((state.dps || 0) * 120, 5_000);
          state.dataPoints += instant;
          state.stats.totalDataEarned += instant;
          state.stats.totalDataAllTime += instant;
          state.tempBugRateMultiplier = (state.tempBugRateMultiplier || 1) * 2;
          state.tempBugRateUntil = 0; // Persiste hasta prestigio.
          return Lang.t('event_ceo_blockchain_result_impl', instant.toLocaleString());
        },
      },
      {
        id: 'ignore',
        labelKey: 'event_choice_ignore',
        apply(state) {
          state.tempProductionMultiplier = (state.tempProductionMultiplier || 1) * 0.9;
          state.tempProductionUntil = Date.now() + 60_000;
          return Lang.t('event_ceo_blockchain_result_ignore');
        },
      },
    ],
  },
  {
    id: 'security_audit',
    titleKey: 'event_security_audit_title',
    descriptionKey: 'event_security_audit_desc',
    minDps: 20,
    choices: [
      {
        id: 'rush_fix',
        labelKey: 'event_choice_rush_fix',
        apply(state) {
          state.bugs = Math.max(0, (state.bugs || 0) + 150);
          return Lang.t('event_security_audit_result_rush');
        },
      },
      {
        id: 'plan_fix',
        labelKey: 'event_choice_plan_fix',
        apply(state) {
          const bonus = Math.max((state.dps || 0) * 30, 1200);
          state.dataPoints += bonus;
          state.stats.totalDataEarned += bonus;
          state.stats.totalDataAllTime += bonus;
          return Lang.t('event_security_audit_result_plan', bonus.toLocaleString());
        },
      },
    ],
  },
]);

export function getRandomEvents() {
  return RANDOM_EVENTS;
}

export function pickRandomEvent(state) {
  const candidates = RANDOM_EVENTS.filter((event) => (state?.dps || 0) >= event.minDps);
  if (candidates.length === 0) return null;
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}

