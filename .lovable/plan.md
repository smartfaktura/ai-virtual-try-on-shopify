

## Goal
Strip `/app/learn` and the per-guide pages down to a clean, calm tutorial index. No recommendations, no progress UI, no hero blocks, no images. Just: title → list → read.

## Audit of current state

**`/app/learn` today has too much:**
- "Continue" row (last opened)
- "Recommended for you" gradient hero block with Sparkles icon
- Read progress chip + progress bar in header
- 5 filter chips + search with ⌘K kbd
- Per-section subtitle + guide count
- Read-state dots (○ / ● / ✓)
- Coming Soon section

**Per-guide page (`GuideLayout.tsx`) likely has** hero gradient/image area, badges, multiple section styles. Needs to match the new calm vibe.

## New `/app/learn` — minimal index

```text
Learn
Short guides for getting more out of VOVV.AI.

[ Search guides…                                    ]   ← quiet, optional

Getting started
─────────────────────────────────────────────────────
  Product Visuals                              2 min  ›
  Brand-ready product shots across 1000+ scenes.

  Freestyle Studio Basics                      3 min  ›
  Free-form prompts plus your image.

  Catalog Studio                               2 min  ›
  Bulk-generate catalog-ready visuals.

Visual Types
─────────────────────────────────────────────────────
  Virtual Try-On Set                           2 min  ›
  Garment on diverse AI models.
  …

Advanced
─────────────────────────────────────────────────────
  …
```

**What's removed:**
- ❌ Recommended hero block
- ❌ Continue row
- ❌ Progress chip + bar
- ❌ Read-state dots
- ❌ Filter chips (search alone is enough)
- ❌ Sparkles, gradients, kbd badge
- ❌ Coming Soon section
- ❌ Per-section guide counts and descriptions

**What stays (quiet & lightweight):**
- Page title + one-line subtitle (existing `PageHeader`)
- Single search input (no ⌘K chrome, no progress)
- Sections grouped by track, tiny uppercase header only
- Clean list rows: title (15px semibold) · tagline (13px muted, single line) · time (12px tabular) · chevron
- Hover: subtle bg tint. Focus: ring. Full-row button.

**Search behavior:** if no results → simple muted "No guides match" + Clear link. Empty query → show all sections.

## New per-guide page — matches hub vibe

Update `GuideLayout.tsx`:
- ❌ Remove any hero image / gradient / thumbnail area
- ❌ Remove decorative badges, shimmer treatments
- Keep: back link, title, one-line tagline, then the content sections (What it does, Best for, What you need, What you get, Quick start, Tips) as **plain typographic blocks** with tiny uppercase section labels — same restraint as the hub
- Keep CTAs at bottom (primary "Start now" + secondary)
- Time chip stays as a single muted line below title

## Behind the scenes (kept, invisible)
- `useLearnRead` hook stays wired so `markRead` still fires on guide open (future-proof) — just no UI surfaces it
- `learnContent.ts` metadata (`tracks`, `level`, `readMin`) stays — drives grouping & time
- `level` is no longer rendered (kept in data only)

## Files touched
- `src/pages/Learn.tsx` — heavy simplification rewrite
- `src/components/app/learn/GuideLayout.tsx` — strip hero, flatten visual hierarchy
- `src/pages/LearnGuide.tsx` — remove any hero-related props if present
- No changes to: `useLearnRead.ts`, `learnContent.ts`, routes, sidebar entry

## QA pass
- Spacing: consistent 24px between sections, 12px row padding-y
- Typography: 3 sizes max on hub (24 title, 15 row title, 13 supporting)
- Mobile: rows stack cleanly at 375px, search full-width, no horizontal overflow
- Hover/focus: subtle bg + ring, no transform tricks beyond chevron 2px slide
- Active sidebar state for `/app/learn/*` verified

## Acceptance
- Hub renders title, optional search, and grouped lists — nothing else
- Zero "recommended", "continue", or progress UI
- Per-guide page has no hero image and matches hub's typographic restraint
- Reads top-to-bottom in one calm scan
- Adding a guide is still one append in `learnContent.ts`

