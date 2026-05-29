## Scope
When the Continue / Generate button in `/app/generate/product-images` is grey because something's missing, the user gets no feedback. Add a short, plain sonner toast explaining what to do — mobile-friendly. Purely a UX layer; `canProceed` logic is untouched.

## Changes

### 1. `src/pages/ProductImages.tsx` — compute `blockedReason`
Right after the existing `canProceed` IIFE (line 1349), add a parallel IIFE returning a short string when blocked, otherwise `null`.

```ts
const blockedReason = (() => {
  if (canProceed) return null;
  switch (step) {
    case 1:
      return 'Pick at least one product to continue';
    case 2:
      if (hasMultipleCategories && perCategoryScenes.size > 0)
        return 'Each category needs at least one shot';
      return 'Select at least one shot to continue';
    case 4:
      if (!(details.selectedAspectRatios?.length))
        return 'Pick an aspect ratio to continue';
      if (totalImages === 0)
        return 'Add shots or models to generate';
      if (!canAfford)
        return 'Not enough credits — top up to generate';
      return 'Finish the setup above to generate';
    default:
      return 'Finish this step to continue';
  }
})();
```

Pass through to the sticky bar:
```tsx
<ProductImagesStickyBar
  ...
  canProceed={canProceed}
  blockedReason={blockedReason}
  onNext={handleNext}
  onBack={handleBack}
/>
```

### 2. `src/components/app/product-images/ProductImagesStickyBar.tsx` — interactive "soft-disabled" state
- Add `blockedReason?: string | null` to `StickyBarProps`.
- Import `toast` from `sonner`.
- Replace the `disabled={!canProceed}` Buttons (mobile + desktop) with a click handler that fires a plain toast (no icon, no description) when blocked:

```tsx
const handleClick = () => {
  if (!canProceed) {
    toast(blockedReason ?? 'Finish this step to continue', { duration: 2600 });
    return;
  }
  onNext();
};
```

Button (both layouts) — drop `disabled`, keep grey look via classes, add `aria-disabled`:
```tsx
<Button
  size="pill"
  onClick={handleClick}
  aria-disabled={!canProceed}
  className={`gap-1.5 ${!canProceed ? 'opacity-50 cursor-not-allowed hover:bg-primary' : ''}`}
>
  ...
</Button>
```
(Mobile variant keeps its existing `flex-1`.)

### 3. Mobile fit
All copy strings ≤40 chars so they fit one line on a 360 px viewport using sonner defaults. `<Toaster />` is already mounted globally — no provider work.

## Out of scope
- No changes to `canProceed` truth values, `handleNext`, or other wizards.
- No new icons in the toast (per user direction).
- No new dependencies.
