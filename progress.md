Original prompt: Continua

## 2026-02-13 - Continuation work
- Removed dynamic legacy script loader dependency from bootstrap path.
- Bootstrap now uses static ES-module imports for runtime legacy modules.
- Updated legacy modules to use explicit `window.*` cross-module references, reducing implicit global lexical coupling.
- Simplified game startup contract: `window.__SUMMAN_LEGACY_GAME_INIT` is now the single entry hook from bootstrap.
- Re-ran full suite: `python -m pytest --tb=short -vv -s` -> 26 passed.
- Added visual verification script with assertions + screenshot:
  - `tools/qa/verify_modular_bootstrap.py`
  - screenshot: `tools/qa/verify_modular_bootstrap.png`

## TODO for next pass
- Continue phase-out of `frontend/static/js/legacy/*` by moving real implementations into `core/content/ui/infra` modules (currently still compatibility-backed).
- Remove `app/container.js` if no longer needed.
- Decide whether to keep or remove `legacy/rough.js` and `frontend/static/css/tutorial.css` after final tutorial/overlay strategy is frozen.

## 2026-02-13 - Full legacy retirement pass
- Migrated real runtime implementations from `frontend/static/js/legacy/*` into the target module tree:
  - `content/`: buildings, upgrades, achievements, prestige catalog/formulas.
  - `infra/`: utils/formatters and save repository logic.
  - `ui/`: renderer and tutorial overlay/controller runtime code.
  - `core/`: game loop/runtime engine.
- Converted migrated modules to ES module exports and kept compatibility globals (`window.*`) while runtime wiring now loads only modular paths.
- Replaced bootstrap wiring to import only `app/core/content/ui/infra/test-api` modules (no legacy imports).
- Removed deprecated files:
  - `frontend/static/js/legacy/`
  - `frontend/static/js/app/container.js`
  - `frontend/static/css/tutorial.css` (redundant; tutorial styles already in `style.css`).
- Updated browser test API to avoid direct runtime dependence on `window.Game/window.UI` in tests and expose deterministic UI dispatch actions:
  - `SHOW_GOLDEN_DATA`, `SHOW_BUG_REPORT`, `SHOW_OFFLINE_MODAL`, `SHOW_TUTORIAL_NARRATIVE`.
- Updated feature/e2e/visual tests to use `window.__SUMMAN_TEST_API__` as public automation contract.
- Updated docs (`README.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`) and `run_game.bat` network hint (removed hardcoded IP).
- Validation:
  - Full suite: `python -m pytest --tb=short -vv -s` => 26 passed.
  - Visual verify script: `python tools/qa/verify_modular_bootstrap.py` + screenshot reviewed (`tools/qa/verify_modular_bootstrap.png`).

## Remaining cleanup opportunities
- Remove compatibility globals (`window.Game/window.UI/...`) progressively by converting internal cross-module calls to direct imports/service container.
- Split `ui/renderer.js` and `core/game-loop.js` into finer files per panel/system now that runtime is stable without `legacy/`.
- Additional decoupling pass: runtime logic now uses direct module imports (`core/game-loop.js`) and an internal bridge (`window.__SUMMAN_GAME_API__`) rather than direct runtime calls to `window.Game/window.UI`.
- Re-ran full suite after decoupling changes: `26 passed`.
- Re-ran visual bootstrap check and verified screenshot remains correct.

## 2026-02-13 - Split pass (game-loop + renderer) and icon regression fix
- Split runtime responsibilities out of `core/game-loop.js`:
  - Added `core/achievement-system.js` and moved unlock flow there.
  - Replaced `core/progression-system.js` wrapper with real progression implementation (buildings/upgrades/prestige operations and preview).
  - `game-loop.js` now orchestrates systems and delegates progression/achievements/events/effects instead of owning every behavior inline.
- Split `ui/renderer.js` into explicit collaborators:
  - `ui/dom-bindings.js` now owns event binding/delegation.
  - Added `ui/modal-actions.js` for modal action handling.
  - Added `ui/overlays/effects-bar.js` for active effects rendering.
  - Added `ui/overlays/ui-feedback.js` for achievement queue, golden data, bug report, offline modal, prestige animation, click animation, save feedback.
- Converted panel modules from placeholder/wrapper behavior to explicit rendering contracts and cleaned icon/text artifacts:
  - `ui/panels/buildings-panel.js`
  - `ui/panels/upgrades-bar.js`
  - `ui/panels/achievements-panel.js`
  - `ui/panels/stats-modal.js`
  - `ui/panels/settings-modal.js`
  - `ui/panels/prestige-modal.js`
- Fixed bootstrap breakage introduced during split:
  - Resolved `Identifier 'getInnovationPointsPreview' has already been declared` in `core/game-loop.js`.
- Validation:
  - `python -m pytest --tb=short -vv -s` => 26 passed.
  - `python tools/qa/verify_modular_bootstrap.py` => pass, screenshot reviewed (`tools/qa/verify_modular_bootstrap.png`), no visible `??` icon regression.

## TODO for next pass
- Continue reducing remaining `window.*` compatibility globals by introducing direct imports/service injection inside UI panels/content modules.
- Consider splitting `core/game-loop.js` once more into `runtime-loop` vs `session-lifecycle` files if we want stricter architectural boundaries.
- Add targeted unit tests for the new `core/progression-system.js` and `core/achievement-system.js` modules (currently covered mostly by e2e/feature tests).

