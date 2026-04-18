

## Goal
Restyle the "Share to Explore" and "Tag Us, Win a Free Year" cards in `LibraryDetailModal.tsx` to match the visual hierarchy of the "HELP US IMPROVE" feedback card directly above them.

## Pattern to mirror (from ContextualFeedbackCard)
```
[icon]  [UPPERCASE BADGE LABEL]
Body sentence as text-sm text-muted-foreground
[action button]
```

- Header row: `MessageSquarePlus`-style icon + small `Badge variant="secondary"` with classes `text-[10px] px-1.5 py-0 font-semibold uppercase tracking-wider`
- The current bold title becomes the **badge label** (uppercased)
- The current subtitle/description becomes the **body text** styled as `text-sm text-muted-foreground` (same as "How was this result?")
- Buttons unchanged (already match — outline pill)

## Changes to `src/components/app/LibraryDetailModal.tsx` (lines 405-452)

**Card 1 — Share to Explore**
- Header badge: `SHARE TO EXPLORE` (Trophy icon kept, tinted to match — `text-primary` ok)
- Body (text-sm muted): `Submit your best work · Win up to 10,000 credits`
- Button unchanged

**Card 2 — Tag Us, Win a Free Year**
- Header badge: `TAG US · WIN A FREE YEAR` (AtSign icon kept)
- Body (text-sm muted): existing sentence with @vovv.ai / #vovvai links — switch from `text-xs` to `text-sm`, keep underlined links
- Button unchanged

Also add a top dismiss `X` button? **No** — out of scope; only typography/header treatment changes.

## Files touched
- `src/components/app/LibraryDetailModal.tsx` (only the two card blocks at lines ~405-452)

## Out of scope
- Card spacing, button styles, icons themselves, copy rewording, consolidation into one card.

