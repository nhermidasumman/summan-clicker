window.Tutorial = (() => {
    let state = {
        active: false,
        step: 0,
        canvas: null,
        ctx: null,
        rc: null,
        lastDrawTime: 0,
        currentTargetRect: null,
        currentType: null,

        // Cache for stable drawing
        arrowGeometry: null,
        roughSeed: 1
    };

    const TUTORIAL_KEY = 'summan_tutorial_complete';
    const GREEN = '#9ac31c';

    function init() {
        if (localStorage.getItem(TUTORIAL_KEY) === 'true') {
            return;
        }
        console.log("Tutorial: Starting...");
        state.active = true;

        // Initial seed
        reseed();

        createCanvas();

        // Re-seed on click (user requested position change on click)
        document.addEventListener('click', (e) => {
            // If active, reseed to change arrow shape/position
            if (state.active) {
                reseed();
                // draw immediately? Game loop will pick it up next frame
            }
        });

        window.addEventListener('resize', () => {
            if (state.active && state.canvas) {
                resizeCanvas();
            }
        });
    }

    function reseed() {
        state.roughSeed = Math.floor(Math.random() * 10000);
        state.arrowGeometry = {
            width: 25 + Math.random() * 15,
            length: 85 + Math.random() * 30,
            headSize: 35 + Math.random() * 10,
            curve: (Math.random() - 0.5) * 40
        };
    }

    function createCanvas() {
        // Remove existing if any (cleanup)
        const existing = document.getElementById('tutorial-canvas');
        if (existing) existing.remove();

        const canvas = document.createElement('canvas');
        canvas.id = 'tutorial-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '9999';
        document.body.appendChild(canvas);

        state.canvas = canvas;
        state.ctx = canvas.getContext('2d');

        if (typeof rough !== 'undefined') {
            state.rc = rough.canvas(canvas);
        } else {
            console.warn("Rough.js not found immediately. Retrying in 100ms...");
            setTimeout(() => {
                if (typeof rough !== 'undefined') {
                    state.rc = rough.canvas(canvas);
                } else {
                    console.error("Rough.js failed to load.");
                }
            }, 100);
        }

        resizeCanvas();
    }

    function resizeCanvas() {
        if (!state.canvas) return;
        state.canvas.width = window.innerWidth;
        state.canvas.height = window.innerHeight;
    }

    function update() {
        if (!state.active) return;

        // Retry init rc if missed
        if (!state.rc && typeof rough !== 'undefined' && state.canvas) {
            state.rc = rough.canvas(state.canvas);
        }

        const gameState = Game.getState();
        const data = gameState.dataPoints;
        const internCount = (gameState.buildings['intern'] && gameState.buildings['intern'].count) || 0;

        let target = null;
        let type = null;

        if (data < 20) {
            target = document.getElementById('click-orb');
            type = 'orb';
        } else if (data >= 20 && internCount === 0) {
            const internBtn = document.querySelector('.building-item[data-building="intern"]');
            // Only point if visible
            if (internBtn && internBtn.offsetParent !== null) {
                target = internBtn;
                type = 'intern';
            }
        } else {
            complete();
            return;
        }

        if (target) {
            const rect = target.getBoundingClientRect();
            state.currentTargetRect = rect;
            state.currentType = type;
            draw(rect, type);
        } else {
            if (state.ctx && state.canvas) state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
        }
    }

    function draw(rect, type) {
        if (!state.ctx || !state.rc || !state.arrowGeometry) return;

        const ctx = state.ctx;
        const rc = state.rc;
        const width = state.canvas.width;
        const height = state.canvas.height;
        const isMobile = window.innerWidth <= 900;

        ctx.clearRect(0, 0, width, height);

        const targetX = rect.left;
        const targetY = rect.top + rect.height / 2;
        const targetW = rect.width;

        let tipX, tipY, rotation;

        // Configuration based on type AND device
        if (type === 'orb') {
            if (isMobile) {
                // Orb is Top-Center. Arrow points UP from below
                tipX = rect.left + rect.width / 2;
                tipY = rect.bottom + 10; // Slightly below orb
                rotation = -Math.PI / 2 + ((state.roughSeed % 100) / 100 - 0.5) * 0.2;
            } else {
                // Orb: Arrow points RIGHT
                const padding = 20;
                tipX = targetX - padding;
                tipY = targetY;
                rotation = ((state.roughSeed % 100) / 100 - 0.5) * 0.2;
            }
        } else {
            // Intern
            if (isMobile) {
                // Intern is Bottom-Center. Arrow points DOWN from above
                tipX = rect.left + rect.width / 2;
                tipY = rect.top - 10; // Slightly above button
                rotation = Math.PI / 2 + ((state.roughSeed % 100) / 100 - 0.5) * 0.2;
            } else {
                // Intern: Arrow points LEFT
                const padding = 20;
                tipX = targetX + targetW + padding;
                tipY = targetY;
                rotation = Math.PI + ((state.roughSeed % 100) / 100 - 0.5) * 0.2;
            }
        }

        ctx.save();
        ctx.translate(tipX, tipY);
        ctx.rotate(rotation);
        drawBlockyCurvedArrow(rc, 0, 0);
        ctx.restore();

        // Get Message
        let msg = "";
        if (type === 'orb') {
            const clicks = Game.getState().dataPoints;
            if (clicks < 5) msg = Lang.t('tutorial_click_0_4');
            else if (clicks < 10) msg = Lang.t('tutorial_click_5_9');
            else if (clicks < 15) msg = Lang.t('tutorial_click_10_14');
            else msg = Lang.t('tutorial_click_15_19');
        } else {
            msg = Lang.t('tutorial_exploit');
        }

        // Calculate Bubble Dimensions & Position
        ctx.font = 'bold 15px "Comic Sans MS", "Chalkboard SE", sans-serif';
        // Narrower text for mobile to prevent overflow
        const wrapWidth = isMobile ? 200 : 250;
        const lines = wrapText(ctx, msg, wrapWidth);
        const lineHeight = 20;
        const paddingH = 30;
        const paddingV = 20;

        let maxLineWidth = 0;
        lines.forEach(line => {
            const metrics = ctx.measureText(line);
            if (metrics.width > maxLineWidth) maxLineWidth = metrics.width;
        });

        // Ensure bubble is wide enough
        const bubbleW = Math.max(160, maxLineWidth + paddingH * 2);
        const bubbleH = (lines.length * lineHeight) + paddingV * 2;

        // Position relative to tip
        let bubbleX, bubbleY;
        const verticalGap = 40;

        if (isMobile) {
            // Center horizontally
            bubbleX = (window.innerWidth - bubbleW) / 2;

            if (type === 'orb') {
                // Orb: Bubble is BELOW the arrow tail
                const arrowLen = state.arrowGeometry.length;
                bubbleY = tipY + arrowLen + 20;
            } else {
                // Intern: Bubble is ABOVE the arrow tail
                const arrowLen = state.arrowGeometry.length;
                bubbleY = tipY - arrowLen - bubbleH - 20;
            }

            // Clamp bubble to screen horizontal edges
            if (bubbleX < 10) bubbleX = 10;
            if (bubbleX + bubbleW > window.innerWidth - 10) bubbleX = window.innerWidth - bubbleW - 10;

        } else {
            // Desktop Logic
            if (type === 'orb') {
                // Left and Above
                bubbleX = tipX - bubbleW - 20;
                bubbleY = tipY - bubbleH - verticalGap;
            } else {
                // Right and Above
                bubbleX = tipX + 40;
                bubbleY = tipY - bubbleH - verticalGap;
            }
        }

        // Round coordinates to avoid sub-pixel blurring
        bubbleX = Math.round(bubbleX);
        bubbleY = Math.round(bubbleY);

        drawBubble(rc, ctx, bubbleX, bubbleY, bubbleW, bubbleH, lines, lineHeight);
    }

    // Helper for text wrapping
    function wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);

        if (text.includes('(') && lines.length === 1) {
            const parts = text.split('(');
            if (parts.length > 1) return [parts[0].trim(), '(' + parts[1]];
        }

        return lines;
    }

    function drawBlockyCurvedArrow(rc, x, y) {
        const geo = state.arrowGeometry;
        const width = geo.width;
        const length = geo.length;
        const headSize = geo.headSize;
        const curve = geo.curve;

        const headBackX = -headSize;
        const headTopY = -headSize / 1.2;
        const headBotY = headSize / 1.2;
        const tailJoinX = -headSize + 10;
        const tailWidth = width;
        const tailLen = length;

        const cp1x = -tailLen * 0.5;
        const cp1y = -curve;
        const endX = -tailLen;
        const endY = curve / 2;

        let d = `M 0 0 `;
        d += `L ${headBackX} ${headTopY} `;
        d += `L ${tailJoinX} ${-tailWidth / 2} `;
        d += `Q ${cp1x} ${cp1y - tailWidth / 2} ${endX} ${endY - tailWidth / 2} `;
        d += `L ${endX} ${endY + tailWidth / 2} `;
        d += `Q ${cp1x} ${cp1y + tailWidth / 2} ${tailJoinX} ${tailWidth / 2} `;
        d += `L ${headBackX} ${headBotY} `;
        d += `Z`;

        const shadowOpts = {
            seed: state.roughSeed,
            fill: 'black', fillStyle: 'solid', stroke: 'none', roughness: 0.5
        };

        const ctx = state.ctx;
        ctx.save();
        ctx.translate(4, 4);
        rc.path(d, shadowOpts);
        ctx.restore();

        const mainOpts = {
            seed: state.roughSeed + 1,
            fill: GREEN, fillStyle: 'hachure', fillWeight: 3, hachureGap: 3, stroke: 'black', strokeWidth: 2, roughness: 1.5
        };
        rc.path(d, mainOpts);
    }

    function drawBubble(rc, ctx, x, y, w, h, lines, lineHeight) {
        // Reduced roughness for cleaner box edges
        const shadowOpts = { seed: state.roughSeed + 2, fill: 'black', fillStyle: 'solid', stroke: 'none', roughness: 0.5 };
        const mainOpts = { seed: state.roughSeed + 3, fill: 'white', fillStyle: 'solid', stroke: 'black', roughness: 1 }; // Consistent roughness

        ctx.save();
        ctx.translate(4, 4);
        rc.rectangle(x, y, w, h, shadowOpts);
        ctx.restore();

        rc.rectangle(x, y, w, h, mainOpts);

        ctx.save();
        const centerX = x + w / 2;
        let currentY = y + (h - (lines.length * lineHeight)) / 2 + lineHeight / 2;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        lines.forEach(line => {
            if (line.startsWith('(')) {
                ctx.fillStyle = '#555';
                ctx.font = '13px "Comic Sans MS", "Chalkboard SE", sans-serif';
            } else {
                ctx.fillStyle = 'black';
                ctx.font = 'bold 15px "Comic Sans MS", "Chalkboard SE", sans-serif';
            }
            ctx.fillText(line.trim(), centerX, currentY);
            currentY += lineHeight;
        });
        ctx.restore();
    }

    function complete() {
        console.log("Tutorial: Complete!");
        localStorage.setItem(TUTORIAL_KEY, 'true');
        state.active = false;
        if (state.canvas) {
            state.canvas.remove();
            state.canvas = null;
        }
    }

    function restart() {
        console.log("Tutorial: Restarting...");
        localStorage.removeItem(TUTORIAL_KEY);
        if (state.canvas) state.canvas.remove();
        init();
        setTimeout(update, 50);
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
