

# Redesign Catalog Poses Step — Studio-Only Poses + Mood Selector + AI-Generated Previews

## What Changes

The reference image shows a clean two-column layout: **Poses grid** (left, grouped by category like "Front") + **Mood selector** (right sidebar). All poses are studio poses with real preview images of a supermodel on a bright white background with shadows.

### 1. Redefine pose data in `catalogPoses.ts`

Remove lifestyle and editorial categories. Replace with ~11 studio-only poses matching real e-commerce photography (similar to reference image):

**Front category** (~5-6 poses):
- Front Relaxed (arms at sides)
- Front Hands on Hips
- Front One Hand on Hip
- Front Arms Crossed
- Front Walking

**Side / Angled category** (~3-4 poses):
- Three-Quarter Turn
- Side Profile
- Back View
- Over-the-Shoulder Look

**Seated / Detail** (~2 poses):
- Seated Casual
- Close-Up / Upper Body

Update `CATALOG_POSE_CATEGORIES` to just `['front', 'angled', 'detail']`.

### 2. Add Mood/Expression selector

Add a `CATALOG_MOODS` array with options:
- `{ id: 'any', name: 'Any expression', icon: Ban }` (default, selected by default)
- `{ id: 'joyful', name: 'Joyful' }`
- `{ id: 'radiant', name: 'Radiant' }`
- `{ id: 'neutral', name: 'Neutral' }`
- `{ id: 'unapologetic', name: 'Unapologetic' }`
- `{ id: 'confident', name: 'Confident' }`

### 3. Generate AI preview images for poses and moods

Use the Lovable AI Gateway (Nano Banana 2 — `google/gemini-3.1-flash-image-preview`) to generate:
- ~11 pose preview images: female supermodel in white t-shirt and blue jeans, bright white studio background with natural shadows, full body, professional e-commerce photography
- ~5 mood preview images: close-up headshot of same model with each expression

Images will be generated via script, uploaded to Supabase storage (`catalog-previews` bucket), and URLs hardcoded into the pose/mood data.

### 4. Rebuild `CatalogStepPoses.tsx` layout

Two-column layout matching reference:
- **Left (wide)**: Header "Select expression and poses" with Back/Next buttons top-right. Below: "Poses" label + "you can select multiple poses" hint. Grid of pose cards grouped by category (5 columns), using `ShimmerImage` with actual preview URLs.
- **Right sidebar**: "Select a mood" panel. "Mood" label. Grid of mood cards (2 columns). First card = "Any expression" with a ⊘ icon. Others show AI-generated headshot previews.

### 5. Wire mood state into `CatalogGenerate.tsx`

- Add `selectedMood` state (string, default `'any'`)
- Pass to `CatalogStepPoses` and forward to generation payload
- Mood gets injected into prompt as expression directive (e.g., "joyful smiling expression")

## Files to modify/create

| Action | File |
|--------|------|
| Update | `src/data/catalogPoses.ts` — studio-only poses, new categories, add moods array |
| Rewrite | `src/components/app/catalog/CatalogStepPoses.tsx` — two-column layout with mood sidebar |
| Update | `src/pages/CatalogGenerate.tsx` — add `selectedMood` state, pass to poses step and generation |
| Script | Generate ~16 AI images via `lovable_ai.py`, upload to storage bucket, get public URLs |
| Update | `src/hooks/useCatalogGenerate.ts` — inject mood into generation prompt |

## Image generation plan

Run a script that generates each pose/mood image one by one using `google/gemini-3.1-flash-image-preview`:
- Pose prompts: "Professional e-commerce photograph of a beautiful female supermodel wearing a plain white t-shirt and blue jeans, [pose description], bright white studio background with soft natural shadows on the floor, full body shot, clean minimalist photography, 85mm lens"
- Mood prompts: "Professional headshot portrait of a beautiful female supermodel, [expression] facial expression, white background, shoulders up, clean beauty photography"

Save to `/tmp/`, upload to `catalog-previews` bucket, hardcode resulting URLs.

