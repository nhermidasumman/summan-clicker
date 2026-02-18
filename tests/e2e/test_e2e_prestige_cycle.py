from playwright.sync_api import Page


def wait_ready(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__ && window.__SUMMAN_TEST_API__.isReady()')


def test_e2e_prestige_cycle(page: Page):
    wait_ready(page)
    page.evaluate('window.__SUMMAN_TEST_API__.reset()')

    # Buy one boardroom upgrade first.
    page.evaluate("""
        window.__SUMMAN_TEST_API__.setState({
            innovationPoints: 500,
            stats: {
                ...window.__SUMMAN_TEST_API__.getState().stats,
                totalDataEarned: 5_000_000_000,
                totalDataAllTime: 8_000_000_000
            }
        })
    """)

    page.click('#right-panel [data-action="buy-prestige-upgrade"]')
    bought_before = page.evaluate('window.__SUMMAN_TEST_API__.getState().prestigeUpgrades.length')

    result = page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'PRESTIGE' })")
    state = page.evaluate('window.__SUMMAN_TEST_API__.getState()')

    assert result is True
    assert state['innovationPoints'] >= 300
    assert len(state['prestigeUpgrades']) == bought_before
