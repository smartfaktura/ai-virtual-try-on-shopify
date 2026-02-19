

## Fix: Align Backend Credit Pricing with Frontend Tiers

### The Real Problem

The **frontend** pricing is correct (matching your intent), but the **backend** uses a flat 8/16 rate that ignores model/scene complexity. This causes the "insufficient credits" error when a user has 4 credits and tries a basic (no model, no scene) generation that should cost 4.

### Your Intended Pricing (per image)

| Scenario | Standard | High Quality |
|----------|----------|-------------|
| Base (no model, no scene) | 4 | 10 |
| With model | 12 | 12 |
| With model + scene | 15 | 15 |
| Virtual try-on | 8 | 8 |

### What Needs to Change

**1. Backend: `supabase/functions/enqueue-generation/index.ts`**

Update the `calculateCreditCost` function to accept `hasModel` and `hasScene` flags from the frontend payload, and apply the correct tiered pricing instead of the flat 8/16 rate.

```text
Before:  perImage = quality === "high" ? 16 : 8  (always)
After:
  - model + scene: 15 per image
  - model only:    12 per image
  - base:          quality === "high" ? 10 : 4 per image
  - tryon:         8 per image
```

The edge function will read `hasModel` and `hasScene` from the request body (already sent by the freestyle page) and pass them to the cost calculator.

**2. Frontend: `src/pages/Freestyle.tsx`**

Add `hasModel` and `hasScene` flags to the payload sent to `enqueue-generation` so the backend can calculate the correct cost. Currently these flags exist in the component but may not be forwarded in the request body.

**3. Frontend: `src/contexts/CreditContext.tsx`**

Update the `calculateCost` function to match the same rates (4/10/12/15) so any other UI that uses it stays consistent. The current `calculateCost` already has this logic, so this may just need verification.

### Technical Details

| File | Change |
|------|--------|
| `supabase/functions/enqueue-generation/index.ts` | Rewrite `calculateCreditCost` to use tiered pricing based on `hasModel`/`hasScene` flags; extract those flags from `body` |
| `src/pages/Freestyle.tsx` | Ensure `hasModel` and `hasScene` are included in the generation request payload |
| `src/hooks/useGenerateFreestyle.ts` | Verify the hook passes `hasModel`/`hasScene` to the enqueue call |

This fix will make a basic freestyle generation correctly cost 4 credits, allowing the user with 4 credits to generate successfully.

