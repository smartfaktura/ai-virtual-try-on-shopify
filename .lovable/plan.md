

## Polish: Share Request button + mobile workflow cards + tighter header gap

### 1. Share Request button — match "Start Creating" vibe

Currently `variant="outline" size="sm" h-8 text-xs` with subtle border — feels different from the dark pill CTAs everywhere else.

**File:** `src/components/app/WorkflowRequestBanner.tsx` (line 79-87)

Change to match the standard primary pill used by all other workflow CTAs:
- Drop `variant="outline"`, use default (filled primary).
- `h-8 text-xs px-5` → `h-10 px-5 text-sm`
- Keep `rounded-full font-semibold gap-1.5`
- Icon `w-3.5 h-3.5` → `w-4 h-4`

### 2. Mobile workflow cards — too small titles & buttons

Looking at the mobile screenshot: in 2-col mobile mode, titles are `text-[11px]`, buttons are `h-8 px-3 text-xs` saying "Start" — visibly too small/weak compared to the strong imagery above and feels off-brand.

**File:** `src/components/app/WorkflowCardCompact.tsx`

Mobile compact (2-col) variant — bump to comfortable touch scale:
- Content padding: `p-2` → `p-3`
- Title: `text-[11px]` → `text-sm font-bold` (line 143)
- Button: `h-8 px-3 text-xs` → `h-9 px-4 text-xs` (line 163) — keep "Start" label since space is tight
- Gap: `gap-1.5` stays

**File:** `src/components/app/FreestylePromptCard.tsx`

Same treatment for mobile compact:
- Content padding `p-2` → `p-3` (line 219)
- Title `text-[11px]` → `text-sm font-bold` (line 222)
- Button `h-8 px-3 text-xs` → `h-9 px-4 text-xs` (line 238)

### 3. Tighten gap between PageHeader subtitle and first content

Currently `PageHeader` outer wrapper is `space-y-12 sm:space-y-16` — that's the gap between the header block (h1 + subtitle) and the first child section. Screenshot shows this gap is way too large (basically a blank screen full of empty space below "realistic brand visuals" subtitle).

**File:** `src/components/app/PageHeader.tsx` (line 14)

- Outer wrapper: `space-y-12 sm:space-y-16` → `space-y-8 sm:space-y-10`

This keeps generous breathing room but kills the excessive empty band. Section-to-section spacing inside children (like Activity → Catalog → Recent on workflows page) is controlled separately by the parent `space-y-*` on `<PageHeader>`'s child wrappers — so we adjust ONLY the header→first-section gap by reducing the wrapper.

Wait — same wrapper controls both. To truly fix only the header→first gap without shrinking section-to-section gaps, switch approach:
- Remove `space-y-*` from outer wrapper.
- Add `mb-8 sm:mb-10` to the inner header block (line 15 `<div>`).
- Wrap `{children}` in a `<div className="space-y-12 sm:space-y-16">` so sibling sections still get the larger breathing room.

This way: header→first section = ~32-40px (tight, reads as one block), section→section = 48-64px (generous rhythm).

### Acceptance
- Share Request button looks like the same family as "Start Creating" buttons (filled primary pill, h-10).
- Mobile 2-col workflow cards have readable titles (`text-sm`) and proper-sized buttons (`h-9`).
- Gap below the page subtitle to the first content (Activity card or grid) is noticeably tighter; section-to-section spacing further down is unchanged.

