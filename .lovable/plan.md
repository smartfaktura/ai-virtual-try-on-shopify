

## Supercharge the Product Listing Set Workflow

The current "Product Listing Set" workflow is minimal -- only 4 angle-based variations (Hero Front, 45-degree, Close-up, Back View) all on white backgrounds. We'll transform it into a comprehensive, category-aware product photography engine with diverse backgrounds, scenes, and compositions.

### What Changes

**1. Database: Update the `generation_config` for the Product Listing Set workflow**

Replace the current `generation_config` JSONB with a much richer configuration:

- **Variation Strategy**: Change from `angle` (4 variations) to `scene` type with **8 variations** covering diverse product photography scenarios:

  1. **Hero White** -- Clean white/light-gray studio shot, front-facing, e-commerce primary listing image
  2. **Marble Surface** -- Product on white/gray marble surface with soft shadows, premium feel
  3. **Natural Texture** -- Product on linen/wood/stone natural surface, warm organic tones
  4. **Gradient Backdrop** -- Product floating on a smooth gradient background (white-to-soft-color), modern and airy
  5. **Lifestyle Context** -- Product placed in its natural use environment (kitchen for food, bathroom for skincare, desk for tech), shallow depth of field
  6. **Detail Close-up** -- Tight macro crop on the most important feature, texture, or label of the product
  7. **Group/Scale Shot** -- Product shown with 1-2 complementary props to convey scale and use context (no people)
  8. **Dark/Moody** -- Product on dark background (charcoal, slate, deep color) with dramatic side lighting for premium/luxury feel

- **Prompt Template**: Rewritten with comprehensive instructions that:
  - Emphasize product-only photography (no people, no hands, no body parts)
  - Instruct the AI to re-render the product naturally into the scene (matching lighting, shadows, reflections)
  - Cover all physical product categories (cosmetics, food, electronics, fashion accessories, home goods, supplements, etc.)
  - Include explicit negative prompts against people, compositing artifacts, and AI hallucinations

- **System Instructions**: Detailed specialist prompt covering:
  - Category-aware photography decisions (a perfume bottle needs different treatment than a protein bar)
  - Lighting matching rules per background type
  - Packaging text legibility requirements
  - Color accuracy mandates

- **Fixed Settings**: Unlock aspect ratio (remove `lock_aspect_ratio: true`) since product listings need both 1:1 (Amazon/eBay) and 4:5 (Instagram Shopping). Default remains 1:1.

- **UI Config**: Keep `skip_template: true` and `skip_mode: true` (this workflow doesn't need template or mode selection).

**2. Edge Function: Update prompt construction in `generate-workflow/index.ts`**

No structural changes needed -- the existing `buildVariationPrompt` function already handles the `variation_strategy` config dynamically. The new variations and prompt template will flow through automatically.

**3. Workflow Card: Update feature bullets in `WorkflowCard.tsx`**

Update the `featureMap['Product Listing Set']` array to reflect the new capabilities:
- "8 diverse scenes from white studio to lifestyle"
- "Category-aware lighting and composition"
- "No people -- pure product focus"
- "Optimized for Amazon, Shopify, and social commerce"

**4. Animation Data: Update `workflowAnimationData.tsx`**

Update the Product Listing Set animation elements to better showcase the variety:
- Add a "Scene" badge element showing "8 Backgrounds" to communicate the diversity
- Keep existing product element

**5. Preview Prompt: Update `generate-workflow-preview/index.ts`**

Update the Product Listing Set prompt in the `workflowPrompts` map to show a more compelling preview image that hints at multiple background types rather than just white studio.

---

### Technical Detail: New `generation_config` Structure

```text
prompt_template:
  "Professional product photography. Show ONLY the physical product 
   from [PRODUCT IMAGE] -- no people, no hands, no body parts. 
   Re-render the product naturally into the specified scene with 
   matching lighting, shadows, reflections, and perspective. 
   The product must look like it belongs in the environment, 
   not composited or pasted. Ultra high resolution."

system_instructions:
  "You are an expert e-commerce and commercial product photographer. 
   You specialize in photographing physical products across all 
   categories: cosmetics, food & beverage, electronics, fashion 
   accessories, home goods, supplements, jewelry, and more.
   
   Rules:
   - NEVER include people, hands, fingers, or body parts
   - Preserve 100% accurate packaging, labels, branding, colors
   - All text on packaging must be perfectly legible
   - Match lighting/shadows to the background environment
   - Product should fill 70-85% of the frame
   - Each background type has its own lighting logic:
     White studio = even diffused light, minimal shadows
     Marble/stone = soft directional light, subtle reflections
     Natural textures = warm side light, organic shadows
     Dark/moody = dramatic side or rim lighting
     Lifestyle = ambient environmental lighting with shallow DOF"

negative_prompt_additions:
  "people, hands, fingers, body parts, faces, human skin,
   compositing artifacts, cut-out edges, mismatched lighting,
   pasted look, floating product, AI artifacts, distorted text,
   blurry labels, watermarks, text overlays"

variation_strategy.type: "scene"
variation_strategy.variations: [8 items as described above]

fixed_settings:
  aspect_ratios: ["1:1"]
  quality: "standard"
  composition_rules: "Product fills 70-85% of frame. No text overlays. 
    Product must appear naturally placed, not floating or composited."

ui_config:
  skip_template: true
  skip_mode: true
  lock_aspect_ratio: false  (was true -- now unlocked)
```

### Files Changed
- **DB Migration**: Update `generation_config` JSONB for the Product Listing Set workflow row
- **Edit**: `src/components/app/WorkflowCard.tsx` -- update feature bullets
- **Edit**: `src/components/app/workflowAnimationData.tsx` -- update animation elements
- **Edit**: `supabase/functions/generate-workflow-preview/index.ts` -- update preview prompt

