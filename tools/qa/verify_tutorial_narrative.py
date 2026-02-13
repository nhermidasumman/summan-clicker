from playwright.sync_api import sync_playwright, expect
import time

def run():
    print("🚀 Starting robust verification script (Performance Optimized)...")
    with sync_playwright() as p:
        # Launch with flags to prevent background throttling of `requestAnimationFrame`
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--disable-background-timer-throttling",
                "--disable-backgrounding-occluded-windows",
                "--disable-renderer-backgrounding",
                "--no-sandbox"
            ]
        )
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        
        # Set a reasonable default timeout
        page.set_default_timeout(10000) 

        print("1. Loading game & Resetting...")
        page.goto("http://localhost:8000")
        page.evaluate("Game.resetGame()")
        # Force reload to ensure clean state
        page.reload() 
        time.sleep(1)

        print("2. Clicking Orb 30 times (Safety Margin)...")
        orb = page.locator("#click-orb")
        orb.wait_for(state="visible")
        for _ in range(30): 
            orb.click()
            time.sleep(0.02) # Faster clicking

        print("3. Checking Data Points...")
        data_points = page.evaluate("Game.getState().dataPoints")
        print(f"   Current Data: {data_points}")
        if data_points < 20:
            print("   ❌ Not enough data points! Buying Intern will fail.")
            browser.close()
            exit(1)

        print("4. Buying Intern...")
        intern_btn = page.locator('.building-item[data-building="intern"]')
        intern_btn.wait_for(state="visible")
        
        # Check if affordable
        is_affordable = page.evaluate("Game.getState().dataPoints >= 20")
        if not is_affordable:
             print("   ❌ Intern not affordable according to logic!")
             browser.close()
             exit(1)

        intern_btn.click()
        
        # Verify purchase success
        time.sleep(0.5)
        intern_count = page.evaluate("Game.getState().buildings['intern'] || 0")
        if intern_count < 1:
            print(f"   ❌ Purchase failed! Intern count: {intern_count}")
            page.screenshot(path="debug_purchase_fail.png")
            browser.close()
            exit(1)
        print("   ✅ Intern purchased successfully.")

        # --- NARRATIVE VERIFICATION ---
        
        print("5. Verifying Narrative Start (DPS Highlight)...")
        # Check if tutorial state advanced
        sub_step = page.evaluate("Tutorial.state.subStep")
        print(f"   Current Tutorial SubStep: {sub_step}")
        
        if sub_step < 1:
            print("   ❌ Tutorial did not enter narrative phase!")
            page.screenshot(path="debug_narrative_fail.png")
            browser.close()
            exit(1)
            
        page.screenshot(path="verify_narrative_1_dps.png")

        print("   >> Fast-forwarding DPS phase (skipping 7.5s)...")
        page.evaluate("Tutorial.state.stepTimer -= 7500")

        # Helper to strict wait for text
        def wait_for_text(locator, text, timeout_sec=5):
            start = time.time()
            while time.time() - start < timeout_sec:
                if locator.is_visible():
                    content = locator.inner_text()
                    if text in content:
                        return True
                time.sleep(0.2)
            return False

        print("6. Verifying Mantra 1 (CRECE!)...")
        overlay = page.locator("#tutorial-overlay")
        
        if not wait_for_text(overlay, "CRECE", 5) and not wait_for_text(overlay, "GROW", 1):
             print("   ❌ Mantra 1 not found!")
             page.screenshot(path="debug_mantra1_fail.png")
             # Safe check for inner_html
             try:
                 html_content = overlay.inner_html()
             except:
                 html_content = "Element not found"
             print(f"   Overlay HTML: {html_content}")
             browser.close()
             exit(1)
        
        print("   ✅ Mantra 1 confirmed.")
        page.screenshot(path="verify_narrative_2_mantra1.png")

        print("   >> Fast-forwarding Mantra 1...")
        page.evaluate("Tutorial.state.stepTimer -= 2500")
        
        print("7. Verifying Mantra 2 (ACUMULA!)...")
        if not wait_for_text(overlay, "ACUMULA", 5) and not wait_for_text(overlay, "ACCUMULATE", 1):
             print("   ❌ Mantra 2 not found!")
             browser.close()
             exit(1)
        
        print("   ✅ Mantra 2 confirmed.")
        page.screenshot(path="verify_narrative_3_mantra2.png")

        print("   >> Fast-forwarding Mantra 2...")
        page.evaluate("Tutorial.state.stepTimer -= 2500")

        print("8. Verifying Mantra 3 (UTILIZA...)...")
        if not wait_for_text(overlay, "UTILIZA", 5) and not wait_for_text(overlay, "USE", 1):
             print("   ❌ Mantra 3 not found!")
             browser.close()
             exit(1)
             
        print("   ✅ Mantra 3 confirmed.")
        page.screenshot(path="verify_narrative_4_mantra3.png")
        
        print("✅ Strict verification passed (Optimized & Robust).")
        browser.close()

if __name__ == "__main__":
    run()
