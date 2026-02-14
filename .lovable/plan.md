

## Generate Pro-Quality Scene Preview Images with Showcase Products

### What This Does

Updates the 30 scene preview prompts to feature specific showcase products (as you specified), upgrades to the pro image model, and regenerates all preview thumbnails. The core generation workflow logic stays completely untouched.

### Changes

**1. Edge Function: `supabase/functions/generate-scene-previews/index.ts`**

Update the `scenePreviewPrompts` map only -- replace all 30 generic background-only prompts with product-specific showcase prompts using your master prompt template:

| Scene | Showcase Product | Prompt Approach |
|-------|-----------------|-----------------|
| Hero White | Luxury cognac leather handbag | Clean white studio, no visible lights |
| Soft Gray Infinity | Premium hyaluronic acid serum | Seamless gray sweep |
| Gradient Glow | Rose gold moisturizer set | White-to-blush gradient |
| Shadow Play | Designer crystal perfume | Hard directional shadows |
| Dark and Moody | Black leather bifold wallet | Dark charcoal, rim lighting |
| White Marble | Stainless steel automatic watch | Veined marble slab |
| Raw Concrete | Hex dumbbells and resistance bands | Industrial concrete surface |
| Warm Wood Grain | Ceramic tea set with bamboo tray | Natural oak surface |
| Linen and Fabric | Facial oil and cream duo | Soft draped linen |
| Terrazzo Stone | Wooden stacking toy blocks | Speckled terrazzo |
| Bathroom Shelf | Facial cleanser and toner | Styled bathroom shelf |
| Kitchen Counter | Stainless steel cookware with copper | Clean kitchen countertop |
| Vanity Table | Velvet jewelry organizer | Beauty vanity with mirror |
| Office Desk | Space gray premium laptop | Minimal workspace |
| Bedside Table | Navy silk sleep mask | Cozy bedroom nightstand |
| Botanical Garden | Copper watering can and pruning shears | Lush greenery |
| Water Splash | Electric blue energy drink can | Dynamic water droplets |
| Golden Hour | White and neon orange running shoes | Warm sunset lighting |
| Neon Accent | Matte black RGB gaming mouse | Dark scene with neon rim |
| Flat Lay Overhead | Complete skincare routine collection | Top-down styled arrangement |
| Floating Levitation | Designer perfume bottle | Suspended mid-air |
| Mirror Reflection | Black wool baseball cap | Reflective mirror surface |
| Monochrome Color Block | Shoe care kit | Olive-toned matte backdrop |
| Geometric Pedestal | Crystal perfume bottle | Stone cylinders and arches |
| Smoke and Mist | Charcoal hard-shell suitcase | Atmospheric fog |
| Hand-in-Shot | Gold chain bracelet | Hand presenting naturally |
| Still Life Composition | Premium hardcover book | Curated props arrangement |
| Content Pour-out | Hydrating face cream | Cream spilling from jar |
| Beach and Sand | Woven jute espadrille sandals | Natural sand, ocean light |
| Gift and Unboxing | Burgundy merino wool socks | Premium packaging, tissue paper |

Each prompt follows your master template:
"Ultra high-end commercial product photography of [PRODUCT], luxury brand campaign style, clean modern composition, premium minimal aesthetic, soft natural but controlled studio lighting..."

Additional function changes (structure stays the same):
- Upgrade model from `google/gemini-2.5-flash-image` to `google/gemini-3-pro-image-preview` for dramatically better quality
- Accept optional `force_regenerate` boolean parameter to skip the "already has preview" check
- Clear existing `preview_url` values when force regenerating

**2. UI: `src/pages/Generate.tsx`**

Add a small info note below the scene selection grid:
- Text: "Products shown are for demonstration only -- your product will be placed in each selected scene."
- Styled with an Info icon in muted text

Update the admin "Generate Scene Previews" button to pass `force_regenerate: true` so it always regenerates.

**3. Trigger Generation**

After deploying the updated edge function, call it with `force_regenerate: true` for the Product Listing Set workflow to generate all 30 new pro-quality showcase images. This will run in batches (the function saves progress after each image to handle timeouts).

### What Does NOT Change

- The core generation workflow logic (generate-workflow edge function)
- Credit pricing, angle selection, or any other workflow behavior
- The database schema or generation_config structure
- How the actual user product generation works

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/generate-scene-previews/index.ts` | Replace 30 prompts with product-showcase versions, upgrade model, add force_regenerate |
| `src/pages/Generate.tsx` | Add info note about showcase products, update admin button |
