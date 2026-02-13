from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True) # Run headless for speed, change to False to watch
        
        # Create context with mobile viewport
        context = browser.new_context(
            viewport={'width': 375, 'height': 667},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        )
        page = context.new_page()

        print("1. Loading game...")
        page.goto("http://localhost:8000")
        
        # Ensure clean state
        print("2. Resetting game state...")
        page.evaluate("Game.resetGame()")
        time.sleep(1) # Wait for animation/reload

        # Check for Canvas
        canvas = page.locator("#tutorial-canvas")
        if canvas.count() > 0:
            print("   ✅ Tutorial canvas found.")
        else:
            print("   ❌ Tutorial canvas NOT found!")

        # Screenshot 1: Orb Arrow (Mobile)
        print("3. Capturing Orb step (Mobile)...")
        page.screenshot(path="tutorial_mobile_orb.png")
        print("   📸 Saved tutorial_mobile_orb.png")

        # Progress to Intern step
        print("4. Clicking Orb 20 times...")
        orb = page.locator("#click-orb")
        for _ in range(20):
            orb.click()
            time.sleep(0.05)
        
        time.sleep(1) # Wait for update loop

        # Screenshot 2: Intern Arrow (Mobile)
        print("5. Capturing Intern step (Mobile)...")
        page.screenshot(path="tutorial_mobile_intern.png")
        print("   📸 Saved tutorial_mobile_intern.png")

        # Verify Intern arrow direction (logic check)
        # We can check specific drawing logic via evaluate if needed, 
        # but visual screenshot is best for "Up/Down" check.
        
        # Test Reset
        print("6. Testing Game Reset...")
        # Interact to make sure we have some progress to wipe
        page.evaluate("Game.resetGame()")
        time.sleep(1)

        # Check if tutorial restarted
        is_active = page.evaluate("window.Tutorial.state.active")
        if is_active:
            print("   ✅ Tutorial is active after reset.")
        else:
            print("   ❌ Tutorial is NOT active after reset!")
            
        print("7. Capturing Reset state...")
        page.screenshot(path="tutorial_mobile_reset.png")
        print("   📸 Saved tutorial_mobile_reset.png")

        browser.close()

if __name__ == "__main__":
    run()
