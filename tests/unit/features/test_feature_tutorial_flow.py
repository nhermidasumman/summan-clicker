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
