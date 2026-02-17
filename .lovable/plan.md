

## Fix: Dual-Mounted Prompt Panels Causing Duplicate Popovers

### Root Cause

The `Freestyle.tsx` page renders `FreestylePromptPanel` **twice** simultaneously -- once for desktop (line 607, inside `hidden lg:block`) and once for mobile (line 634, inside `lg:hidden`). Both are always mounted in the DOM; only CSS visibility differs.

Both instances share the **same popover state** (e.g. `modelPopoverOpen`). When you click "Model":
1. State becomes `true`
2. **Both** mounted `Popover` components open
3. `PopoverContent` uses a **Portal**, which renders outside the hidden parent, bypassing the CSS `display:none`
4. Result: two identical popover panels appear, and Radix's outside-click detection from one immediately closes both

This explains both symptoms: **doubled panels** and **instant disappearance**.

### Solution

Render only ONE `FreestylePromptPanel` instead of two. The panel already adapts its layout based on `useIsMobile()` internally, so there is no need for two separate mount points.

### Changes

**File: `src/pages/Freestyle.tsx`**

1. Remove the duplicate mobile rendering (lines 612-635) of `FreestylePromptPanel`
2. In the desktop container (lines 582-610), remove the `hidden lg:block` restriction so the single panel renders on all screen sizes
3. Adjust the container styling to work for both mobile and desktop:
   - Desktop: keep the absolute-positioned floating bar with gradient fade
   - Mobile: switch to a simpler docked layout

The key change is to use a single responsive container:

```tsx
{/* Prompt panel - single instance for all screen sizes */}
<div className="lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:z-20">
  {/* Desktop gradient fade */}
  <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-muted/80 via-muted/40 to-transparent pointer-events-none" />
  
  <div className="lg:px-4 lg:sm:px-8 lg:pb-3 lg:sm:pb-5 lg:pt-2">
    <div className="lg:max-w-3xl lg:mx-auto lg:pointer-events-auto relative">
      {/* Scene hint (shown on both) */}
      ...
      <FreestylePromptPanel {...panelProps} />
    </div>
  </div>
</div>
```

This eliminates the dual-mount entirely, fixing both the duplicate popover and flash-close issues without needing any `modal` prop workarounds.

### Files Modified
- `src/pages/Freestyle.tsx` -- merge desktop and mobile panel containers into a single mount point

