# AGENTS.md - Summan Data Clicker

This file defines mandatory instructions for AI coding agents working in this repository.

---

## Project Summary

Summan Data Clicker is a browser incremental game served by FastAPI.
Players generate Data Points via clicking and automation, buy buildings and upgrades,
unlock achievements, and use prestige (innovation points).
The game supports Spanish and English.

---

## Current Architecture (Source of Truth)

```text
summan-clicker/
  backend/
    app.py
    routes.py
    config.py
  frontend/
    templates/
      index.html
    static/
      css/
        style.css
      js/
        app/
          main.js
          bootstrap.js
          version.js
        core/
          game-loop.js
          economy.js
          progression-system.js
          effects-system.js
          event-system.js
          state-store.js
        content/
          buildings.js
          upgrades.js
          achievements.js
          prestige-upgrades.js
          i18n/
            index.js
            es.js
            en.js
        ui/
          renderer.js
          dom-bindings.js
          panels/
          overlays/
        infra/
          constants.js
          logger.js
          number-formatters.js
          save-repository.js
          save-migrations.js
        test-api/
          browser-test-api.js
  tests/
    unit/
    contract/
    e2e/
    visual/
  docs/
    ARCHITECTURE.md
    FEATURE_PLAYBOOK.md
    TESTING.md
    SAVE_SCHEMA.md
  tools/
    qa/
  main.py
```

Important:
- `frontend/static/js/legacy/` is retired and must not be reintroduced.
- Runtime starts from `frontend/static/js/app/main.js` only.
- Browser automation contract is `window.__SUMMAN_TEST_API__`.

---

## Mandatory Context Loading (No Exceptions)

Before making any code change, read these files in order:

1. `README.md`
2. `docs/ARCHITECTURE.md`
3. `docs/FEATURE_PLAYBOOK.md`
4. `docs/TESTING.md`
5. `docs/SAVE_SCHEMA.md`
6. `progress.md` (if present)
7. `frontend/templates/index.html`
8. `frontend/static/js/app/main.js`
9. `frontend/static/js/app/bootstrap.js`
10. `frontend/static/js/test-api/browser-test-api.js`

Then inspect the specific modules you will touch.
If your change affects gameplay formulas or progression, also read:
- `frontend/static/js/core/game-loop.js`
- `frontend/static/js/content/*.js`

If your change affects UI/UX, also read:
- `frontend/static/js/ui/renderer.js`
- relevant files under `frontend/static/js/ui/panels/` and `frontend/static/js/ui/overlays/`
- `frontend/static/css/style.css`

---

## Setup and Run

```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt
uvicorn main:app --host 127.0.0.1 --port 8000
python -m pytest --tb=short -vv -s
```

Base URL: `http://127.0.0.1:8000`

---

## Engineering Rules

### JavaScript and Frontend
- Use ES modules.
- Keep logic separated by layer (`core`, `content`, `ui`, `infra`, `app`).
- Do not introduce inline handlers in HTML.
- Escape HTML attributes when rendering dynamic `innerHTML`.
- Keep upgrade rendering sorted by ascending cost.
- Keep ES and EN support for user-facing text.

### Public Contracts
- Tests and automation must use `window.__SUMMAN_TEST_API__`.
- Do not make tests depend on direct runtime globals such as `window.Game` or `window.UI`.
- Save key must remain `summan_clicker_save`.
- Save schema version is currently `2`; maintain backward compatibility through migrations.

### Gameplay Safety
Do not change gameplay behavior unintentionally.
Protect these invariants:
- Buy modes (`x1`, `x10`, `x100`, `Max`) produce expected quantities and costs.
- DPS/click formulas remain stable unless explicitly requested.
- Prestige formula and reset behavior remain stable unless explicitly requested.
- Existing saves must continue loading.

---

## Testing and Validation (Mandatory)

After every meaningful change:

1. Run full test suite:
   `python -m pytest --tb=short -vv -s`
2. Ensure all tests pass.
3. Run visual verification script:
   `python tools/qa/verify_modular_bootstrap.py`
4. Inspect screenshot output:
   `tools/qa/verify_modular_bootstrap.png`

If any validation fails, fix and rerun before declaring completion.

---

## Git and Deployment Safety

- Work on `main` unless user requests otherwise.
- Do not push unless user explicitly asks.
- `git push` triggers deployment on Render.
- Before commit, full suite + visual verification are mandatory.

---

## Ask First

Request explicit user approval before:
- Changing prestige design/formulas.
- Adding or rebalancing buildings/upgrades.
- Changing game loop timing semantics.
- Breaking save format compatibility.
- Adding external dependencies.

---

## Definition of Done for Any Feature/Fix

A change is complete only if:
- Code follows current module architecture.
- Contracts remain valid (`__SUMMAN_TEST_API__`, DOM contract, save schema).
- Tests are added or updated where relevant.
- Full test suite passes.
- Visual verification passes.
- Docs are updated if architecture/contracts/flows changed.
