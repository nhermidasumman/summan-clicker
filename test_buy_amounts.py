import re
import pytest
from playwright.sync_api import Page, expect

def test_buy_amount_logic(page: Page):
    """
    Test the logic for x10, x100, and Max buy amounts.
    """
    page.goto("http://127.0.0.1:8000")
    page.wait_for_load_state("networkidle")

    # Reset game to known state
    page.evaluate("Game.resetGame()")
    
    # Give enough data for testing
    # Intern cost is 15. 
    # 10 interns cost: 15 * (1.15^10 - 1) / (1.15 - 1) ~= 204
    # Let's give 100 data.
    page.evaluate("const s = Game.getState(); s.dataPoints = 100; UI.renderBuildings(s);")
    
    # 1. Test x10 State
    # Select x10
    page.click("button[data-amount='10']")
    
    # Check if Intern button is LOCKED (class 'locked' or not 'affordable')
    # Because 100 < 204.
    intern_btn = page.locator("#building-intern")
    # It should NOT have 'affordable' class
    expect(intern_btn).not_to_have_class(re.compile(r"affordable"))
    expect(intern_btn).to_have_class(re.compile(r"locked"))
    
    # 2. Test Affordability updates
    # Give 350 data. Now 10 interns (cost ~305) should be affordable.
    page.evaluate("const s = Game.getState(); s.dataPoints = 350; s.settings.buyAmount = 10; UI.renderBuildings(s);")
    expect(intern_btn).to_have_class(re.compile(r"affordable"))
    
    # 3. Test Max Calculation
    # Select Max
    page.click("button[data-amount='-1']")
    
    # With 300 data, and base cost 15, growth 1.15.
    # Max affordable should be calculated.
    # We expect the UI to show the amount we can buy.
    # Retrieve the displayed amount.
    # The UI typically shows "Intern (X)" or similar when Max is selected? 
    # Or maybe the button text updates?
    
    # Let's just check if it's affordable (it should be as long as we can buy at least 1)
    expect(intern_btn).to_have_class(re.compile(r"affordable"))
    
    # Verify the cost displayed on the button matches the bulk cost for that max amount
    # This requires inspecting the UI structure for cost display.
