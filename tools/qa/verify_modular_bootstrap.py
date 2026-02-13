from playwright.sync_api import sync_playwright, expect


def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1366, "height": 768})

        page.goto('http://127.0.0.1:8000')
        expect(page.locator('#click-orb')).to_be_visible()
        expect(page.locator('#data-counter')).to_be_visible()
        expect(page.locator('#buildings-list')).to_be_visible()
        page.wait_for_timeout(1000)
        page.screenshot(path='tools/qa/verify_modular_bootstrap.png', full_page=True)

        browser.close()


if __name__ == '__main__':
    run()
