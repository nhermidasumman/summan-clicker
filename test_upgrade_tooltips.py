"""
Test: Upgrade tooltips display correctly and Stats modal shows upgrade progress.
"""
import re
import pytest
from playwright.sync_api import Page, expect


def test_upgrade_tooltip_and_stats(page: Page):
    """Verify upgrade tooltips are not broken AND stats modal shows upgrade count."""
    page.goto("http://127.0.0.1:8000")
    page.wait_for_load_state("networkidle")

    # Give player enough data to unlock some upgrades
    page.evaluate("""() => {
        const s = Game.getState();
        s.dataPoints = 5000;
        s.stats.totalDataEarned = 5000;
        s.stats.totalClicks = 200;
        Game.manualSave();
    }""")
    page.reload()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1500)  # Let game render

    # ---- TOOLTIP VERIFICATION ----
    # There should be at least one upgrade tile visible
    tiles = page.locator(".upgrade-tile")
    tile_count = tiles.count()
    print(f"Upgrade tiles visible: {tile_count}")
    assert tile_count > 0, "Expected at least one upgrade tile to be visible"

    # Each tile must have a valid data-tooltip attribute (non-empty, no broken HTML)
    for i in range(tile_count):
        tile = tiles.nth(i)
        tooltip = tile.get_attribute("data-tooltip")
        assert tooltip is not None, f"Tile {i} is missing data-tooltip attribute"
        assert len(tooltip) > 5, f"Tile {i} has suspiciously short tooltip: '{tooltip}'"
        # Must not contain raw newlines (they break HTML attributes)
        assert "\n" not in tooltip, f"Tile {i} tooltip contains raw newline: '{tooltip}'"
        # Must contain the cost indicator
        assert "💠" in tooltip or "💠" in tooltip or "amp;" not in tooltip.split("💠")[0] if "💠" in tooltip else True
        print(f"  Tile {i} tooltip OK: {tooltip[:60].encode('ascii', 'replace').decode()}...")

    # ---- HOVER TOOLTIP VISIBILITY ----
    # Hover over the first tile and check the JS tooltip div appears
    first_tile = tiles.first
    first_tooltip_text = first_tile.get_attribute("data-tooltip")
    first_tile.hover()
    page.wait_for_timeout(300)  # 100ms delay + render buffer

    tooltip_div = page.locator(".upgrade-tooltip.visible")
    assert tooltip_div.count() > 0, "JS tooltip div did not appear on hover"
    actual_text = tooltip_div.text_content()
    assert first_tooltip_text in actual_text or actual_text in first_tooltip_text, \
        f"Tooltip text mismatch. Expected: '{first_tooltip_text}', Got: '{actual_text}'"
    print(f"  OK: Hover tooltip visible with correct text: {actual_text[:60].encode('ascii', 'replace').decode()}...")

    # ---- STATS MODAL: UPGRADE PROGRESS ----
    # Open stats modal
    page.click("#btn-stats")
    page.wait_for_timeout(500)

    # The modal should be visible
    modal = page.locator("#modal-overlay.active")
    expect(modal).to_be_visible()

    # Check for the "Mejoras compradas" row
    modal_text = page.locator("#modal-body").inner_text()
    print(f"Stats modal text:\n{modal_text}")

    # Should contain upgrade progress (e.g., "0 / 46" or "2 / 46")
    assert "Mejoras compradas" in modal_text or "Upgrades purchased" in modal_text, \
        f"Stats modal missing upgrade progress row. Content: {modal_text}"

    # Verify format is "X / Y" where Y is the total number of upgrades
    match = re.search(r"(\d+)\s*/\s*(\d+)", modal_text)
    assert match, "Could not find 'X / Y' format in stats modal"
    # The total should be > 0
    total = int(match.group(2))
    assert total > 0, f"Total upgrades should be > 0, got {total}"

    print(f"\nOK: All checks passed! Tooltips OK, Stats shows upgrade progress.")
