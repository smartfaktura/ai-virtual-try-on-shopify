## Add Material Reference Upload for Furniture Scenes

When a user selects any furniture scene, they will see an optional "Upload material/fabric photo" card. If provided, the material image is sent to the AI as a reference so it can accurately render the furniture's upholstery, wood grain, or surface texture.

### Changes

**1. Add `materialDetail` reference trigger definition**
File: `src/components/app/product-images/detailBlockConfig.ts`

Add a new entry to `REFERENCE_TRIGGERS`:
```
materialDetail: {
  key: 'materialDetail',
  label: 'Upload material/fabric photo',
  description: 'Upload a close-up of the material — wood grain, fabric weave, leather texture, marble veining — so the AI can accurately match the surface finish.',
  promptLabel: 'Material/fabric close-up reference — use this to accurately render the surface texture, grain, and finish of the furniture:',
}
```

**2. Add `materialDetail` to all furniture scene trigger_blocks (database update)**

Run an UPDATE on `product_image_scenes` to append `materialDetail` to the `trigger_blocks` array for every active furniture scene that does not already have it:

```sql
UPDATE product_image_scenes
SET trigger_blocks = array_append(trigger_blocks, 'materialDetail')
WHERE category_collection = 'furniture'
  AND is_active = true
  AND NOT ('materialDetail' = ANY(trigger_blocks));
```

### How it works (no additional code needed)

The existing reference trigger pipeline handles everything automatically:
- **Step 3 (Refine)** already detects reference triggers from selected scenes and shows upload cards
- **ProductImages.tsx** already reads `sceneExtraRefs` and maps trigger keys to `REFERENCE_TRIGGERS[key].promptLabel`
- **generate-workflow edge function** already receives `extra_references` array and injects each as a labeled reference image into the AI prompt

The material photo will appear to the AI as:
> `[PRODUCT EXTRA ANGLE] Material/fabric close-up reference — use this to accurately render the surface texture, grain, and finish of the furniture:`
