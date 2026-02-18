# Testing Strategy

## Test layers
- `tests/unit/core`: formulas, multipliers, migrations.
- `tests/unit/features`: feature-level behavior.
- `tests/contract`: API and DOM contracts.
- `tests/e2e`: user-flows in browser.
- `tests/visual`: visual assertions for overlays/tooltips.

## Browser automation contract
- Use only `window.__SUMMAN_TEST_API__`.
- Trigger deterministic UI behaviors via `dispatch` actions.

Supported deterministic actions include:
- Existing: `CLICK`, `BUY_BUILDING`, `BUY_UPGRADE`, `SET_LANGUAGE`, `SET_BUY_AMOUNT`, `PRESTIGE`, `RESET`, `SAVE`.
- Deterministic overlays: `SHOW_GOLDEN_DATA`, `SHOW_BUG_REPORT`, `SHOW_OFFLINE_MODAL`, `SHOW_TUTORIAL_NARRATIVE`.
- Technical debt controls: `SET_BUGS`, `TRIGGER_REFACTOR`, `RUN_LOGIC_TICKS`, `FORCE_CRASH`, `REBOOT_CRASH`.

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
