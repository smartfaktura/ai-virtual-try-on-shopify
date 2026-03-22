

# Improve "Created With" Section Label

## Problem
The label above the scene/model thumbnails just says "FREESTYLE" or a workflow name — it's unclear what it represents. The user wants it to say "CREATED WITH" as a section header, with the workflow/freestyle type shown differently.

## Changes

### `src/components/app/DiscoverDetailModal.tsx` (line 188-189)

Change the label from just the workflow name to a two-part layout:

```
Before:
  FREESTYLE

After:
  CREATED WITH
  Freestyle  (as a small badge/chip below the header)
```

Replace:
```tsx
<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
  {workflowLabel}
</p>
```

With:
```tsx
<p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
  Created with
</p>
<span className="inline-block text-xs font-medium text-foreground/80 bg-muted px-2.5 py-1 rounded-md w-fit">
  {workflowLabel}
</span>
```

This makes it clear the section describes what tools were used, and the workflow type becomes a readable chip rather than a cryptic standalone label.

### `src/components/app/PublicDiscoverDetailModal.tsx`

Same change to keep public and authenticated modals consistent.

Two files, ~4 lines each.

