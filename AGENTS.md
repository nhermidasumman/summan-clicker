# AGENTS.md — Summan Data Clicker

> This file provides instructions for AI coding agents working on this project.
> It follows the [AGENTS.md open standard](https://agents.md).

---

## Project Overview

**Summan Data Clicker** is a browser-based incremental/clicker game themed around the company Summan (a consulting firm). Players click to generate "data points," purchase buildings that auto-generate data, buy upgrades, earn achievements, and prestige for innovation points. The game supports Spanish and English.

---

## Tech Stack

| Layer      | Technology                       |
|------------|----------------------------------|
| Backend    | Python 3.10+, FastAPI, Uvicorn   |
| Frontend   | Vanilla HTML/CSS/JavaScript (no framework) |
| Storage    | LocalStorage (browser-side)      |
| Testing    | pytest + Playwright (browser)    |
| Hosting    | Render (auto-deploy from `main`) |
| VCS        | Git (GitHub)                     |

---

## Project Structure

```
summan-clicker/
├── main.py                 # FastAPI server entry point
├── requirements.txt        # Production dependencies
├── requirements-dev.txt    # Dev/test dependencies
├── templates/
│   └── index.html          # Single-page game HTML
├── static/
│   ├── css/style.css       # All styles
│   ├── js/
│   │   ├── game.js         # Core game loop, state, save/load
│   │   ├── ui.js           # DOM rendering and interactions
│   │   ├── buildings.js    # Building definitions and cost functions
│   │   ├── upgrades.js     # Upgrade definitions and unlock logic
│   │   ├── achievements.js # Achievement definitions
│   │   ├── prestige.js     # Prestige/innovation system
│   │   ├── lang.js         # i18n (ES/EN)
│   │   └── utils.js        # Formatting, math helpers
│   ├── manifest.json
│   └── icons/
├── test_*.py               # Playwright test files
└── .agent/workflows/       # Agent workflow definitions
```

---

## Setup & Run

```bash
# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run the server locally
uvicorn main:app --host 127.0.0.1 --port 8000

# Run all tests (server must be running on port 8000)
python -m pytest --tb=short -vv -s
```

---

## Code Conventions

- **Language:** JavaScript (ES6+, IIFE module pattern). No transpilation, no bundler.
- **Module pattern:** Each JS file exports a single global object via IIFE (e.g., `window.UI = (() => { ... })();`).
- **Naming:** `camelCase` for functions/variables, `UPPER_SNAKE` for constants.
- **CSS:** Vanilla CSS with CSS custom properties (variables). No preprocessors.
- **HTML:** Single-page app in `templates/index.html`. Jinja2 templating via FastAPI.
- **i18n:** All user-facing strings go through `Lang.t('key')` or conditional `Lang.getLanguage() === 'es'`.
- **Numbers:** Always use `Utils.formatNumber()` for display. It handles suffixes (K, M, B, T, etc.).
- **State access:** Use `Game.getState()` to read state. Use exported functions (e.g., `Game.buyBuilding()`) for mutations.
- **Save:** Use `Game.manualSave()` (NOT `Game.save()` — that is not exported).

---

### UI & Canvas Guidelines
- **Visual Validation (CRITICAL):** Do not assume your code works just because the logic seems correct. You MUST access the game (via browser or verification script) and visually confirm that the element looks right (e.g., text fits inside container, alignment is perfect). If the output doesn't match a user's reasonable expectation, fix it *before* asking for review.
- **Dynamic Sizing**: Never hardcode container dimensions for text. Calculate width/height based on text metrics (`ctx.measureText`) plus adequate padding (min 20px).
- **Coordinate Precision**: Always round drawing coordinates (`Math.round`) to integer values to prevent sub-pixel rendering artifacts (blurriness).
- **Text Safety**: When mixing Rough.js (sketchy style) with text:
    - Increase padding (e.g. 30px) to prevent sketchy borders from overlapping text.
    - Reduce `roughness` (e.g. 0.5) for containers to ensure cleaner edges significantly improve legibility.
- **Context Management**: Always wrap canvas operations in `ctx.save()` and `ctx.restore()` to prevent style leakage.
- **Responsiveness**: Ensure UI elements (like bubbles) are positioned relative to their target but with safe margins to avoid screen edge clipping.

---

## Testing

- **Framework:** pytest + playwright
- **Location:** `test_*.py` files in project root
- **Base URL:** `http://127.0.0.1:8000` (server must be running)
- **Pattern:** Each test navigates to the game, sets up state via `page.evaluate()`, and asserts DOM state.
- **Important:** Use `page.reload()` (NOT `location.reload()` in evaluate) to avoid execution context errors.
- **Wait:** Always `page.wait_for_timeout(1500)` after reload to let the game render.

---

## Verification Workflow (MANDATORY)

**After EVERY fix or feature, you MUST visually verify in-game before committing.** See `.agent/workflows/verify-in-game.md` for the full workflow. Summary:

1. Start server (`uvicorn main:app --port 8000`)
3. **PRIORITY**: Use the `browser_subagent` tool (or manual verification) to verify UI and interactive features. This is more reliable than Python scripts for visual/canvas elements.
4. If using a Python script: **Assertions First**. Visual verification scripts MUST programmatically assert the presence/visibility of the element (e.g., `expect(locator).to_be_visible()`) BEFORE taking a screenshot. Blind screenshots are forbidden.
5. Only commit after confirming visual correctness
6. Clean up temp files

---

## Git & Deployment

- **Branch:** Work on `main`. Commits to `main` auto-deploy to Render.
- **Commit messages:** Imperative mood, concise (e.g., "Fix tooltip escaping in upgrade tiles").
- **Commit messages:** Imperative mood, concise (e.g., "Fix tooltip escaping in upgrade tiles").

### ⚠️ Pre-Commit Checklist (MANDATORY — no exceptions)

Before EVERY `git commit`, you MUST complete ALL of these steps IN ORDER:

1. ✅ Run the **full test suite**: `python -m pytest --tb=short -vv -s`
2. ✅ Verify **ALL tests pass** (0 failures)
3. ✅ Complete the visual verification workflow (see `.agent/workflows/verify-in-game.md`)
4. ✅ Only then: `git add <files> && git commit -m "message"`

> **STOP after commit.** Do NOT `git push` unless the user explicitly requests deployment.

### 🚫 Push = Deploy (requires explicit user approval)

- `git push` triggers auto-deploy to production (Render).
- **NEVER push without the user explicitly asking to deploy.**
- If you're unsure, ASK. The default is to commit only and notify the user.


---

## Boundaries

### Always
- **Validate your own work end-to-end.** You MUST be able to access, run, and visually verify every implementation you make — whether that means running tests, opening the browser, inspecting the DOM, or taking screenshots. If you are blocked by missing tools, dependencies, permissions, or environment issues (e.g., browser won't launch, Playwright not installed, port not available), you MUST immediately ask the user to install, download, configure, or grant whatever is needed to unblock you. **Never skip validation because a tool isn't working — escalate to the user instead.**
- Escape HTML attributes when injecting dynamic content via `innerHTML`

- Sort upgrades by price ascending in `renderUpgrades()`
- Include bilingual support (ES primary, EN secondary) for new UI text
- Create a Playwright test (`test_*.py`) for every new feature or bug fix before committing
- Run the **full test suite** (`python -m pytest --tb=short -vv -s`) after implementation and before committing to catch regressions

### Never
- **Push to `main` (deploy) without explicit user approval** — commit only, then ask
- **Commit without running the FULL test suite** (all `test_*.py` files, not just one)
- Modify `buildings.js` cost balancing without explicit user approval
- Delete or overwrite save data without user confirmation
- Add external dependencies (npm packages, CDNs) without user approval
- Skip the in-game verification workflow

### Ask First
- Changes to the prestige system
- Adding new buildings or upgrades
- Modifying the game loop timing
- Any breaking changes to save format
