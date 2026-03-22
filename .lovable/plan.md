

# Match /app/discover with /discover styling + scroll hint

## Problem
1. `/app/discover` has different header text ("Browse curated prompts and styles for inspiration") vs `/discover` ("Every image here was created by AI. Yours can be next.")
2. `/app/discover` header is left-aligned with smaller text, while `/discover` is centered with larger text
3. No visual hint that the category bar is scrollable on desktop

## Changes

### 1. `src/pages/Discover.tsx` — Match header style with PublicDiscover

**Lines 420-430**: Update header to match `/discover` page style:
- Center-align the header block
- Use same text sizing: `text-4xl sm:text-5xl` for title
- Change subtitle to "Every image here was created by AI. Yours can be next." with `text-lg`
- Keep admin pending badge

### 2. `src/pages/Discover.tsx` + `src/pages/PublicDiscover.tsx` — Add scroll affordance

Add a subtle right-side arrow/gradient indicator to make scrollability obvious on desktop. The `fade-scroll` CSS already fades the right edge — but it's too subtle. Add a small animated scroll hint:

- On the category container, add `relative` wrapper
- After the scroll row, add a tiny pulsing `→` icon on the right edge (only visible when content overflows), using CSS `sticky` positioning at the right
- OR simpler: just add `cursor-grab` on the scroll container so users know to drag

**Simpler approach**: Add `scroll-smooth` and slightly widen the right fade (48px instead of 32px) to make the cut-off more obvious. Also add `cursor-grab active:cursor-grabbing` for desktop drag hint.

### 3. `src/index.css` — Widen right fade

Update `.fade-scroll` mask from 32px to 48px for a more noticeable fade hint.

### Summary
- 3 files, small edits
- `/app/discover` header matches `/discover` visually
- Scroll affordance improved with wider fade + grab cursor

