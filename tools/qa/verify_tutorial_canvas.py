from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))
        
        # Clear local storage first
        page.goto("http://127.0.0.1:8000")
        page.evaluate("localStorage.clear()")
        page.reload()
        
        # Check if tutorial canvas exists
        try:
            page.wait_for_selector("#tutorial-canvas", timeout=5000)
            print("SUCCESS: Tutorial canvas found.")
        except:
            print("FAILURE: Tutorial canvas NOT found.")
            
        # Check if Rough.js loaded (window.rough)
        is_rough_loaded = page.evaluate("typeof window.rough !== 'undefined'")
        if is_rough_loaded:
            print("SUCCESS: Rough.js loaded.")
        else:
            print("FAILURE: Rough.js NOT loaded.")

        # Check tutorial state
        is_active = page.evaluate("window.Tutorial && window.Tutorial.state && window.Tutorial.state.active")
        if is_active:
             print("SUCCESS: Tutorial state is active.")
        else:
             print("FAILURE: Tutorial state is NOT active.")

        browser.close()

if __name__ == "__main__":
    run()
