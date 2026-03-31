
Fix the blog article image renderer so images stay optimized but keep a natural, non-skinny appearance.

1. Diagnose the actual cause
- The current fix in `src/pages/BlogPost.tsx` changed all markdown images to `max-h-[500px] w-auto h-auto`.
- That prevents oversized images, but for portrait assets it shrinks width proportionally, which is why they now look unnaturally narrow.
- There is also an invalid markup issue: markdown images are currently rendered through `ShimmerImage` inside a `<p>`, and `ShimmerImage` outputs a wrapper `<div>`. The console warning confirms this can create layout quirks.

2. Replace the one-size-fits-all image sizing
- Update the markdown image renderer in `src/pages/BlogPost.tsx` to use a dedicated blog image block instead of the current generic class string.
- Preserve original aspect ratio, but size by orientation:
  - landscape: allow near full article width
  - portrait: center it with a reasonable max-width instead of limiting only by height
  - square: medium centered width
- This keeps images looking like their original format without becoming huge or ultra-skinny.

3. Fix markdown paragraph/image structure
- Update the custom `p` renderer so image-only paragraphs are rendered as a block/figure wrapper, not a `<p>`.
- This removes the `div inside p` warning and gives stable spacing/alignment for article images.

4. Keep optimization, but apply it safely
- Continue using optimized image URLs for performance.
- Do not rely on fixed visual height as the main control.
- If needed, slightly increase article image optimization width so portrait images still look crisp when centered at a larger width.

5. Styling cleanup
- Add dedicated blog article image styles in `src/index.css` (or keep them inline if very small) for:
  - centered display
  - responsive max widths by orientation
  - consistent margins
  - rounded corners without forced cropping

Technical details
- Primary file: `src/pages/BlogPost.tsx`
- Possible supporting file: `src/index.css`
- Likely implementation shape:
  - create a small `BlogMarkdownImage` renderer/component
  - detect orientation from `naturalWidth` / `naturalHeight` on load
  - apply orientation-aware classes instead of `max-h-[500px] w-auto`
  - special-case image-only paragraphs in the markdown `p` renderer

Expected result
- Blog images remain optimized
- No zoomed-in/cropped look
- No skinny portrait images
- Original aspect ratios are preserved
- Cleaner DOM and more predictable article layout

Validation
- Check the current article route `/blog/ai-product-photography-examples-gallery`
- Verify at least one portrait, one landscape, and one square-ish image in blog content
- Confirm the console warning about invalid nesting is gone
- Confirm images still load lazily and remain sharp
