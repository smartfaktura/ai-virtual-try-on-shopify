## Fix: Duplicate Packaging Sections + Unboxing Scene Missing Reference

### Problem 1: Duplicate packaging upload sections
`packagingDetails` is hardcoded on line 3585 of `ProductImagesStep3Refine.tsx` as a `productSpecificTrigger`, AND it now also appears via the `REFERENCE_TRIGGERS` loop (line 3587-3589) because it was added to `REFERENCE_TRIGGERS` in the previous fix. This creates two identical upload sections.

### Problem 2: "Packaging Unboxing Luxury" not using packaging reference
The scene `scarf-packaging-unboxing-luxury` has trigger_blocks `[sceneEnvironment, visualDirection, layout, detailFocus]` — it's missing `packagingDetails`, so the packaging reference image is never injected into its prompt.

### Fix 1: Remove duplicate (`ProductImagesStep3Refine.tsx`)
In the `activeReferenceTriggers` loop (line 3587), skip `packagingDetails` and `backView` since they're already hardcoded above:
```
if (tk === 'packagingDetails' || tk === 'backView') continue;
```

### Fix 2: Add packagingDetails to unboxing scene (DB migration)
```sql
UPDATE product_image_scenes 
SET trigger_blocks = trigger_blocks || '["packagingDetails"]'::jsonb
WHERE scene_id = 'scarf-packaging-unboxing-luxury';
```
Also add it to `product-packaging-bags-scarves` which currently only has `[background]` — it's a packaging scene that should use the reference too.

### Fix 3: Strengthen the unboxing prompt
Update `scarf-packaging-unboxing-luxury` prompt_template to include a `[PACKAGING REFERENCE]` directive so when the packaging ref image is provided, the AI knows to reproduce the exact box.
