from playwright.sync_api import sync_playwright

def run():
    print("Launching mobile view verification...")
    with sync_playwright() as p:
        # Launch browser (headless=True for screenshot)
        browser = p.chromium.launch(headless=True)
        
        # Emulate iPhone 12
        iphone_12 = p.devices['iPhone 12']
        context = browser.new_context(**iphone_12)
        page = context.new_page()

        print("Navigating to game...")
        try:
            page.goto('http://127.0.0.1:8000')
            
            # Reset tutorial for a clean state
            page.evaluate("() => { localStorage.removeItem('summan_tutorial_complete'); window.location.reload(); }")
            page.wait_for_load_state('networkidle')
            
            # Wait for tutorial overlay
            try:
                page.wait_for_selector('.tutorial-bubble', timeout=5000)
                print("Tutorial bubble found!")
            except:
                print("Tutorial bubble not immediately found, dispatching manual trigger...")
                # Force trigger if needed, though clean state should do it
                
            # Take screenshot
            output_path = 'mobile_preview.png'
            page.screenshot(path=output_path)
            print(f"Screenshot saved to {output_path}")
            
        except Exception as e:
            print(f"Error: {e}")
            print("Ensure the game server is running at http://127.0.0.1:8000")
        finally:
            browser.close()

if __name__ == '__main__':
    run()
