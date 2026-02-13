from playwright.sync_api import Page


def wait_ready(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__ && window.__SUMMAN_TEST_API__.isReady()')


def test_progression_buy_building_exact_cost(page: Page):
    wait_ready(page)
    page.evaluate('window.__SUMMAN_TEST_API__.reset()')
    page.evaluate("""
        window.__SUMMAN_TEST_API__.setState({
            dataPoints: 100,
            stats: {
                ...window.__SUMMAN_TEST_API__.getState().stats,
                totalDataEarned: 100,
                totalDataAllTime: 100
            }
        })
    """)

    page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'SET_BUY_AMOUNT', amount: 1 })")
    page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'BUY_BUILDING', buildingId: 'intern' })")

    state = page.evaluate('window.__SUMMAN_TEST_API__.getState()')
    assert (state['buildings'].get('intern') or 0) == 1
    assert int(state['dataPoints']) == 80


def test_progression_buy_max_respects_bulk_math(page: Page):
    wait_ready(page)
    page.evaluate('window.__SUMMAN_TEST_API__.reset()')
    page.evaluate("""
        window.__SUMMAN_TEST_API__.setState({
            dataPoints: 100,
            stats: {
                ...window.__SUMMAN_TEST_API__.getState().stats,
                totalDataEarned: 100,
                totalDataAllTime: 100
            }
        })
    """)

    page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'SET_BUY_AMOUNT', amount: -1 })")
    page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'BUY_BUILDING', buildingId: 'intern' })")

    state = page.evaluate('window.__SUMMAN_TEST_API__.getState()')
    assert (state['buildings'].get('intern') or 0) == 3
    assert int(state['dataPoints']) == 28
