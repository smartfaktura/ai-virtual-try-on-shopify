

# Improve Mobile Layout for Category Tabs & Summary Strip

## Problems
1. **Category tabs** are horizontally scrollable cards with thumbnails + text — too wide on mobile, hard to scan
2. **Summary strip** ("Bags & Accessories → 2 shots · accessories → needs shots · Earrings → needs shots · Jeans → needs shots") gets very long with many categories — too much text, wraps awkwardly on mobile
3. User explicitly said: no carousels

## Solution

### Category Tabs — Stack Vertically on Mobile
- On mobile (`< sm`): render tabs as a **vertical stack** of compact rows instead of horizontal scroll
- Each row: thumbnails (smaller, 24px) + short label + shot count badge or "Select →" indicator
- On desktop (`sm+`): keep current horizontal layout but use `flex-wrap` instead of `overflow-x-auto` so all tabs are visible without scrolling

### Summary Strip — Replace with Compact Dot Indicators
- Remove the verbose text summary strip entirely
- Replace with a **compact inline status row**: each category shown as a small colored dot/chip
  - Green dot + count = has shots
  - Red dot = needs shots
  - Clicking a dot switches to that category tab
- On mobile this takes one line max; on desktop it's a subtle secondary indicator

### File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

**Tab container (line 795):**
- Change from `flex gap-2 overflow-x-auto` to `flex flex-col sm:flex-row sm:flex-wrap gap-2`
- Mobile tabs: full-width rows, more compact padding (`px-3 py-2`)
- Desktop tabs: keep current sizing with `flex-wrap`

**Tab content (lines 803-838):**
- Mobile: hide "X products" subtext, show only label + badge/indicator
- Thumbnails: `w-6 h-6` on mobile, `w-7 h-7` on desktop

**Summary strip (lines 843-860):**
- Replace verbose text with compact chips: `<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-[10px]">Bags ✓ 2</span>` or `<span className="... bg-destructive/10 text-destructive">Earrings 0</span>`
- "Apply to all" button stays, moves to its own row on mobile
- Each chip is clickable to switch category

### Changes Summary
| Area | Before | After |
|------|--------|-------|
| Tabs on mobile | Horizontal scroll, large cards | Vertical stack, compact rows |
| Tabs on desktop | Horizontal scroll | Flex-wrap, no scroll |
| Summary strip | "Label → N shots" repeated text | Small clickable status chips |
| "Apply to all" | Inline with summary | Own row on mobile |

Single file change: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

