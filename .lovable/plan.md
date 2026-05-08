## What is wrong

The upscale backend is now completing correctly: the latest job finished and inserted a new `upscaled_4k` Library record.

The bad part is display: the Library thumbnail uses the image transform endpoint for every image. The new 4K PNG exists, but the transform endpoint returns `Invalid source image`, so the card shows a broken/empty tile even though the upscale completed.

## Fix plan

1. **Stop optimizing already-upscaled Library thumbnails**
   - In `LibraryImageCard`, render `upscaled_2k` / `upscaled_4k` items with the original storage URL instead of `getOptimizedUrl(...?quality=60)`.
   - Keep optimization for normal Library images.
   - This avoids the broken transform endpoint for large Topaz PNGs.

2. **Add a clean image-error fallback in Library cards**
   - If a thumbnail fails to load, show a polished neutral fallback with a clear label instead of the browser’s broken-image icon.
   - Keep the 4K/2K badge visible so users understand the asset exists.

3. **Make successful upscale refresh the Library automatically**
   - When an upscale job completes successfully, invalidate/refetch the Library query and the upscaling-source query.
   - This makes the new upscaled image appear without requiring a page refresh.

4. **Small mobile UI cleanup from the screenshot**
   - Prevent long card labels like “Freestyle Creation” from visually floating/overlapping on the grid.
   - Keep the mobile grid focused on thumbnails, badges, and actions.

## Verification

- Confirm the latest completed 4K image URL loads directly.
- Confirm the Library card no longer requests the failing transformed URL for upscaled assets.
- Confirm a completed upscale appears in Library after the job finishes without manual refresh.