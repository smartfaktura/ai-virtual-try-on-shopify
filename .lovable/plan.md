

# Add Selected Scenes Summary Above Scene Grid

## What
Add a compact summary strip above the "Select Scenes" grid showing thumbnails + names of currently selected scenes. Only visible when ≥1 scene is selected. Improves clarity especially when scenes are pre-selected from Discover.

## Where
**`src/pages/Generate.tsx`** — between the header row (line 3657) and the scene grid (line 3659).

## Implementation

Insert a conditional block that renders when `selectedPoses.size > 0`:

```tsx
{selectedPoses.size > 0 && (
  <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border border-border/50">
    <span className="text-xs text-muted-foreground self-center mr-1">Selected:</span>
    {Array.from(selectedPoses).map(id => {
      const pose = selectedPoseMap.get(id);
      if (!pose) return null;
      return (
        <div key={id} className="flex items-center gap-1.5 bg-background rounded-md px-2 py-1 border text-xs">
          <img src={getOptimizedUrl(pose.previewUrl, { quality: 50 })} alt={pose.name} className="w-6 h-6 rounded object-cover" />
          <span className="font-medium truncate max-w-[120px]">{pose.name}</span>
        </div>
      );
    })}
  </div>
)}
```

Single insertion (~15 lines), one file. Uses existing `selectedPoseMap` and `getOptimizedUrl` already available in scope.

