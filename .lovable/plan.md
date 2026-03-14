

## Fix: Quality Setting Not Affecting Credit Cost + Label Rename

### Problems Found

1. **Credit cost ignores quality setting**: In `src/pages/Freestyle.tsx` line 193, the cost is hardcoded as `(hasModel || hasScene) ? 8 : 4` — the `quality` variable is never considered. Same issue in `supabase/functions/enqueue-generation/index.ts` line 37 where `_quality` parameter is prefixed with underscore (intentionally unused).

2. **Wrong credit amount shown for High quality**: The UI dropdown says "10 credits per image" for High, but it should be **8 credits per image** (matching model/scene pricing).

3. **Label says "Standard" instead of "Quality"**: The chip just shows "Standard" or "✦ High" with no "Quality" label context.

### Correct Pricing Logic
- **Standard** (no model/scene): 4 credits
- **Standard** (with model/scene): 8 credits  
- **High** (no model/scene): 8 credits
- **High** (with model/scene): 8 credits (already pro-tier)

### Changes

**1. `src/pages/Freestyle.tsx` (~line 193)**
Update credit cost calculation to include quality:
```typescript
const creditCost = (hasModel || hasScene || quality === 'high') ? 8 : 4;
```

**2. `src/components/app/freestyle/FreestyleSettingsChips.tsx` (~line 185-186)**
- Fix High quality description: change "10 credits per image" → "8 credits per image"
- Add "Quality" prefix to chip label: show "Quality" before "Standard" / "✦ High"

**3. `supabase/functions/enqueue-generation/index.ts` (~line 36-37)**
Update backend cost to respect quality:
```typescript
perImage = (hasModel || hasScene || quality === 'high') ? 8 : 4;
```
(rename `_quality` to `quality` and use it)

**4. `src/contexts/CreditContext.tsx` `calculateCost` function (~line 259)**
Same fix for the shared cost calculator used by the Generate button.

### Files Changed
| File | Change |
|------|--------|
| `src/pages/Freestyle.tsx` | Include `quality` in credit cost calc |
| `src/components/app/freestyle/FreestyleSettingsChips.tsx` | Fix "10 credits" → "8 credits", add "Quality" label |
| `supabase/functions/enqueue-generation/index.ts` | Use quality param in backend cost |
| `src/contexts/CreditContext.tsx` | Update `calculateCost` to factor in quality |

