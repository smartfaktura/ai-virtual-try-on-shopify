

## Regenerate 4 Scene Previews + Grid Layout + Image Optimization

### 1. Update Prompts for 4 Scenes

Update the edge function prompts for these 4 scenes to emphasize the dynamic elements more prominently:

| Scene | Updated Prompt Focus |
|-------|---------------------|
| **Water Splash** | Energy drink can with dramatic water splashes and droplets filling the entire frame, water erupting around and behind the product, editorial water photography |
| **Neon Accent** | Gaming mouse with vivid neon cyan and magenta light rays, glowing neon streaks on background and reflecting off the product surface, full neon atmosphere |
| **Beach & Sand** | Espadrille sandals placed directly on natural beach sand with ocean waves lapping nearby, shells, warm coastal light |
| **Gift & Unboxing** | Burgundy wool socks mid-unbox from a premium gift box with tissue paper, ribbon, and wrapping details visible |

**File:** `supabase/functions/generate-scene-previews/index.ts` -- update 4 prompt strings only.

### 2. Change Grid from 5 to 4 Columns

Update the scene cards grid from `lg:grid-cols-5` to `lg:grid-cols-4` for better visibility of each scene preview.

**File:** `src/pages/Generate.tsx` line 1459 -- change `lg:grid-cols-5` to `lg:grid-cols-4`.

### 3. Optimize Scene Preview Images for Faster Loading

Apply the existing `getOptimizedUrl` utility to scene preview thumbnails so they load as compressed versions instead of full-resolution originals.

**File:** `src/pages/Generate.tsx` line 1489 -- wrap `v.preview_url` with `getOptimizedUrl(v.preview_url, { width: 400, quality: 60 })`.

### 4. Trigger Regeneration

After deploying the updated edge function, call it to regenerate only the 4 updated scenes (Water Splash, Neon Accent, Beach & Sand, Gift & Unboxing) by temporarily clearing their `preview_url` values and invoking the function.

### Technical Details

- Grid change: single class name update on line 1459
- Image optimization: wrap one `src` attribute with `getOptimizedUrl()` (already imported)
- Edge function: update 4 prompt strings to emphasize environmental effects (water/neon/sand/unboxing) surrounding the product
- Regeneration: clear the 4 specific `preview_url` values via SQL, then call the edge function which will skip scenes that already have previews

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/generate-scene-previews/index.ts` | Update 4 scene prompts |
| `src/pages/Generate.tsx` | Grid cols 5 to 4, add `getOptimizedUrl` to preview images |

