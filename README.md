# Summan Data Clicker

Browser incremental game served with FastAPI.

## Run

```bash
pip install -r requirements-dev.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

Open: `http://127.0.0.1:8000`

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

## Browser test contract

Tests should use `window.__SUMMAN_TEST_API__`.
