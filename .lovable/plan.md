# Fix `/blog` Mobile Layout

The Blog page has several mobile issues causing a poor experience on small viewports (≤440px):

## Issues Identified

1. **Featured card text overlaps the "Featured" badge** — the badge uses `absolute top-4 right-4`, but on mobile the meta row (category + date + read time) wraps and collides with it. Date is rendered in long form ("November 14, 2025") which forces ugly wrapping next to the badge.
2. **Featured card padding too large on mobile** — `p-8` (32px) eats into a 440px viewport, leaving little room for content.
3. **Featured image aspect ratio `2.2/1` is too tall-content / too wide** — fine on desktop, but combined with the heavy padded text block below, the card feels enormous on phones.
4. **Card body padding `p-6 sm:p-7` is too dense** on small screens for the post grid.
5. **Section vertical padding `py-20`** (80px top + 80px bottom) is excessive on mobile, pushing content down unnecessarily.
6. **Category filter row** wraps into 3-4 lines on mobile (cramped). Should scroll horizontally on mobile instead, like a chip row.
7. **Mid-page CTA padding `p-8`** also too large on mobile; heading wraps awkwardly.
8. **H1 size `text-4xl`** (36px) is OK but `mb-12` spacing under header is too large on mobile.

## Fix Plan — single file: `src/pages/Blog.tsx`

### 1. Section + container
- `py-20 sm:py-28` → `py-12 sm:py-20 lg:py-28`
- Header `mb-12` → `mb-8 sm:mb-12`

### 2. Header
- H1: `text-4xl sm:text-5xl` → `text-3xl sm:text-4xl lg:text-5xl`
- Subtitle: `text-lg` → `text-base sm:text-lg`, add `px-2` for safety

### 3. Category filters — horizontal scroll on mobile
Replace `flex flex-wrap justify-center gap-2 mb-12` with a horizontally scrollable strip on mobile, centered wrap on `sm+`:
```
<div className="-mx-4 px-4 sm:mx-0 sm:px-0 mb-8 sm:mb-12 overflow-x-auto sm:overflow-visible">
  <div className="flex sm:flex-wrap sm:justify-center gap-2 w-max sm:w-auto">
    ...buttons with `whitespace-nowrap shrink-0`
  </div>
</div>
```
Add `scrollbar-hide` style or `[&::-webkit-scrollbar]:hidden` utility.

### 4. Featured card
- Move "Featured" badge from absolute-positioned overlay to **inline at the top of the meta row** (or overlay on the image instead of the text block) — fixes overlap.
- Wrapper: `mb-10` → `mb-8 sm:mb-10`
- Inner padding: `p-8 sm:p-10` → `p-5 sm:p-8 lg:p-10`
- Image aspect: `aspect-[2.2/1]` → `aspect-[16/10] sm:aspect-[2.2/1]` (taller/squarer on mobile reads better)
- Move "Featured" badge to overlay the image top-right (`absolute top-3 right-3` on the image container) so it never collides with body text.
- Date format: switch to short form on mobile (`Nov 14, 2025`) — use `month: 'short'`.
- H2: `text-2xl sm:text-3xl` → `text-xl sm:text-2xl lg:text-3xl`
- Excerpt: keep `text-sm`, add `line-clamp-3` to prevent overflow.

### 5. Post grid cards
- Grid gap `gap-5` → `gap-4 sm:gap-5`
- Card body padding `p-6 sm:p-7` → `p-4 sm:p-6`
- H2: `text-lg` → `text-base sm:text-lg`
- Meta row gap `gap-3` → `gap-2 sm:gap-3` (tighter)

### 6. Mid-page CTA
- Wrapper margin `mt-14` → `mt-10 sm:mt-14`
- Padding `p-8 sm:p-10` → `p-6 sm:p-8 lg:p-10`
- Heading: `text-xl sm:text-2xl` keep, but add `px-2` to allow breathing room.
- Button: add `w-full sm:w-auto` so it fills nicely on mobile.

## Out of Scope
- No content/data changes to `blogPosts`.
- No changes to `BlogPost.tsx` (individual article page) — only the `/blog` index. If user later reports the article page also has issues, address separately.
- No changes to `LandingNav` / `LandingFooter` / `PageLayout`.

## Files Edited
- `src/pages/Blog.tsx` (only file touched)
