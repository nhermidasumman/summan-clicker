from playwright.sync_api import Page


def test_feature_golden_data_spawns(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__')

    page.evaluate("window.__SUMMAN_TEST_API__.setState({ dataPoints: 1000, dps: 10, stats: { ...window.__SUMMAN_TEST_API__.getState().stats, totalDataEarned: 1000, totalDataAllTime: 1000 } })")
    page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'SHOW_GOLDEN_DATA' })")

    assert page.locator('#golden-data.visible').count() == 1
