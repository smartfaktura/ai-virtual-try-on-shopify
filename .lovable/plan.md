

## Freestyle Scene URL Audit

### How scenes work
When a user selects a scene in Freestyle, the scene's `previewUrl` is sent to the backend edge function as a reference image. The AI provider (Google) must be able to **fetch** this URL. That means it must be an absolute, publicly accessible `https://` URL.

### URL sources used by scenes

| Source | Pattern | Publicly accessible? |
|--------|---------|---------------------|
| `getLandingAssetUrl(...)` | `https://{supabase}/storage/v1/object/public/landing-assets/...` | Yes |
| `WORKFLOW_PREVIEW_BASE/...` | `https://{supabase}/storage/v1/object/public/workflow-previews/...` | Yes |
| Relative path (`/images/...`) | Resolves to preview/published domain | No (AI provider cannot fetch) |

### Results

**BAD — will cause generation failure:**
- **White Studio** (`scene_038`): uses `'/images/hero/hero-hp-white.png'` — a relative path. This is the only broken scene.

**GOOD — all other scenes (30+):** Every other scene uses either `getLandingAssetUrl()` or an absolute Supabase storage URL. These are all publicly fetchable and will work correctly.

### The fix (from approved but not yet fully applied plan)

1. **`src/data/mockData.ts`**: Change `sceneWhiteStudio` from the relative path to a Supabase storage public URL (upload the image to `landing-assets/scenes/scene-white-studio.jpg` or similar)
2. **`src/pages/Freestyle.tsx`**: Remove the `window.location.origin` workaround (it produces preview-domain URLs that are also inaccessible to AI providers)
3. **`supabase/functions/generate-freestyle/index.ts`**: Add a safety guard — if a scene URL is not `https://`, log a warning and skip it instead of failing the entire job

### Summary
Only 1 scene out of ~35 is broken: **White Studio**. The root cause is a relative URL that can't be fetched by external AI services. All other scenes use proper absolute Supabase storage URLs and work fine.

