

## Remove Model Name from Video Detail Modal

Hide the "kling-v3" model chip from the metadata section in `src/components/app/video/VideoDetailModal.tsx`.

### Change

In `VideoDetailModal.tsx`, remove the conditional block that renders `video.model_name` (around line 155-159):

```tsx
// DELETE this block:
{video.model_name && (
  <span className="px-2.5 py-1 rounded-md bg-muted/50 text-[11px] font-medium text-muted-foreground">
    {video.model_name}
  </span>
)}
```

Only the duration and aspect ratio chips will remain.

