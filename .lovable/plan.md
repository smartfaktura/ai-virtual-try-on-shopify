## Goal
Make `/blog` resilient when data is missing or filters return nothing — no broken/blank layout, no missing-image holes, and a clear error fallback.

## Scope
Single file: `src/pages/Blog.tsx`. No new pages, no data changes.

## Failure cases to cover

1. **No posts at all** (`blogPosts` empty) — currently renders just a header and an empty grid (looks broken).
2. **Active category yields zero posts** — currently shows the filter row then nothing below it.
3. **Featured/grid post missing `coverImage`** — currently the image block is skipped entirely, leaving an awkward text-only card. Need a branded fallback.
4. **Render error inside the list** (bad date, missing field) — currently crashes the whole page. Wrap in an ErrorBoundary fallback so the rest of the page still renders.

## Changes

### 1. Empty state component (in-file)
Add a small `BlogEmptyState` block used in two situations:
- No posts in the data file → "We're working on new stories" + CTA back to `/` and "Try VOVV.AI free".
- Filtered category has zero results → "No posts in {category} yet" + a "Show all posts" button that calls `setActiveCategory(null)`.

Visual: centered card matching the existing rounded-2xl/border-border aesthetic, uses `Sparkles` icon (already imported), `py-16 sm:py-20`, mobile-friendly full-width CTA.

### 2. Cover image fallback
Extract a tiny `<CoverFallback />` rendered when `post.coverImage` is missing — a gradient block (`bg-gradient-to-br from-primary/15 via-accent/40 to-card`) with the post category badge centered and a faint Sparkles glyph. Used by both featured card and grid cards so cards stay uniform height.

### 3. Safe date formatting
Wrap `new Date(post.publishDate).toLocaleDateString(...)` in a helper `formatDate(iso)` that returns `''` (and hides the date row) if the date is invalid, instead of rendering "Invalid Date".

### 4. ErrorBoundary fallback
Wrap the featured card and the grid in the existing `src/components/ErrorBoundary.tsx`. Fallback UI: the same friendly empty-state card with a "Reload page" button. Keeps header + category chips + CTA visible even if a post throws.

### 5. Conditional rendering flow
```text
if (sorted.length === 0)           → BlogEmptyState (no data variant)
else if (filtered.length === 0)    → keep filters, show BlogEmptyState (no results variant)
else                               → featured + grid (each wrapped in ErrorBoundary)
```

## Out of scope
- No changes to `blogPosts` data, routes, or `BlogPost.tsx`.
- No new dependencies.
- No layout/styling changes to working states from the previous mobile-fix pass.

## Files
- Edit: `src/pages/Blog.tsx`
