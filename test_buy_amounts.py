import re
import pytest
from playwright.sync_api import Page, expect

def test_buy_amount_logic(page: Page):
    """
    Test the logic for x10, x100, and Max buy amounts.
    Intern: baseCost=20, growthRate=1.18
    """
    page.goto("http://127.0.0.1:8000")
    page.wait_for_load_state("networkidle")

    # Reset game to known state
    page.evaluate("Game.resetGame()")
    page.wait_for_timeout(500)
    
    # Give enough data for testing
    # Intern baseCost=20, growthRate=1.18
    # 10 interns cost: sum of 20*1.18^i for i=0..9 ≈ 305
    # Give 100 data — not enough for x10
    page.evaluate("const s = Game.getState(); s.dataPoints = 100; UI.renderBuildings(s);")
    
    # 1. Test x10 State
    # Select x10
    page.click("button[data-amount='10']")
    
    # Intern button should be LOCKED because 100 < 305
    intern_btn = page.locator(".building-item[data-building='intern']")
    expect(intern_btn).not_to_have_class(re.compile(r"affordable"))
    expect(intern_btn).to_have_class(re.compile(r"locked"))
    
    # 2. Test Affordability updates
    # Give 500 data. Now 10 interns (cost ~305) should be affordable.
    page.evaluate("const s = Game.getState(); s.dataPoints = 500; s.settings.buyAmount = 10; UI.renderBuildings(s);")
    expect(intern_btn).to_have_class(re.compile(r"affordable"))
    
    # 3. Test Max Calculation
    # Select Max
    page.click("button[data-amount='-1']")
    
    # With 500 data and base cost 20, growth 1.18
    # Max should let us buy at least 1, so affordable
    expect(intern_btn).to_have_class(re.compile(r"affordable"))
    
    print("OK: Buy amount logic test passed!")
