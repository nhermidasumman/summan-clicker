from playwright.sync_api import Page


def test_feature_upgrade_unlocks(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__')

    page.evaluate("window.__SUMMAN_TEST_API__.setState({ dataPoints: 5000, stats: { ...window.__SUMMAN_TEST_API__.getState().stats, totalDataEarned: 5000, totalDataAllTime: 5000, totalClicks: 200 } })")
    assert page.locator('.upgrade-tile').count() > 0
