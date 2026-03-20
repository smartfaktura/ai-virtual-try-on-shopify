

# Fix Try-On UX Issues (5 items)

## 1. Fix confusing "0 of 2 products" progress text
**File**: `src/components/app/MultiProductProgressBanner.tsx` (line 82-84)

The banner shows "0 of 2 products" which is confusing. Change to show generating progress more clearly:
- Replace `{completedCount} of {totalProducts} products` with `Generating {totalImages} images for {totalProducts} product{s}`
- When completedCount > 0, show `{completedCount} of {totalProducts} products done`

## 2. Fix "Not enough credits" error appearing mid-generation
**File**: `src/pages/Generate.tsx` (lines 1252-1296)

The multi-product loop enqueues jobs sequentially. If credits run out mid-way, individual 402 errors show as toasts. Fix:
- Before starting the loop, calculate total credits needed for all products × models × poses × ratios × framings
- If `balance < totalCreditsNeeded`, show a single clear error and open the buy modal instead of starting generation
- This prevents partial generation and confusing error toasts

## 3. Fix wildly inaccurate time estimates
**File**: `src/components/app/MultiProductProgressBanner.tsx` (line 64)

The estimate uses 90 seconds per image, producing "34-63 min" when actual generation takes 1-2 minutes. Fix:
- Change `estimatePerImage` from 90 to 15 seconds (closer to reality for standard quality)
- Use 30 seconds for high quality (could pass quality as a prop)
- This gives realistic estimates like "~1-2 min for 8 images"

## 4. Fix results grid for mixed aspect ratios
**File**: `src/pages/Generate.tsx` (lines 3950-3968)

When multiple aspect ratios are selected, images of different sizes create ugly spacing in a flat grid. Fix:
- Group images by their variation label (which contains ratio/framing info)
- Render each group with its own heading and uniform grid
- Use `object-cover` instead of `object-contain` to fill cards uniformly, or group images by label prefix

## 5. Improve Close-Up framing instructions
**File**: `supabase/functions/generate-tryon/index.ts` (line 88)

Current close-up instruction is too vague: "Close-up from shoulders up. Tight beauty headshot emphasizing product detail." This produces images identical to upper body shots. Improve with Perspectives-style photography DNA:
```
5. FRAMING — CLOSE-UP / PRODUCT DETAIL:
- Lens: 85mm at f/2.8, shallow depth-of-field with razor-sharp focus on the product zone.
- Framing: Tight crop from mid-chest upward. The product/garment must fill at least 60% of the visible frame area.
- Show fabric texture, stitching, material drape, pattern detail at close range.
- Camera distance: Much closer than a standard portrait — the viewer should feel they can reach out and touch the product.
- DO NOT produce a standard portrait/headshot. The crop must be noticeably tighter than 'upper body'.
- Background should be heavily blurred (bokeh) to isolate the product area.
```

Also update `src/lib/framingUtils.ts` (line 102-103) `buildFramingPrompt` for `close_up` to match.

### Files to edit
- `src/components/app/MultiProductProgressBanner.tsx` — progress text + time estimate
- `src/pages/Generate.tsx` — pre-check credits before loop + group results grid by label
- `supabase/functions/generate-tryon/index.ts` — close-up framing instruction
- `src/lib/framingUtils.ts` — close-up framing prompt

