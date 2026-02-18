from playwright.sync_api import Page


def test_contract_test_api(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__')

    methods = page.evaluate('Object.keys(window.__SUMMAN_TEST_API__)')
    for method in ['getState', 'setState', 'dispatch', 'reset', 'isReady']:
        assert method in methods


def test_contract_test_api_new_dispatch_actions(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__ && window.__SUMMAN_TEST_API__.isReady()')

    page.evaluate('window.__SUMMAN_TEST_API__.reset()')
    page.evaluate("""
        window.__SUMMAN_TEST_API__.setState({
            bugs: 1200,
            dataPoints: 100000,
            dps: 500,
            stats: {
                ...window.__SUMMAN_TEST_API__.getState().stats,
                totalDataEarned: 100000,
                totalDataAllTime: 100000
            }
        })
    """)

    assert page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'SET_BUGS', bugs: 800 })") is True
    assert page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'RUN_LOGIC_TICKS', ticks: 3 })") is True
    assert page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'FORCE_CRASH' })") is True
    assert page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'REBOOT_CRASH' })") is True

    # Refactor can fail if cost/dps conditions are not met, but dispatch must be callable.
    result = page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'TRIGGER_REFACTOR' })")
    assert isinstance(result, bool)
