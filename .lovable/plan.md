

## Make PageHeader spacing match dashboard rhythm

### Root cause
Dashboard (`/app`) uses tight spacing between section heading + subtitle and the content right below it (~16px = `mt-4` / `space-y-4`). Sub-pages like `/app/discover`, `/app/workflows`, etc. use `PageHeader` which has `mb-8 sm:mb-10` (32-40px) between the title block and `{children}` — that's the "too big" gap the user keeps seeing.

### Single source of truth fix

**File:** `src/components/app/PageHeader.tsx`
- Line 18: `mb-8 sm:mb-10` → `mb-4 sm:mb-6` (matches dashboard's `space-y-4` to `space-y-6` rhythm between heading→content).
- Subtitle margin already `mt-1.5` ✓ (matches dashboard).

That's it — one class change cascades to ALL pages using `PageHeader`: `/app/discover`, `/app/workflows`, `/app/library`, `/app/products`, `/app/brand-profiles`, `/app/learn`, etc.

### Verification before approval
Confirmed dashboard pattern: `<section className="space-y-4">` with heading (`text-2xl sm:text-3xl font-bold`) directly above content. PageHeader's title is the same scale, so reducing the wrapper margin to `mb-4 sm:mb-6` produces visually identical rhythm.

Section-to-section spacing inside pages stays untouched (still `space-y-12 sm:space-y-16` on the children wrapper) — only the header→first-section gap tightens.

### Acceptance
- `/app/discover` ("Explore" + "Every result here was created by AI...") gap to first content matches `/app` dashboard's "Your Products, In Motion" → video grid gap.
- Same applies to `/app/workflows`, `/app/library`, `/app/products`, `/app/brand-profiles`, `/app/learn`, and every other PageHeader consumer.
- Section-to-section gaps further down the page are unchanged.

