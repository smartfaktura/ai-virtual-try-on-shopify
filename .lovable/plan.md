

## Goal
Refine `/app/learn` from "flat list" to "modern minimal learning hub" — keeping the calm, tutorial-first nature but adding the typographic polish, rhythm, and quiet depth expected of a premium SaaS product surface (Linear / Raycast / Stripe vibe).

## Audit — what's making it feel dated

Looking at current `Learn.tsx` and `GuideLayout.tsx`:
- Rows sit on raw top/bottom borders (`border-t border-b border-border/40`) — reads as a `<table>`, not a designed surface
- Page header reuses the generic `PageHeader` — same density as every other admin page, no editorial breathing room
- Section labels (10px uppercase) are correct but float without anchoring — no visual relationship to their rows
- Search input is a stock `Input` with default 10px radius — feels form-like, not search-like
- Row internals are vertically tight (`py-3`) and use single weight hierarchy — title and tagline blur together
- No consistent container width — page stretches across the full content area, weakening the editorial feel
- Per-guide page has the same flat rhythm: section after section with hairline rules, no anchoring surface

## New design direction

**One organizing idea:** group each track into a soft surface "panel" that anchors its rows, so the page reads as a few designed blocks instead of one long list. Inside each panel, rows stay minimal — just better breathing room, a more deliberate hover, and refined typography.

### Page composition

```text
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   Learn                                                          │
│   Short, focused guides for getting more out of VOVV.AI.         │
│                                                                  │
│   ⌕  Search guides                                          ⌘K   │   ← softer, pill-ish, muted bg
│                                                                  │
│  ─────────────────────────────────────────────────────────────   │
│                                                                  │
│   GETTING STARTED                                       3 guides │   ← tiny meta on right, muted
│   ┌────────────────────────────────────────────────────────────┐ │
│   │  Product Visuals                                  2 min  › │ │
│   │  Brand-ready product shots across 1000+ scenes.            │ │
│   │ ·········································                  │ │   ← hairline divider inside panel
│   │  Freestyle Studio Basics                          3 min  › │ │
│   │  Free-form prompts plus your image.                        │ │
│   │ ·········································                  │ │
│   │  Catalog Studio                                   2 min  › │ │
│   │  Bulk-generate catalog-ready visuals.                      │ │
│   └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│   VISUAL TYPES                                          6 guides │
│   ┌────────────────────────────────────────────────────────────┐ │
│   │  …                                                         │ │
│   └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Specific refinements

**Container & rhythm**
- Centered max-width `max-w-3xl` for editorial feel (instead of full-bleed)
- Generous top spacing (`pt-2 pb-24`), `space-y-12` between major regions

**Header (custom, not `PageHeader`)**
- Title: `text-3xl md:text-4xl font-semibold tracking-tight` (more presence)
- Subtitle: `text-base text-muted-foreground` with `max-w-xl`
- Drop generic `PageHeader` here — this page deserves its own quiet hero

**Search**
- Larger (`h-11`), `rounded-full` or `rounded-xl`, `bg-muted/40` no border, focus ring subtle
- Icon `text-muted-foreground/60`
- Tiny `⌘K` kbd hint right-aligned (visual cue only, no shortcut needed for v1) — or skip entirely if it adds noise. Lean: **skip** to honor "no clutter."

**Track sections**
- Section header row: tiny uppercase label left + muted `N guides` right, with `mb-3`
- Wrap rows in a panel: `rounded-xl border border-border/50 bg-card/40 backdrop-blur-[1px] divide-y divide-border/40 overflow-hidden`
- Panel = the "quiet depth." Replaces raw top/bottom hairlines.

**Rows (the key win)**
- `py-4 px-5` (taller, more deliberate)
- Title: `text-[15px] font-medium tracking-tight` (medium not semibold — calmer)
- Tagline: `text-[13px] text-muted-foreground` truncate, `mt-1`
- Right rail: `text-[12px] text-muted-foreground tabular-nums` time + chevron `text-muted-foreground/40` → `text-foreground/60` on hover
- Hover: `bg-accent/30` (subtler than current `accent/40`), chevron translates `2px`, no other movement
- Focus-visible: `ring-1 ring-ring/40 ring-offset-0` inset — stays inside panel
- First/last rows get rounded corners via `overflow-hidden` on parent

**Empty search state**
- Centered, more breathing room (`py-20`), single muted line + ghost "Clear" button

### Per-guide page (`GuideLayout.tsx`) — match the hub

Keep current structure but apply the same refinements:
- Same `max-w-2xl` centered container ✓ (already)
- Title: bump to `text-3xl md:text-4xl font-semibold tracking-tight`
- Tagline: `text-lg text-muted-foreground` for editorial weight
- Read-time: keep as a single muted line, but move to a small chip-style pill (`inline-flex px-2.5 py-1 rounded-full bg-muted text-[12px]`) for a touch of polish
- Section component: add a subtle anchor — keep the tiny uppercase label, but wrap content blocks in slightly looser spacing (`pt-8 mt-8` instead of `pt-6 mt-6`)
- Replace hairline `border-t` between sections with more breathing room only — let typography rhythm carry the structure (more modern than rules everywhere)
- CTA section: pill-rounded buttons stay, but separate with `mt-16 pt-10` (no border), with optional subtle muted helper text above ("Ready to try it?")

### What we deliberately do NOT add
- ❌ Icons on rows or section headers
- ❌ Thumbnails / hero images
- ❌ Progress bars, read dots, badges
- ❌ Recommendation blocks
- ❌ Filter chips
- ❌ Multiple section variants — one panel pattern, used consistently

## Files touched
- `src/pages/Learn.tsx` — drop `PageHeader`, custom hero header, refined search, panel-wrapped track sections, refined `LearnRow`
- `src/components/app/learn/GuideLayout.tsx` — typographic upgrade, replace section borders with rhythm, polish CTAs

No changes to: `learnContent.ts`, `useLearnRead.ts`, routing, sidebar.

## Acceptance
- Page reads as 2–3 designed panels, not one long list
- Centered editorial width, generous vertical rhythm
- Rows feel taller, calmer, with a clear but quiet hover
- Section headers anchor their panels visually
- Per-guide page typography matches hub presence
- Still zero icons / thumbnails / progress UI
- Clean at 1276px desktop and 375px mobile

