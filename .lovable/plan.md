

## Add Workflow Scenes to Freestyle Scene Selector

### What we're doing
Adding 6 new scenes from the Workflows "Product Listing Set" into the freestyle `mockTryOnPoses` array, all under the `clean-studio` (Product Studio) category. Shadow Play already exists there.

### Scenes to add (all as `clean-studio`)

| Scene | Status | Notes |
|---|---|---|
| Shadow Play | Already exists (scene_019) | No change needed |
| Raw Concrete | New — add to mockData | Similar to "Concrete Slab" but different name/prompt |
| Warm Wood Grain | New — add to mockData | Similar to "Wooden Table" but different name/prompt |
| Linen & Fabric | New — add to mockData | Similar to "Linen Textile" but different name/prompt |
| Bathroom Shelf | New — add to mockData | Lifestyle bathroom context |
| Water Splash | New — add to mockData | Dynamic water photography |
| Floating Levitation | New — add to mockData | Zero-gravity surreal editorial |

### File changes

**`src/data/mockData.ts`**
1. Add 6 new image URL constants using `getLandingAssetUrl('scenes/scene-*.jpg')` for each new scene
2. Add 6 new entries to `mockTryOnPoses` array after the existing scenes, all with `category: 'clean-studio'`, using prompt hints from `generate-scene-previews/index.ts`

Scene IDs will continue from `scene_032` onward. Preview URLs will reference CDN assets (same pattern as existing scenes). The prompts will match what's already defined in the workflow edge function.

