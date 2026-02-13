from playwright.sync_api import Page


def test_feature_offline_progress_modal(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__')

    page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'SHOW_OFFLINE_MODAL', dataEarned: 250, secondsAway: 120 })")
    assert page.locator('#modal-overlay.active').count() == 1
