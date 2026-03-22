

# Fix "Created with" Label: Same Line + Subtle Hover Color

## Problem
1. "CREATED WITH" and "FREESTYLE" are on separate lines — should be on the same line.
2. Hover color is vivid blue (`text-blue-600`) — too bright, should be subtle.

## Changes

### `src/components/app/DiscoverDetailModal.tsx` (lines 187-202)

Replace the `<div className="space-y-3">` + separate `<p>` and `<button>` with a single inline layout:

```tsx
<div className="flex items-baseline gap-1.5">
  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
    Created with
  </span>
  <button
    onClick={...}
    className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 hover:text-foreground/90 transition-colors cursor-pointer"
  >
    {workflowLabel}
  </button>
</div>
```

- Same line using `flex items-baseline gap-1.5`
- Hover changes from `text-blue-600` to `text-foreground/90` (subtle darken, not vivid blue)

### `src/components/app/PublicDiscoverDetailModal.tsx`

Same inline layout change for consistency (public modal has no click behavior, just restyle to inline).

Two files, ~5 lines each.

