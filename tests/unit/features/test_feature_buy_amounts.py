from playwright.sync_api import Page


def test_feature_buy_amount_buttons(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')

    for amount in ['1', '10', '100', '-1']:
        page.click(f'button[data-amount="{amount}"]')
        active = page.locator(f'button[data-amount="{amount}"].active').count()
        assert active == 1
