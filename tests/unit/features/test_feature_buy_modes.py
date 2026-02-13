from playwright.sync_api import Page


def wait_ready(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__ && window.__SUMMAN_TEST_API__.isReady()')


def test_feature_buy_modes(page: Page):
    wait_ready(page)
    page.evaluate('window.__SUMMAN_TEST_API__.reset()')
    page.evaluate("window.__SUMMAN_TEST_API__.setState({ dataPoints: 1000000, stats: { ...window.__SUMMAN_TEST_API__.getState().stats, totalDataEarned: 1000000, totalDataAllTime: 1000000 } })")

    page.click('button[data-amount="1"]')
    page.click('.building-item[data-building="intern"]')
    c1 = page.evaluate("window.__SUMMAN_TEST_API__.getState().buildings['intern'] || 0")

    page.click('button[data-amount="10"]')
    page.click('.building-item[data-building="intern"]')
    c2 = page.evaluate("window.__SUMMAN_TEST_API__.getState().buildings['intern'] || 0")

    assert c2 >= c1 + 10


def test_feature_buy_max(page: Page):
    wait_ready(page)
    page.evaluate('window.__SUMMAN_TEST_API__.reset()')
    page.evaluate("window.__SUMMAN_TEST_API__.setState({ dataPoints: 5000, stats: { ...window.__SUMMAN_TEST_API__.getState().stats, totalDataEarned: 5000, totalDataAllTime: 5000 } })")

    page.click('button[data-amount="-1"]')
    page.click('.building-item[data-building="intern"]')
    owned = page.evaluate("window.__SUMMAN_TEST_API__.getState().buildings['intern'] || 0")
    assert owned > 0
