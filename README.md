# Summan Data Clicker

Browser incremental game served with FastAPI.

## Run

```bash
pip install -r requirements-dev.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

Open: `http://127.0.0.1:8000`

## Deploy (Render)

This repository supports two parallel Render services via `render.yaml`:

- `summan-clicker` (production): deploys from branch `main`.
- `summan-clicker-test` (testing): deploys from branch `staging`.

Recommended flow:

1. Push candidate changes to `staging` and validate with testers in test URL.
2. Merge validated changes into `main` to deploy production.

## Structure

- `backend/`: FastAPI app and routes.
- `frontend/`: templates and static assets.
- `tests/`: unit, contract, e2e, and visual suites.
- `tools/qa/`: manual/visual verification helpers.
- `docs/`: architecture and development guides.

## Frontend entrypoint

`frontend/static/js/app/main.js` (`type="module"`)

## Runtime modules

- Core runtime no longer loads `frontend/static/js/legacy/*`.
- Active gameplay/runtime code lives in `frontend/static/js/core`, `frontend/static/js/content`,
  `frontend/static/js/ui`, and `frontend/static/js/infra`.
- Technical Debt systems are modularized in:
  - `core/debt-system.js`
  - `core/crash-system.js`
  - `core/refactor-system.js`
  - `infra/formulas.js`

## Browser test contract

Tests should use `window.__SUMMAN_TEST_API__`.

Extended dispatch actions available:
- `SET_BUGS`
- `TRIGGER_REFACTOR`
- `RUN_LOGIC_TICKS`
- `FORCE_CRASH`
- `REBOOT_CRASH`

## Testing

Run full suite:

```bash
python -m pytest --tb=short -vv -s
```

Audio click SFX regression (press/release + variant rotation):

```bash
python -m pytest --tb=short -vv -s tests/unit/features/test_feature_audio_click_sfx.py
```
