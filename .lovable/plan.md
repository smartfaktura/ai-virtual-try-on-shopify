

# /app/catalog — Final Audit Insights

After three rounds of optimization, the catalog flow is in strong shape. Here are the remaining items I found:

## Issues & Improvements

### 1. Review step: `clicked` state never resets on failure
**File: `CatalogStepReviewV2.tsx` line 58-68**
When `onGenerate()` fails or the user doesn't have enough credits and closes the buy modal, `clicked` remains `true` — the Generate button stays permanently disabled. The component never resets it.
**Fix**: Reset `clicked` to `false` when `isGenerating` transitions from `true` back to `false`, and immediately when opening the buy modal.

### 2. Review step: Style/Background "Edit" button navigates to Step 2 (Style) but Background is Step 4
**File: `CatalogStepReviewV2.tsx` line 145**
The Edit button next to the Style + Background row calls `onStepClick(2)`. But Background is Step 4. A user wanting to change the background gets sent to Style instead.
**Fix**: Split into two separate Edit buttons — one for Style (Step 2) and one for Background (Step 4), or navigate to Step 4 since both are quick to change.

### 3. Shots step: credit bar `sticky bottom-4` overlaps content on short viewports
**File: `CatalogStepShots.tsx` line 116**
On 440px viewport, the sticky credit calculator bar is ~120px tall and sits at `bottom-4`. If only 2-3 shot cards are visible, the bar overlaps them with no scroll margin.
**Fix**: Add `scroll-pb-40` or `pb-44` to the parent container so content scrolls above the sticky bar.

### 4. Props step: "Skip — no props" link + "Next" button both do the same thing
**File: `CatalogStepProps.tsx` lines 393-401**
When no props are assigned, both the "Skip" link and the "Next" button call `onNext()`. This is redundant UI clutter.
**Fix**: When `totalWithProps === 0`, show only the "Next" button with text "Skip: No Props" to consolidate.

### 5. Mobile: Background label text overlaps on 3-col grid at 440px
**File: `CatalogStepBackgroundsV2.tsx` line 53-58**
With 3 columns at 440px, each card is ~130px wide. The label overlay shows name + shadow style + hex code — the hex code likely overflows or overlaps on small cards.
**Fix**: Hide the hex code on mobile with `hidden sm:inline`.

### 6. Products step: "Select All" selects from filtered results but label says "Select All"
**File: `CatalogStepProducts.tsx` line 210-214**
When a search filter is active, "Select All" selects only filtered products (correct behavior), but the button text doesn't reflect this. Could confuse users.
**Fix**: Change label to "Select All ({filtered.length})" or "Select Visible" when search is active.

### 7. Generation progress: no way to cancel a running batch
**File: `CatalogGenerate.tsx` lines 386-467**
During generation, there's no cancel button. If a user queued 60 images by mistake, they must wait 10 minutes for the hard timeout.
**Fix**: Add a "Cancel" button that calls `resetBatch()` and shows a confirmation dialog.

### 8. Fashion Style step: no focus-visible ring on style cards
**File: `CatalogStepFashionStyle.tsx` line 46-51**
Style cards lack `focus-visible:ring-2 focus-visible:ring-primary` for keyboard navigation.
**Fix**: Add the focus ring classes.

## Recommended Priority

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 1 | Reset `clicked` state on failure | Trivial | Prevents stuck button (functional bug) |
| 2 | Fix Edit navigation for Background | Trivial | Wrong step navigation (functional bug) |
| 3 | Add scroll padding for sticky credit bar | Trivial | Content overlap on small screens |
| 4 | Consolidate Skip/Next buttons in Props | Trivial | Cleaner UI |
| 5 | Hide hex code on mobile backgrounds | Trivial | Text overflow |
| 6 | "Select All" label clarity | Trivial | UX clarity |
| 7 | Add cancel button during generation | Small | User control |
| 8 | Focus ring on Fashion Style cards | Trivial | Accessibility |

Items 1 and 2 are functional bugs that should be fixed. The rest are polish.