## 2026-02-13 - Hardening pass: internal DI + core unit tests
- Removed most runtime `window.*` coupling inside UI/core modules by switching to explicit imports and API injection.
- Added internal runtime API bridge from `core/game-loop.js` into UI/tutorial layers:
  - `ui/renderer.js` now exposes `setGameApi(api)` and no longer depends on `window.__SUMMAN_GAME_API__` internally.
  - `ui/overlays/tutorial-controller.js` now exposes `setGameApi(api)` and reads state from injected API.
- Refactored modules to use direct imports instead of globals:
  - `ui/panels/buildings-panel.js` now imports `Buildings/Lang/Utils` and receives `getBuildingDiscount` via options.
  - `ui/panels/upgrades-bar.js` now imports `Upgrades/Utils`.
  - `ui/panels/achievements-panel.js` now imports `Achievements`.
  - `ui/panels/stats-modal.js` now imports `Lang/Utils/Upgrades` and receives `calculateClickValue` via options.
  - `ui/panels/settings-modal.js` and `ui/panels/prestige-modal.js` now import `Lang`.
  - `ui/modal-actions.js` now imports `Lang/Utils` and acts on injected `gameApi`.
  - `ui/overlays/ui-feedback.js` now imports `Lang/Utils/Achievements`.
- Added targeted tests for the newly extracted core systems:
  - `tests/unit/core/test_progression_system.py`
  - `tests/unit/core/test_achievement_system.py`
- Validation:
  - `python -m pytest --tb=short -vv -s` => 29 passed.
  - `python tools/qa/verify_modular_bootstrap.py` => pass + screenshot reviewed.

## TODO for next pass
- Continue reducing compatibility globals for `window.Game/window.UI/window.Tutorial` once external automation confirms it is safe to remove.
- Add focused tests for prestige purchase flow (`buyPrestigeUpgrade`) under `tests/unit/core/`.

## 2026-02-13 - Tramo siguiente del plan: retiro de globals de compatibilidad
- Removed legacy compatibility globals from runtime modules:
  - `window.Game` export removed from `frontend/static/js/core/game-loop.js`
  - `window.UI` export removed from `frontend/static/js/ui/renderer.js`
  - `window.Tutorial` export removed from `frontend/static/js/ui/overlays/tutorial-controller.js`
- Confirmed public contracts remain intact:
  - Internal runtime bridge still uses `window.__SUMMAN_GAME_API__` from bootstrap.
  - Automated testing contract remains `window.__SUMMAN_TEST_API__`.
- Updated architecture documentation to reflect that runtime no longer exposes those globals.
- Validation:
  - `python -m pytest --tb=short -vv -s` => 29 passed.
  - `python tools/qa/verify_modular_bootstrap.py` => pass, screenshot reviewed.

## 2026-02-13 - Bugfix tutorial text bubble + mantra animation mapping
- Fixed tutorial bubble visibility regression:
  - `frontend/static/css/style.css`: added `.message-bubble.receipt.tutorial-bubble { display: block; }`.
  - Root cause: bubble DOM existed with text, but `.tutorial-bubble` rule kept it hidden with `display: none`.
- Fixed narrative step-to-animation mapping:
  - `frontend/static/js/ui/overlays/tutorial-overlay.js`
  - Correct mapping now: step 2 -> `mantra-1`, step 3 -> `mantra-2`, step 4+ -> `mantra-3`.
- Added regression test:
  - `tests/unit/features/test_feature_tutorial_flow.py::test_feature_tutorial_bubble_text_visible`
  - Verifies tutorial bubble is visible and contains non-empty text after tutorial reset.
- Validation:
  - Full suite: `python -m pytest --tb=short -vv -s` => 30 passed.
  - Visual bootstrap verify: `python tools/qa/verify_modular_bootstrap.py` => pass.
  - Additional visual assertion+screenshot for tutorial bubble:
    - `tools/qa/verify_tutorial_bubble.png` (bubble and text visible).

## 2026-02-13 - Tutorial bubble auto-sizing and positioning refinement
- Updated tutorial bubble layout engine in `frontend/static/js/ui/overlays/tutorial-overlay.js`:
  - Bubble text now uses `textContent` (safe plain text).
  - Added dynamic sizing each frame based on text and viewport (`maxWidth`, wrapping, auto height).
  - Added explicit viewport clamping and type-aware anchoring (`orb`, `intern`, `dps`) with consistent gaps.
  - Bubble position now recalculates after sizing, so location aligns with actual rendered text dimensions.
- Updated CSS in `frontend/static/css/style.css`:
  - Keep tutorial receipt visible (`display: block`).
  - Disabled tutorial receipt tear pseudo-element (`::after`) so bubble visual box matches measured text box.
- Expanded regression coverage in `tests/unit/features/test_feature_tutorial_flow.py`:
  - `test_feature_tutorial_bubble_text_visible` now verifies:
    - visible bubble,
    - non-empty text,
    - text fits within bubble,
    - bubble remains in viewport,
    - bubble remains anchored near target.
- Validation:
  - Full suite: `python -m pytest --tb=short -vv -s` => 30 passed.
  - Visual checks: `tools/qa/verify_modular_bootstrap.png` and `tools/qa/verify_tutorial_bubble_layout.png`.
