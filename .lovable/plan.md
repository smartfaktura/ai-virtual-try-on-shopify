

## Fix: Restore Branded Button Color and Fix Desktop Gradient Overlap

### Problem 1: Button Color Changed
The Generate button was changed from the branded `bg-primary` (dark navy VOVV.AI color) to `bg-blue-600`. This should be reverted back to `bg-primary` for brand consistency.

### Problem 2: Gradient Fade Covers the Button
On desktop, a gradient overlay (`h-40 bg-gradient-to-t from-muted/80`) sits at `z-10` but the prompt panel has no explicit z-index, so the gradient renders on top of the button making it look faded/washed out.

### Changes

**File: `src/components/app/freestyle/FreestylePromptPanel.tsx`**
- Revert the active Generate button from `bg-blue-600 hover:bg-blue-700` back to `bg-primary hover:bg-primary/90 text-primary-foreground`
- Keep the shadow for visual prominence

**File: `src/pages/Freestyle.tsx`**
- Add `relative z-20` to the prompt panel's inner content wrapper so it sits above the gradient fade
- This ensures the gradient provides the visual fade effect on the gallery behind but never overlaps the interactive prompt panel

### Technical Detail

```
FreestylePromptPanel.tsx line 314:
  Before: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
  After:  "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"

Freestyle.tsx line 595:
  Before: <div className="lg:max-w-3xl lg:mx-auto lg:pointer-events-auto relative">
  After:  <div className="lg:max-w-3xl lg:mx-auto lg:pointer-events-auto relative z-20">
```

Two lines changed across two files.
