# Save Schema

- Storage key: `summan_clicker_save`
- Current schema version: `2`

## Migration policy
- Always keep backward migration support from previous stable versions.
- `save-migrations.js` owns transformation logic.
- Runtime must never crash if a save is partially missing fields.
