window.Tutorial = (() => {
    let state = {
        active: false,
        subStep: 0, // 0: pending, 1: dps, 2: mantra1, 3: mantra2, 4: mantra3
        stepTimer: 0
    };

    const TUTORIAL_KEY = 'summan_tutorial_complete';

    function init() {
        if (localStorage.getItem(TUTORIAL_KEY) === 'true') {
            return;
        }
        console.log("Tutorial: Starting (SVG Mode)...");
        state.active = true;
        state.subStep = 0;

        // Init Overlay
        if (window.TutorialOverlay) {
            TutorialOverlay.init();
        } else {
            console.error("TutorialOverlay not found!");
        }
    }

    function update() {
        if (!state.active) return;
        if (!window.TutorialOverlay) return;

        const gameState = Game.getState();
        const data = gameState.dataPoints;
        const internVal = gameState.buildings['intern'];
        const internCount = (typeof internVal === 'object' ? internVal.count : internVal) || 0;

        let target = null;
        let type = null;
        let message = "";
        let narrativeStep = 0;
        let narrativeText = "";

        // Sequence Logic
        if (state.subStep === 0) {
            // PRIORITY 1: Narrative Trigger
            if (internCount > 0) {
                state.subStep = 1;
                state.stepTimer = Date.now();
            }
            // PRIORITY 2: Core loop - Orb clicking
            else if (data < 20) {
                target = document.getElementById('click-orb');
                type = 'orb';

                const clicks = data;
                if (clicks < 5) message = Lang.t('tutorial_click_0_4');
                else if (clicks < 10) message = Lang.t('tutorial_click_5_9');
                else if (clicks < 15) message = Lang.t('tutorial_click_10_14');
                else message = Lang.t('tutorial_click_15_19');
            }
            // PRIORITY 3: Buy Intern
            else if (data >= 20 && internCount === 0) {
                const internBtn = document.querySelector('.building-item[data-building="intern"]');
                if (internBtn && internBtn.offsetParent !== null) {
                    target = internBtn;
                    type = 'intern';
                    message = Lang.t('tutorial_exploit');
                }
            }
        }

        // Narrative Phase logic
        if (state.subStep > 0) {
            const result = handleNarrativeLogic();
            narrativeStep = result.step;
            narrativeText = result.text;

            // Special case for DPS highlight (subStep 1)
            if (state.subStep === 1) {
                target = document.getElementById('dps-display');
                type = 'dps';
                message = Lang.t('tutorial_dps_expl');
                narrativeStep = 0; // Use normal overlay, not mantra
            }

            if (result.complete) {
                complete();
                return;
            }
        }

        // Delegated Render
        TutorialOverlay.render(target, type, message, narrativeStep > 1 ? narrativeStep : 0);

        // If we have narrative text for step 2+, render handles it via 4th arg.
        // But for step 1 (dps), we render target normally.
        // Wait, render() takes (target, type, text, narrativeStep).
        // If narrativeStep > 0, it ignores target.
        // So for subStep 1, we pass narrativeStep 0.
        // For subStep 2+, we pass narrativeStep 2/3/4 and text as narrativeText.

        if (state.subStep >= 2) {
            TutorialOverlay.render(null, null, narrativeText, state.subStep); // Re-map subStep 2->2 etc.
        }
    }

    function handleNarrativeLogic() {
        const elapsed = Date.now() - state.stepTimer;
        // Tuned timings
        const dpsStepDuration = 8000;
        const mantra1Duration = 2500;
        const mantra2Duration = 2500;
        const mantra3Duration = 4000;

        let res = { step: 0, text: "", complete: false };

        if (state.subStep === 1) {
            if (elapsed > dpsStepDuration) {
                state.subStep = 2;
                state.stepTimer = Date.now();
            }
        }
        else if (state.subStep === 2) {
            res.step = 2;
            res.text = Lang.t('tutorial_mantra_1') || "1. CRECE";
            if (elapsed > mantra1Duration) {
                state.subStep = 3;
                state.stepTimer = Date.now();
            }
        }
        else if (state.subStep === 3) {
            res.step = 3;
            res.text = Lang.t('tutorial_mantra_2') || "2. ACUMULA";
            if (elapsed > mantra2Duration) {
                state.subStep = 4;
                state.stepTimer = Date.now();
            }
        }
        else if (state.subStep === 4) {
            res.step = 4;
            res.text = Lang.t('tutorial_mantra_3') || "3. UTILIZA";
            if (elapsed > mantra3Duration) {
                res.complete = true;
            }
        }

        return res;
    }

    function complete() {
        console.log("Tutorial: Complete!");
        localStorage.setItem(TUTORIAL_KEY, 'true');
        state.active = false;
        if (window.TutorialOverlay) TutorialOverlay.clear();
    }

    function restart() {
        console.log("Tutorial: Restarting...");
        localStorage.removeItem(TUTORIAL_KEY);
        state.subStep = 0;
        state.active = true;
        init();
        Utils.showToast(Lang.getLanguage() === 'en' ? 'Tutorial restarted!' : '¡Tutorial reiniciado!', 'info', 2000);
    }

    return {
        init,
        update,
        complete,
        restart,
        state
    };
})();
