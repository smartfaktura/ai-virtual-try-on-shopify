

## Apple-Inspired Mobile Prompt Bar Polish

### Problem

1. The collapse/expand handle (pill bar + chevron + text) looks cluttered and cheap -- not aligned with the app's luxury aesthetic
2. A visible border line appears above the prompt panel because BOTH the parent wrapper (`border-t`) and the panel itself (`border`) draw borders, creating a double-line effect
3. The rounded top corners of the panel are cropped/clipped by the parent container

### Changes

**File: `src/pages/Freestyle.tsx`** (line 613)

Remove the `border-t border-border/60` and `bg-background/80 backdrop-blur-xl` from the mobile dock wrapper. The panel component itself already has background, blur, and border styling -- the wrapper should be transparent and borderless to avoid doubling.

Change:
```
<div className="lg:hidden border-t border-border/60 bg-background/80 backdrop-blur-xl">
```
To:
```
<div className="lg:hidden">
```

**File: `src/components/app/freestyle/FreestylePromptPanel.tsx`** (lines 186-196)

Replace the current cluttered handle (pill + chevron + text) with a clean, Apple-inspired minimal design:

- Single centered pill indicator (like iOS sheet handles): `w-9 h-[5px] rounded-full bg-border/40` inside a generous `py-3` touch target
- No text, no chevron -- the pill alone is the universal iOS "drag handle" affordance
- When collapsed, show a compact row with just the pill and a subtle upward-facing chevron to hint "tap to expand"
- Larger touch target (`min-h-[44px]`) for easy tapping

Replace lines 186-196 with:
```tsx
{isMobile && onToggleCollapse && (
  <button
    onClick={onToggleCollapse}
    className="w-full flex items-center justify-center min-h-[44px] active:bg-muted/20 transition-colors"
    aria-label={isCollapsed ? 'Expand prompt' : 'Collapse prompt'}
  >
    <div className={cn(
      'w-9 h-[5px] rounded-full transition-colors',
      isCollapsed ? 'bg-muted-foreground/30' : 'bg-border/50'
    )} />
  </button>
)}
```

**File: `src/components/app/freestyle/FreestylePromptPanel.tsx`** (lines 153-163)

Update the mobile container to use a subtle top shadow instead of a border for a cleaner, more spacious feel:

- Change mobile styling from `rounded-t-2xl border-b-0 shadow-none` to `rounded-t-3xl border-0 shadow-[0_-4px_24px_-6px_rgba(0,0,0,0.08)]`
- Remove the generic `border` from the shared class and only apply it on desktop
- Use `overflow-visible` on mobile so the rounded corners are not clipped by the parent

### Summary of Visual Effect

- The prompt bar will appear to "float" upward from the bottom with a soft shadow instead of a hard border line
- The collapse handle becomes a single clean pill indicator (Apple sheet-style)
- More vertical breathing room around the handle for a spacious, premium feel
- No double borders, no content clipping

### Files Modified
- `src/pages/Freestyle.tsx` -- remove redundant border/bg from mobile wrapper
- `src/components/app/freestyle/FreestylePromptPanel.tsx` -- Apple-style handle, shadow instead of border on mobile

