from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})

        print("1. Loading game & Resetting...")
        page.goto("http://localhost:8000")
        page.evaluate("Game.resetGame()")
        time.sleep(1)

        print("2. Triggering Narrative...")
        # Cheat to skip orb clicks
        page.evaluate("Game.getState().dataPoints = 25")
        # We still need the game loop to see we have enough points
        time.sleep(0.5)
        page.click('.building-item[data-building="intern"]')

        print("3. Waiting for sequence to finish (~15s)...")
        # Speed up game time or just wait? We'll wait to differ from the real experience as little as possible
        # Actually, we can just wait for the element to DISAPPEAR
        
        overlay = page.locator("#tutorial-overlay")
        
        # Wait for it to appear first (to confirm it started)
        try:
            overlay.wait_for(state="visible", timeout=10000)
            print("   ✅ Overlay appeared.")
        except:
             print("   ❌ Overlay NEVER appeared! Validation failed.")
             browser.close()
             exit(1)

        # Now wait for it to disappear
        print("4. Waiting for Overlay Removal...")
        try:
            overlay.wait_for(state="hidden", timeout=20000) # Give it plenty of time
            print("   ✅ Overlay is GONE (Strictly verified).")
        except:
            print("   ❌ Overlay STUCK visible! Validation failed.")
            page.screenshot(path="debug_overlay_stuck_strict.png")
            browser.close()
            exit(1)

        # Check LocalStorage
        complete_val = page.evaluate("localStorage.getItem('summan_tutorial_complete')")
        assert complete_val == 'true', f"Expected localStorage complete=true, got {complete_val}"
        print("   ✅ LocalStorage marked as complete.")

        browser.close()

if __name__ == "__main__":
    run()
