

# Fix: Product Images — Multiple Quality & Naming Issues

## Problems Identified

1. **Person appearing in product-only scenes** (Tabletop Lifestyle, Product on Pedestal, Accent Color Backdrop): The model reference is sent to the edge function for ALL scenes (line 391: `...(modelRef ? { model: modelRef } : {})`). When the edge function sees a model, it injects person instructions, causing people to appear in packshot/product-only scenes.

2. **In-Hand Studio/Lifestyle bad for garments**: The prompt says "held in a hand" which doesn't work for apparel. A tank top can't be held like a perfume bottle. These scenes should either be excluded for garments or have garment-specific prompt adaptation (e.g. "model holding the folded garment close to camera").

3. **Scene labels showing "Scene"**: When polling or session restore resolves scene names, it falls back to `'Scene'` if `selectedScenes` doesn't contain the scene (e.g. DB-loaded scenes not matching). The `scene_name` is already stored in the DB — we should use it.

4. **Background color not applied to non-global scenes**: The prompt builder only injects background for global scenes (`globalOnly` flag on line 832-838 for shadow, surface, styling, lighting). The `injectIfMissing` for background does check all scenes (line 823-830), but the `hasBgToken` check may not catch all templates. Need to verify non-global category scenes also get the user's selected background.

5. **In-Hand Lifestyle showing wrong composition for fashion**: Same root cause as #2 — prompts treat all products as handheld objects rather than adapting for garment presentation.

## Plan

### A. File: `src/pages/ProductImages.tsx` — Conditionally skip model reference for product-only scenes

**Change the payload building loop** (~line 391) to only include `model` when the scene's `triggerBlocks` includes `personDetails` or `actionDetails`:

```typescript
const sceneNeedsPerson = scene.triggerBlocks?.some(
  (b: string) => b === 'personDetails' || b === 'actionDetails'
);

const payload = {
  ...
  ...(modelRef && sceneNeedsPerson ? { model: modelRef } : {}),
  ...
};
```

This prevents the edge function from injecting person/model instructions for tabletop, pedestal, accent backdrop, and other product-only scenes.

### B. File: `src/pages/ProductImages.tsx` — Fix scene name fallback in polling

In `startPolling` (line 496) and the `onViewResults` callback (line 881), when `scene?.title` is not found, fall back to the `scene_name` from the DB query. Update the polling query to also select `scene_name`:

```typescript
// In poll query, select scene_name as well
const { data: jobs } = await supabase
  .from('generation_queue')
  .select('id, status, result, scene_name')
  .in('id', jobIds);

// Use job.scene_name as fallback
productMap.set(jobId, {
  productId,
  sceneName: scene?.title || 'Scene'  // initial map
});

// After fetching jobs, enrich with DB scene_name
for (const job of jobs) {
  const existing = productMap.get(job.id);
  if (existing && existing.sceneName === 'Scene' && job.scene_name) {
    productMap.set(job.id, { ...existing, sceneName: job.scene_name });
  }
}
```

### C. File: `src/components/app/product-images/sceneData.ts` — Fix In-Hand scenes for garments

Add `'garments'` to the `excludeCategories` for both `in-hand-studio` and `in-hand-lifestyle`. Garments should NOT use "held in hand" scenes — they have their own category-specific on-model scenes.

```typescript
// in-hand-studio
excludeCategories: ['home-decor', 'tech-devices', 'garments'],

// in-hand-lifestyle  
excludeCategories: ['home-decor', 'tech-devices', 'garments'],
```

### D. File: `src/lib/productImagePromptBuilder.ts` — Ensure background injection works for all scenes

The background injection at line 823-830 checks `!hasBgToken && !isAuto(bgTone)`, but `bgTone` maps to `details.backgroundTone` while some users set `details.negativeSpace` (the background family). Verify both paths inject correctly. Also ensure the `injectIfMissing` calls for lighting, shadow etc. are NOT restricted to `globalOnly` for background — currently background injection is correct (not globalOnly), but we should also inject lighting for category scenes when user explicitly set it.

### E. File: `src/components/app/product-images/sceneData.ts` — Add garment-specific category scenes for in-hand

Add two new garment-specific scenes to the `garments` category collection:
- **"Garment In-Hand Presentation"**: Close-up of someone presenting the folded/held garment naturally
- **"Garment Lifestyle Hold"**: Model casually holding the garment in a lifestyle setting

Or alternatively, adapt the global in-hand prompts to detect garment category and use different wording. The simpler approach is excluding garments from the generic in-hand and relying on existing on-model garment scenes.

## Files

| File | Changes |
|---|---|
| `src/pages/ProductImages.tsx` | Skip model ref for product-only scenes; fix scene name fallback using DB `scene_name` |
| `src/components/app/product-images/sceneData.ts` | Add `garments` to `excludeCategories` for in-hand-studio and in-hand-lifestyle |
| `src/lib/productImagePromptBuilder.ts` | Minor: ensure background/lighting injection covers category scenes when user explicitly set values |

