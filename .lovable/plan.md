# Blog Refresh — fix overflow + match home aesthetic

## Bugs identified

1. **Horizontal scroll on blog post** — `ShimmerImage` wraps an `<img>` that has no intrinsic width constraint when used with `aspectRatio`. The wrapper sets `aspectRatio: 16/9` but the inner `<img>` only gets `transition-opacity` classes from defaults — no `w-full h-full object-cover`. So the natural image size leaks past its parent and pushes horizontal scroll on the page (visible as the cover image bleeding edge-to-edge in the screenshot).
2. **Cover image looks upscaled / cropped** — forced `aspectRatio="16/9"` crops portrait/square sources awkwardly; also no `getOptimizedUrl` is applied, so the raw asset loads at full resolution and is then squeezed into a small container.

## Fixes (focused, minimal)

**`src/pages/BlogPost.tsx`** — cover image block (lines 226–240):
- Drop forced `aspectRatio="16/9"`. Use natural aspect with `max-h-[60vh]` so portrait images don't dominate the screen.
- Pass `className="w-full h-auto object-contain"` so the image always fits its container.
- Use `getOptimizedUrl(post.coverImage, { quality: 78 })` for sane file size.
- Wrap in `overflow-hidden` parent to guarantee no leak.

**`src/components/ui/shimmer-image.tsx`** — defensive fix:
- Always apply `max-w-full` to the inner `<img>` so it can never overflow its wrapper, regardless of caller props.

## Aesthetic refresh — match home/help/about pattern

**`src/pages/Blog.tsx`** (the Blog index):
- Page bg `bg-[#FAFAF8]`, drop the gradient header.
- Hero: eyebrow `Blog` + big headline (`text-[2.5rem] sm:text-5xl lg:text-[3.5rem] tracking-[-0.03em]`) + muted lead.
- Category filter pills: cleaner pill style on white, primary fill when active.
- Featured post card: white rounded-3xl card on cream, `border-[#f0efed] shadow-sm`, drop the gradient overlay.
- Post grid: white `rounded-2xl` cards with `border-[#f0efed]`, soft hover shadow.
- Replace the bright primary-gradient mid-page CTA with the dark `#1a1a2e` final CTA pattern (matches site).

**`src/pages/BlogPost.tsx`** (article view):
- Page bg cream `#FAFAF8`.
- Hero header: drop the multi-color gradient + decorative orbs. Replace with cream bg, eyebrow `{category}`, big tracking-tight headline, muted excerpt, and a clean meta row (author chip on white, date, read time).
- TOC card: white `rounded-2xl border-[#f0efed] shadow-sm` instead of muted card.
- Tags: subtle outline pills on cream.
- In-article CTA: replace the primary gradient block with the dark `#1a1a2e` CTA pattern (matches all other pages).
- Related posts: white rounded cards on cream, small softer hover.
- Reading progress bar stays.

## Out of scope
- No markdown content, no `data/blogPosts.ts` changes
- No changes to `index.css` blog typography (drop-cap, numbered H2, callouts) — they already match the editorial vibe
- No new images
- No changes to `BlogMarkdownImage` (already correctly constrained)

## Files touched
- `src/pages/BlogPost.tsx`
- `src/pages/Blog.tsx`
- `src/components/ui/shimmer-image.tsx` (one-line defensive `max-w-full`)
