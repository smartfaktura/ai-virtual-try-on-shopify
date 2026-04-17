

## Goal
Rebuild `/app/learn` as a **premium, image-independent, list-style tutorial hub** organized around real VOVV.AI user intent — not a card gallery.

## Why a list, not cards
We have no proprietary tutorial artwork. Image-heavy cards = weak visuals + slow scanning. A clean row layout reads faster, scales better, and feels closer to Linear/Notion/Apple Developer docs — which matches our "luxury restraint" memory.

## New IA — organized by user journey, not by section

Replace the current "Visual Studio · Freestyle Studio" split with **5 intent-based tracks**. The same 11 guides get re-tagged via metadata; no content rewriting needed.

| Track | Purpose | Example items |
|---|---|---|
| **Start here** | First-run essentials — pick one and go | Product Visuals, Freestyle Basics, Catalog Studio |
| **Visual Types** | Reference for every workflow | Try-On, Selfie/UGC, Flat Lay, Mirror Selfie, Staging, Perspectives |
| **Improve output quality** | Prompting, refs, brand profiles | Freestyle prompting tips (extracted), Product Visuals best practices |
| **Advanced & bulk** | Power flows | Catalog Studio bulk, Picture Perspectives, Image Upscaling |
| **Coming soon** | Greyed teasers | Video, Brand Models, Brand Profiles |

Each guide gets two new optional metadata fields in `learnContent.ts`:
- `tracks: LearnTrack[]` (a guide can appear in 1–2 tracks, e.g. Product Visuals = Start here + Visual Types)
- `level: 'foundational' | 'core' | 'advanced'`
- `estimatedMin` already exists as `readMin`

## Page layout — list-first, premium

```text
┌──────────────────────────────────────────────────────────────────┐
│  Learn                                       3 of 11 read · ▱▰▱  │
│  Short, action-oriented guides for getting more out of VOVV.AI   │
│                                                                  │
│  [ Search guides …                                          ⌘K ] │
│                                                                  │
│  [ All ] [ Start here ] [ Visual Types ] [ Quality ] [ Advanced ]│
└──────────────────────────────────────────────────────────────────┘

┌─ Recommended for you ────────────────────────────────────────────┐
│  ▶  Product Visuals                              · 2 min  ›      │
│     Brand-ready shots across 1000+ scenes                        │
└──────────────────────────────────────────────────────────────────┘

START HERE                                              3 guides
─────────────────────────────────────────────────────────────────
●  Product Visuals                                      2 min  ›
   Brand-ready product shots across 1000+ scenes — fully
   art-directed.                                  Foundational

✓  Freestyle Studio Basics                              3 min  ›
   Free-form prompts + your image. Maximum creative control.
                                                      Core

○  Catalog Studio (Bulk)                                2 min  ›
   Bulk-generate catalog-ready visuals in one run.   Advanced

VISUAL TYPES                                            6 guides
─────────────────────────────────────────────────────────────────
○  Virtual Try-On Set                                   2 min  ›
○  Selfie / UGC Set                                     2 min  ›
○  Flat Lay Set                                         2 min  ›
…
```

**Row anatomy** (replaces all current cards):
- Left: read-state dot (`○` unread, `●` recommended next, `✓` read)
- Title (semibold, 15px)
- Tagline (muted, 13px, single-line truncate with full text on hover via `title=`)
- Right rail: time chip · level chip · chevron
- Hover: subtle bg tint (`bg-accent/40`), chevron slides 2px right
- Full row clickable, keyboard `Enter`/`Space`, focus ring matching design system

## Key UX behaviors

1. **"Recommended for you" hero row** — a single-row featured block at top. Logic: first unread guide in user's currently-recommended track. Default = Product Visuals.
2. **Filter chips** drive instant client-side filtering by track. "All" = default.
3. **Search** — fuzzy match on title + tagline + tracks. Empty state: friendly "No guides match X · Clear search" reset.
4. **Read progress** — reuses the `useLearnRead` hook from previous polish plan (or creates it: `localStorage` keyed `learn:read:{section}/{slug}`). Shows ✓ on rows + "X of N read" with thin progress bar in header.
5. **Continue learning** — tiny optional row above tracks if user has any read item: "Last opened: Freestyle Basics → Open again."
6. **Coming soon** — collapsed disabled rows at bottom (Video, Brand Models, Brand Profiles).

## Polish + audit fixes

- **Typography**: 2 sizes only on this page (24px page title, 15px row title, 13px supporting). No icon clutter.
- **Spacing**: 12px row padding-y, 16px between sections. Section headers tiny uppercase like sidebar (matches `mem://ui/sidebar-and-navigation`).
- **Mobile (<768px)**: filter chips become horizontal scroll, rows stack tagline below title, time/level chips collapse to time only.
- **A11y**: rows are `<button>` with `aria-label`, focus ring uses `ring-ring`, chevron has `aria-hidden`.
- **Active sidebar state**: confirm `Tutorials` highlights when on any `/app/learn/*` route (audit + fix if needed).
- **Loading state**: list is static config — no skeleton needed, just fade-in.
- **Empty search state**: centered muted copy + reset button, no illustration noise.
- **Broken link audit**: verify every `cta.route` resolves (visual scan against `App.tsx`).

## Files touched

- `src/data/learnContent.ts` — add `tracks` + `level` metadata to every guide, add `LEARN_TRACKS` array + helpers (`getGuidesByTrack`, `getRecommendedGuide`)
- `src/pages/Learn.tsx` — full rewrite: header + search + chips + list sections + recommended row
- `src/pages/Learn.tsx` companion: small `LearnRow` subcomponent (kept in same file — < 60 lines)
- New: `src/hooks/useLearnRead.ts` — `localStorage`-backed read tracker (`isRead`, `markRead`, `readCount`)
- `src/components/app/learn/GuideLayout.tsx` — minor: call `markRead` on mount so progress updates when a guide is opened
- No DB changes. No new deps. No image work.

## Out of scope
- Per-guide page redesign (already polished)
- Video / Brand Models guides (Phase 4)
- Server-backed analytics or "recently viewed" history beyond last-opened in `localStorage`

## Acceptance
- `/app/learn` shows zero hero images, no thumbnails, no card grid
- Header has search + 5 filter chips + "X of N read" progress
- Guides render as scannable rows grouped under tiny uppercase track headers
- "Recommended for you" surfaces first unread item
- Rows show ✓ once read; `localStorage` persists across reloads
- Sidebar "Tutorials" stays active on all `/app/learn/*` routes
- Clean at 375px mobile, full keyboard navigation, proper focus rings
- Adding a new guide = one object append + tagging it with track(s) — no layout changes

