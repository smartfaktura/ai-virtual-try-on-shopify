

# Refine Step — Scene-Centric UX Redesign

## Core Concept

Flip the mental model from "abstract setting categories" to **"here are YOUR scenes — we auto-tuned them, but you can override anything."**

The user's flow becomes:
1. See their selected scenes as visual cards with auto-applied smart defaults
2. See an info banner if any scene needs a model (actionable — "select model" button right there)
3. Optionally tap into any scene card to tweak its specific settings
4. Optionally expand "Global style" to change defaults that cascade to all scenes
5. Pick format (ratio/count/quality) last — the technical output step
6. Add a custom note if needed

## New Layout (top to bottom)

```text
┌─────────────────────────────────────────────┐
│ "Refine your shoot"                         │
│  Smart defaults applied. Tap a scene to     │
│  fine-tune, or jump straight to Review.     │
└─────────────────────────────────────────────┘

┌─ INFO BANNER (conditional) ────────────────┐
│ ⚠ "Front View" and "In-Hand Studio" need   │
│   a model. [Select Model ▸]                │
└────────────────────────────────────────────┘

┌─ YOUR SCENES ──────────────────────────────┐
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│ │thumb │ │thumb │ │thumb │ │thumb │       │
│ │Clean │ │Edit. │ │Front │ │In-   │       │
│ │Studio│ │Surf. │ │View* │ │Hand* │       │
│ │ ✓ OK │ │ ✓ OK │ │⚠model│ │⚠model│       │
│ └──┬───┘ └──────┘ └──┬───┘ └──────┘       │
│    │                  │                     │
│    ▼ (tap to expand inline settings)       │
│  ┌─────────────────────────────────┐       │
│  │ Background & Composition        │       │
│  │ [chip] [chip] [chip]            │       │
│  │ Visual Direction                │       │
│  │ [chip] [chip] [chip]            │       │
│  └─────────────────────────────────┘       │
└────────────────────────────────────────────┘

┌─ OUTFIT & MODEL (if person scenes) ───────┐
│  (same content as today, just moved here)  │
└────────────────────────────────────────────┘

┌─ GLOBAL STYLE (collapsed) ────────────────┐
│  "Default look for all scenes"             │
│  Mini scene thumbnails showing which       │
│  scenes inherit these defaults             │
│  [Color world] [Background] [Lighting]...  │
└────────────────────────────────────────────┘

┌─ CUSTOM NOTE ─────────────────────────────┐
│  [textarea]                                │
└────────────────────────────────────────────┘

┌─ FORMAT & OUTPUT (collapsed) ─────────────┐
│  Ratio · Images per scene · Quality        │
│  Per-scene overrides · Props               │
└────────────────────────────────────────────┘

┌─ CREDIT PREVIEW (always visible) ─────────┐
│  3 products · 4 scenes · 2 images = 24    │
│  images — 144 credits                      │
└────────────────────────────────────────────┘
```

## Detailed Changes

### 1. Model-needed info banner
- Compute `scenesNeedingModel` = scenes whose `triggerBlocks` include `personDetails` or `actionDetails`
- If any exist AND `!details.selectedModelId`, show an amber banner: *"X scenes include a person. Select a model or configure person details below."* with a button that scrolls to / opens the Outfit & Model section.
- Once a model is selected, banner turns green: *"Model selected ✓ — applied to X scenes."*

### 2. Scene cards with inline expansion
- Replace the current "scene context strip" (tiny 40px thumbs) + separate "Scene-specific details" collapsibles with **unified scene cards**.
- Each card: 64px thumbnail, title, status indicator (✓ ready / ⚠ needs model / 🎨 customized).
- Tapping a card expands its scene-specific detail blocks inline (same `BlockFields` content as today).
- Cards that have NO scene-specific blocks (e.g., `triggerBlocks: ['background']` only) show a subtle "No extra settings" label when tapped.
- Show which blocks are configurable as small text under the title: e.g., "Background, shadows" derived from `triggerBlocks`.

### 3. Global Style with scene thumbnails
- Rename "Overall Aesthetic" → **"Global Style"**
- Add a row of mini scene thumbnails (the ones that DON'T have their own templates overriding these values — i.e., universal/global scenes). Label: *"Applies to these scenes:"*
- Keep collapsed by default. The subtitle reads: *"Default colors, lighting, and surfaces for your scenes. Smart defaults already applied."*

### 4. Section reorder
Move Format & Output to LAST (before credit preview). New order:
1. Scene cards (with inline expansion)
2. Outfit & Model (if applicable)
3. Global Style (collapsed)
4. Custom Note
5. Format & Output (collapsed)
6. Credit preview (always visible, outside any collapsible)

### 5. Credit preview always visible
- Extract the credit preview strip from inside the Format collapsible
- Render it as a standalone element at the bottom of the step, always visible

## Files to Update

| File | Changes |
|------|---------|
| `ProductImagesStep3Refine.tsx` | (1) Add model-needed banner with `scenesNeedingModel` computation. (2) Replace scene context strip + separate scene-specific section with unified scene cards that expand inline. (3) Rename "Overall Aesthetic" → "Global Style", add mini scene thumbs showing which scenes inherit. (4) Reorder sections: scenes → outfit → global style → note → format. (5) Move credit preview outside Format collapsible. (6) Change defaults: `formatOpen: false`, `aestheticOpen: false` (was already false). |

No changes needed to `detailBlockConfig.ts`, `sceneData.ts`, `types.ts`, or `ProductImages.tsx` — this is purely a UI restructure within the single component.

