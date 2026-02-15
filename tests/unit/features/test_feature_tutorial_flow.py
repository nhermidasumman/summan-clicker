from playwright.sync_api import Page


def test_feature_tutorial_overlay_exists(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__')
    result = page.evaluate("""
        () => {
            window.__SUMMAN_TEST_API__.dispatch({
                type: 'SHOW_TUTORIAL_NARRATIVE',
                text: 'TEST MANTRA',
                step: 2
            });
            const overlay = document.getElementById('narrative-overlay');
            return !!overlay;
        }
    """)

    assert result is True


def test_feature_tutorial_bubble_text_visible(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__ && window.__SUMMAN_TEST_API__.isReady()')

    page.evaluate("""
        () => {
            localStorage.removeItem('summan_tutorial_complete');
            window.__SUMMAN_TEST_API__.reset();
        }
    """)
    page.wait_for_timeout(1000)

    result = page.evaluate("""
        () => {
            const bubble = document.querySelector('.tutorial-bubble');
            const target = document.getElementById('click-orb');
            if (!bubble || !target) {
                return { visible: false, text: '', fitsText: false, inViewport: false, anchored: false };
            }

            const style = window.getComputedStyle(bubble);
            const visible = style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity || '1') > 0;
            const rect = bubble.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();

            const fitsText = bubble.scrollWidth <= bubble.clientWidth + 1
              && bubble.scrollHeight <= bubble.clientHeight + 1;

            const inViewport = rect.left >= 0
              && rect.top >= 0
              && rect.right <= window.innerWidth
              && rect.bottom <= window.innerHeight;

            const arrow = document.querySelector('#tutorial-layer img.tutorial-arrow-svg');
            let anchored = false;
            let startChangedAfterClick = false;
            if (arrow) {
                const startX = Number(arrow.dataset.startX || NaN);
                const startY = Number(arrow.dataset.startY || NaN);
                const endX = Number(arrow.dataset.endX || NaN);
                const endY = Number(arrow.dataset.endY || NaN);

                if (Number.isFinite(startX) && Number.isFinite(startY) && Number.isFinite(endX) && Number.isFinite(endY)) {
                    const targetCenterX = targetRect.left + targetRect.width / 2;
                    const targetCenterY = targetRect.top + targetRect.height / 2;
                    const distanceToCenter = Math.hypot(endX - targetCenterX, endY - targetCenterY);
                    const targetRadius = Math.min(targetRect.width, targetRect.height) / 2;
                    const nearTargetEdge = distanceToCenter >= (targetRadius * 0.6)
                        && distanceToCenter <= (targetRadius * 1.2);

                    anchored = nearTargetEdge;
                }

                const oldStart = `${arrow.dataset.startX},${arrow.dataset.startY}`;
                window.__SUMMAN_TEST_API__.dispatch({ type: 'CLICK', x: 12, y: 12 });
                const arrowAfterClick = document.querySelector('#tutorial-layer img.tutorial-arrow-svg');
                if (arrowAfterClick) {
                    const newStart = `${arrowAfterClick.dataset.startX},${arrowAfterClick.dataset.startY}`;
                    startChangedAfterClick = oldStart !== newStart;
                }
            }
            return {
                visible,
                text: (bubble.textContent || '').trim(),
                fitsText,
                inViewport,
                anchored,
                startChangedAfterClick
            };
        }
    """)

    assert result['visible'] is True
    assert len(result['text']) > 0
    assert result['fitsText'] is True
    assert result['inViewport'] is True
    assert result['anchored'] is True
    assert result['startChangedAfterClick'] is True


def test_feature_tutorial_dps_arrow_targets_value(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__ && window.__SUMMAN_TEST_API__.isReady()')

    page.evaluate("""
        () => {
            localStorage.removeItem('summan_tutorial_complete');
            window.__SUMMAN_TEST_API__.reset();
            window.__SUMMAN_TEST_API__.setState({ dataPoints: 100 });
            window.__SUMMAN_TEST_API__.dispatch({ type: 'BUY_BUILDING', buildingId: 'intern' });
        }
    """)
    page.wait_for_timeout(700)

    result = page.evaluate("""
        () => {
            const dps = document.getElementById('dps-display');
            const arrow = document.querySelector('#tutorial-layer img.tutorial-arrow-svg');
            const bubble = document.querySelector('.tutorial-bubble');
            if (!dps || !arrow) return { ok: false };

            const rect = dps.getBoundingClientRect();
            const startX = Number(arrow.dataset.startX || NaN);
            const startY = Number(arrow.dataset.startY || NaN);
            const endX = Number(arrow.dataset.endX || NaN);
            const endY = Number(arrow.dataset.endY || NaN);
            const tipX = Number(arrow.dataset.tipX || NaN);
            const tipY = Number(arrow.dataset.tipY || NaN);
            const targetX = Number.isFinite(tipX) ? tipX : endX;
            const targetY = Number.isFinite(tipY) ? tipY : endY;

            if (!Number.isFinite(startX) || !Number.isFinite(startY) || !Number.isFinite(endX) || !Number.isFinite(endY)) return { ok: false };

            const withinX = targetX >= (rect.left - 36) && targetX <= (rect.left - 6);
            const withinY = targetY >= (rect.top + rect.height * 0.35) && targetY <= (rect.bottom - 1);
            let bubbleNoOverlap = true;
            let bubbleAboveArrow = true;
            if (bubble) {
                const b = bubble.getBoundingClientRect();
                const overlapX = Math.max(0, Math.min(b.right, rect.right) - Math.max(b.left, rect.left));
                const overlapY = Math.max(0, Math.min(b.bottom, rect.bottom) - Math.max(b.top, rect.top));
                bubbleNoOverlap = (overlapX * overlapY) === 0;
                const arrowTop = Math.min(startY, endY);
                bubbleAboveArrow = b.bottom <= (arrowTop - 2);
            }

            return { ok: true, withinX, withinY, bubbleNoOverlap, bubbleAboveArrow };
        }
    """)

    assert result['ok'] is True
    assert result['withinX'] is True
    assert result['withinY'] is True
    assert result['bubbleNoOverlap'] is True
    assert result['bubbleAboveArrow'] is True


def test_feature_tutorial_intern_arrow_avoids_cost_column(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__ && window.__SUMMAN_TEST_API__.isReady()')

    page.evaluate("""
        () => {
            localStorage.removeItem('summan_tutorial_complete');
            window.__SUMMAN_TEST_API__.reset();
            window.__SUMMAN_TEST_API__.setState({ dataPoints: 25 });
        }
    """)
    page.wait_for_timeout(700)

    result = page.evaluate("""
        () => {
            const internItem = document.querySelector('.building-item[data-building="intern"]');
            const arrow = document.querySelector('#tutorial-layer img.tutorial-arrow-svg');
            if (!internItem || !arrow) return { ok: false };

            const rect = internItem.getBoundingClientRect();
            const layerRect = document.getElementById('tutorial-layer').getBoundingClientRect();
            const startX = Number(arrow.dataset.startX || NaN);
            const startY = Number(arrow.dataset.startY || NaN);
            const endX = Number(arrow.dataset.endX || NaN);
            const endY = Number(arrow.dataset.endY || NaN);
            const tipX = Number(arrow.dataset.tipX || NaN);
            const tipY = Number(arrow.dataset.tipY || NaN);
            const targetX = Number.isFinite(tipX) ? tipX : endX;
            const targetY = Number.isFinite(tipY) ? tipY : endY;

            if (!Number.isFinite(startX) || !Number.isFinite(startY) || !Number.isFinite(endX) || !Number.isFinite(endY)) return { ok: false };

            const inRightZone = targetX >= (rect.right + 2) && targetX <= (rect.right + 24);
            const inRowBand = targetY >= (rect.top + rect.height * 0.18) && targetY <= (rect.bottom - rect.height * 0.18);
            const startInsideViewport = startX >= (layerRect.left + 8)
                && startX <= (layerRect.right - 8)
                && startY >= (layerRect.top + 8)
                && startY <= (layerRect.bottom - 8);

            return { ok: true, inRightZone, inRowBand, startInsideViewport };
        }
    """)

    assert result['ok'] is True
    assert result['inRightZone'] is True
    assert result['inRowBand'] is True
    assert result['startInsideViewport'] is True


def test_feature_tutorial_mobile_arrow_tip_alignment(page: Page):
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__ && window.__SUMMAN_TEST_API__.isReady()')

    page.evaluate("""
        () => {
            localStorage.removeItem('summan_tutorial_complete');
            window.__SUMMAN_TEST_API__.reset();
        }
    """)
    page.wait_for_timeout(700)

    page.evaluate("() => window.__SUMMAN_TEST_API__.setState({ dataPoints: 25 })")
    page.wait_for_timeout(700)

    intern_result = page.evaluate("""
        () => {
            const row = document.querySelector('.building-item[data-building="intern"]');
            const arrow = document.querySelector('#tutorial-layer img.tutorial-arrow-svg');
            if (!row || !arrow) return { ok: false };

            const r = row.getBoundingClientRect();
            const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
            // Updated expectation: Production logic now reserves 50px on right for mobile arrow tail
            const expectedX = clamp(r.right + 8, 20, window.innerWidth - 50);
            const expectedY = clamp(r.top + (r.height * 0.52), 20, window.innerHeight - 20);
            const tipX = Number(arrow.dataset.tipX || arrow.dataset.endX || NaN);
            const tipY = Number(arrow.dataset.tipY || arrow.dataset.endY || NaN);
            if (!Number.isFinite(tipX) || !Number.isFinite(tipY)) return { ok: false };

            const distance = Math.hypot(tipX - expectedX, tipY - expectedY);
            return { ok: true, distance };
        }
    """)

    page.evaluate("""
        () => {
            window.__SUMMAN_TEST_API__.setState({ dataPoints: 200 });
            window.__SUMMAN_TEST_API__.dispatch({ type: 'BUY_BUILDING', buildingId: 'intern' });
        }
    """)
    page.wait_for_timeout(900)

    dps_result = page.evaluate("""
        () => {
            const dps = document.getElementById('dps-display');
            const arrow = document.querySelector('#tutorial-layer img.tutorial-arrow-svg');
            if (!dps || !arrow) return { ok: false };

            const r = dps.getBoundingClientRect();
            const expectedX = r.left - 22;
            const expectedY = r.top + (r.height * 0.58);
            const tipX = Number(arrow.dataset.tipX || arrow.dataset.endX || NaN);
            const tipY = Number(arrow.dataset.tipY || arrow.dataset.endY || NaN);
            if (!Number.isFinite(tipX) || !Number.isFinite(tipY)) return { ok: false };

            const distance = Math.hypot(tipX - expectedX, tipY - expectedY);
            return { ok: true, distance };
        }
    """)

    assert intern_result['ok'] is True
    assert intern_result['distance'] <= 24
    assert dps_result['ok'] is True
    assert dps_result['distance'] <= 24


def test_feature_tutorial_narrative_responsive_mobile_viewport(page: Page):
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__')

    result = page.evaluate("""
        () => {
            window.__SUMMAN_TEST_API__.dispatch({
                type: 'SHOW_TUTORIAL_NARRATIVE',
                text: 'UTILIZA TODO Y A TODOS...',
                step: 4
            });

            const mantra = document.querySelector('#narrative-overlay .mantra-text');
            if (!mantra) return { exists: false };

            // Freeze animation to validate base responsive layout deterministically.
            mantra.style.animation = 'none';
            const rect = mantra.getBoundingClientRect();

            const inViewport = rect.left >= 0
              && rect.top >= 0
              && rect.right <= window.innerWidth
              && rect.bottom <= window.innerHeight;

            return {
                exists: true,
                inViewport,
                fontSize: window.getComputedStyle(mantra).fontSize
            };
        }
    """)

    assert result['exists'] is True
    assert result['inViewport'] is True
