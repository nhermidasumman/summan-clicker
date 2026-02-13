from playwright.sync_api import Page


def test_contract_test_api(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__')

    methods = page.evaluate('Object.keys(window.__SUMMAN_TEST_API__)')
    for method in ['getState', 'setState', 'dispatch', 'reset', 'isReady']:
        assert method in methods
