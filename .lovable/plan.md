## Setup step (`ProductImagesStep3Refine.tsx`): two tweaks

### 1. Move the Product Specifications card to the bottom

`ProductSpecsCard` (the optional "Product details" card that opens a modal) currently renders right after the "Complete setup" header. Move it so it becomes the last card before "Additional note".

- **Remove** the block at lines `2536–2544` (`<ProductSpecsCard … />` plus the surrounding comment).
- **Insert the same `<ProductSpecsCard … />`** immediately before the `{/* ── ADDITIONAL NOTE ── */}` block (just before line `3719`), keeping the same props and indentation.

No other props or behavior change.

### 2. Model picker: replace persistent free-plan banner with a toast

Match the pattern already used by the Shots step (`FreeLimitToast` in `ProductImagesStep2Scenes.tsx`): no persistent "Free plan: 1 model per generation Upgrade" header text — only a floating bottom toast when a Free user tries to add a second model.

- **Remove** the persistent banner inside `ModelPickerSections` at lines `201–209` (the `{isFree && (<span>… Free plan: 1 model per generation … Upgrade</span>)}` block). Keep the surrounding `VOVV.AI Models` label and layout.
- **Remove** the inline hint card at lines `2614–2622` (`{isFree && modelLimitHintAt != null && (<div>… Free plan limit — 1 model per generation …</div>)}`).
- **Add a floating toast** mirroring `FreeLimitToast` from Step 2 Scenes, rendered at the bottom of `ProductImagesStep3Refine` (e.g. near the end of the returned JSX, inside a fragment), shown when `isFree && modelLimitHintAt != null`. Message: `1 model on Free — upgrade for multi-model shoots`. Reuse the same classes: `fixed bottom-24 left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 rounded-full bg-foreground text-background text-xs font-medium shadow-lg animate-fade-in`.

Existing `flashModelLimit` / `modelLimitHintAt` / `onFreeLimitHit` wiring stays — only the visual presentation changes.

### Out of scope

- No changes to background-color free-plan limit (still uses its own inline hint).
- No changes to model selection logic, picker layout, or upgrade modal behavior.
- No copy or layout changes to `ProductSpecsCard` itself.
