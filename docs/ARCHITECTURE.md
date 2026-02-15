# Architecture

## Layers
- `backend/`: FastAPI app, routes, and server configuration.
- `frontend/static/js/app`: modular bootstrap and startup entrypoint.
- `frontend/static/js/core`: game-domain logic and game loop.
- `frontend/static/js/content`: game definitions and static content.
- `frontend/static/js/ui`: rendering and UI behavior.
- `frontend/static/js/infra`: persistence, constants, helpers.
- `frontend/static/js/test-api`: stable browser API for automated tests.
- `frontend/static/assets`: runtime static assets (images/audio/svg) served directly.

## Rules
- UI must not own economy formulas.
- Core modules must not mutate DOM directly.
- Tests must use `window.__SUMMAN_TEST_API__`.
- Runtime does not expose `window.Game`, `window.UI`, or `window.Tutorial`.
- Runtime imports must point to `app/core/content/ui/infra`; `legacy/` is retired.
