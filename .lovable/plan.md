

# Give scene-type Discover items full metadata editing

## What changes

**File: `src/components/app/DiscoverDetailModal.tsx`**

Currently, when a scene appears in Discover and an admin opens it, the editor hides 4 fields: Workflow, Model, Scene, and Product (all wrapped in `{!isScene && ...}`). This means you can only edit category and prompt hint for scenes.

### Changes

1. **Remove the `{!isScene && ...}` guards** from the Workflow selector (line 296), Model selector (line 309), Scene selector (line 327), Product picker (line 364), and Prompt textarea (line 346). All fields will now appear for every item type.

2. **Update the save handler for custom scenes** (line 463 branch): Instead of only updating `custom_scenes` with category/description, also **upsert into `discover_presets`** with the full metadata (workflow, model, scene, product, prompt, category). This "promotes" the scene to a full discover preset entry, giving it parity with any other preset.

   The upsert will use the scene's name as title, scene image as image_url, and store all the admin-selected workflow/model/scene/product data. A stable ID strategy (e.g., using `custom-{scene_id}` as a convention or generating a new UUID) will be used.

3. **For built-in (mock) scenes**: Same approach — show all fields and on save, upsert a `discover_presets` row. The built-in scene restriction ("read-only") will be removed since the admin is creating/editing a *Discover preset entry*, not modifying the scene definition itself.

4. **After save**: Invalidate both `discover-presets` and `custom-scenes` query caches. The scene item may now appear as a preset in the feed (or both — we can deduplicate by checking if a preset already exists for that scene).

5. **Deduplication**: In `Discover.tsx` and `PublicDiscover.tsx`, when building `allItems`, skip scene items that already have a corresponding `discover_presets` row (matched by title or a stored `source_scene_id`). This prevents duplicates after promotion.

### Technical detail

The save flow for scene items becomes:
```
Admin fills all fields → Save →
  1. If custom scene: update custom_scenes (category, prompt_hint)
  2. Upsert discover_presets with:
     - title = scene name
     - image_url = scene image
     - category, prompt, model_name, model_image_url,
       scene_name, scene_image_url, workflow_slug, workflow_name,
       product_name, product_image_url, aspect_ratio
  3. Invalidate both query caches
  4. Toast success
```

This means once an admin saves metadata on a scene item, it becomes a full discover preset and behaves identically to any other preset going forward.

