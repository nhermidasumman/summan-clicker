import re
from playwright.sync_api import Page, expect


def test_e2e_offline_modal(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')
    page.wait_for_function('() => !!window.__SUMMAN_TEST_API__')

    page.evaluate("window.__SUMMAN_TEST_API__.dispatch({ type: 'SHOW_OFFLINE_MODAL', dataEarned: 1000, secondsAway: 3600 })")
    modal = page.locator('#modal-overlay')
    expect(modal).to_have_class(re.compile(r'active'))

    page.click('#modal-close')
    expect(modal).not_to_have_class(re.compile(r'active'))
