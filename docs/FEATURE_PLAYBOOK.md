# Feature Playbook

1. Add/modify definitions under `frontend/static/js/content`.
2. Add business logic under `frontend/static/js/core`.
3. Render and interactions go under `frontend/static/js/ui`.
4. Expose any deterministic test hooks through `test-api`.
5. Add tests in: `tests/unit/features`, then `tests/e2e`, then `tests/visual` if UI-critical.
6. For repeated interaction UX (for example click SFX press/release), add a feature regression that validates event coverage and variation rotation (reference: `tests/unit/features/test_feature_audio_click_sfx.py`).
7. Store runtime static assets under `frontend/static/assets/<domain>/` and keep deterministic catalogs/definitions in `frontend/static/js/content/` (logic stays in `core`/`ui`).
