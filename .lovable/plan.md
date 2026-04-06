

# Refine Step — UX Polish Pass

## Problems to Fix

1. **Scene cards don't look clickable** — the chevron only appears on hover, no "tap to customize" affordance. Users see a wall of cards and don't know they're interactive.
2. **Background strip has no "advanced details" access** — user wants a quick way to also tweak lighting/shadow/surface from the same area without opening individual cards.
3. **Clicking a "needs model" card doesn't open Outfit & Model** — the card expands its own (empty) settings, but the user expects the Outfit section to open automatically.

## Changes

### 1. Make scene cards obviously interactive

- Always show the chevron (not just on hover) — use `opacity-40` default, `opacity-100` on hover
- Add a subtle bottom bar text: `"Tap to customize"` visible by default (hidden when expanded)
- Add `hover:bg-muted/30` background tint on the entire card for a clear interactive signal
- When expanded, show `"Collapse"` text + upward chevron instead

### 2. Add "Advanced details" toggle next to Background strip

Below the Background chips, add a row: `"⚙ Advanced"` button that expands inline to show Lighting, Shadow, Surface, and Accent color chip selectors — all from the template-derived controls. These affect the same `details` fields, so they sync with individual scene cards automatically.

Only show controls that at least 2 scenes actually use (computed from `getTemplateControls`).

```text
┌─ Background  across 7 scenes ─────────────────┐
│ [Pure White] [Light Gray] [Warm] [Cool] ...    │
│ Applies to: [thumb][thumb]...                  │
│                                                │
│ ⚙ Advanced details              [collapse ▴]  │
│ ┌────────────────────────────────────────────┐ │
│ │ Lighting: [Soft diffused] [Warm ed.] ...   │ │
│ │ Shadow:   [None] [Soft] [Natural] ...      │ │
│ │ Surface:  [Minimal studio] [Stone] ...     │ │
│ └────────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

### 3. Auto-open Outfit & Model when clicking a "needs model" card

When user clicks a scene card that has `personDetails` or `actionDetails` in `triggerBlocks` AND no model is selected yet:
- Don't expand the scene card (it has no useful settings without a model)
- Instead, set `outfitOpen = true` and scroll to the Outfit & Model section
- This reuses the existing scroll-to-outfit logic from the banner button

### 4. Minor layout polish

- Reduce gap between scene cards from `gap-2` to `gap-1.5`
- Make the "settings pill" slightly more prominent with a subtle border
- Ensure scene card titles don't truncate aggressively — allow 2 lines with `line-clamp-2` instead of `truncate`

## File to Update

| File | Changes |
|------|---------|
| `ProductImagesStep3Refine.tsx` | (1) Always-visible chevron on cards with reduced opacity. (2) Add "Tap to customize" / "Collapse" text affordance. (3) Add hover bg tint. (4) Add "Advanced details" collapsible section inside the Background strip with shared Lighting/Shadow/Surface/Accent chips — computed from template controls used by 2+ scenes. (5) In `toggleSceneExpand`, if scene needs model and no model selected, auto-open Outfit & scroll instead of expanding card. (6) Title `line-clamp-2`, settings pill border, gap tweaks. |

