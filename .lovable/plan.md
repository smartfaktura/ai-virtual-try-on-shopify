

## Hide feedback bar on empty Library + tighten subtitle→buttons spacing

### Change 1 — Hide `<FeedbackBanner />` when Library is empty
**File:** `src/pages/Jobs.tsx` (line 730)

The feedback banner currently always renders at the bottom. Wrap it so it only shows when there's content (or an active search), matching the same condition that hides tabs/toolbar.

```tsx
{!isEmpty && <FeedbackBanner />}
```
(I'll use whatever variable already drives the empty-state branch around line 543 — likely `allItems.length === 0` — to stay consistent.)

### Change 2 — Spacing between subtitle and CTA buttons
**File:** `src/components/app/EmptyStateCard.tsx` (default variant, lines ~96-118)

Current: `CardContent` uses `space-y-4` (16px) between the heading/description block and the action buttons. With a two-line description + two pill buttons, the buttons sit slightly close — they read as part of the text block rather than a distinct call-to-action.

Proposal: add a small extra top margin on the actions row only when the default empty card is shown.

```tsx
<div className="flex items-center gap-3 pt-2">
```
Net effect: ~24px breathing room between description and buttons (16 + 8). Subtle, keeps the card compact but lets the CTAs feel like their own beat.

I won't touch the `teamMember` variant (it already has `pt-1`, intentionally tight).

### UX assessment of current state (per your ask)
- White card: 👍 keeps consistency with surrounding cards, calm feel
- Icon (ImagePlus): reads OK in this context
- Heading + subtitle pairing: clear and on-brand
- Subtitle → buttons gap: only thing that feels slightly off — fix above addresses it
- Two CTAs with correct hierarchy: ✅
- Once feedback bar is hidden, the page becomes one focused moment — that's the right call for empty

### Acceptance
- Empty Library (zero items, no search): no FeedbackBanner; CTAs have a touch more air above them
- Library with items: FeedbackBanner still renders at the bottom as today
- "No results" search empty state: spacing change applies there too (it uses the same component) — that's fine
- No layout shift, no regressions on the `teamMember` variant used elsewhere

