import pytest
import re
from playwright.sync_api import Page, expect

@pytest.fixture(scope="function")
def game_page(page: Page):
    # Log console messages
    page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.type}: {msg.text}"))
    page.on("pageerror", lambda err: print(f"BROWSER ERROR: {err.message}"))
    
    page.goto("http://localhost:8000")
    # Wait for game to initialize
    page.wait_for_selector("#click-orb")
    # Reset game to ensure clean state (Game.resetGame has no confirm dialog)
    page.evaluate("Game.resetGame()")
    # Wait a moment for initialization to settle
    page.wait_for_timeout(500)
    return page

def test_game_loads(game_page: Page):
    """Verify the game loads and core elements are visible."""
    expect(game_page.locator("#game-title")).to_contain_text("Summan")
    expect(game_page.locator("#data-counter")).to_be_visible()
    expect(game_page.locator("#click-orb")).to_be_visible()
    # Take visual proof
    game_page.screenshot(path="game_verify.png")

def test_no_decimals_in_ui(game_page: Page):
    """Verify that no decimal points are shown in the main data counter."""
    # Data counter should not have a dot (main counter stays integer)
    expect(game_page.locator("#data-counter")).not_to_have_text(re.compile(r"\."))

def test_clicking_mechanic(game_page: Page):
    """Verify clicking generates data."""
    target = game_page.locator("#click-target")
    counter = game_page.locator("#data-counter")
    
    initial_text = counter.inner_text()
    
    # Click 20 times to be sure
    for _ in range(20):
        target.click()
        
    # Wait a moment for UI loop
    game_page.wait_for_timeout(500)
    
    # Verify counter increased
    expect(counter).not_to_have_text(initial_text, timeout=10000)
    
def test_buy_building(game_page: Page):
    """Verify buying a building works and increases DPS."""
    # Cheat to get money
    game_page.evaluate("Game.getState().dataPoints = 1000")
    game_page.evaluate("UI.update(Game.getState(), 0)")
    
    # Buy Intern (first building)
    intern_btn = game_page.locator(".building-item").first
    expect(intern_btn).to_have_class(re.compile("affordable"))
    
    intern_btn.click()
    
    # Verify owned count increased
    expect(game_page.locator(".building-owned").first).to_have_text("1")
    
    # Verify DPS increased
    dps = game_page.locator("#dps-display")
    expect(dps).not_to_contain_text("0.0 /s")

def test_tabs_switching(game_page: Page):
    """Verify tabs switch correctly."""
    # Click Upgrades tab
    game_page.locator("#tab-upgrades").click()
    expect(game_page.locator("#panel-upgrades")).to_have_class(re.compile("active"))
    expect(game_page.locator("#panel-buildings")).not_to_have_class(re.compile("active"))
    
    # Click Achievements tab
    game_page.locator("#tab-achievements").click()
    expect(game_page.locator("#panel-achievements")).to_have_class(re.compile("active"))

def test_achievements_rendering(game_page: Page):
    """Verify achievements render without error."""
    game_page.locator("#tab-achievements").click()
    items = game_page.locator(".achievement-item")
    expect(items).to_have_count(28) # 28 defined achievements

def test_modals_interface(game_page: Page):
    """Verify statistics and settings modals render with icons."""
    # Stats Modal
    game_page.locator("#btn-stats").click()
    expect(game_page.locator("#modal-overlay")).to_have_class(re.compile("active"))
    expect(game_page.locator("#modal-title")).to_have_text(re.compile(r"Estadísticas|Statistics"))
    # Check for icon in a stat row
    expect(game_page.locator(".stat-row").first).to_have_text(re.compile(r"📊"))
    game_page.locator("#modal-close").click()
    expect(game_page.locator("#modal-overlay")).not_to_have_class(re.compile("active"))
    
    # Settings Modal
    game_page.locator("#btn-settings").click()
    expect(game_page.locator("#modal-overlay")).to_have_class(re.compile("active"))
    # Check for icons in settings buttons
    expect(game_page.locator(".settings-btn").first).to_have_text(re.compile(r"📤"))
    expect(game_page.locator(".settings-btn.danger")).to_have_text(re.compile(r"🗑️"))
    game_page.locator("#modal-close").click()
    
    # Prestige Modal (Cheat to show it)
    game_page.evaluate("Game.getState().stats.totalDataAllTime = 1000000000")
    game_page.evaluate("UI.renderPrestige(Game.getState())")
    game_page.locator("#btn-prestige").click()
    expect(game_page.locator("#modal-overlay")).to_have_class(re.compile("active"))
    expect(game_page.locator(".prestige-btn")).to_have_text(re.compile(r"🚀"))

def test_language_switching(game_page: Page):
    """Verify language switching updates UI text."""
    game_page.locator("#btn-settings").click()
    
    # Switch to English
    game_page.locator("button:has-text('🇺🇸 EN')").click()
    expect(game_page.locator("#game-subtitle")).to_have_text("Digital Transformation, one data point at a time")
    
    # Switch to Spanish
    game_page.locator("button:has-text('🇪🇸 ES')").click()
    expect(game_page.locator("#game-subtitle")).to_have_text("Transformación Digital, un dato a la vez")

def test_reset_functionality(game_page: Page):
    """Verify game reset clears progress."""
    # Play a bit
    game_page.evaluate("Game.getState().dataPoints = 500")
    game_page.locator("#btn-settings").click()
    
    # Set up dialog handler for confirm
    game_page.once("dialog", lambda dialog: dialog.accept())
    game_page.locator("button:has-text('🗑️')").click()
    
    # Verify data is reset
    expect(game_page.locator("#data-counter")).to_have_text("0")

def test_export_import_functionality(game_page: Page):
    """Verify exporting and importing a save works."""
    # 1. Set data (use 500, below abbreviation threshold) and export
    game_page.evaluate("Game.getState().dataPoints = 500")
    exported_str = game_page.evaluate("() => Game.exportSave()")
    assert exported_str is not None and len(exported_str) > 0

    # 2. Reset via Game API (no confirm dialog - that's only in handleReset)
    game_page.evaluate("() => Game.resetGame()")
    game_page.wait_for_timeout(300)
    assert game_page.evaluate("() => Game.getState().dataPoints") == 0

    # 3. Import via Game API
    result = game_page.evaluate("(data) => Game.importSave(data)", exported_str)
    assert result is True
    game_page.wait_for_timeout(300)

    # 4. Verify data points restored via game state (avoids UI formatting issues)
    restored = game_page.evaluate("() => Game.getState().dataPoints")
    assert restored == 500, f"Expected 500 data points, got {restored}"
    expect(game_page.locator("#data-counter")).to_have_text("500")

def test_prestige_functional(game_page: Page):
    """Verify prestige reset and innovation point gain."""
    # Cheat to gain prestige points (25 billion)
    game_page.evaluate("Game.getState().stats.totalDataAllTime = 25000000000")
    
    # Directly trigger prestige logic to isolate from UI issues
    result = game_page.evaluate("""
        () => {
            const before = Game.getState().innovationPoints;
            const success = Game.performPrestige();
            const after = Game.getState().innovationPoints;
            return { success, before, after };
        }
    """)


    
    # Verify prestige state
    assert result['success'] is True
    assert result['after'] >= 5
    
    # Verify UI state
    innov_badge = game_page.locator("#innovation-display")
    expect(innov_badge).to_be_visible()
    expect(innov_badge).to_have_text(re.compile(r"[5-9]"))
    
    game_page.screenshot(path="prestige_success.png")
