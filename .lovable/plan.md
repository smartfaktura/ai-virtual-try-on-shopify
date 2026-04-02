

# Fix Catalog Studio Shot Quality for Jackets & Product-Only Shots

## Problems Identified

1. **Jacket back on neck (identity_anchor)**: No `jacket_coat` override — the generic "collarbone to feet" crop cuts awkwardly through the jacket collar, making it look like the back of the jacket is on the model's neck
2. **Waist-Up Crop not working**: No jacket-specific override — prompt doesn't focus the camera on the upper body/jacket
3. **On Surface & Clean Flat Lay not working**: Prompts lack product fidelity language — AI invents/simplifies the product instead of reproducing it from the reference
4. **Side / 3-Quarter not correct**: Generic apparel prompt doesn't account for outerwear structure and silhouette
5. **Movement not working**: No jacket-specific motion instructions for showing fabric/drape properly

## Changes — Single file: `src/lib/catalogEngine.ts`

### 1. Add `jacket_coat` override to `identity_anchor` (line ~656)
Shift the crop point down to shoulders (not collarbone) so the jacket collar sits naturally. Explicit instruction that the jacket must be fully zipped/buttoned and sitting properly on the shoulders.

### 2. Add `jacket_coat` override to `waist_up_crop` (line ~600)
Crop from waist up, camera at chest height, focus on jacket construction — collar, lapels, zipper, shoulders, sleeve length, fabric texture. This is the "portrait focused on jacket" shot the user wants.

### 3. Improve `on_surface` prompt (line ~637)
Add strong product fidelity instructions: "Reproduce the EXACT product from the reference image — identical color, fabric, pattern, hardware, construction. Do NOT invent, simplify, or alter any detail." Also add `strictIsolation: true`.

### 4. Improve `clean_flat_lay` prompt (line ~646)
Same product fidelity upgrade. Add `strictIsolation: true`. Add jacket-specific override for natural folded/laid shape.

### 5. Add `jacket_coat` override to `side_3q` (line ~375)
Focus on showing the jacket silhouette, shoulder structure, sleeve drape, and side seam from a 30-45° angle.

### 6. Add `jacket_coat` override to `movement` (line ~401)
Controlled walking motion showing how the jacket moves — fabric swing, collar position, sleeve movement. Not editorial, still catalog.

### 7. Add `jacket_coat` override to `back_view` (line ~366)
Ensure back panel, shoulder seams, collar from behind are properly shown.

## Technical Details

All changes are prompt template strings in the `SHOT_DEFINITIONS` array. No logic changes, no schema changes, no edge function changes. The existing prompt assembly pipeline (`assemblePrompt`) already handles `categoryOverrides` — we just need to populate them for `jacket_coat`.

Example override (waist_up_crop):
```
jacket_coat: '[HERO_PRODUCT] worn by [MODEL], waist-up ecommerce catalog photograph, camera at chest height, centered composition, jacket fully visible from waist to collar — showing collar shape, lapels, shoulder construction, zipper/button closure, sleeve length, and fabric texture, arms relaxed naturally, neutral composed expression, [SUPPORT_WARDROBE], [QUALITY], [LIGHTING], [BACKGROUND], [CONSISTENCY]'
```

