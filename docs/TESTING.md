# Testing Strategy

## Test layers
- `tests/unit/core`: formulas, multipliers, migrations.
- `tests/unit/features`: feature-level behavior.
- `tests/contract`: API and DOM contracts.
- `tests/e2e`: user-flows in browser.
- `tests/visual`: visual assertions for overlays/tooltips.

## Browser automation contract
- Use only `window.__SUMMAN_TEST_API__`.
- Trigger deterministic UI behaviors via `dispatch` actions (e.g. `SHOW_OFFLINE_MODAL`, `SHOW_GOLDEN_DATA`).

## Run
```bash
python -m pytest --tb=short -vv -s
```

## Audio SFX regression
- Click orb press/release + variant rotation is covered by:
  - `tests/unit/features/test_feature_audio_click_sfx.py`
- Targeted run:
```bash
python -m pytest --tb=short -vv -s tests/unit/features/test_feature_audio_click_sfx.py
```
