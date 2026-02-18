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
        '#tech-debt-meter',
        '#bug-counter',
        '#btn-refactor',
        '#event-log',
        '#crash-overlay',
        '#reboot-button',
        '#right-panel',
    ]
    for selector in required:
        assert page.locator(selector).count() == 1
