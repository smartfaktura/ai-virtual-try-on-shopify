

## Fix: Prompt Panel Looks "Clipped" Instead of Floating on Mobile/Tablet

### Problem

The prompt panel has `rounded-t-3xl` corners on mobile, but it sits flush against the gallery container above it. The gallery's bottom edge creates a hard horizontal line exactly where the panel's rounded corners curve inward. Combined with the panel's shadow, this makes the corners look "clipped into" the layout rather than floating above it.

### Solution

Add a small negative margin-top on the prompt panel wrapper (mobile only) so the panel overlaps the gallery slightly. This lets the rounded corners float over the gallery content, eliminating the hard line. Also ensure the panel's shadow is visible above the gallery.

### Changes

**File: `src/pages/Freestyle.tsx` (line 583)**

Update the prompt panel wrapper to pull it up slightly on mobile so it overlaps the gallery edge:

```tsx
// Before:
<div className="flex-shrink-0 relative z-20 lg:absolute lg:bottom-0 lg:left-0 lg:right-0">

// After:
<div className="flex-shrink-0 relative z-20 -mt-4 lg:mt-0 lg:absolute lg:bottom-0 lg:left-0 lg:right-0">
```

The `-mt-4` pulls the panel 16px upward on mobile/tablet, so its rounded corners sit over the gallery content. `lg:mt-0` resets this on desktop where the panel is absolutely positioned.

**File: `src/components/app/freestyle/FreestylePromptPanel.tsx` (line 171)**

Slightly increase the shadow so the floating effect is more obvious now that the panel overlaps content:

```tsx
// Before:
? 'rounded-t-3xl border-0 shadow-[0_-2px_12px_-4px_rgba(0,0,0,0.06)]'

// After:
? 'rounded-t-3xl border-0 shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.08)]'
```

### Result

- The prompt panel's rounded corners visually float over the gallery below
- No hard line or "clipped" edge visible at the corners
- The soft upward shadow reinforces the floating appearance
- Desktop layout unchanged (absolute positioning ignores margins)

### Files Modified
- `src/pages/Freestyle.tsx` -- add `-mt-4 lg:mt-0` to panel wrapper
- `src/components/app/freestyle/FreestylePromptPanel.tsx` -- slightly larger shadow for floating effect

