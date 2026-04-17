

## Polish empty state on /app/library

### Observations from screenshot
1. Filter tabs (All / Favorites / Brand Ready / Ready to Publish) and the toolbar (Search / Filters / grid size / Select) are all rendered even with **zero images** — they're noise when there's nothing to filter, search, or select.
2. Empty illustration is a tiny generic sparkle icon — feels under-designed vs the rest of the app.
3. Copy "Create stunning visuals in Visual Studio or Freestyle Studio." is fine but generic; doesn't tell the user what Library actually is.
4. Two equally-weighted CTAs ("Open Visual Studio" outline + "Open Freestyle Studio" solid) — Freestyle being primary is arbitrary; Visual Studio is the main creation surface per memory (`Visual Studio = creation destination`).
5. Vertical centering: empty block sits roughly in the middle but the toolbar above it pushes it down, making it feel slightly off.

### Fix — `src/pages/Library.tsx` (or whichever file renders this view; will locate)

**A. Hide chrome when truly empty** (no items at all, no active search/filter):
- Hide filter tabs row
- Hide search + Filters + grid-size + Select toolbar
- Keep the page header (`Library` title + subtitle) — gives context

**B. Upgrade the empty card itself**:
- Replace tiny sparkle with a larger, softer icon group (e.g., `ImagePlus` in a 64px rounded-full muted circle, matching the products empty-state pattern)
- Headline: **"Your library is empty"** (`text-lg font-semibold`)
- Subtitle: **"Generated visuals land here, ready to review, favorite, and publish."** (one line, `text-sm text-muted-foreground`)
- CTA hierarchy:
  - Primary solid: **"Open Visual Studio"** (with `Sparkles` icon) — main path
  - Ghost/outline: **"Try Freestyle"** — secondary
- Reduce gap between CTAs and tighten vertical rhythm (`gap-3`, `mt-6`)

**C. Keep header subtitle short**:
- Current: "All your visuals, organized for review, selection, and publishing"
- New: **"All your generated visuals, in one place."**

**D. When user has filtered/searched but result is empty** (different state):
- Keep tabs + toolbar visible
- Show a separate, smaller "No matches" empty state with a "Clear filters" button (only if filters are actually active)

### Out of scope
- Populated grid, lightbox, status pills, backend, filter logic.

### Acceptance
- With zero items and no filters: only `Library` header + centered upgraded empty card visible. No tabs, no search, no Select button.
- Empty card has a clear visual icon, one-line subtitle, and a primary "Open Visual Studio" CTA with secondary "Try Freestyle".
- With items present: existing layout unchanged.
- With items + active search/filter returning empty: smaller "No matches" state shown, full toolbar still visible.

