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

## Runtime systems
- Economy: `core/economy.js`, `infra/formulas.js`, `infra/decimal-adapter.js`.
- Technical Debt: `core/debt-system.js`.
- Crash/Reboot: `core/crash-system.js`.
- Refactor: `core/refactor-system.js`.
- Loop orchestration: `core/game-loop.js` (fixed logical tick at 100ms + render on `requestAnimationFrame`).
- Random events and pub/sub: `core/event-system.js`, `content/random-events.js`.
- Prestige/Boardroom: `content/prestige-upgrades.js`, `ui/panels/boardroom-panel.js`.

## Public contracts
- Browser automation must use `window.__SUMMAN_TEST_API__` only.
- Save key remains `summan_clicker_save`.
- Save schema version remains `2`.
- Save payload is now envelope-based (`version`, `encoding`, `payload`) with backward compatibility for legacy plain saves.

## Rules
- UI must not own economy formulas.
- Core modules must not mutate DOM directly.
- Tests must use `window.__SUMMAN_TEST_API__`.
- Runtime does not expose `window.Game`, `window.UI`, or `window.Tutorial`.
- Runtime imports must point to `app/core/content/ui/infra`; `legacy/` is retired.
