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
