# -*- coding: utf-8 -*-
from playwright.sync_api import Page, expect
import pytest
import re

@pytest.fixture(scope="function")
def game_page(page: Page):
    # Capture console logs
    page.on("console", lambda msg: print(f"BROWSER: {msg.type}: {msg.text}"))
    
    page.goto("http://localhost:8000")
    # Wait for game to initialize
    page.wait_for_selector("#click-orb")
    # Reset game to ensure clean state
    page.evaluate("Game.resetGame()")
    page.wait_for_timeout(500)
    return page

def test_tutorial_flow(game_page: Page):
    # 1. Clear storage and reload (resetGame does this but let's be sure for tutorial state)
    game_page.evaluate("localStorage.clear()")
    game_page.reload()
    game_page.wait_for_timeout(1000)

    # 2. Verify Tutorial Arrow exists and points to Orb
    arrow = game_page.locator("#tutorial-canvas") # Canvas is the element now, arrow is drawn on it
    # We can't easily check for "arrow element" since it's canvas drawing.
    # But we can check for state.active via console or just assume if canvas is there.
    # The bubble might still be a DOM element? NO, it's also canvas now.
    
    # Wait, the new implementation draws EVERYTHING on canvas (arrow AND bubble).
    # So checking for .tutorial-bubble selector will FAIL.
    # We need to update the test to check game state or just presence of canvas.
    
    canvas = game_page.locator("#tutorial-canvas")
    expect(canvas).to_be_visible()
    
    # We can verify the text by checking the internal state via evaluate
    # getting the current message from state or checking what Game.state.dataPoints implies
    
    # Initial state (0 clicks) -> "Inicia la operación, da clic"
    # We can't verify rendered text easily on canvas without screenshot comparison or OCR.
    # Let's verify the logical state instead.
    
    # 3. Click 5 times
    orb = game_page.locator("#click-orb")
    for _ in range(5):
        orb.click()
        game_page.wait_for_timeout(50)
    
    # 5-9 clicks -> "El mercado reacciona..."
    
    # 4. Reach 20 clicks (Intern cost is 20)
    for _ in range(15):
        orb.click()
        game_page.wait_for_timeout(50)

    # Now 20+ clicks. 
    # Tutorial state should target 'intern'
    tutorial_target = game_page.evaluate("window.Tutorial.state.currentType")
    assert tutorial_target == 'intern'
    
    # 5. Buy Intern
    intern_btn = game_page.locator(".building-item[data-building='intern']")
    intern_btn.click(force=True)
    
    # 6. Tutorial should complete
    # Wait a bit for update loop
    game_page.wait_for_timeout(100)
    is_active = game_page.evaluate("window.Tutorial.state.active")
    assert is_active is False
    
    # Canvas should be removed
    expect(canvas).not_to_be_attached()

    # 7. Reload page to verify persistence (should stay gone)
    game_page.reload()
    game_page.wait_for_timeout(1000)
    expect(game_page.locator("#tutorial-canvas")).not_to_be_attached()
