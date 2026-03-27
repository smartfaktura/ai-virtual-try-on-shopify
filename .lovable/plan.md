

# Enhance Admin Scenes Row with More Metadata

## What changes

**File: `src/pages/AdminScenes.tsx` — `SceneRow` component (lines 624–735)**

Currently each scene row shows: thumbnail, name, category dropdown, and badges for Custom/Prompt Only/Duplicate. We'll add a compact info line below the existing badges showing additional debug data.

### New info to display (as tiny `text-[10px]` metadata chips):

1. **Scene ID** — the raw `poseId` (truncated, click to copy full ID)
2. **Source type** — "Image + Prompt" or "Prompt Only" (already shown as badge, but we'll make the image source clearer)
3. **Prompt hint** — show first ~60 chars of `promptHint` if present, with tooltip for full text
4. **Image URL status** — show a green/red dot indicating if `previewUrl` is a Supabase storage URL (custom upload) vs a local/mock asset
5. **Created date** — show `created_at` if available (custom scenes have this)
6. **Has optimized image** — indicator if `optimizedImageUrl` exists

### Implementation

Add a new `div` row inside the `<div className="min-w-0 flex-1">` block, below the existing badges row (after line 694):

```tsx
{/* Admin debug info */}
<div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
  <span
    className="text-[9px] font-mono text-muted-foreground/60 cursor-pointer hover:text-foreground truncate max-w-[120px]"
    onClick={() => { navigator.clipboard.writeText(pose.poseId); toast.success('ID copied'); }}
    title={`Click to copy: ${pose.poseId}`}
  >
    {pose.poseId.length > 20 ? pose.poseId.slice(0, 8) + '…' + pose.poseId.slice(-4) : pose.poseId}
  </span>
  {pose.promptHint && (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-[9px] text-muted-foreground/50 italic truncate max-w-[200px] cursor-help">
          "{pose.promptHint.slice(0, 60)}{pose.promptHint.length > 60 ? '…' : ''}"
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs whitespace-pre-wrap">{pose.promptHint}</TooltipContent>
    </Tooltip>
  )}
  {pose.optimizedImageUrl && (
    <Badge variant="secondary" className="text-[9px] h-4 px-1.5 bg-green-500/10 text-green-600 border-0">Optimized</Badge>
  )}
  {pose.created_at && (
    <span className="text-[9px] text-muted-foreground/40">
      {new Date(pose.created_at).toLocaleDateString()}
    </span>
  )}
</div>
```

This gives admins at-a-glance visibility into each scene's internal ID, prompt content, optimization status, and creation date — all without cluttering the primary UI.

