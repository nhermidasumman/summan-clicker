from playwright.sync_api import Page


def test_feature_achievements_render(page: Page):
    page.goto('http://127.0.0.1:8000')
    page.wait_for_selector('#click-orb')

    page.click('#tab-achievements')
    assert page.locator('.achievement-item').count() >= 20
