

# /app/catalog — Round 4 Audit

The previous three rounds addressed all major functional bugs and most polish items. The flow is now solid. Here are the remaining items I found:

## Remaining Issues

### 1. `confirm()` used for cancel — should be a proper dialog
**File: `CatalogGenerate.tsx` line 410**
The cancel button uses `window.confirm()` which is a browser-native blocking dialog. It looks out of place in a polished app and can't be styled.
**Fix**: Replace with an `AlertDialog` component (already available in the project's UI library) for a consistent cancel confirmation.

### 2. Models step: no `focus-visible` ring on "Product Only" toggle or model cards
**File: `CatalogStepModelsV2.tsx` line 63**
The Product Only button and model cards lack focus-visible styling for keyboard navigation — same fix that was applied to Fashion Style and Shots cards but missed here.
**Fix**: Add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` to the Product Only button and verify `ModelSelectorCard` has it too.

### 3. Products step: list view has no "Load more" button
**File: `CatalogStepProducts.tsx` line 361-406**
Grid view has "Load more" when `filtered.length > visibleCount`, but list view renders the same `visible` slice without a load-more button. Users in list view can't see products beyond the first 24.
**Fix**: Add the same "Load more" button after the list view's scrollable container.

### 4. Products step: list view `max-h-[420px]` is arbitrary and may cut off on larger screens
**File: `CatalogStepProducts.tsx` line 362**
The `max-h-[420px]` on the list view container is fixed. On a desktop 1080p screen, this wastes vertical space. On a 440px mobile viewport, the actual available height is less.
**Fix**: Use `max-h-[50vh]` or `max-h-[min(420px,50vh)]` for better responsiveness.

### 5. Generation progress: `confirm()` Cancel doesn't stop in-flight jobs
**File: `CatalogGenerate.tsx` line 410-413**
`resetBatch()` clears local state and stops polling, but already-queued jobs continue processing on the server and consume credits. The cancel is only cosmetic.
**Fix**: This is acceptable behavior (server-side cancellation is complex), but the confirm message should clarify: "Already-queued images will still be processed. Credits for completed images will be used."

### 6. Sidebar credit estimate doesn't show balance comparison
**File: `CatalogContextSidebar.tsx` line 137-148**
The sidebar shows `totalCredits` and `totalImages` but doesn't show the user's current balance or whether they have enough. The Review step shows this, but having it earlier (from Step 5 onward when shots are selected) would catch insufficient credits sooner.
**Fix**: Pass `balance` to `CatalogContextSidebar` and show a red/green indicator when `totalImages > 0`.

### 7. No keyboard shortcut to advance steps
Not a bug, but a nice-to-have. Power users generating multiple catalogs would benefit from Enter to advance and Escape to go back. Low priority.

## Recommended Priority

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 1 | Replace `confirm()` with AlertDialog | Small | Visual consistency |
| 2 | Focus ring on Models step | Trivial | Accessibility |
| 3 | Add "Load more" to list view | Trivial | Functional gap |
| 4 | Responsive list view max-height | Trivial | Layout polish |
| 5 | Clarify cancel message | Trivial | User expectations |
| 6 | Show balance in sidebar estimate | Small | Early credit awareness |

No functional bugs remain. These are polish and accessibility items. Items 1-3 are the most worthwhile.

## Technical Details

- **AlertDialog replacement** (item 1): Import `AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger` from `@/components/ui/alert-dialog`. Add `showCancelDialog` state, render the dialog, and trigger it from the Cancel button.
- **Focus ring** (item 2): Add classes to the Product Only `<button>` in `CatalogStepModelsV2.tsx` line 63. Check if `ModelSelectorCard` already has focus styling.
- **Load more in list view** (item 3): Copy the existing "Load more" `<Button>` from the grid view section (lines 347-356) and place it after the list view's closing `</div>` at line 405.
- **Sidebar balance** (item 6): Add `balance` prop to `CatalogContextSidebarProps`, pass it from `CatalogGenerate.tsx`, and render a small indicator below the credit estimate showing `{balance} available` with conditional red/green coloring.

