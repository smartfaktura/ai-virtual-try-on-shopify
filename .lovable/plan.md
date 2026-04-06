

# Refine Step — Kill "Global Style", Embed Controls in Scene Cards

## Problem

"Global Style" is confusing — it says "applies to all scenes" but editorial scenes have their own specific mood/lighting baked into templates. Users don't understand what controls affect what. Too many settings scattered across separate sections.

## Solution: No Global Section. Each Scene Shows Its Own Controls.

Every scene's `promptTemplate` uses specific directives (e.g., `{{lightingDirective}}`, `{{shadowDirective}}`, `{{moodDirective}}`). Instead of a separate "Global Style" section, **scan each scene's template** and show only the controls that scene actually uses — right inside its card expansion.

If two scenes both use `{{lightingDirective}}`, the same `details.lightingStyle` value appears in both cards. Changing it in one updates the other automatically. No need to explain "shared" — users discover it naturally.

## What Changes

### Scene card expansion: show ALL relevant controls per scene

For each scene, compute which controls to show by scanning its `promptTemplate` for directive tokens:

| Template token | Control shown |
|---|---|
| `{{lightingDirective}}` | Lighting chip selector |
| `{{shadowDirective}}` | Shadow style chip |
| `{{moodDirective}}` | Styling direction chip |
| `{{surfaceDirective}}` | Surface / material chip |
| `{{background}}` | Background family chip |
| `{{accentDirective}}` or `{{accentColorDirective}}` | Accent color chip |
| `{{productProminenceDirective}}` | Product prominence chip |

These are shown BELOW the existing scene-specific `BlockFields` in a "Style" sub-group. Result: every scene card becomes self-contained — the user sees everything that affects THAT scene in one place.

Example — "Clean Studio Shot" card expands to show:
- Background & Composition (from `triggerBlocks`)
- Product Size (from `triggerBlocks`)
- **Lighting** (from template scan — uses `{{lightingDirective}}`)
- **Shadow** (from template scan — uses `{{shadowDirective}}`)

Example — "Editorial on Surface" card expands to show:
- Visual Direction (from `triggerBlocks`)
- Environment (from `triggerBlocks`)
- **Lighting**, **Mood/Styling**, **Surface**, **Accent** (from template scan)

Scenes that were previously "No extra settings" (like Marketplace Listing with only `triggerBlocks: ['background']`) now show Lighting + Shadow from their template — giving users control they didn't have before.

### Remove Global Style section entirely

Delete the entire "Global Style" collapsible (current Section 3, lines ~1349-1465). No replacement needed — all its controls now live inside scene cards.

Move the "Auto (Recommended)" button to the header area next to "Your scenes" as a quick reset.

### Consistency control

The multi-product consistency chip (`auto-balance` / `anchor-first` / `strong` / `strict`) moves into a small standalone card between the scene cards section and Custom Note — it's a cross-cutting concern that doesn't belong to any single scene.

## New Section Order

1. Model-needed info banner (unchanged)
2. Your scenes — with "Auto (Recommended)" reset in header + scene cards with full inline controls
3. Outfit & Model (unchanged)
4. Consistency (if multi-product — small standalone chip)
5. Custom note
6. Format & Output (collapsed)
7. Credit preview (always visible)

## Files to Update

| File | Changes |
|---|---|
| `ProductImagesStep3Refine.tsx` | (1) Add `getTemplateControls(scene)` helper scanning `promptTemplate` for directive tokens, returning list of control keys. (2) In scene card expansion, render template-derived controls (Lighting, Shadow, Mood, Surface, Background, Accent chips) below the existing `BlockFields`. (3) Delete entire Global Style collapsible section. (4) Move `AutoAestheticButton` to scene section header. (5) Move consistency chip to standalone small section. (6) Remove `aestheticOpen` state and `globalInheritScenes` computation. |

