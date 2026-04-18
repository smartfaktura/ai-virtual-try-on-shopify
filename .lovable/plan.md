

## Fix Library page spacing rhythm

### Root cause
`PageHeader` applies `space-y-12 sm:space-y-16` (48–64px) between its **direct** children. Library currently passes 4–5 direct children (smart views, search/filters row, grid content, FeedbackBanner), so every block is separated by 64px — producing the "huge gaps" the user sees.

Reference pages (`Discover`, `Workflows`) group related controls inside `<section className="space-y-4">` wrappers so tightly-related rows sit close together; only major sections get the big PageHeader gap.

### Changes — `src/pages/Jobs.tsx` (Library)

Wrap the browser UI (smart views + search/filters row + grid content + Load More) into a **single `<section className="space-y-4 sm:space-y-6">`** block. This:
- Collapses the gap between smart views ↔ search/filters row to ~16–24px
- Collapses the gap between search/filters row ↔ grid to ~16–24px
- Keeps a single, clean ~64px gap before `FeedbackBanner` (which remains its own child)

Concretely:
1. Open one `<section className="space-y-4 sm:space-y-6">` right after `<PageHeader …>`.
2. Move inside it: Smart Views block, Incoming banner block, Search+Filters+Columns+Select block, and the Content block (skeleton / empty / grid + Load More).
3. Close the section before `{selectMode && …}` floating action bar (which is `fixed`-positioned, so placement doesn't affect layout).
4. Leave `FeedbackBanner` as a direct PageHeader child so it gets the standard major-section gap (matching Discover/Workflows rhythm).
5. Empty-state branches: drop the `py-8` wrappers around `EmptyStateCard` (they add extra vertical padding on top of the section gap).

### Acceptance
- Smart-view tabs sit close above the search row (~16–24px).
- Search row sits close above the grid (~16–24px).
- The "Help us improve VOVV.AI" feedback banner has the same standard breathing room used on Discover/Workflows (single PageHeader gap, not double).
- Mobile and desktop both feel rhythmically consistent with `/app/discover` and `/app/workflows`.

