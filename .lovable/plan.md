

## Fix Credit Deduction Logic for Workflows and Freestyle

### Current State (Broken)

**Edge function** (`enqueue-generation/index.ts`) uses complex tiered pricing: 4/8/10/12/15 per image depending on model/scene/quality/tryon flags.

**Workflow UI** (`Generate.tsx` line 1280) estimates `8` or `16` per image (standard/high).

**Batch path** (`useGenerationBatch.ts`) never sends `hasModel`/`hasScene` → edge function defaults to 4/image.

**Freestyle UI** (`Freestyle.tsx` line 192-196) uses 4/10/12/15 tiers.

Result: mismatches everywhere between what's shown and what's charged.

### New Rules (Per User Request)

- **Workflows**: Always 8 credits per image. No model/scene/quality checks. Always use high quality.
- **Freestyle**: 4 credits if no model and no scene. 8 credits if model OR scene selected. Max 8 per image.

### Changes

**1. `supabase/functions/enqueue-generation/index.ts`** — Simplify `calculateCreditCost`:
```
if (jobType === "workflow") → 8 per image, ignore all flags
if (jobType === "freestyle") → hasModel || hasScene ? 8 : 4, ignore quality
if (jobType === "tryon") → 8 per image (unchanged)
```
Remove the quality-based tiers entirely.

**2. `src/pages/Generate.tsx`** — Two fixes:
- Line 1280: Change workflow cost estimate to always `workflowImageCount * 8` (remove quality multiplier since quality is always high now)
- Line ~770-815: Force `quality = 'high'` for workflow generations before enqueue/startBatch calls

**3. `src/hooks/useGenerationBatch.ts`** — Pass `hasModel`/`hasScene` in the fetch body (lines 218-223). Even though workflows will always be 8, this prevents future bugs.

**4. `src/pages/Freestyle.tsx`** — Line 192-196: Simplify credit cost display:
```typescript
const creditCost = (hasModel || hasScene) ? 8 : 4;
```
Remove quality-based tiers (10, 12, 15).

### Files Changed — 4 files
- `supabase/functions/enqueue-generation/index.ts` — Simplify pricing function
- `src/pages/Generate.tsx` — Force high quality, fix cost estimate
- `src/hooks/useGenerationBatch.ts` — Pass model/scene flags
- `src/pages/Freestyle.tsx` — Simplify cost display to 4 or 8

