# Restore upscale progress banner & shorten subtitle

## What's wrong

In `src/pages/Generate.tsx`:

- **Line 4539** — `MultiProductProgressBanner` is rendered for batch generations but explicitly excluded for upscale (`&& !isUpscale`). When bulk-upscaling 3 images, all 3 jobs are queued and tracked via `multiProductJobIds`, but the user sees only the static "Enhancing to 4K..." card with no per-image progress, no completed count, no ETA.
- **Line 4517** — Upscale subtitle is verbose: `Upscaling 3 images — sharpening details & recovering textures`. User wants just `Upscaling 3 images`.

## Fix

### 1. Show progress banner during upscale (line 4539)

Remove the `!isUpscale` guard so the `MultiProductProgressBanner` renders for upscale runs the same way it does for normal multi-product jobs. It already reads from `multiProductJobIds`, `multiProductResults`, and `generatingProgress`, all of which the upscale flow populates (see lines 1290–1370). The banner will show:

- N of M images completed
- Per-job status
- Cancel control
- Implicit ETA via the progress bar

Pass `workflowName="Image Upscaling"` when `isUpscale` so the banner header reads correctly, and keep `isProModel={false}` for upscale.

### 2. Shorten subtitle (line 4517)

Change:
```
Upscaling ${count} image${s} — sharpening details & recovering textures
```
to:
```
Upscaling ${count} image${s}
```

No terminal period (matches Core memory rule).

## Out of scope

- No backend / worker changes
- No change to the "Enhancing to 4K..." title
- No change to results page layout (already cleaned up in earlier turns)
- No change to non-upscale flows
