

# Fix Feedback Card Delay + Sticky Close Button

## Issues

1. **2-second delay**: `ContextualFeedbackCard` has a `setTimeout(() => setStep('step1'), 2000)` on line 55. The card starts as `'idle'` (invisible) and only appears after 2 seconds. In the Freestyle page this made sense as a gentle reveal, but inside the image detail modal it feels like a bug since the user is already engaged with the image.

2. **Close button scrolls away**: The `X` close button on the info panel uses `absolute top-5 right-5` (line 189-194) but the panel itself is `overflow-y-auto`, so when the user scrolls down the close button scrolls out of view.

## Changes

### `src/components/app/ContextualFeedbackCard.tsx` — Line 55

Reduce the delay from 2000ms to 300ms so the card appears almost instantly but still has a subtle entrance animation.

```tsx
// Before
const t = setTimeout(() => setStep('step1'), 2000);

// After
const t = setTimeout(() => setStep('step1'), 300);
```

### `src/components/app/LibraryDetailModal.tsx` — Lines 186-196

Make the close button sticky by moving it outside the scrollable content area. Change the info panel to have a sticky header with the close button, then the scrollable content below.

**Before:**
```tsx
<div className="relative w-full md:w-[40%] h-[55vh] md:h-full overflow-y-auto bg-background/95 backdrop-blur-xl border-l border-border/20">
  {/* Close */}
  <button onClick={onClose} className="absolute top-5 right-5 z-20 ...">
    <X className="w-7 h-7" strokeWidth={2} />
  </button>
  <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10 pt-8 md:pt-10">
```

**After:**
```tsx
<div className="relative w-full md:w-[40%] h-[55vh] md:h-full flex flex-col bg-background/95 backdrop-blur-xl border-l border-border/20">
  {/* Sticky close button */}
  <div className="sticky top-0 z-20 flex justify-end p-4 pb-0">
    <button onClick={onClose} className="text-foreground/70 hover:text-foreground transition-colors">
      <X className="w-7 h-7" strokeWidth={2} />
    </button>
  </div>
  <div className="flex-1 overflow-y-auto">
    <div className="flex flex-col gap-6 p-6 md:p-8 lg:p-10 pt-2 md:pt-2">
```

And close the new wrapper `</div>` before the panel's closing tag.

| File | Change |
|------|--------|
| `src/components/app/ContextualFeedbackCard.tsx` | Reduce show delay from 2000ms to 300ms |
| `src/components/app/LibraryDetailModal.tsx` | Make close button sticky at top of info panel |

