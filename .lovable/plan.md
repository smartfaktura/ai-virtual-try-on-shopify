

## Add "AI Creative Pick" Scene as First Option

### What
Add a new variation at position 0 in the Product Listing Set workflow's `variation_strategy.variations` array. This scene won't prescribe a specific background — instead, its instruction tells the AI to autonomously choose a unique, high-quality aesthetic setting that best complements the product, varying each time.

### Database Migration

One SQL migration to prepend a new variation to the existing array:

```sql
UPDATE workflows
SET generation_config = jsonb_set(
  generation_config,
  '{variation_strategy,variations}',
  (
    '[{
      "label": "AI Creative Pick",
      "category": "Studio Essentials",
      "instruction": "You are a world-class creative director. Analyze the product and autonomously choose the SINGLE most compelling, unexpected, and aesthetically striking scene that best showcases THIS specific product. Consider the product material, color, shape, and category — then design a unique environment, surface, lighting setup, and mood that creates a premium editorial-quality photograph. Every generation should feel different and surprising: vary between studio setups, textured surfaces, lifestyle contexts, dramatic lighting, creative angles, and artistic compositions. Push creative boundaries while keeping the product as the undeniable hero. Ultra high resolution, magazine-cover quality.",
      "preview_url": null
    }]'::jsonb || (generation_config->'variation_strategy'->'variations')
  )
)
WHERE name = 'Product Listing Set';
```

This inserts the new variation at index 0 (before all existing scenes). It has no `preview_url` so the UI will show a fallback/placeholder card.

### Frontend — No code changes needed

The Generate.tsx scene grid already handles `preview_url: null` with a gradient fallback. The new card will appear first with its label "AI Creative Pick".

### Result

Users see "AI Creative Pick" as the first selectable scene. When selected, the AI gets full creative freedom to design a unique, high-quality aesthetic setting tailored to the product — different every time.

### 1 file changed
- New SQL migration (database)

