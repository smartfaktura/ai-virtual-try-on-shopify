

## Fix: clicking "star" on Clothing (or any sub-family) tab actually pins to that sub-family's Featured (0/12) panel

### Root cause

Your screenshot shows `Fashion & Apparel · Featured (0/12)` even after starring 5 cards under the **Clothing** sub-family tab. The DB confirms it: `recommended_scenes` has rows for family-level keys (`fashion`, `jewelry`, …) and `null` (Global) — **zero rows for any sub-family slug** (`garments`, `clothing`, `hoodies`, etc.).

The page has **two stars on each card** with overlapping meaning:

| Star | Action | What it actually writes |
|---|---|---|
| **Top-left (large, prominent)** — what users click | `toggle_scene_featured` RPC | Sets `product_image_scenes.sort_order` to a small negative number. **Family-wide. Ignores the active sub-family tab.** |
| **Top-right (tiny, only visible after add)** | `addMutation` → `INSERT INTO recommended_scenes` | Correctly writes a row scoped to `category = dbCategory` (the active sub-family slug). |

Users naturally click the big top-left star, expecting it to add to the visible "Featured (0/12)" panel — but that star calls the wrong mutation, so the panel never updates.

The "All Fashion" and "Global" tabs **appear** to work because both stars happen to align there: at the family level, the user has previously populated those rows, and `toggle_scene_featured` also re-sorts cards visually so it looks like the click "did something".

### The fix

Collapse the two stars into **one prominent star per card** whose behaviour is **scoped by the active tab**:

```text
Active tab          | Star click =
--------------------|--------------------------------------------------
Global              | INSERT recommended_scenes (category = NULL)
Family (e.g. Fashion) | INSERT recommended_scenes (category = 'fashion')
Sub-family (Clothing) | INSERT recommended_scenes (category = 'garments')
```

Clicking again while the scene is already in that scope removes it (existing `removeMutation`).

This means:
1. The "Featured (N/12)" panel at the top of the page becomes the single source of truth for what the active scope curates.
2. Sub-family panels (Clothing, Hoodies, Dresses…) finally get populated when admins click stars while on those tabs.
3. The user-facing `useRecommendedScenes` hook (which already runs PASS 1 = sub-categories, PASS 2 = families, PASS 3 = global) immediately surfaces the new sub-family curation.

### What changes in the file

**`src/pages/AdminRecommendedScenes.tsx`** — single file, surgical edit:

1. **Remove the `toggleFeaturedMutation` star button** (top-left, lines ~712–730). Keep the RPC import — admins can still pin globally via other UIs if needed, but it doesn't belong on a per-scope curation page where it confuses the model.

2. **Promote the "in recommended" indicator to the prominent top-left position** and merge it with the click target. The single star now:
   - Filled gold/primary when the scene is in the active scope's `recommended_scenes` (i.e. `recommendedMap.has(scene.scene_id)`).
   - Outlined when not.
   - On click → `addMutation` if not in scope, `removeMutation` if in scope. (These already correctly use `dbCategory`.)

3. **Replace the now-redundant whole-card click** (lines 683–710) with a non-toggling click area (just opens preview / does nothing). The star is the only mutation control.

4. **Header copy clarification** under "Featured (N/12)":
   - Sub-family active: `Curating Clothing scenes — shown first to users who picked Clothing in onboarding.`
   - Family active: `Curating Fashion & Apparel scenes — shown to all Fashion users when no sub-family curation exists.`
   - Global: `Curating Global scenes — shown to everyone as final fallback.`

5. **Optional polish** — the `subCounts` query already runs and shows the count next to each sub-pill. Keep it; it'll start showing real numbers once stars actually persist.

### What does **not** change

- DB schema, RLS, the `toggle_scene_featured` RPC itself.
- `useRecommendedScenes` (already correctly does sub→family→global cascade).
- `recommended_scenes` table contents — existing family-level + Global rows stay intact.
- The card grid layout, filters, search, or interleave/grouped views.

### Validation

1. Go to `/app/admin/recommended-scenes` → **Fashion & Apparel** → **Clothing** tab.
2. Click the star on 5 cards. The header counter ticks up to **Featured (5/12)** in real time.
3. The featured strip at the top renders those 5 scenes immediately.
4. The "Clothing (N)" pill in the sub-strip shows **5**.
5. DB check: `SELECT * FROM recommended_scenes WHERE category = 'garments'` returns 5 rows.
6. As a user with `'garments'` in `profiles.product_subcategories`, refresh the app: the workflow rail now shows those 5 scenes first (PASS 1 hit in `useRecommendedScenes`).
7. Click the star again on one card → it disappears from the strip; counter drops to 4.
8. Switch to **Hoodies** sub-tab → "Featured (0/12)", independent of Clothing. Star a different card → only Hoodies featured grows.
9. Switch to **All Fashion** → existing 12 family-level featured scenes still show, untouched.

