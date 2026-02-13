import re
from playwright.sync_api import Page, expect


def wait_ready(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__ && window.__SUMMAN_TEST_API__.isReady()')


def test_e2e_new_game_smoke(page: Page):
    wait_ready(page)
    page.evaluate('window.__SUMMAN_TEST_API__.reset()')

    before = page.evaluate('window.__SUMMAN_TEST_API__.getState().dataPoints')
    page.click('#click-target')
    page.wait_for_timeout(100)
    after = page.evaluate('window.__SUMMAN_TEST_API__.getState().dataPoints')

    assert after > before
    expect(page.locator('#data-counter')).to_be_visible()


def test_e2e_settings_language_switch(page: Page):
    wait_ready(page)
    page.click('#btn-settings')
    page.click('[data-action="set-language"][data-lang="en"]')
    expect(page.locator('#game-subtitle')).to_contain_text('Digital Transformation')
