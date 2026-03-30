

## Fix: Progress Banner Shows "0 images" and "Almost there" Instantly + Workflow Card Per-Image Estimates

### Problems

1. **"Almost there" shows at 3 seconds**: In `MultiProductProgressBanner`, `totalEstSeconds = totalImages * 8`. When `totalImages = 0` (jobs not yet enqueued), `ratio = elapsed / 0 = Infinity`, immediately triggering the overtime message.

2. **"Generating 0 images" / "Est. ~0 sec for 0 images"**: `totalExpectedImages` is passed as `multiProductJobIds.size` which is 0 until the enqueue loop populates it. The banner renders before any jobs exist.

3. **Workflow Activity Card shows per-image estimate** ("~60-120s/img") instead of total batch estimate (e.g., "est. ~48-96 min total").

4. **`estimatePerImage = 8` is wrong for try-on**: Try-on jobs take 60-120s each, not 8s. The estimate is wildly inaccurate.

### Plan

#### 1. Fix MultiProductProgressBanner zero-state

**File**: `src/components/app/MultiProductProgressBanner.tsx`

- Guard against `totalImages === 0`: show a "Preparing batch…" message instead of "Generating 0 images"
- Use `Math.max(totalEstSeconds, 1)` in the ratio calculation to prevent division by zero
- Detect job type (try-on vs standard) via a new `isProModel` prop and use 45s estimate for pro, 8s for standard
- Don't show overtime message until at least 30 seconds have passed (add `elapsed > 30` guard)

#### 2. Fix WorkflowActivityCard to show total batch estimate

**File**: `src/components/app/WorkflowActivityCard.tsx`

- Replace per-image estimate text (`~60-120s/img`) with total batch estimate
- Calculate: `const estPerImg = isProModel ? 90 : 22; const totalEst = group.totalImageCount * estPerImg;`
- Display: `est. ~${formatRange(totalEst)} total` (e.g., "est. ~48-96 min total")
- Show elapsed time relative to total batch, not individual image

#### 3. Pass `isProModel` to MultiProductProgressBanner

**File**: `src/pages/Generate.tsx`

- Add `isProModel` prop based on workflow quality or job type (try-on detection)
- Already has the data: `isTryOn` and quality settings are available in the generation flow

### Files changed

| File | Change |
|------|--------|
| `src/components/app/MultiProductProgressBanner.tsx` | Guard zero-state; fix estimate per image for pro/try-on; prevent instant overtime message |
| `src/components/app/WorkflowActivityCard.tsx` | Show total batch estimate instead of per-image; format as minutes for large batches |
| `src/pages/Generate.tsx` | Pass `isProModel` prop to banner |

