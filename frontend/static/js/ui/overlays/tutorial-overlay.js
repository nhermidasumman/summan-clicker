const TutorialOverlay = (() => {
    let overlayContainer = null;

    // State Tracking
    let currentTarget = null;
    let currentType = null;
    let currentArrowSeed = null;
    let currentArrowStartPoint = null;

    // Element References
    let arrowEl = null;
    let rippleEl = null;
    let bubbleEl = null;

    const BUBBLE_VIEWPORT_MARGIN = 12;
    const BUBBLE_GAP = 28;
    const BUBBLE_TARGET_OFFSET = 42;
    const ARROW_ASSET_PATH = "/static/assets/tutorial-arrows/arrow-comet-tail.svg";
    const ARROW_VIEWBOX_WIDTH = 320;
    const ARROW_VIEWBOX_HEIGHT = 100;
    const ARROW_SOURCE_START = { x: 20, y: 64 };
    const ARROW_SOURCE_END = { x: 292, y: 50 };
    const ARROW_SOURCE_VECTOR_X = ARROW_SOURCE_END.x - ARROW_SOURCE_START.x;
    const ARROW_SOURCE_VECTOR_Y = ARROW_SOURCE_END.y - ARROW_SOURCE_START.y;
    const ARROW_SOURCE_LENGTH = Math.hypot(ARROW_SOURCE_VECTOR_X, ARROW_SOURCE_VECTOR_Y);
    const ARROW_SOURCE_ANGLE = Math.atan2(ARROW_SOURCE_VECTOR_Y, ARROW_SOURCE_VECTOR_X);
    const ARROW_MIN_SCALE_DESKTOP = 0.2;
    const ARROW_MIN_SCALE_MOBILE = 0.1;
    const ARROW_MAX_SCALE = 1.8;

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
        document.body.appendChild(overlayContainer);
    }

    function clear() {
        // Clear DOM elements but keep container
        if (arrowEl) { arrowEl.remove(); arrowEl = null; }
        if (rippleEl) { rippleEl.remove(); rippleEl = null; }
        if (bubbleEl) { bubbleEl.remove(); bubbleEl = null; }

        currentTarget = null;
        currentType = null;
        currentArrowSeed = null;
        currentArrowStartPoint = null;

        hideNarrative();
    }

    function render(target, type, text, narrativeStep = 0, context = {}) {
        // 1. Narrative Mode
        if (narrativeStep > 0) {
            clear(); // Remove arrow/bubble
            showNarrative(text, narrativeStep, context);
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

            createElements(target, type, text, context);

            // Auto-scroll logic: Only scroll if target is NOT fixed (like orb/dps)
            // 'intern' is in a list, so it needs scrolling. 'orb' and 'dps' are main layout.
            if (target && typeof target.scrollIntoView === 'function') {
                if (type !== 'orb' && type !== 'dps') {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }
            }
        } else {
            // 4. Update Positions (Scroll/Resize)
            updatePositions(target, type, text, context);
        }
    }

    function createElements(target, type, text, context = {}) {
        if (!overlayContainer) return;

        arrowEl = document.createElement('img');
        arrowEl.className = 'tutorial-arrow-svg';
        arrowEl.src = ARROW_ASSET_PATH;
        arrowEl.alt = 'Tutorial arrow';
        arrowEl.decoding = 'async';
        arrowEl.loading = 'eager';
        overlayContainer.appendChild(arrowEl);

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
        updatePositions(target, type, text, context);
    }

    function updatePositions(target, type, text, context = {}) {
        const rect = target.getBoundingClientRect();

        // --- Ripple Logic ---
        if (rippleEl) {
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            rippleEl.style.left = `${centerX}px`;
            rippleEl.style.top = `${centerY}px`;
        }

        // --- Arrow Logic (decoupled from bubble) ---
        const startPoint = getArrowStartPoint(rect, type, context);
        const targetPoint = getTargetPoint(rect, type, startPoint);

        // --- Bubble Logic ---
        if (bubbleEl) {
            if (type === 'dps') {
                applyDpsBubbleLayout(bubbleEl, rect, text || "", startPoint, targetPoint);
            } else {
                applyBubbleLayout(bubbleEl, rect, type, text || "");
            }
        }

        updateArrowLayout(startPoint, targetPoint);
    }

    function applyBubbleLayout(bubble, targetRect, type, text) {
        if (bubble.textContent !== text) {
            bubble.textContent = text;
        }

        const preferredMax = type === 'dps' ? 340 : 420;
        const maxWidth = Math.max(220, Math.min(preferredMax, window.innerWidth - (BUBBLE_VIEWPORT_MARGIN * 2)));
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
        const left = position.left;
        const top = position.top;

        bubble.style.left = `${Math.round(left)}px`;
        bubble.style.top = `${Math.round(top)}px`;
        bubble.style.visibility = 'visible';

        return bubble.getBoundingClientRect();
    }

    function applyDpsBubbleLayout(bubble, targetRect, text, startPoint, targetPoint) {
        if (bubble.textContent !== text) {
            bubble.textContent = text;
        }

        const maxWidth = Math.max(220, Math.min(320, window.innerWidth - (BUBBLE_VIEWPORT_MARGIN * 2)));
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

        const arrowAnchorX = startPoint.x + ((targetPoint.x - startPoint.x) * 0.45);
        const arrowTopY = Math.min(startPoint.y, targetPoint.y);
        let left = arrowAnchorX - (bubbleWidth / 2);
        let top = arrowTopY - bubbleHeight - 18;

        // Keep DPS bubble left of the production text block.
        const maxRight = targetRect.left - 24;
        if ((left + bubbleWidth) > maxRight) {
            left = maxRight - bubbleWidth;
        }

        left = clamp(left, BUBBLE_VIEWPORT_MARGIN, window.innerWidth - bubbleWidth - BUBBLE_VIEWPORT_MARGIN);
        top = clamp(top, BUBBLE_VIEWPORT_MARGIN, window.innerHeight - bubbleHeight - BUBBLE_VIEWPORT_MARGIN);

        bubble.style.left = `${Math.round(left)}px`;
        bubble.style.top = `${Math.round(top)}px`;
        bubble.style.visibility = 'visible';

        return bubble.getBoundingClientRect();
    }

    function getPreferredBubblePosition(targetRect, bubbleWidth, bubbleHeight, type) {
        // Mobile Docking Logic
        if (window.innerWidth <= 768) {
            const centerY = targetRect.top + (targetRect.height / 2);
            const windowHeight = window.innerHeight;
            const margin = 16;
            const headerClearance = 120; // Enough space for top bar + data display

            // Mobile Docking Logic - "Below Sphere" Strategy
            const orb = document.getElementById('click-orb');
            let anchorTop = headerClearance; // default fallback

            if (orb) {
                const orbRect = orb.getBoundingClientRect();
                // Anchor just below the orb
                anchorTop = orbRect.bottom + 20;
            } else {
                // Fallback if orb not found (unlikely), approx 45% screen height
                anchorTop = windowHeight * 0.45;
            }

            // Ensure we don't go too low (into buttons) or too high (into header)
            // Header is approx 0-100px.
            // Buttons are approx bottom 100px.
            const minTop = 110;
            const maxTop = windowHeight - bubbleHeight - 110;

            const safeTop = clamp(anchorTop, minTop, maxTop);

            return {
                left: margin,
                top: safeTop
            };
        }

        // Desktop Logic (Original)
        const centerX = targetRect.left + targetRect.width / 2;
        const centerY = targetRect.top + targetRect.height / 2;
        const candidates = [];

        if (type === 'orb') {
            candidates.push(
                { left: centerX - (bubbleWidth / 2), top: targetRect.top - bubbleHeight - BUBBLE_GAP },
                { left: centerX - (bubbleWidth / 2), top: targetRect.bottom + BUBBLE_GAP },
                { left: targetRect.left - bubbleWidth - BUBBLE_TARGET_OFFSET, top: centerY - (bubbleHeight / 2) },
                { left: targetRect.right + BUBBLE_TARGET_OFFSET, top: centerY - (bubbleHeight / 2) },
            );
        } else if (type === 'intern') {
            candidates.push(
                { left: centerX - (bubbleWidth / 2), top: targetRect.top - bubbleHeight - BUBBLE_GAP },
                { left: centerX - (bubbleWidth / 2), top: targetRect.bottom + BUBBLE_GAP },
                { left: targetRect.right + BUBBLE_GAP, top: centerY - (bubbleHeight / 2) },
                { left: targetRect.left - bubbleWidth - BUBBLE_GAP, top: centerY - (bubbleHeight / 2) },
            );
        } else if (type === 'dps') {
            candidates.push(
                { left: centerX - (bubbleWidth / 2), top: targetRect.bottom + BUBBLE_GAP },
                { left: targetRect.left - bubbleWidth - BUBBLE_GAP, top: centerY - (bubbleHeight / 2) },
                { left: targetRect.right + BUBBLE_GAP, top: centerY - (bubbleHeight / 2) },
                { left: centerX - (bubbleWidth / 2), top: targetRect.top - bubbleHeight - BUBBLE_GAP },
            );
        } else {
            candidates.push(
                { left: centerX - (bubbleWidth / 2), top: targetRect.bottom + BUBBLE_GAP },
                { left: centerX - (bubbleWidth / 2), top: targetRect.top - bubbleHeight - BUBBLE_GAP },
            );
        }

        let best = null;
        for (let i = 0; i < candidates.length; i += 1) {
            const candidate = scoreBubbleCandidate(candidates[i], bubbleWidth, bubbleHeight, targetRect, i, type);
            if (!best || candidate.score < best.score) {
                best = candidate;
            }
        }

        if (best) {
            return { left: best.left, top: best.top };
        }

        return { left: centerX - (bubbleWidth / 2), top: targetRect.bottom + BUBBLE_GAP };
    }

    function scoreBubbleCandidate(candidate, width, height, targetRect, priority, type = '') {
        const minX = BUBBLE_VIEWPORT_MARGIN;
        const maxX = window.innerWidth - width - BUBBLE_VIEWPORT_MARGIN;
        const minY = BUBBLE_VIEWPORT_MARGIN;
        const maxY = window.innerHeight - height - BUBBLE_VIEWPORT_MARGIN;

        const clampedLeft = clamp(candidate.left, minX, maxX);
        const clampedTop = clamp(candidate.top, minY, maxY);
        const overflowPenalty = Math.abs(candidate.left - clampedLeft) + Math.abs(candidate.top - clampedTop);
        const overlapPenalty = getRectOverlapArea(
            { left: clampedLeft, top: clampedTop, right: clampedLeft + width, bottom: clampedTop + height },
            targetRect,
        );
        let extraPenalty = 0;
        if (type === 'dps') {
            const dataDisplay = document.getElementById('data-display');
            if (dataDisplay) {
                const displayRect = dataDisplay.getBoundingClientRect();
                const displayOverlap = getRectOverlapArea(
                    { left: clampedLeft, top: clampedTop, right: clampedLeft + width, bottom: clampedTop + height },
                    displayRect,
                );
                extraPenalty += displayOverlap * 8;
            }
        }

        return {
            left: clampedLeft,
            top: clampedTop,
            score: (overflowPenalty * 40) + overlapPenalty + extraPenalty + (priority * 8),
        };
    }

    function getRectOverlapArea(a, b) {
        const overlapX = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const overlapY = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        return overlapX * overlapY;
    }

    function getTargetPoint(targetRect, type, startPoint = null) {
        const isMobile = window.innerWidth <= 768;

        if (type === 'intern') {
            const x = targetRect.right + 8;
            const y = targetRect.top + targetRect.height * 0.52;
            // On mobile, reserve space on the right for the arrow tail if possible
            const maxX = window.innerWidth - (isMobile ? 50 : 20);
            return {
                x: Math.round(clamp(x, 20, maxX)),
                y: Math.round(clamp(y, 20, window.innerHeight - 20)),
            };
        }
        if (type === 'dps') {
            const x = targetRect.left - 22;
            const y = targetRect.top + (targetRect.height * 0.58);
            return {
                x: Math.round(x),
                y: Math.round(y),
            };
        }
        if (type === 'orb') {
            const centerX = targetRect.left + targetRect.width / 2;
            const centerY = targetRect.top + targetRect.height / 2;
            const radius = Math.max(16, (Math.min(targetRect.width, targetRect.height) * 0.46));

            const vectorX = (startPoint ? startPoint.x : targetRect.left) - centerX;
            const vectorY = (startPoint ? startPoint.y : centerY) - centerY;
            const length = Math.hypot(vectorX, vectorY) || 1;
            const ux = vectorX / length;
            const uy = vectorY / length;

            return {
                x: Math.round(centerX + (ux * (radius - 2))),
                y: Math.round(centerY + (uy * (radius - 2))),
            };
        }
        return {
            x: Math.round(targetRect.left),
            y: Math.round(targetRect.top + targetRect.height / 2),
        };
    }

    function getFallbackArrowStart(targetRect, type) {
        const isMobile = window.innerWidth <= 768;

        if (type === 'intern') {
            const offset = isMobile ? 60 : 138;
            const desiredX = targetRect.right + offset;
            const desiredY = targetRect.top + targetRect.height * 0.52;
            // Allow arrow start to be closer to edge on mobile to maintain distance from target
            const maxX = window.innerWidth - (isMobile ? 10 : 140);
            const x = clamp(desiredX, 30, maxX);
            const y = clamp(desiredY, 30, window.innerHeight - 30);
            return {
                x: Math.round(x),
                y: Math.round(y),
            };
        }
        if (type === 'dps') {
            const offset = isMobile ? 60 : 170;
            const desiredX = targetRect.left - offset;
            const desiredY = targetRect.top + (targetRect.height * 0.95);
            const x = clamp(desiredX, 30, window.innerWidth - (isMobile ? 20 : 140));
            const y = clamp(desiredY, 30, window.innerHeight - 30);
            return {
                x: Math.round(x),
                y: Math.round(y),
            };
        }
        return {
            x: Math.round(targetRect.left - (isMobile ? 60 : 110)),
            y: Math.round(targetRect.top + targetRect.height / 2),
        };
    }

    function seededUnit(seed, offset = 0) {
        const x = Math.sin((seed + 1 + offset) * 12.9898) * 43758.5453;
        return x - Math.floor(x);
    }

    function getOrbArrowStart(targetRect, clickSeed) {
        const centerX = targetRect.left + (targetRect.width / 2);
        const centerY = targetRect.top + (targetRect.height / 2);

        const angle = seededUnit(clickSeed, 0) * Math.PI * 2;
        const distanceFactor = 1.1 + (seededUnit(clickSeed, 13) * 0.6);
        const radius = Math.max(targetRect.width, targetRect.height) * distanceFactor;

        const rawX = centerX + (Math.cos(angle) * radius);
        const rawY = centerY + (Math.sin(angle) * radius);

        return {
            x: Math.round(clamp(rawX, 24, window.innerWidth - 24)),
            y: Math.round(clamp(rawY, 24, window.innerHeight - 24)),
        };
    }

    function getArrowStartPoint(targetRect, type, context = {}) {
        if (type === 'orb') {
            const clickSeed = Number(context.clickSeed ?? 0);
            if (currentArrowStartPoint && currentArrowSeed === clickSeed) {
                return currentArrowStartPoint;
            }
            currentArrowSeed = clickSeed;
            currentArrowStartPoint = getOrbArrowStart(targetRect, clickSeed);
            return currentArrowStartPoint;
        }

        currentArrowSeed = null;
        currentArrowStartPoint = null;
        return getFallbackArrowStart(targetRect, type);
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function getArrowMinScale() {
        const compactViewport = Math.max(window.innerWidth, window.innerHeight) <= 900;
        return compactViewport ? ARROW_MIN_SCALE_MOBILE : ARROW_MIN_SCALE_DESKTOP;
    }

    function updateArrowLayout(startPoint, endPoint) {
        if (!arrowEl) return;

        const targetVectorX = endPoint.x - startPoint.x;
        const targetVectorY = endPoint.y - startPoint.y;
        const targetLength = Math.hypot(targetVectorX, targetVectorY);

        if (targetLength < 1) {
            arrowEl.style.display = 'none';
            return;
        }

        const minScale = getArrowMinScale();
        const scale = clamp(targetLength / ARROW_SOURCE_LENGTH, minScale, ARROW_MAX_SCALE);
        const width = ARROW_VIEWBOX_WIDTH * scale;
        const height = ARROW_VIEWBOX_HEIGHT * scale;
        const startOffsetX = ARROW_SOURCE_START.x * scale;
        const startOffsetY = ARROW_SOURCE_START.y * scale;
        const left = Math.round(startPoint.x - startOffsetX);
        const top = Math.round(startPoint.y - startOffsetY);
        const targetAngle = Math.atan2(targetVectorY, targetVectorX);
        const rotationDeg = (targetAngle - ARROW_SOURCE_ANGLE) * (180 / Math.PI);
        const unitX = targetVectorX / targetLength;
        const unitY = targetVectorY / targetLength;
        const renderedLength = ARROW_SOURCE_LENGTH * scale;
        const tipX = startPoint.x + (unitX * renderedLength);
        const tipY = startPoint.y + (unitY * renderedLength);

        arrowEl.style.display = 'block';
        arrowEl.style.left = `${left}px`;
        arrowEl.style.top = `${top}px`;
        arrowEl.style.width = `${Math.round(width)}px`;
        arrowEl.style.height = `${Math.round(height)}px`;
        arrowEl.style.transformOrigin = `${startOffsetX}px ${startOffsetY}px`;
        arrowEl.style.transform = `rotate(${rotationDeg}deg)`;

        arrowEl.dataset.startX = `${Math.round(startPoint.x)}`;
        arrowEl.dataset.startY = `${Math.round(startPoint.y)}`;
        arrowEl.dataset.endX = `${Math.round(endPoint.x)}`;
        arrowEl.dataset.endY = `${Math.round(endPoint.y)}`;
        arrowEl.dataset.tipX = `${Math.round(tipX)}`;
        arrowEl.dataset.tipY = `${Math.round(tipY)}`;
        arrowEl.dataset.scale = scale.toFixed(3);
    }

    function showNarrative(text, step, context = {}) {
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
        let narrativeStepClass = 'narrative-step-2';
        if (step === 3) mantraClass = 'mantra-2';
        if (step === 3) narrativeStepClass = 'narrative-step-3';
        if (step >= 4) {
            mantraClass = 'mantra-3';
            narrativeStepClass = 'narrative-step-4';
        }
        container.className = `narrative-overlay ${narrativeStepClass}`;

        const nextOpacity = Number(context.narrativeOpacity);
        const narrativeOpacity = Number.isFinite(nextOpacity) ? clamp(nextOpacity, 0, 1) : 1;
        container.style.opacity = `${narrativeOpacity}`;

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

