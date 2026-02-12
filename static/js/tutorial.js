window.Tutorial = (() => {
    let state = {
        active: false,
        step: 0, // 0-14: orb, 15: intern
        arrowElement: null,
        bubbleElement: null
    };

    const TUTORIAL_KEY = 'summan_tutorial_complete';

    function init() {
        const stored = localStorage.getItem(TUTORIAL_KEY);
        console.log("Tutorial Init: Stored key =", stored);
        if (stored === 'true') {
            console.log("Tutorial: Skipping (already complete)");
            return;
        }
        console.log("Tutorial: Starting...");

        state.active = true;
        createElements();

        // Use timeout to ensure UI is ready
        setTimeout(() => {
            update();
        }, 500);
    }

    function createElements() {
        // Container
        const container = document.createElement('div');
        container.id = 'tutorial-layer';
        container.style.position = 'absolute';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none'; // Let clicks pass through
        container.style.zIndex = '9999';
        document.body.appendChild(container);

        // Arrow
        const arrow = document.createElement('div');
        arrow.className = 'tutorial-arrow';
        container.appendChild(arrow);
        state.arrowElement = arrow;

        // Bubble
        const bubble = document.createElement('div');
        bubble.className = 'tutorial-bubble';
        container.appendChild(bubble);
        state.bubbleElement = bubble;
    }

    function update() {
        if (!state.active) return;

        const gameState = Game.getState();
        const data = gameState.dataPoints;
        const internCount = (gameState.buildings['intern'] && gameState.buildings['intern'].count) || 0;

        // Step 1: Click the orb (0-19 data points)
        if (data < 20) {
            const orb = document.getElementById('click-orb');
            if (orb) {
                showArrow(orb, getMessageForClicks(data), 'left');
            }
        }
        // Step 2: Buy Intern (20+ data points, 0 interns)
        else if (data >= 20 && internCount === 0) {
            // Find the buy button
            const internBtn = document.querySelector('.building-item[data-building="intern"]');
            if (internBtn) {
                showArrow(internBtn, Lang.t('tutorial_exploit'), 'right');
            }
        }
        // Step 3: Done
        else {
            complete();
        }
    }

    function getMessageForClicks(clicks) {
        if (clicks === 0) return Lang.t('tutorial_click_start');
        if (clicks < 5) return Lang.t('tutorial_click_keep');
        if (clicks < 10) return Lang.t('tutorial_click_more');
        return Lang.t('tutorial_click_almost');
    }

    function showArrow(target, message, orientation) {
        if (!state.arrowElement || !state.bubbleElement) return;

        const rect = target.getBoundingClientRect();
        const arrow = state.arrowElement;
        const bubble = state.bubbleElement;

        // Reset classes
        arrow.className = 'tutorial-arrow';

        // Position logic
        if (orientation === 'left') {
            // Arrow pointing RIGHT towards the target (placed to the LEFT of target)
            arrow.classList.add('bounce-right');
            arrow.style.left = (rect.left - 80) + 'px';
            arrow.style.top = (rect.top + rect.height / 2 - 25) + 'px'; // Center vertically

            // Bubble above arrow
            bubble.style.left = (rect.left - 200) + 'px';
            bubble.style.top = (rect.top - 60) + 'px';
        } else {
            // Arrow pointing LEFT towards the target (placed to the RIGHT of target)
            // For the intern button on the right sidebar
            arrow.classList.add('bounce-left');
            arrow.style.left = (rect.left - 90) + 'px'; // Pointing from left side of button? 
            // Wait, "points from the right logic area towards this button".
            // Sidebar is on the right. Logic area is center.
            // So arrow should be to the LEFT of the button, pointing RIGHT?
            // "Apuntar hacia el primer edificio (pasante)"
            // The intern button is in the sidebar (right). The arrow should be to its LEFT, pointing RIGHT.

            arrow.classList.add('bounce-right'); // Same animation direction (towards right)
            arrow.style.left = (rect.left - 80) + 'px';
            arrow.style.top = (rect.top + rect.height / 2 - 25) + 'px';

            // Bubble abover
            bubble.style.left = (rect.left - 200) + 'px';
            bubble.style.top = (rect.top - 60) + 'px';
        }

        bubble.textContent = message;
        bubble.style.display = 'block';
        arrow.style.display = 'block';
    }

    function hide() {
        if (state.arrowElement) state.arrowElement.style.display = 'none';
        if (state.bubbleElement) state.bubbleElement.style.display = 'none';
        const layer = document.getElementById('tutorial-layer');
        if (layer) layer.remove();
    }

    function complete() {
        state.active = false;
        hide();
        localStorage.setItem(TUTORIAL_KEY, 'true');
    }

    return {
        init,
        update,
        complete
    };
})();
