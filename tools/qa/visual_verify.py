from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800}) # Desktop view

        print("1. Loading game...")
        page.goto("http://localhost:8000")
        
        # Reset to ensure default state (no buildings bought yet is fine, but we need money to see 'affordable' vs 'locked' or at least see the list)
        # Actually, let's just cheat some buildings to see the text for owned buildings too, if relevant.
        # But the text "Produce X/s" is visible even if 0 owned, usually.
        # Wait, if 0 owned, it shows base DPS.

        # Force some data to make buildings affordable/visible if needed
        page.evaluate("Game.getState().dataPoints = 1000")
        page.evaluate("UI.update(Game.getState(), 0)")
        time.sleep(1)

        # Screenshot the buildings list
        print("2. Capturing Buildings List...")
        
        # Locate the buildings listing
        buildings_list = page.locator("#buildings-list")
        
        if buildings_list.count() > 0:
            buildings_list.screenshot(path="verify_produce_text.png")
            print("   📸 Saved verify_produce_text.png")
        else:
            print("   ❌ Buildings list not found!")

        browser.close()

if __name__ == "__main__":
    run()
