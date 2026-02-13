from playwright.sync_api import Page


def test_contract_dom_ids(page: Page):
    page.goto('http://127.0.0.1:8000')
    required = [
        '#click-orb',
        '#data-counter',
        '#dps-display',
        '#buildings-list',
        '#upgrades-list',
        '#effects-bar',
        '#modal-overlay',
        '#toast-container',
    ]
    for selector in required:
        assert page.locator(selector).count() == 1
