

# Deep Audit: Creative Drops Settings Pipeline

## What Works Correctly
- **Theme & theme_notes** → passed from schedule → `trigger-creative-drop` → `generate-workflow` → injected into prompt as `SEASONAL DIRECTION` or `CREATIVE DIRECTION` block ✓
- **Brand profile** → fully resolved from DB with all fields (tone, lighting, colors, etc.) → passed to `generate-workflow` → injected as `BRAND GUIDELINES` block in prompt ✓
- **Aspect ratio** → passed from `scene_config.aspect_ratio` ✓
- **Selected variations** → variation indices forwarded, `generate-workflow` picks correct scenes ✓
- **Custom settings / mapped_settings** → spread into payload, covers interior design fields (room_type, wall_color, flooring, etc.) ✓
- **Model** → name + imageUrl forwarded for try-on workflows ✓

## Bug: 4 Wizard Settings Are Silently Dropped

The wizard saves these to `scene_config[workflowId]`, but `trigger-creative-drop` never reads or forwards them to the job payload:

| Wizard Field | Expected Payload Key | Effect if Missing |
|---|---|---|
| `flat_lay_prop_style` | `prop_style` | Flat Lay workflow ignores user's "clean" vs "decorated" choice — defaults to `clean` always |
| `styling_notes` | `styling_notes` | User's custom styling notes for flat lay are lost |
| `product_angle` | `product_angles` | Multi-angle generation (front-side, front-back, all) ignored — always generates front-only |
| `selected_framings` | Not consumed by `generate-workflow` directly | Framings (close-up, wide, etc.) have no effect on creative drops |

### Impact
- **Flat Lay** drops will always be "clean" style with no props, regardless of user selection
- **Product angle** drops will always be front-only, even if user selected "all angles"
- **Styling notes** are completely lost
- **Framings** — this is actually not supported by `generate-workflow` at all (it's a freestyle-only concept), so this is a UI/expectation mismatch rather than a code bug

## Fix

### File: `supabase/functions/trigger-creative-drop/index.ts` (~lines 224-236)

Add the missing fields from `wfSceneConfig` to the job payload:

```ts
const payload = {
  workflow_id: wfId,
  product_id: productId,
  product: productObject,
  imageCount: actualImageCount,
  quality: "standard",
  aspectRatio,
  selected_variations: variationIndices.length > 0 ? variationIndices : undefined,
  brand_profile: brandProfile,
  theme: schedule.theme || undefined,
  theme_notes: schedule.theme_notes || undefined,
  // --- ADD THESE 3 LINES ---
  prop_style: wfSceneConfig.flat_lay_prop_style || undefined,
  styling_notes: wfSceneConfig.styling_notes || undefined,
  product_angles: wfSceneConfig.product_angle || undefined,
  // --- END ---
  ...mappedSettings,
};
```

That's it — 3 lines added. `generate-workflow` already reads `body.prop_style`, `body.styling_notes`, and `body.product_angles` correctly. The data just wasn't being forwarded from the schedule.

## No Other Issues Found
- `generate-workflow` correctly consumes all payload fields including theme, brand_profile, variations, model, mapped_settings
- `generate-tryon` correctly forwards `creative_drop_id` for completion tracking
- The prompt template system correctly injects seasonal themes, brand guidelines, and variation instructions
- Custom themes with `theme_notes` produce a `CREATIVE DIRECTION` block in the prompt

## Summary
- 1 file, 3 lines added
- Fixes 3 silently-dropped settings (prop style, styling notes, product angles)
- All other settings (theme, brand, variations, models, aspect ratio, interior design fields) flow correctly end-to-end

