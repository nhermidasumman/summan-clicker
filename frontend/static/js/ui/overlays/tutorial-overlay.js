const TutorialOverlay = (() => {
    let overlayContainer = null;
    let svgContainer = null;

    // State Tracking
    let currentTarget = null;
    let currentType = null;

    // Element References
    let arrowPath = null;
    let arrowHead = null;
    let rippleEl = null;
    let bubbleEl = null;

    const SVG_NS = "http://www.w3.org/2000/svg";
    const BUBBLE_VIEWPORT_MARGIN = 12;
    const BUBBLE_GAP = 18;

    function init() {
        if (document.getElementById('tutorial-layer')) return;

        // Create Main Container
        overlayContainer = document.createElement('div');
        overlayContainer.id = 'tutorial-layer';
        overlayContainer.style.position = 'fixed';
        overlayContainer.style.top = '0';
        overlayContainer.style.left = '0';
        overlayContainer.style.width = '100vw';
        overlayContainer.style.height = '100vh';
        overlayContainer.style.pointerEvents = 'none';
        overlayContainer.style.zIndex = '9999';

        // SVG Layer
        svgContainer = document.createElementNS(SVG_NS, 'svg');
        svgContainer.style.width = '100%';
        svgContainer.style.height = '100%';
        svgContainer.style.position = 'absolute';
        svgContainer.style.top = '0';
        svgContainer.style.left = '0';

        // Filter Definition (DOM API for robustness)
        const defs = document.createElementNS(SVG_NS, 'defs');
        const filter = document.createElementNS(SVG_NS, 'filter');
        filter.setAttribute('id', 'turbulence-erratic');

        const feTurbulence = document.createElementNS(SVG_NS, 'feTurbulence');
        feTurbulence.setAttribute('type', 'fractalNoise');
        feTurbulence.setAttribute('baseFrequency', '0.05');
        feTurbulence.setAttribute('numOctaves', '2');
        feTurbulence.setAttribute('result', 'noise');

        const feDispMap = document.createElementNS(SVG_NS, 'feDisplacementMap');
        feDispMap.setAttribute('in', 'SourceGraphic');
        feDispMap.setAttribute('in2', 'noise');
        feDispMap.setAttribute('scale', '3');

        filter.appendChild(feTurbulence);
        filter.appendChild(feDispMap);
        defs.appendChild(filter);
        svgContainer.appendChild(defs);

        overlayContainer.appendChild(svgContainer);
        document.body.appendChild(overlayContainer);
    }

    function clear() {
        // Clear DOM elements but keep container
        if (arrowPath) { arrowPath.remove(); arrowPath = null; }
        if (arrowHead) { arrowHead.remove(); arrowHead = null; }
        if (rippleEl) { rippleEl.remove(); rippleEl = null; }
        if (bubbleEl) { bubbleEl.remove(); bubbleEl = null; }

        currentTarget = null;
        currentType = null;

        hideNarrative();
    }

    function render(target, type, text, narrativeStep = 0) {
        // 1. Narrative Mode
        if (narrativeStep > 0) {
            clear(); // Remove arrow/bubble
            showNarrative(text, narrativeStep);
            return;
        }
        hideNarrative();

        // 2. Cleanup if no target
        if (!target) {
            clear();
            return;
        }

        // 3. Check for Identity Change
        if (target !== currentTarget || type !== currentType) {
            clear(); // Full reset for new target
            currentTarget = target;
            currentType = type;

            createElements(target, type, text);
        } else {
            // 4. Update Positions (Scroll/Resize)
            updatePositions(target, type, text);
        }
    }

    function createElements(target, type, text) {
        if (!svgContainer) return;

        // Arrow
        arrowPath = document.createElementNS(SVG_NS, 'path');
        arrowPath.setAttribute('class', 'arrow-final');
        svgContainer.appendChild(arrowPath);

        arrowHead = document.createElementNS(SVG_NS, 'path');
        arrowHead.setAttribute('class', 'arrow-final');
        arrowHead.style.animation = "none";
        arrowHead.style.strokeDasharray = "none";
        svgContainer.appendChild(arrowHead);

        // Ripple
        rippleEl = document.createElement('div');
        rippleEl.className = 'ripple-final tutorial-ripple';
        rippleEl.style.position = 'fixed';
        // Initial size/pos set in update
        overlayContainer.appendChild(rippleEl);

        // Bubble
        if (text) {
            bubbleEl = document.createElement('div');
            bubbleEl.className = 'message-bubble receipt tutorial-bubble';
            bubbleEl.textContent = text;
            document.body.appendChild(bubbleEl); // Attach to body for z-index
        }

        // Initial Position Set
        updatePositions(target, type, text);
    }

    function updatePositions(target, type, text) {
        const rect = target.getBoundingClientRect();

        // --- Arrow Logic ---
        let startX, startY, endX, endY, controlX, controlY;

        if (type === 'orb') {
            startX = rect.left - 100;
            startY = rect.top + rect.height / 2;
            endX = rect.left - 20;
            endY = rect.top + rect.height / 2;
            controlX = (startX + endX) / 2;
            controlY = startY - 40;
        } else if (type === 'intern') {
            startX = rect.right + 100;
            startY = rect.top + rect.height / 2;
            endX = rect.right + 20;
            endY = rect.top + rect.height / 2;
            controlX = (startX + endX) / 2;
            controlY = startY + 40;
        } else if (type === 'dps') {
            // Point to DPS (usually top)
            startX = rect.right + 60;
            startY = rect.top + 60;
            endX = rect.right + 10;
            endY = rect.bottom; // Point to bottom-right corner ish
            controlX = startX;
            controlY = endY + 20;
        } else {
            startX = rect.left - 80;
            startY = rect.bottom + 20;
            endX = rect.left;
            endY = rect.bottom;
            controlX = startX;
            controlY = endY;
        }

        if (arrowPath) {
            const d = `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
            arrowPath.setAttribute('d', d);
        }

        if (arrowHead) {
            const headSize = 20;
            let headD = "";
            if (type === 'orb') {
                headD = `M ${endX - headSize} ${endY - headSize} L ${endX} ${endY} L ${endX - headSize} ${endY + headSize}`;
            } else if (type === 'intern') {
                headD = `M ${endX + headSize} ${endY - headSize} L ${endX} ${endY} L ${endX + headSize} ${endY + headSize}`;
            } else {
                headD = `M ${endX - 10} ${endY + 20} L ${endX} ${endY} L ${endX + 20} ${endY + 10}`;
            }
            arrowHead.setAttribute('d', headD);
        }

        // --- Ripple Logic ---
        if (rippleEl) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            rippleEl.style.left = `${centerX}px`;
            rippleEl.style.top = `${centerY}px`;
        }

        // --- Bubble Logic ---
        if (bubbleEl) {
            applyBubbleLayout(bubbleEl, rect, type, text || "");
        }
    }

    function applyBubbleLayout(bubble, targetRect, type, text) {
        if (bubble.textContent !== text) {
            bubble.textContent = text;
        }

        const maxWidth = Math.max(220, Math.min(460, window.innerWidth - (BUBBLE_VIEWPORT_MARGIN * 2)));
        bubble.style.maxWidth = `${maxWidth}px`;
        bubble.style.width = 'max-content';
        bubble.style.height = 'auto';
        bubble.style.whiteSpace = 'normal';
        bubble.style.wordBreak = 'break-word';
        bubble.style.overflowWrap = 'anywhere';
        bubble.style.visibility = 'hidden';
        bubble.style.left = '0px';
        bubble.style.top = '0px';

        const box = bubble.getBoundingClientRect();
        const bubbleWidth = Math.ceil(box.width);
        const bubbleHeight = Math.ceil(box.height);

        let left = targetRect.left + (targetRect.width / 2) - (bubbleWidth / 2);
        let top = targetRect.bottom + BUBBLE_GAP;

        if (type === 'intern') {
            left = targetRect.left;
            top = targetRect.bottom + BUBBLE_GAP;
        } else if (type === 'dps') {
            left = targetRect.right + BUBBLE_GAP;
            top = targetRect.top + (targetRect.height / 2) - (bubbleHeight / 2);
        }

        if (left + bubbleWidth > window.innerWidth - BUBBLE_VIEWPORT_MARGIN) {
            left = window.innerWidth - bubbleWidth - BUBBLE_VIEWPORT_MARGIN;
        }
        if (left < BUBBLE_VIEWPORT_MARGIN) {
            left = BUBBLE_VIEWPORT_MARGIN;
        }

        if (top + bubbleHeight > window.innerHeight - BUBBLE_VIEWPORT_MARGIN) {
            top = targetRect.top - bubbleHeight - BUBBLE_GAP;
        }
        if (top < BUBBLE_VIEWPORT_MARGIN) {
            top = BUBBLE_VIEWPORT_MARGIN;
        }

        bubble.style.left = `${Math.round(left)}px`;
        bubble.style.top = `${Math.round(top)}px`;
        bubble.style.visibility = 'visible';
    }

    function showNarrative(text, step) {
        let container = document.getElementById('narrative-overlay');
        if (!container) {
            container = document.createElement('div');
            container.id = 'narrative-overlay';
            container.className = 'narrative-overlay';
            const bg = document.createElement('div');
            bg.className = 'mantra-bg';
            container.appendChild(bg);
            document.body.appendChild(container);
        }

        // step mapping: 2->mantra-1, 3->mantra-2, 4+->mantra-3
        let mantraClass = 'mantra-1';
        if (step === 3) mantraClass = 'mantra-2';
        if (step >= 4) mantraClass = 'mantra-3';

        const existingText = container.querySelector('.mantra-text');
        if (existingText) {
            // Only update if changed prevents animation reset? 
            // Actually for mantra we WANT animation reset usually on step change.
            // But we are clearing in render() loop if step 0. 
            // If step is same, we'll keep calling this.
            if (existingText.innerText !== text || !existingText.classList.contains(mantraClass)) {
                existingText.className = `mantra-text ${mantraClass}`;
                existingText.innerText = text;
            }
        } else {
            const txtDiv = document.createElement('div');
            txtDiv.className = `mantra-text ${mantraClass}`;
            txtDiv.innerText = text;
            container.appendChild(txtDiv);
        }
    }

    function hideNarrative() {
        const container = document.getElementById('narrative-overlay');
        if (container) container.remove();
    }

    return {
        init,
        render, // Main entry point
        clear
    };
})();

window.TutorialOverlay = TutorialOverlay;

export const init = TutorialOverlay.init;
export const render = TutorialOverlay.render;
export const clear = TutorialOverlay.clear;
export default TutorialOverlay;

