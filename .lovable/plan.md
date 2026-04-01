

# Catalog Studio — Loading, Completion, Prompt Intelligence, and UX Polish

## Problems Identified

1. **Grey generate button, long wait with no feedback** — `isGenerating` is set true then immediately false after enqueueing. No loading indicator during the enqueue loop which can take 10-30s for large batches.
2. **Bikini generates with pants** — No `swimwear` category exists. Bikini falls to `unknown` → `upper_body_slot` → support wardrobe adds "neutral straight trousers". Need a `swimwear` category with appropriate support wardrobe (no bottoms for bikini tops, no tops for bikini bottoms).
3. **Ghost mannequin has shadow** — Prompt includes "soft shadow beneath product". Should be shadowless for ghost mannequin.
4. **No estimated time or elapsed time** during generation.
5. **Completion screen** needs more polish — VOVV.AI branding, elapsed time summary, better layout.
6. **Background color consistency** — User wants the hex code visible per background so they can match across sets.
7. **No final confirmation/review step** before generating — User wants to see the full job list and optionally add accessories (extra reference images per product).
8. **Design inconsistency** with Templates/Workflows pages — Catalog Studio steps look different from the rest of the app.

## Plan

### 1. Fix Generate Button Loading State (`useCatalogGenerate.ts`)
- Keep `isGenerating = true` throughout the entire enqueue loop (currently set to false too early at line 306)
- Move `setIsGenerating(false)` to after polling starts
- In the UI, show a branded "Preparing your photoshoot..." overlay with a spinner during the enqueue phase (before batch state exists)

### 2. Add Swimwear Category (`catalogEngine.ts` + `types/catalog.ts`)
- Add `swimwear` to `ProductCategory` union type
- Add keywords: `bikini`, `swimsuit`, `swimwear`, `swim`, `bathing suit`, `one-piece`, `tankini`, `swim trunk`, `board short`
- Map `swimwear` → `full_body_slot` in `CATEGORY_TO_SLOT`
- Create swimwear-specific support wardrobe: **no additional clothing** — null out upper, lower, footwear slots. The product IS the outfit.
- Add swimwear overrides in each `FashionStyleDefinition.supportWardrobeKits` or handle via a `resolveSupportWardrobe` special case

### 3. Fix Ghost Mannequin Shadow (`catalogEngine.ts`)
- Change ghost mannequin prompt from "soft shadow beneath product" to "no shadow, floating isolated product, pure clean background, shadowless"

### 4. Add Elapsed Time + Estimated Time (`CatalogGenerate.tsx`)
- Track `generationStartedAt` timestamp when batch starts
- Show elapsed time as `mm:ss` in the progress UI
- Estimate remaining: `(elapsed / completedJobs) * remainingJobs`
- Show both in the progress section

### 5. Redesign Progress & Completion UI (`CatalogGenerate.tsx`)
- **Progress**: Add elapsed/estimated time display. Show a subtle VOVV.AI wordmark. Show per-product thumbnail + progress bar instead of just text rows.
- **Completion**: Show total time taken, add background hex badge on each image, make the grid more editorial (larger cards, hover to see shot label). Keep lightbox on click.

### 6. Show Background Hex Code (`CatalogStepBackgroundsV2.tsx`)
- Display the hex value below each background swatch name (already partially there via `bg.hex`, just surface it as copyable text)

### 7. Add Review/Confirmation Step (Step 6)
- Insert a new step between Shots and Generate: **"Review & Confirm"**
- Shows: selected products (thumbnails), selected models, selected style, background (with hex), selected shots
- Per-product expandable section with optional "Add Accessories" — user can add 1-3 extra reference images (hat, sunglasses, bottom piece) that get injected into that product's prompt
- "Generate" button moves here from the Shots step
- Shots step gets a "Next: Review" button instead

### 8. Minimize Visual Noise Across All Steps
- Reduce border weights from `border-2` to `border`
- Remove emoji icons from shot cards (👤📦), use consistent Lucide icons or no icons
- Stepper: thinner lines, smaller circles, less shadow
- Use consistent `rounded-lg` instead of mixed `rounded-xl`, `rounded-2xl`
- Remove gradient backgrounds from style cards — use flat subtle bg
- Match card padding and spacing to Templates/Workflows page patterns

## Files Modified

| File | Change |
|------|--------|
| `src/types/catalog.ts` | Add `swimwear` to `ProductCategory`, add step 6 |
| `src/lib/catalogEngine.ts` | Add swimwear category + keywords, fix ghost mannequin shadow, swimwear support wardrobe |
| `src/pages/CatalogGenerate.tsx` | Add review step (step 6), fix loading state, add elapsed/estimated time, redesign progress + completion, minimize visual noise on stepper |
| `src/hooks/useCatalogGenerate.ts` | Fix `isGenerating` timing (keep true during enqueue) |
| `src/components/app/catalog/CatalogStepShots.tsx` | Remove generate button (moves to review step), remove emoji icons, clean up card styling |
| `src/components/app/catalog/CatalogStepReview.tsx` | New component — review + confirm step with accessory add-on slots |
| `src/components/app/catalog/CatalogStepProducts.tsx` | Reduce visual weight, match app styling |
| `src/components/app/catalog/CatalogStepFashionStyle.tsx` | Remove gradients, flatten cards |
| `src/components/app/catalog/CatalogStepModelsV2.tsx` | Reduce border weights, cleaner grid |
| `src/components/app/catalog/CatalogStepBackgroundsV2.tsx` | Show hex code as copyable text under each swatch |

## Technical Details

- Swimwear `resolveSupportWardrobe`: when `heroSlot === 'full_body_slot'` AND category is `swimwear`, return all-null wardrobe (no support clothing at all — the swimwear IS the complete outfit)
- Ghost mannequin prompt change is a single string replacement in `SHOT_DEFINITIONS`
- `isGenerating` fix: move `setIsGenerating(false)` from line 306 to inside the `if (allJobs.length === 0)` error branch, and add it to the polling callback when `allDone` is true
- Accessory references in review step: stored as `Map<productId, string[]>` (base64 URLs), passed into `CatalogSessionConfig` and appended to prompts as extra reference context
- Estimated time calculation: `avgTimePerJob = elapsed / completed; remaining = avgTimePerJob * (total - completed - failed)`

