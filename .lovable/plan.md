## Goal

Restructure `/app/models` so the page is **about your models**, not about creating one. Creation moves to a dedicated wizard route.

## New IA

```text
/app/models           → My Brand Models (grid, list-first)
/app/models/new       → Create New Model (full-page single-scroll wizard)
```

## /app/models (grid view)

Page header:
- Title: `Brand Models` + count chip (`12 models`)
- Right side: primary button **`+ Create New Model`** → navigates to `/app/models/new`
- Below header: toolbar with search input, sort dropdown (Newest / Name / Most used), filter chips (All · Female · Male · Kids)

Grid:
- Responsive 2/3/4 columns
- **First tile** = dashed "+ New model" card (only shown when models exist; matches card height)
- **Model cards**: 3:4 portrait, name + meta chips (gender · age · ethnicity · morphology), hover reveals **`Use in Visual Studio →`** (links `/app/workflows?model=<id>`) and a `⋯` menu (Rename, Duplicate, Delete)
- Quiet timestamp footer

Empty state (zero models):
- Centered illustrated block: "No brand models yet"
- Subtitle: one short line about what a brand model is
- Primary CTA **`Create your first model`** → `/app/models/new`
- Secondary: `Try a starter preset` (prefills wizard via query params)

## /app/models/new (wizard page)

Single-scroll layout, centered max-width ~960px, two columns on desktop:

```text
┌─ Back to Brand Models                                       ┐
│                                                             │
│  ┌── FORM (single scroll, ~560px) ──┐  ┌── LIVE PREVIEW ──┐ │
│  │ Essentials                       │  │ Avatar tile      │ │
│  │   name, gender, age, ethnicity,  │  │ Name             │ │
│  │   morphology                     │  │ Summary chips    │ │
│  │                                  │  │ (sticky on scroll│ │
│  │ Appearance                       │  │  desktop only)   │ │
│  │   hair, eyes, skin, facial hair, │  │                  │ │
│  │   expression, signature          │  │                  │ │
│  │                                  │  │                  │ │
│  │ Reference (optional)             │  │                  │ │
│  │   image upload + toggle          │  │                  │ │
│  └──────────────────────────────────┘  └──────────────────┘ │
│                                                             │
│  ─── Sticky footer ───                                      │
│  20 credits · Balance 8,722       [ Cancel ] [ Generate ]   │
└─────────────────────────────────────────────────────────────┘
```

- Subtle section headers (small uppercase label + thin divider), no collapsibles — single scroll as requested
- Live preview card sticky on desktop (right column), inline above form on mobile
- Sticky generate footer at viewport bottom
- On success: navigate back to `/app/models` and highlight/scroll to the new card
- Cancel / back: returns to `/app/models` (warn if dirty)

## Files

- **`src/App.tsx`** — add lazy route `/models/new` → `BrandModelNew`
- **`src/pages/BrandModels.tsx`** — strip the create form, become grid-only (header, toolbar, dashed tile, empty state, upgraded `ModelCard`, variations `Dialog`)
- **`src/pages/BrandModelNew.tsx`** *(new)* — wizard page (form + live preview + sticky footer), reuses existing `generate-user-model` call
- **`src/components/app/brand-models/`** *(new folder)* — `LivePreviewCard.tsx`, `ModelCard.tsx`, `ModelsToolbar.tsx`, `EmptyState.tsx`, `StickyGenerateBar.tsx`
- **`src/components/app/AppShell.tsx`** — add `/app/models/new` to `prefetchMap`

## Out of scope

- No backend / DB / edge function changes
- No changes to credit logic or `generate-user-model`
- `Use in Visual Studio` only appends `?model=<id>` — wiring into workflows is a follow-up

## Behavior notes

- Starter preset CTA in empty state navigates to `/app/models/new?preset=sarah` (wizard reads query params to prefill)
- Search/sort/filter are client-side over `models` array
- Live preview avatar uses an HSL tint derived from ethnicity/skin choice
