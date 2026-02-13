import * as Lang from '../../content/i18n/index.js';
import * as Utils from '../../infra/number-formatters.js';
import * as TutorialOverlay from './tutorial-overlay.js';

const Tutorial = (() => {
  let gameApi = null;

  let state = {
    active: false,
    subStep: 0,
    stepTimer: 0,
  };

  const TUTORIAL_KEY = 'summan_tutorial_complete';

  function setGameApi(api) {
    gameApi = api;
  }

  function getGameState() {
    return gameApi?.getState ? gameApi.getState() : null;
  }

  function init() {
    if (localStorage.getItem(TUTORIAL_KEY) === 'true') return;

    state.active = true;
    state.subStep = 0;

    TutorialOverlay.init();
  }

  function update() {
    if (!state.active) return;

    const gameState = getGameState();
    if (!gameState) return;

    const data = gameState.dataPoints;
    const internVal = gameState.buildings.intern;
    const internCount = (typeof internVal === 'object' ? internVal.count : internVal) || 0;

    let target = null;
    let type = null;
    let message = '';
    let narrativeStep = 0;
    let narrativeText = '';

    if (state.subStep === 0) {
      if (internCount > 0) {
        state.subStep = 1;
        state.stepTimer = Date.now();
      } else if (data < 20) {
        target = document.getElementById('click-orb');
        type = 'orb';

        if (data < 5) message = Lang.t('tutorial_click_0_4');
        else if (data < 10) message = Lang.t('tutorial_click_5_9');
        else if (data < 15) message = Lang.t('tutorial_click_10_14');
        else message = Lang.t('tutorial_click_15_19');
      } else {
        const internButton = document.querySelector('.building-item[data-building="intern"]');
        if (internButton && internButton.offsetParent !== null) {
          target = internButton;
          type = 'intern';
          message = Lang.t('tutorial_exploit');
        }
      }
    }

    if (state.subStep > 0) {
      const result = handleNarrativeLogic();
      narrativeStep = result.step;
      narrativeText = result.text;

      if (state.subStep === 1) {
        target = document.getElementById('dps-display');
        type = 'dps';
        message = Lang.t('tutorial_dps_expl');
        narrativeStep = 0;
      }

      if (result.complete) {
        complete();
        return;
      }
    }

    TutorialOverlay.render(target, type, message, narrativeStep > 1 ? narrativeStep : 0);

    if (state.subStep >= 2) {
      TutorialOverlay.render(null, null, narrativeText, state.subStep);
    }
  }

  function handleNarrativeLogic() {
    const elapsed = Date.now() - state.stepTimer;
    const dpsStepDuration = 8000;
    const mantra1Duration = 2500;
    const mantra2Duration = 2500;
    const mantra3Duration = 4000;

    const result = { step: 0, text: '', complete: false };

    if (state.subStep === 1) {
      if (elapsed > dpsStepDuration) {
        state.subStep = 2;
        state.stepTimer = Date.now();
      }
    } else if (state.subStep === 2) {
      result.step = 2;
      result.text = Lang.t('tutorial_mantra_1') || '1. CRECE';
      if (elapsed > mantra1Duration) {
        state.subStep = 3;
        state.stepTimer = Date.now();
      }
    } else if (state.subStep === 3) {
      result.step = 3;
      result.text = Lang.t('tutorial_mantra_2') || '2. ACUMULA';
      if (elapsed > mantra2Duration) {
        state.subStep = 4;
        state.stepTimer = Date.now();
      }
    } else if (state.subStep === 4) {
      result.step = 4;
      result.text = Lang.t('tutorial_mantra_3') || '3. UTILIZA';
      if (elapsed > mantra3Duration) {
        result.complete = true;
      }
    }

    return result;
  }

  function complete() {
    localStorage.setItem(TUTORIAL_KEY, 'true');
    state.active = false;
    TutorialOverlay.clear();
  }

  function restart() {
    localStorage.removeItem(TUTORIAL_KEY);
    state.subStep = 0;
    state.active = true;
    init();
    Utils.showToast(Lang.getLanguage() === 'en' ? 'Tutorial restarted!' : 'Tutorial reiniciado!', 'info', 2000);
  }

  return {
    init,
    update,
    complete,
    restart,
    setGameApi,
    state,
  };
})();

export const init = Tutorial.init;
export const update = Tutorial.update;
export const complete = Tutorial.complete;
export const restart = Tutorial.restart;
export const setGameApi = Tutorial.setGameApi;
export const state = Tutorial.state;
export default Tutorial;
