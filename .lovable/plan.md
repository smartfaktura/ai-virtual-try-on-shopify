

# Refine Options Audit — Field Collisions + Missing Map Entries

## Critical Issues Found

### Issue 1: Two field collisions — scene-specific blocks overwrite global aesthetic

Two pairs of UI controls silently write to the **same** `details` field, causing whichever is set last to overwrite the other:

| `details` field | Overall Aesthetic control | Scene-specific block control | Conflict |
|---|---|---|---|
| `negativeSpace` | **Background family** (pure-white, soft-white, light-grey...) | **Spacing** (tight, balanced, generous) | User picks "soft-white" background, then sets "tight" spacing → background becomes "tight" → BG_MAP returns nothing → garbage prompt |
| `mood` | **Styling direction** (minimal-luxury, fashion-editorial...) | **Mood** (clean, warm, dramatic, editorial, natural) | User picks "fashion-editorial" styling, then sets scene mood to "warm" → styling direction becomes "warm" → STYLING_DIRECTION_MAP returns nothing → weak fallback |

**Fix**: Give scene-specific block fields their own `details` keys:
- Rename scene-specific "Spacing" from `negativeSpace` → `compositionFraming` (which already exists in the type but is unused)
- Rename scene-specific "Mood" from `mood` → `sceneIntensity` (which already exists in the type but is unused)

### Issue 2: Missing prompt map entries for scene-specific chip values

These scene-specific chip values have no entry in their respective maps and fall through to weak generic fallbacks:

| Map | Missing keys (from scene-specific blocks) |
|---|---|
| `LIGHTING_MAP` | `natural`, `studio`, `dramatic` |
| `SHADOW_MAP` | `dramatic` |
| `SURFACE_MAP` | `wood`, `glass` |
| `CONSISTENCY_MAP` | `natural`, `strong`, `strict` (from multi-product consistency chips) |

### Issue 3: Scene-specific visualDirection "Mood" values produce no useful prompt

The values `clean`, `warm`, `dramatic`, `editorial`, `natural` are not in STYLING_DIRECTION_MAP. After fixing the field collision (Issue 1), these will route through `sceneIntensity` which needs its own resolution logic.

## Plan

### File 1: `src/components/app/product-images/ProductImagesStep3Refine.tsx`

**A. Fix scene-specific "Spacing" field** (line 374): Change from `negativeSpace` to `compositionFraming`
```
// Before
<ChipSelector label="Spacing" value={details.negativeSpace} onChange={v => update({ negativeSpace: v })} ...
// After  
<ChipSelector label="Spacing" value={details.compositionFraming} onChange={v => update({ compositionFraming: v })} ...
```

**B. Fix scene-specific "Mood" field** (line 382): Change from `mood` to `sceneIntensity`
```
// Before
<ChipSelector label="Mood" value={details.mood} onChange={v => update({ mood: v })} ...
// After
<ChipSelector label="Mood" value={details.sceneIntensity} onChange={v => update({ sceneIntensity: v })} ...
```

**C. Update BLOCK_FIELD_MAP** (line 484-485): Replace `negativeSpace` with `compositionFraming` in background block, and ensure visualDirection uses `sceneIntensity` for mood.

### File 2: `src/lib/productImagePromptBuilder.ts`

**A. Add missing LIGHTING_MAP entries:**
```typescript
'natural': 'Natural ambient lighting with organic warmth and gentle shadow transitions.',
'studio': 'Professional controlled studio lighting with clean, even illumination.',
'dramatic': 'Dramatic high-contrast lighting with deep shadows and bold highlights.',
```

**B. Add missing SHADOW_MAP entry:**
```typescript
'dramatic': 'Product anchored with a strong, dramatic cast shadow adding visual weight and depth.',
```

**C. Add missing SURFACE_MAP entries:**
```typescript
'wood': 'placed on a natural wood surface with visible grain and organic warmth',
'glass': 'placed on a transparent glass surface with subtle reflections and clean edges',
```

**D. Add missing CONSISTENCY_MAP entries:**
```typescript
'natural': 'Maintain natural visual flow across the series — same general tone with organic variation.',
'strong': 'Maintain strong visual consistency with other shots — same lighting direction, color temperature, and style.',
'strict': 'Maintain strict visual consistency — identical lighting, identical background, identical framing across all shots.',
```

**E. Add `compositionFraming` resolution** in `resolveToken`:
```typescript
case 'compositionDirective': {
  if (isAuto(details.compositionFraming)) return '';
  const FRAMING_MAP = {
    'tight': 'Tight composition — product fills the frame with minimal surrounding space.',
    'balanced': 'Balanced composition — product centered with comfortable breathing room.',
    'generous': 'Generous composition — ample negative space around the product for editorial feel.',
  };
  return FRAMING_MAP[details.compositionFraming!] || `${details.compositionFraming} composition.`;
}
```

**F. Add `sceneIntensity` resolution** in `resolveToken`:
```typescript
case 'sceneIntensityDirective': {
  if (isAuto(details.sceneIntensity)) return '';
  const SCENE_MOOD_MAP = {
    'clean': 'Clean, modern aesthetic — crisp lines, minimal distraction, contemporary feel.',
    'warm': 'Warm, inviting atmosphere — rich amber undertones, cozy tactile quality.',
    'dramatic': 'Dramatic, high-impact visual — bold contrasts, cinematic depth, editorial tension.',
    'editorial': 'Editorial storytelling — magazine-quality composition with narrative visual intent.',
    'natural': 'Natural, organic feel — soft, authentic, unforced visual language.',
  };
  return SCENE_MOOD_MAP[details.sceneIntensity!] || `${details.sceneIntensity} scene mood.`;
}
```

**G. Auto-inject compositionFraming and sceneIntensity** in the `injectIfMissing` block:
```typescript
injectIfMissing('composition', 'compositionDirective');
injectIfMissing('mood', 'sceneIntensityDirective');  // only if no mood/styling already present
```

## Files to Update

| File | Change |
|---|---|
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Fix 2 field collisions (negativeSpace → compositionFraming, mood → sceneIntensity in scene-specific blocks), update BLOCK_FIELD_MAP |
| `src/lib/productImagePromptBuilder.ts` | Add 9 missing map entries, add compositionFraming + sceneIntensity resolvers, add auto-inject for new directives |

