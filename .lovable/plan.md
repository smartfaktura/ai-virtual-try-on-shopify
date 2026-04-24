

## Safety guarantee: no zoom regression in modal optimization pass

### Your concern
Last time the zoom bug appeared because I added `width: 40` to `getOptimizedUrl(...)`. You want a hard guarantee that won't happen again in this modal audit pass.

### Why this pass is safe
The zoom bug has one and only one cause in this codebase:

> Passing `width`, `height`, or `resize` to `getOptimizedUrl` triggers the Supabase render endpoint to crop/zoom the image.

This is documented in core memory (`image-optimization-no-crop`).

### Hard rule for this pass
Every change will use **quality only**:

```tsx
getOptimizedUrl(url, { quality: 60 })   // ✅ safe
getOptimizedUrl(url, { quality: 70 })   // ✅ safe
```

Forbidden in this pass:
```tsx
getOptimizedUrl(url, { width: ... })    // ❌ never
getOptimizedUrl(url, { height: ... })   // ❌ never
getOptimizedUrl(url, { resize: ... })   // ❌ never
```

### Why quality-only cannot zoom
Looking at `src/lib/imageOptimization.ts`: the function only appends `?quality=N` to the URL when no width/height/resize is passed. The Supabase render endpoint with quality-only re-encodes the same pixels at lower JPEG quality — **same dimensions, same framing, same crop**. It is mathematically impossible to zoom.

### Self-check before each edit
For every one of the 8 thumbnails, I will:
1. Confirm the new call contains only `{ quality: N }` — no other keys
2. Leave all CSS (`object-cover`, `object-contain`, sizing) exactly as-is
3. Not touch any wrapper div, aspect ratio, or container

### Files (unchanged from prior plan)
- `AddModelModal.tsx` — line 151
- `AddSceneModal.tsx` — line 127
- `GenerateModelModal.tsx` — line 138
- `TryOnConfirmModal.tsx` — line 71
- `StartWorkflowModal.tsx` — lines 285, 340
- `AddToDiscoverModal.tsx` — line 540
- `freestyle/FreestylePromptPanel.tsx` — line 274

Plus add `loading="lazy"` where missing on these same elements.

### QA after the change
Open each modal and visually compare with current state:
- Framing identical (no zoom, no crop shift)
- Visual quality unchanged at small sizes
- Network tab: requests contain `?quality=...` and **never** `width=`, `height=`, or `resize=`

If any thumbnail looks even slightly different in framing — revert that single line. Quality-only is reversible and isolated per call.

