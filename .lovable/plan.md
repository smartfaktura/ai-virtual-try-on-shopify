

# Fix Catalog Poses Step — Regenerate Images + Improve Floating Bar

## Issues

1. **Seated and Close-Up poses** use recycled images from other poses (Front Relaxed / Hands on Hips) — they need dedicated AI-generated images showing actual seated and close-up compositions
2. **Mood/expression images** all use the same `mood_radiant.jpg` — need distinct images per expression (joyful, neutral, unapologetic, confident)
3. **Floating summary bar** (`CatalogMatrixSummary`) shows only counts and credits but has no action buttons — needs Back/Next navigation buttons

## Plan

### 1. Regenerate missing pose and mood images

Use `google/gemini-3.1-flash-image-preview` to generate:
- `pose_seated.png` — "Professional e-commerce photograph of a beautiful female supermodel wearing a plain white t-shirt and blue jeans, seated casually on a minimal white stool, bright white studio background with soft natural shadows, clean minimalist photography, 85mm lens"
- `pose_closeup.png` — "Professional e-commerce photograph of a beautiful female supermodel wearing a plain white t-shirt, upper body close-up detail shot from waist up, bright white studio background, clean minimalist photography, 85mm lens"
- `pose_over_shoulder.png` — "Professional e-commerce photograph of a beautiful female supermodel wearing a plain white t-shirt and blue jeans, looking back over shoulder, bright white studio background with soft natural shadows, full body, clean minimalist photography, 85mm lens"
- `mood_joyful.jpg` — headshot with genuinely joyful expression
- `mood_neutral.jpg` — headshot with calm neutral expression  
- `mood_unapologetic.jpg` — headshot with strong fierce expression
- `mood_confident.jpg` — headshot with confident self-assured expression

Save to `src/assets/catalog/`, update imports in `catalogPoses.ts` so each mood has a unique preview.

### 2. Update `catalogPoses.ts`

- Add new imports for all generated images
- Update `catalogPoses` array: change `previewUrl` for Seated (was reusing `poseFrontRelaxed`), Close-Up (was reusing `poseFrontHandsHips`), and Over-the-Shoulder (was reusing `poseThreeQuarter`)
- Update `CATALOG_MOODS` array: give each mood its own unique `previewUrl` instead of all pointing to `moodRadiant`

### 3. Improve `CatalogMatrixSummary` floating bar

Add navigation context and action buttons:
- Accept new props: `step`, `totalSteps`, `onBack`, `onNext`, `canProceed`, `stepLabel`
- Add a "Back" outline button (left side) and "Next: [step name]" primary button (right side) alongside the image/credit summary
- On the final step, show "Generate" button instead of "Next"
- Pass these props from `CatalogGenerate.tsx`

### Files to modify

| Action | File |
|--------|------|
| Generate | 7 new images via AI script → `src/assets/catalog/` |
| Update | `src/data/catalogPoses.ts` — new imports, unique preview URLs |
| Update | `src/components/app/CatalogMatrixSummary.tsx` — add nav buttons |
| Update | `src/pages/CatalogGenerate.tsx` — pass step/nav props to summary bar |

