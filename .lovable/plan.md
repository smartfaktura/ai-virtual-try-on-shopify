
The user is on mobile (440px viewport) at the Admin Scenes page. The empty preview slot shows a tiny broken-image icon — the `<img>` tag is rendering but the image fails to load (or src is empty).

Let me check the relevant component.
<lov-tool-use id="toolu_vrtx_01S6YGy8NX3zoYUdhDK8ouS1" name="code--search_files" integration-id="code" data="{\"query\": \"preview_image_url\", \"include_patterns\": \"src/**/*.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_016uWUM3315FEdwuqkjpsURK" name="code--search_files" integration-id="code" data="{\"query\": \"Front View Flat Lay|ESSENTIAL SHOTS|Cat order\", \"include_patterns\": \"src/**/*.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_0127cwgXX6TFQz2Cfk1VPiyu" name="code--search_files" integration-id="code" data="{\"query\": \"Cat order|Triggers:\", \"include_patterns\": \"src/**/*.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01QHubW5aFKHYwZLK9SyQigX" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/AdminProductImageScenes.tsx\", \"lines\": \"560-650\"}">
</lov-tool-use>
The screenshot shows broken image icons (the "?" placeholder) for scene previews on mobile. The code renders `<img src={scene.preview_image_url} />` directly. The image URLs likely fail to load on mobile (CORS/referrer/network), or `preview_image_url` is set but pointing to a URL that needs proxying/auth.

Let me check screenshot more carefully — first row shows the broken-image "?" icon (image attempted to load but failed). Second row shows the camera placeholder (no preview_image_url). So some scenes have a URL that fails to load on mobile.

<lov-plan>
**Issue:** On mobile admin scene list, scene preview images show broken-image icons (the "?" placeholder) for scenes that have a `preview_image_url`. Scenes without a URL show the camera placeholder correctly.

**Root cause hypothesis:**
The `<img>` in `SceneRow` (`src/pages/AdminProductImageScenes.tsx` line 605–610) loads `scene.preview_image_url` directly with no error handling, no `loading`/`referrerPolicy` attributes, and no proxy. On mobile Safari/Chrome, several known issues commonly trigger broken images here:
1. The URL is a Supabase Storage signed URL that has expired (admin overrides stored as signed URLs instead of public URLs).
2. The URL points to an external host that blocks hot-linking with strict referrer (mobile browsers send `Referer` differently than desktop, especially in private/iOS).
3. Mixed content or HTTPS cert issue on iOS.

Without `onError` handling, a failed load just shows the broken-image glyph instead of falling back to the camera icon.

**Plan (small, surgical fix in `src/pages/AdminProductImageScenes.tsx`):**

1. Add an `imgError` state in `SceneRow`. Render the `<img>` only if `preview_image_url && !imgError`; otherwise render the `Camera` placeholder. This gives a clean fallback on mobile when the image fails for any reason.
2. Add `referrerPolicy="no-referrer"` and `loading="lazy"` on the `<img>` to fix hot-link blocks and reduce mobile network pressure.
3. Route the preview through the existing `image-proxy` edge function (same approach used in `mobileImageSave.ts`) so external/signed URLs load reliably on mobile:
   ```
   src = `${VITE_SUPABASE_URL}/functions/v1/image-proxy?url=${encodeURIComponent(scene.preview_image_url)}`
   ```
   Use the proxy only for non-Supabase Storage URLs (keep public Supabase URLs direct since they already work).
4. Apply the same fix to the bigger drawer/grid thumbnails in `AdminSceneLibrary.tsx` (`recipe.preview_image_url` img tags) for consistency on mobile.

**Files to edit:**
- `src/pages/AdminProductImageScenes.tsx` — `SceneRow` thumbnail block (lines ~604–611) + add tiny inner `<SceneThumb>` component or inline state.
- `src/pages/AdminSceneLibrary.tsx` — same `<img>` hardening for grid/list/drawer previews.

**Result:** On mobile, scene admin previews either load via the image proxy (no more hot-link/referrer/CORS failures) or fall back gracefully to the camera placeholder instead of showing a broken-image "?" glyph.
