

# Fix: Replace "Apify" label with "RapidAPI"

## Change
Update `src/components/app/trend-watch/AddAccountModal.tsx` line 70 to change the select option label from `API (Apify)` to `API (RapidAPI)`.

Also update `src/components/app/trend-watch/constants.ts` `SOURCE_MODE_MAP` if it references Apify (currently shows "API" which is fine, but worth confirming the label is consistent).

## Files
- `src/components/app/trend-watch/AddAccountModal.tsx` — change `"API (Apify)"` → `"API (RapidAPI)"`

Single-line fix.

