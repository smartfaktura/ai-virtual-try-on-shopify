## Root cause

`react-markdown` URI-encodes image `src` values, so the `|` separators we use for collages (`![alt](url1|url2|url3)`) arrive at `BlogMarkdownImage` as `%7C`. The current check `src.includes('|')` is false, so all three blog collages render as a single broken-URL image (the broken-image icon you see). Same bug affects bags and fashion posts — they all use the same syntax.

## Fix

In `src/components/app/BlogMarkdownImage.tsx`:

- Compute `const decoded = src.includes('|') ? src : decodeURIComponent(src);` once at the top.
- Use `decoded.includes('|')` for the collage check.
- Use `decoded.split('|')` for the URL list.

Keep everything else (grid layout, optimization, captions) unchanged. No blog content edits needed — the markdown is correct; only the renderer needs the decode.

## Files

- `src/components/app/BlogMarkdownImage.tsx`
