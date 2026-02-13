from playwright.sync_api import Page


def test_contract_save_schema(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__')

    page.evaluate('window.__SUMMAN_TEST_API__.reset()')
    page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'SAVE' })")
    version = page.evaluate("JSON.parse(localStorage.getItem('summan_clicker_save')).version")
    assert version == 2
