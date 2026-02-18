# Save Schema

- Storage key: `summan_clicker_save`
- Current schema version: `2`

## Envelope format (v2 compatible)
Saved value is a JSON envelope:

```json
{
  "version": 2,
  "encoding": "json",
  "payload": "{...serialized game state...}"
}
```

## Migration policy
- Always keep backward migration support from previous stable versions.
- Legacy plain saves (without envelope) are still accepted.
- `save-migrations.js` owns transformation logic.
- Runtime must never crash if a save is partially missing fields.

## Extended gameplay fields (optional/migrated)
- `bugs`, `bugRate`, `baseBugRate`, `efficiency`
- `crash` (`active`, `endsAt`, `rebootClicks`, `totalCrashes`)
- `eventLog`
- `pendingRandomEvent`
- `tempProductionMultiplier`, `tempProductionUntil`
- `tempBugRateMultiplier`, `tempBugRateUntil`
- `stats.totalRefactors`
