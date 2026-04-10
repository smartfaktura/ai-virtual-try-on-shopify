

# Increase Product Upload Limit from 10 to 100

## Change
Update the `MAX_BATCH` constant in `src/components/app/ManualProductTab.tsx` from `10` to `100`. This single constant controls the batch upload limit — all references (toast message, "Add more" button visibility, help text) use it dynamically.

## File Changed
| File | Change |
|------|--------|
| `src/components/app/ManualProductTab.tsx` | Change `const MAX_BATCH = 10;` to `const MAX_BATCH = 100;` |

