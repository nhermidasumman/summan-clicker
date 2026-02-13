from playwright.sync_api import Page


def test_feature_random_events_overlay(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__')

    page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'SHOW_BUG_REPORT' })")
    assert page.locator('#bug-report.visible').count() == 1
