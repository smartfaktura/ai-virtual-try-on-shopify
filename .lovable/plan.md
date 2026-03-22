

# Enhance Discover with Generation Context, Scene/Model Metadata & "Recreate This" CTA

## Current State Analysis

**What exists:**
- `discover_presets` table has `scene_name`, `model_name`, `workflow_slug`, `workflow_name` columns — but they're **all null** for existing presets (the generation function never populates them)
- The Discover feed mixes two item types: `preset` (AI-generated images with prompts) and `scene` (from `mockTryOnPoses` + custom scenes from DB)
- Scenes already have `previewUrl`, `name`, `category`, `promptHint` — they ARE the scene reference
- Models exist in `mockModels` (52 hardcoded) + `custom_models` DB table, each with `name`, `previewUrl`/`image_url`
- The detail modal currently shows: title, category badge, workflow name (if set), prompt text, tags, view count, and buttons for "Use Prompt" / "Use Scene"
- The card hover currently shows only prompt text or scene name — no context about HOW the image was created

**Key insight:** Some discover items ARE scenes (type: `scene`), and presets were generated with specific scenes/models/workflows but that metadata is empty. The system needs:
1. A way to store and display what scene + model + workflow was used for each preset
2. Better hover UX showing generation context + a "Recreate this" CTA
3. Richer detail modal with scene thumbnail, model thumbnail, and generation type

## Database Changes

### Migration: Add `scene_image_url` and `model_image_url` to `discover_presets`

```sql
ALTER TABLE public.discover_presets 
  ADD COLUMN scene_image_url text,
  ADD COLUMN model_image_url text;
```

These store thumbnail URLs for the scene and model used, so we can show them on hover and in the detail modal without needing to cross-reference other tables at runtime.

## UI Changes

### 1. `src/hooks/useDiscoverPresets.ts` — Add new fields to interface

Add `scene_image_url` and `model_image_url` to the `DiscoverPreset` interface.

### 2. `src/components/app/DiscoverCard.tsx` — Redesign hover overlay

Replace current simple text/prompt overlay with:

**For presets:**
```text
┌──────────────────────────┐
│      [Main Image]        │
│                          │
│  ┌────────────────────┐  │  ← hover overlay (gradient from bottom)
│  │                    │  │
│  │ ┌───┐ Scene Name   │  │  ← scene thumb (32px) + name (if scene_name exists)
│  │ └───┘              │  │
│  │ ┌───┐ Model Name   │  │  ← model thumb (32px) + name (if model_name exists)
│  │ └───┘              │  │
│  │                    │  │
│  │  [Recreate this →] │  │  ← pill CTA button
│  │                    │  │
│  │ Freestyle · 3:4    │  │  ← generation type badge
│  └────────────────────┘  │
└──────────────────────────┘
```

- If `workflow_name` exists → show workflow name badge (e.g. "Ghost Mannequin")
- If only `scene_name` exists → show "Freestyle · {scene_name}"
- If neither → show "Freestyle" as generation type
- Scene thumbnail from `scene_image_url`, model thumbnail from `model_image_url`
- "Recreate this" is a small rounded pill, white text on dark bg, centered

**For scenes (type === 'scene'):**
- Keep current behavior showing scene name
- Add "Use this scene →" pill CTA on hover

### 3. `src/components/app/DiscoverDetailModal.tsx` — Add "Created With" section

After the title/category area, add a new section:

**"Created with" block:**
- **Scene row**: Small scene thumbnail (40px rounded) + scene name — clickable to filter discover by that scene. Only shown if `scene_name` exists.
- **Model row**: Small model thumbnail (40px rounded) + model name. Only shown if `model_name` exists.
- **Workflow badge**: If `workflow_name` exists, show it as a badge.
- **Fallback**: If none of the above exist, show "Created with Freestyle" label.

**Update primary CTA:**
- Change "Use Prompt" → "Recreate this" with an ArrowRight icon
- Keep "Use Scene" for scene items

**Add "More from this scene" logic:**
- When selected item has `scene_name`, prioritize related items with the same `scene_name` before falling back to the existing similarity scoring.

### 4. `src/pages/Discover.tsx` — Update related items logic

In the `relatedItems` memo:
- If the selected preset has `scene_name`, first collect all items with matching `scene_name`
- If >= 3 matches, use those (up to 9). Otherwise fall back to current similarity scoring.
- This creates the "same scene" grouping the user described.

### 5. `src/pages/PublicDiscover.tsx` — Mirror changes

Apply the same hover overlay redesign and detail modal updates. The "Recreate this" button for public users navigates to `/auth?redirect=/app/freestyle?scene=...` to prompt signup.

## Files Changed

| File | Change |
|------|--------|
| **Migration** | Add `scene_image_url`, `model_image_url` columns |
| `src/hooks/useDiscoverPresets.ts` | Add new fields to interface |
| `src/components/app/DiscoverCard.tsx` | Redesign hover overlay with scene/model thumbs, generation type, "Recreate this" CTA |
| `src/components/app/DiscoverDetailModal.tsx` | Add "Created with" section (scene/model/workflow thumbnails), rename CTA, scene-based related items |
| `src/pages/Discover.tsx` | Update `relatedItems` to prioritize same-scene matches |
| `src/pages/PublicDiscover.tsx` | Mirror hover + detail modal changes |
| `src/components/app/PublicDiscoverDetailModal.tsx` | Add "Created with" section, "Recreate this" → signup redirect |

## Data Population Note

Existing presets have null `scene_name`/`model_name`/`workflow_name` — they'll gracefully show "Created with Freestyle" as fallback. Future discover items (published from generation jobs or admin-created) should populate these fields. A backfill script can be added later to enrich existing presets.

