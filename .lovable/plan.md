Not difficult — the wizard already has the admin gate (`useIsAdminSafe`) wired up on this screen, so it's a small additive change.

## What you'll see

On `/app/brand-scenes/new`, Step 6 (preview & pick), right next to the existing **Save to Brand Scenes** button, a second pill button appears **only for admins**:

- Label: **Save to Public Scenes**
- Visible only when `isAdmin === true`
- Disabled until a variation is selected (same rule as the brand button)
- On click: creates a `draft` row in the public `scene_recipes` library (the one that powers Visual Studio's scene picker), pre-filled from the wizard answers, then toasts "Sent to scene library — finish in /admin/scene-library"

Non-admin users see no change.

## What gets mapped into `scene_recipes`

From the wizard answers (`answers` already passed into Step 6) + the selected variation:

| scene_recipes column | Source |
|---|---|
| `name` | wizard scene name (e.g. "Coastal cliff") |
| `category` / `subcategory` | family / sub-family |
| `scene_type` | scene type |
| `background` | setting (e.g. "Coastal cliff") |
| `lighting`, `mood`, `composition`, `camera_feel`, `crop`, `styling_tone` | matching answer fields |
| `palette`, `props`, `premium_cues`, `avoid_terms`, `tags` | matching arrays (defaulted to `[]` if absent) |
| `preview_image_url` | selected variation's storage URL |
| `status` | `'draft'` (admin finalizes in /admin/scene-library) |
| `source_type` | `'brand_scene_wizard'` |

No Stripe/credits impact — the variation generation was already paid for above.

## Technical details

1. **`src/features/brand-scenes/api/brandSceneApi.ts`** — add `saveAsPublicScene({ answers, selectedUrl })`. It calls a new edge function `save-brand-scene-as-public` (server-side admin check + insert) and returns the new `scene_recipes.id`.
2. **New edge function `supabase/functions/save-brand-scene-as-public/index.ts`**:
   - Verifies JWT via `auth.getClaims`
   - Checks `has_role(uid, 'admin')` — returns 403 otherwise
   - Maps wizard payload → `scene_recipes` insert (service role)
   - Registered in `supabase/config.toml` (default `verify_jwt = true` is fine since we call `getClaims` ourselves; follow the project's existing edge-function pattern)
3. **`src/features/brand-scenes/wizard/steps/Step6PreviewAndPick.tsx`**:
   - Add `handleSaveAsPublic` next to existing `handleSave`
   - Render second `<Button variant="outline" size="pill">` inside `{isAdmin && ...}` wrapper, placed immediately after the Save to Brand Scenes button in the same flex row
   - Local `phase` extended with `"saving-public"` for spinner state
4. No RLS changes needed — the edge function uses service role and enforces admin via `has_role`.

Memory note: routes/DB keep `scene_recipes` naming; user-facing label stays "Public Scenes" (consistent with how the library is referenced in admin UI).
