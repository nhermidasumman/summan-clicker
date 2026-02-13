from playwright.sync_api import Page


def wait_ready(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__ && window.__SUMMAN_TEST_API__.isReady()')


def test_e2e_progression_midgame(page: Page):
    wait_ready(page)
    page.evaluate('window.__SUMMAN_TEST_API__.reset()')
    page.evaluate("window.__SUMMAN_TEST_API__.setState({ dataPoints: 2000, stats: { ...window.__SUMMAN_TEST_API__.getState().stats, totalDataEarned: 2000, totalDataAllTime: 2000 } })")

    page.click('button[data-amount="10"]')
    page.click('.building-item[data-building="intern"]')

    owned = page.evaluate("window.__SUMMAN_TEST_API__.getState().buildings['intern'] || 0")
    assert owned >= 10
