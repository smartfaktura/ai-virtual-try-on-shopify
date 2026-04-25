# Fix /blog mobile layout

## What's broken on mobile (≤440px)
1. **Horizontal page scroll** — the category filter row uses `-mx-4 px-4 ... overflow-x-auto` with `w-max` children. The negative margin escapes the parent's container, pushing the document past the viewport. There's no global `overflow-x-hidden`, so the entire page scrolls sideways.
2. **Hero is too tall** — `pt-28 pb-20` (112/80px) eats most of the first screen on a 440×688 viewport before any content shows.
3. **Headline crowding** — `text-[2.5rem]` (40px) with very tight `tracking-[-0.03em]` causes "Notes on AI photography" to break awkwardly and feel oversized at 360–414px widths.
4. **Filter pills overflow visibly** as a horizontal strip even when categories fit, because of forced `w-max`.
5. **Featured / grid card padding too generous** on mobile (`p-6` + tight tracking on `text-2xl` headings) — feels cramped and pushes content.
6. **Dark CTA quirks** — extra `px-2` on inner heading/paragraph inside an already-padded `p-8` container; `w-full sm:w-auto` button on `Button asChild size="lg"` stretches edge-to-edge oddly with the rounded card.
7. **Redundant `aspectRatio` prop** on ShimmerImage when the parent wrapper already sets the same aspect — no visual bug but cleans up rendering.

## Fixes (single file: `src/pages/Blog.tsx`)

- **Section spacing**: `pt-28 sm:pt-36 pb-20 sm:pb-28` → `pt-20 sm:pt-32 pb-16 sm:pb-24`. Add `overflow-x-hidden` on the outer `<section>` as a guard.
- **Header**: 
  - Headline: `text-[2rem] sm:text-5xl lg:text-[3.5rem]` (was `text-[2.5rem]`), `tracking-[-0.025em]` (slightly looser), `leading-[1.1]`, `px-2` so it never touches edges.
  - Lead paragraph: `text-[15px] sm:text-lg` for better mobile readability.
  - Margin: `mb-10 sm:mb-16`.
- **Filter row**: drop the `-mx-4 px-4 overflow-x-auto` escape pattern. Use plain `flex flex-wrap justify-center gap-2 mb-8 sm:mb-12`. Pills wrap to multiple lines on mobile — clean, no horizontal scroll. Pills also get `px-3.5 py-1.5 text-[12px]` for compact mobile look.
- **Featured card**: 
  - Card padding `p-5 sm:p-10 lg:p-12` (was `p-6`).
  - Heading `text-[1.375rem] sm:text-3xl lg:text-[2.25rem]` with `tracking-[-0.02em]` and `leading-[1.2]`.
  - Meta row: keep but `text-[11px]` on mobile.
  - Excerpt: `text-[14px] sm:text-base`, `mb-5 sm:mb-6`.
- **Grid cards**:
  - `grid gap-4 sm:gap-5 sm:grid-cols-2`.
  - Card padding `p-4 sm:p-6`.
  - Heading `text-[1.0625rem] sm:text-xl`, `tracking-[-0.01em]`.
- **Dark CTA**:
  - Outer `p-7 sm:p-14` (was `p-8`).
  - Inner heading `text-[1.5rem] sm:text-[2rem]` — drop the inner `px-2` (parent already pads), keep `leading-[1.2]`.
  - Paragraph: drop `px-2`, use `text-[14px] sm:text-base mb-7 sm:mb-8`.
  - Button: `w-full sm:w-auto` is fine but wrap it in `flex justify-center` — current Button has the width applied but the `Link` text uses its own width inside.
  - Margin top `mt-12 sm:mt-20`.
- **ShimmerImage redundancy**: remove the duplicate `aspectRatio` prop on featured + grid (the parent `<div>` already enforces aspect). No visual regression.

## Out of scope
- No changes to `BlogPost.tsx`, `ShimmerImage`, data, or other landing pages.
- No new images, no new components, no markdown changes.

## Files touched
- `src/pages/Blog.tsx`
