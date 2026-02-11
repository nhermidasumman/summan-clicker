---
description: How to manually verify any fix or new feature in the Summan Clicker game
---

# Verify Changes In-Game

After implementing ANY fix or new feature, you MUST verify it visually in the game before committing. Follow these steps:

## 1. Start the server (if not running)
// turbo
```bash
uvicorn main:app --host 127.0.0.1 --port 8000
```

## 2. Create a Playwright verification script
Write a Python script that:
- Opens the game at `http://127.0.0.1:8000`
- Sets up the game state needed to test the feature (e.g., give data points, unlock upgrades)
- Navigates to the relevant UI section
- Takes a screenshot of the result
- Saves the screenshot to the project root (e.g., `verify_<feature>.png`)

Key notes:
- Use `Game.manualSave()` (NOT `Game.save()`) to persist state
- Use `page.reload()` (NOT `location.reload()`) for navigation
- Always `page.wait_for_timeout(1500)` after reload for render

## 3. Run the script
// turbo
```bash
python verify_<feature>.py
```

## 4. View the screenshot
Use `view_file` to inspect the screenshot and confirm the feature works visually.

## 5. Clean up
Delete the verification script and screenshot after confirming.

## 6. Then commit
Only after visual verification passes, commit and push.
