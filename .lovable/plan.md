

# Fix Catalog Page: Floating Bar, Images, Backgrounds & Style Shots Error

## Issues to Fix

1. **Floating bar not centered** — uses `left-1/2` which centers on viewport; should center within the main content area (offset by sidebar)
2. **Detail pose images** — Seated and Close-Up are misplaced in Detail section; images show inconsistent models and anatomical errors
3. **Expression images** — look like corporate headshots, not natural; no text labels visible on the images; different models used; need "Neutral" as default selection
4. **Background images** — look like photos of actual studios with equipment visible; remove Sage Green and Warm Beige; regenerate Concrete; add more subtle tones; remove description subtitles
5. **Style Shots crash** — `CatalogShotStyler` uses `<SelectItem value="">` which crashes Radix Select (empty string not allowed)
6. **Image optimization** — pose/mood/background images load at full resolution

## Plan

### 1. Fix floating bar centering
In `CatalogMatrixSummary.tsx`, use the `--sidebar-offset` CSS variable to center within the content area instead of viewport center.
Change from `left-1/2 -translate-x-1/2` to use `left: calc((100% + var(--sidebar-offset)) / 2)` and translate, or simpler: position it inside the content flow using a portal-like sticky approach. Simplest fix: use `left: calc(var(--sidebar-offset, 264px) + (100% - var(--sidebar-offset, 264px)) / 2)` with `-translate-x-1/2`.

### 2. Fix CatalogShotStyler crash
In `CatalogShotStyler.tsx`, the three `<SelectItem value="">Use default</SelectItem>` lines crash because Radix Select doesn't allow empty string values. Change to `value="__default"` and handle the mapping in state/save logic.

### 3. Regenerate Detail pose images (5)
Use `google/gemini-3.1-flash-image-preview` to generate 5 consistent detail images with the SAME model (young woman, white t-shirt, blue jeans), sharp and clean:
- Seated, Close-Up, Fabric Detail, Accessory Detail, Back Detail

### 4. Regenerate Expression images (5)
Generate 5 expression headshots with same consistent model, natural look (not corporate). Each will have the expression name overlaid as text in the component.

### 5. Update Expression component
- Set default `selectedMood` to `'neutral'` in `CatalogGenerate.tsx`
- Add expression name as black text overlay on each card
- Make text more visible below images

### 6. Update Backgrounds
- Remove Sage Green and Warm Beige entries
- Regenerate Concrete background (clean, no studio equipment visible)  
- Add 3-4 more subtle backgrounds: Ivory, Charcoal, Stone, Cream
- Remove description subtitles from `CatalogPoseCard` for backgrounds (or simplify to name-only)
- Generate 5-6 new clean gradient/solid color background images

### 7. Image optimization
Add `loading="lazy"` and size constraints to pose/mood/bg card images. Use smaller rendered sizes via CSS.

## Files to modify

| Action | File |
|--------|------|
| Generate | ~15 new images (5 detail poses, 5 moods, 5-6 backgrounds) |
| Update | `src/components/app/CatalogMatrixSummary.tsx` — center within content area |
| Update | `src/components/app/catalog/CatalogShotStyler.tsx` — fix empty SelectItem value |
| Update | `src/data/catalogPoses.ts` — new imports, remove/add backgrounds, update mood images |
| Update | `src/components/app/catalog/CatalogStepExpression.tsx` — text labels, layout |
| Update | `src/components/app/catalog/CatalogPoseCard.tsx` — remove descriptions for backgrounds, add lazy loading |
| Update | `src/pages/CatalogGenerate.tsx` — default mood to 'neutral' |

