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
            if (!bubble) return { visible: false, text: '' };

            const style = window.getComputedStyle(bubble);
            const visible = style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity || '1') > 0;
            return { visible, text: (bubble.textContent || '').trim() };
        }
    """)

    assert result['visible'] is True
    assert len(result['text']) > 0
