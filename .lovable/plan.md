

# Make "Created with" Workflow Label a Clickable Link

## Problem
The workflow badge (e.g., "Freestyle") is styled as a static chip with a muted background. The user wants it to:
1. Keep the same font style as the "CREATED WITH" header (uppercase tracking)
2. Be a clickable link that navigates to the workflow/freestyle page
3. Show deep blue on hover

## Changes

### `src/components/app/DiscoverDetailModal.tsx` (line 191-193)

Replace the `<span>` badge with a clickable element that navigates to the correct destination (same logic as the "Recreate this" button):

```tsx
// Before
<span className="inline-block text-xs font-medium text-foreground/80 bg-muted px-2.5 py-1 rounded-md w-fit">
  {workflowLabel}
</span>

// After
<button
  onClick={() => {
    onClose();
    if (item.data.workflow_slug) {
      navigate(`/app/generate/${item.data.workflow_slug}`);
    } else {
      navigate('/app/freestyle');
    }
  }}
  className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/70 hover:text-blue-600 transition-colors cursor-pointer w-fit"
>
  {workflowLabel}
</button>
```

This makes it match the "CREATED WITH" header font style (small uppercase tracking) and turns deep blue on hover, acting as a link to the workflow or freestyle page.

### `src/components/app/PublicDiscoverDetailModal.tsx` (line 101-103)

Same change but for unauthenticated users, link to `/auth` or `/pricing` instead (since they can't access app routes). Or simply make it non-clickable text with the same styling (no bg-muted chip). Since public users can't navigate to workflows, just restyle to match the uppercase font without the link behavior.

Two files, ~5 lines each.

