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

            const anchored = Math.abs((rect.left + rect.width / 2) - (targetRect.left + targetRect.width / 2)) < 220;
            return {
                visible,
                text: (bubble.textContent || '').trim(),
                fitsText,
                inViewport,
                anchored
            };
        }
    """)

    assert result['visible'] is True
    assert len(result['text']) > 0
    assert result['fitsText'] is True
    assert result['inViewport'] is True
    assert result['anchored'] is True
