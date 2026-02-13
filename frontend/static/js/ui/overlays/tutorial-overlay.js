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
    const BUBBLE_GAP = 28;
    const BUBBLE_TARGET_OFFSET = 42;

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

        // --- Ripple Logic ---
        if (rippleEl) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            rippleEl.style.left = `${centerX}px`;
            rippleEl.style.top = `${centerY}px`;
        }

        // --- Bubble Logic ---
        let bubbleRect = null;
        if (bubbleEl) {
            bubbleRect = applyBubbleLayout(bubbleEl, rect, type, text || "");
        }

        // --- Arrow Logic (bubble-first for visual coherence) ---
        const targetPoint = getTargetPoint(rect, type);
        const startPoint = bubbleRect
            ? getBubbleAnchorPoint(bubbleRect, targetPoint)
            : getFallbackArrowStart(rect, type);
        const controlPoint = getArrowControlPoint(startPoint, targetPoint, type);

        if (arrowPath) {
            const d = `M ${startPoint.x} ${startPoint.y} Q ${controlPoint.x} ${controlPoint.y} ${targetPoint.x} ${targetPoint.y}`;
            arrowPath.setAttribute('d', d);
        }

        if (arrowHead) {
            const angle = Math.atan2(targetPoint.y - controlPoint.y, targetPoint.x - controlPoint.x);
            arrowHead.setAttribute('d', buildArrowHeadPath(targetPoint.x, targetPoint.y, angle, 18, Math.PI / 7));
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

        const position = getPreferredBubblePosition(targetRect, bubbleWidth, bubbleHeight, type);
        let left = position.left;
        let top = position.top;

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

        return bubble.getBoundingClientRect();
    }

    function getPreferredBubblePosition(targetRect, bubbleWidth, bubbleHeight, type) {
        const centerX = targetRect.left + targetRect.width / 2;
        const centerY = targetRect.top + targetRect.height / 2;

        if (type === 'orb') {
            return {
                left: targetRect.left - bubbleWidth - BUBBLE_TARGET_OFFSET,
                top: centerY - bubbleHeight / 2,
            };
        }
        if (type === 'intern') {
            return {
                left: targetRect.right + BUBBLE_TARGET_OFFSET,
                top: centerY - bubbleHeight / 2,
            };
        }
        if (type === 'dps') {
            return {
                left: targetRect.right + BUBBLE_GAP,
                top: targetRect.top - bubbleHeight / 2,
            };
        }

        return {
            left: centerX - bubbleWidth / 2,
            top: targetRect.bottom + BUBBLE_GAP,
        };
    }

    function getTargetPoint(targetRect, type) {
        if (type === 'intern') {
            return {
                x: Math.round(targetRect.right),
                y: Math.round(targetRect.top + targetRect.height / 2),
            };
        }
        if (type === 'dps') {
            return {
                x: Math.round(targetRect.right - 8),
                y: Math.round(targetRect.top + targetRect.height / 2),
            };
        }
        return {
            x: Math.round(targetRect.left),
            y: Math.round(targetRect.top + targetRect.height / 2),
        };
    }

    function getBubbleAnchorPoint(bubbleRect, targetPoint) {
        const centerX = bubbleRect.left + bubbleRect.width / 2;
        const centerY = bubbleRect.top + bubbleRect.height / 2;
        const deltaX = targetPoint.x - centerX;
        const deltaY = targetPoint.y - centerY;

        if (Math.abs(deltaX) >= Math.abs(deltaY)) {
            return {
                x: Math.round(deltaX >= 0 ? bubbleRect.right : bubbleRect.left),
                y: Math.round(centerY),
            };
        }

        return {
            x: Math.round(centerX),
            y: Math.round(deltaY >= 0 ? bubbleRect.bottom : bubbleRect.top),
        };
    }

    function getFallbackArrowStart(targetRect, type) {
        if (type === 'intern') {
            return {
                x: Math.round(targetRect.right + 110),
                y: Math.round(targetRect.top + targetRect.height / 2),
            };
        }
        if (type === 'dps') {
            return {
                x: Math.round(targetRect.right + 90),
                y: Math.round(targetRect.top + 30),
            };
        }
        return {
            x: Math.round(targetRect.left - 110),
            y: Math.round(targetRect.top + targetRect.height / 2),
        };
    }

    function getArrowControlPoint(startPoint, endPoint, type) {
        const midX = (startPoint.x + endPoint.x) / 2;
        const midY = (startPoint.y + endPoint.y) / 2;
        const distance = Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
        const curve = Math.max(24, Math.min(70, distance * 0.25));

        if (type === 'intern') {
            return { x: Math.round(midX), y: Math.round(midY + curve * 0.4) };
        }
        if (type === 'dps') {
            return { x: Math.round(midX), y: Math.round(midY - curve * 0.2) };
        }
        return { x: Math.round(midX), y: Math.round(midY - curve * 0.4) };
    }

    function buildArrowHeadPath(endX, endY, angle, size, spread) {
        const x1 = endX - size * Math.cos(angle - spread);
        const y1 = endY - size * Math.sin(angle - spread);
        const x2 = endX - size * Math.cos(angle + spread);
        const y2 = endY - size * Math.sin(angle + spread);
        return `M ${x1} ${y1} L ${endX} ${endY} L ${x2} ${y2}`;
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

