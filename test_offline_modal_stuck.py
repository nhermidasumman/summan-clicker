import re
import pytest
# -*- coding: utf-8 -*-
from playwright.sync_api import Page, expect

def test_offline_modal_close(page: Page):
    """
    Test that the offline modal (or any modal) can be closed.
    This reproduction test checks if the close button event listener is correctly bound.
    """
    # Load game
    page.goto("http://127.0.0.1:8000")
    page.wait_for_load_state("networkidle")
    
    # 1. Manually trigger the offline modal via console
    #    (simulating what happens on load if save exists, or just testing the modal mechanism)
    page.evaluate("UI.showOfflineModal(1000, 3600)")
    
    # 2. Verify modal is visible
    modal = page.locator("#modal-overlay")
    expect(modal).to_have_class(re.compile(r"active"))
    
    # 3. Click the close button
    close_btn = page.locator("#modal-close")
    close_btn.click()
    
    # 4. Verify modal is closed (no longer has active class)
    expect(modal).not_to_have_class(re.compile(r"active"))

def test_game_init_no_crash(page: Page):
    """
    Test that the game initializes without console errors related to binding events.
    """
    error_logs = []
    page.on("console", lambda msg: error_logs.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda exc: error_logs.append(str(exc)))
    
    page.goto("http://127.0.0.1:8000")
    page.wait_for_load_state("networkidle")
    
    # Check for "Cannot read properties of null" errors
    for log in error_logs:
        if "Cannot read properties of null" in log:
            pytest.fail(f"Game init crashed with error: {log}")
