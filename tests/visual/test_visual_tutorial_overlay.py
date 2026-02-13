from playwright.sync_api import Page


def test_visual_tutorial_narrative_overlay(page: Page):
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
            const text = overlay ? overlay.querySelector('.mantra-text') : null;
            return {
                hasOverlay: !!overlay,
                hasText: !!text,
                text: text ? text.textContent : ''
            };
        }
    """)

    assert result['hasOverlay'] is True
    assert result['hasText'] is True
    assert result['text'] == 'TEST MANTRA'
