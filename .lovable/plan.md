

# Redesign: Refine → Setup (Complete UX Overhaul)

## Summary

Transform the current "Refine your shoot" step into the user's detailed "Setup your shots" layout with portrait shot cards, smart summary stats, clearer section hierarchy, and renamed labels throughout.

## Current State

The Refine step currently shows: wide list-style scene cards (72px height), a flat "Your scenes" header, inline background strip between product/model shots, and a collapsible "Outfit & Model" section. Labels use technical terms like "Presets", "Customize Outfit", etc.

## Changes

### 1. Rename all labels

| Current | New |
|---|---|
| Refine your shoot | Setup your shots |
| Your scenes | Selected shots |
| Presets | Style direction |
| Customize Outfit | Outfit details |
| Appearance & Styling | Model styling |
| Select Model / Outfit & Model | Choose model |
| Background | Background style |
| Custom note | Additional note |

Update the subtitle to: "AI recommended settings are already applied for realistic, high-quality results."

### 2. Add summary stats strip below heading

After the heading, render 3 inline badge-style stat chips:

```
[ 14 shots selected ] [ 7 use custom background ] [ 2 need a model ]
```

Computed from `selectedScenes.length`, `bgScenes.length`, and `scenesNeedingModel.length`. Followed by a subtle `<Separator />`.

### 3. Redesign shot cards to 3:4 portrait thumbnails

**Replace** the current wide list cards (14×14 square thumb + text beside) with **portrait 3:4 aspect ratio cards** showing:

```
┌──────────┐
│          │  3:4 thumbnail
│  [image] │  
│          │
├──────────┤
│ Title    │  Badge-style name
│ AI · BG  │  Tags row
└──────────┘
```

- Grid: `grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8` (6-8 per row on desktop)
- Thumbnail: `aspect-[3/4]` with `object-cover`
- Title below as `text-[11px] font-medium` truncated
- Tags row: small badges — "AI" always shown, "BG" if scene has background trigger, "Model" if on-model, amber "Needs model" if no model selected
- No gear icon, no expand behavior on regular cards (action scenes still expand)
- Add a `[View all] / [Collapse]` toggle if more than 8 scenes, showing first 8 by default

### 4. Restructure page into clear sections

```
Setup your shots
AI recommended settings are already applied...
[ 14 shots ] [ 7 bg ] [ 2 model ]
─────────────────────────────────

Selected shots
A quick overview of the shots you chose.
[3:4 cards grid]

─────────────────────────────────

Complete setup
Only a few choices are needed for selected shots.

┌ Choose model ─────────────────┐
│ Needed for 2 selected shots   │
│ [Choose model button]         │
└───────────────────────────────┘

┌ Background style ─────────────┐
│ Applies to 7 selected shots   │
│ [swatch grid]                 │
└───────────────────────────────┘

─────────────────────────────────

Style direction
Choose the overall look for applicable shots.
[preset cards with updated names/descriptions]

─────────────────────────────────

Optional
  Outfit details  [ Customize ]  (collapsible)
  Model styling   [ Appearance ] [ Hair ] [ Makeup ] [ Fit direction ]  (collapsible)
  Additional note [ text field ]
```

### 5. Move Background out of scenes grid

Currently the background strip sits between product shots and on-model shots. Move it into the "Complete setup" section as a standalone card with header "Background style" and subtitle "Applies to N selected shots."

### 6. Move Model picker into "Complete setup" card

Extract `ModelPickerSections` from the collapsible "Outfit & Model" and place it in a "Choose model" card inside "Complete setup". Only shown if `scenesNeedingModel.length > 0`. Header: "Choose model", subtitle: "Needed for N selected shots."

### 7. Update Style direction presets

Rename the presets section header from "Presets" to "Style direction". Update descriptions:

| Preset | New Description |
|---|---|
| Studio Standard | Clean, neutral styling for commercial product focus |
| Editorial | Sharper, more fashion-led styling with elevated polish |
| Minimal | Quiet neutrals, soft tones, relaxed premium simplicity |
| Streetwear | Relaxed silhouettes, darker tones, urban attitude |
| Luxury Soft | Warm neutrals, refined textures, elegant softness |

### 8. Optional section with collapsibles

Group remaining controls under an "Optional" label:
- **Outfit details** — collapsible containing `OutfitPieceFields`
- **Model styling** — collapsible containing `InlinePersonDetails`
- **Additional note** — always visible `Textarea`

### 9. Remove model-needed banner

The current amber banner at the top becomes redundant since the "Choose model" card in "Complete setup" handles this. Remove the banner entirely.

## File

All changes are in `src/components/app/product-images/ProductImagesStep3Refine.tsx`.

The internal components (`ModelPickerSections`, `BackgroundSwatchSelector`, `OutfitPresetsOnly`, `OutfitPieceFields`, `InlinePersonDetails`, `BlockFields`) remain the same — only their placement and wrapping labels change.

