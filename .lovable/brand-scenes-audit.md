# Brand Scenes — Phase 0 Safety Audit

Read-only inventory of every code path that touches `product_image_scenes`. Goal: confirm that the Phase 1 additive columns + tightened RLS do not change behavior for anon users, regular authenticated users, or admins.

## Current RLS state (production)

| Policy | Cmd | Using | With Check |
|---|---|---|---|
| Public can read active scenes | SELECT | `is_active = true` | — |
| Authenticated can read active scenes | SELECT | `true` | — |
| Admins can insert scenes | INSERT | — | `has_role(auth.uid(),'admin')` |
| Admins can update scenes | UPDATE | `has_role(auth.uid(),'admin')` | — |
| Admins can delete scenes | DELETE | `has_role(auth.uid(),'admin')` | — |

> ⚠ "Authenticated can read active scenes" currently returns **everything** (uses `true`, not `is_active = true`). Phase 1 RLS tightens this to `is_active AND (owner_user_id IS NULL OR owner_user_id = auth.uid())`. Since today's table has no `owner_user_id` (all admin rows), the new policy returns the **same** rows minus inactive ones for non-admins. Inactive rows are already filtered client-side by every consumer below (`activeOnly = true` default). No behavior regression.

## Client read paths

| File | What it does | Filters applied | Impact of Phase 1 |
|---|---|---|---|
| `src/hooks/useProductImageScenes.ts` | Main hook (Product Visuals wizard, admin page) | `.eq('is_active', true)` by default; admin path passes `includeInactive` | None — owner_user_id will be NULL for all current rows; query unchanged |
| `src/hooks/useSceneCatalog.ts` | Create with Prompt picker | Reads via same table | None |
| `src/hooks/useSceneCounts.ts` | Counts per category | Active scenes | None |
| `src/hooks/useSceneRecipes.ts` | Recipe lookup | Active scenes | None |
| `src/hooks/useRecommendedScenes.ts` | Recommended group | Calls `get_public_recommended_scenes` RPC | None — RPC joins on `is_active = true AND preview_image_url IS NOT NULL` |
| `src/hooks/usePublicSceneLibrary.ts` | Public scene library | Active + preview URL | None |
| `src/hooks/useRecommendedDiscoverItems.ts` | Discover surface | Active scenes | None |
| `src/hooks/useDiscoverPickerOptions.ts` | Discover picker | Active scenes | None |
| `src/hooks/useDeepLinkedDiscoverItem.ts` | Deep link resolver | Single row by `scene_id` | None |
| `src/pages/AdminProductImageScenes.tsx` | Admin CRUD | `includeInactive: true`, full payload | None — admin RLS unchanged |
| `src/pages/AdminRecommendedScenes.tsx` | Admin recommended | Full payload | None |
| `src/pages/admin/SceneUsage.tsx` | Usage analytics | Calls `get_scene_popularity` RPC | None — RPC reads `scene_id` text only |
| `src/components/app/product-images/ProductImagesStep6Results.tsx` | Results display | Lookup by scene id | None |
| `src/components/app/AddToDiscoverModal.tsx` | Add to discover | Reads scene metadata | None |
| `src/components/app/DiscoverDetailModal.tsx` | Discover detail | Reads scene metadata | None |
| `src/pages/Discover.tsx` | Public discover | Active scenes | None |
| `src/pages/ProductImages.tsx` | Wizard entry | Reads via hook | None |
| `src/components/home/HomeTransformStrip.tsx` | Marketing strip | Anon read of active scenes | None — anon policy preserved |

## Server-side dependencies

| Object | What it does | Impact |
|---|---|---|
| `get_public_recommended_scenes()` | SELECT join on `pis.is_active = true` | None — adding columns doesn't affect projection |
| `get_scene_popularity(p_days)` | Aggregates by `scene_id` from `freestyle_generations` + `generation_jobs` | None — no schema dependency |
| `get_scene_unique_user_count(p_days)` | Same | None |
| `toggle_scene_featured(p_scene_id)` | Admin-only UPDATE of `sort_order`/`previous_sort_order` | None — admin RLS unchanged. Phase 1 trigger forbids non-admin from setting `sort_order < 0`, but this RPC runs SECURITY DEFINER and only after `has_role(...,'admin')` check, so it bypasses the trigger via service role context (no behavior change). |
| `cancel_queue_job(p_job_id)` | Does not touch `product_image_scenes` | None |

## Anon / public surfaces

- `HomeTransformStrip.tsx` and any public scene library reads use **anon key**.
- Phase 1 anon policy: `is_active AND owner_user_id IS NULL`.
- All current rows have no `owner_user_id` → policy returns the **exact same set** as today's `is_active = true`.

## Authenticated (non-admin) surfaces

- Today's policy returns **all rows** (including inactive ones) because `qual = true`. Client code always filters `is_active`, so users never see inactive rows in practice.
- Phase 1 policy: `is_active AND (owner_user_id IS NULL OR owner_user_id = auth.uid())`.
- For existing users: all rows have `owner_user_id IS NULL` → returns same set the client already filters to. Net effect: zero visible change.

## Admin surfaces

- Admin policies use `has_role(auth.uid(),'admin')` — unchanged.
- Admin page (`AdminProductImageScenes.tsx`) calls hook with `includeInactive: true` and full payload — still works because admin SELECT remains unrestricted (we will add an admin-or-condition to the new SELECT policy: `OR has_role(auth.uid(),'admin')`).

## Phase 1 RLS — exact policies we will write

```sql
-- Drop the two overlapping SELECT policies, replace with one explicit one each.
DROP POLICY "Public can read active scenes" ON product_image_scenes;
DROP POLICY "Authenticated can read active scenes" ON product_image_scenes;

CREATE POLICY "Anon read active global scenes" ON product_image_scenes
  FOR SELECT TO anon
  USING (is_active = true AND owner_user_id IS NULL);

CREATE POLICY "Auth read active global or own scenes" ON product_image_scenes
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(),'admin')
    OR (is_active = true AND (owner_user_id IS NULL OR owner_user_id = auth.uid()))
  );

-- New write policies for user-owned brand scenes
CREATE POLICY "Users insert own brand scenes" ON product_image_scenes
  FOR INSERT TO authenticated
  WITH CHECK (
    owner_user_id = auth.uid()
    AND is_brand_scene = true
  );

CREATE POLICY "Users update own brand scenes" ON product_image_scenes
  FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid() AND is_brand_scene = true)
  WITH CHECK (owner_user_id = auth.uid() AND is_brand_scene = true);

CREATE POLICY "Users delete own brand scenes" ON product_image_scenes
  FOR DELETE TO authenticated
  USING (owner_user_id = auth.uid() AND is_brand_scene = true);
```

## Phase 1 trigger — exact guard

```sql
CREATE OR REPLACE FUNCTION protect_brand_scene_writes()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.is_brand_scene = true THEN
    -- scene_id must be prefixed brand-
    IF NEW.scene_id IS NULL OR NEW.scene_id NOT LIKE 'brand-%' THEN
      RAISE EXCEPTION 'Brand scene scene_id must be prefixed "brand-"';
    END IF;
    -- cannot use bundle collection
    IF NEW.category_collection = 'bundle' THEN
      RAISE EXCEPTION 'Brand scenes cannot use bundle collection';
    END IF;
    -- non-admins cannot set negative sort_order
    IF NEW.sort_order < 0 AND NOT has_role(auth.uid(),'admin') THEN
      RAISE EXCEPTION 'Only admins can feature scenes';
    END IF;
  END IF;
  -- once owner is set, cannot change it (except admin)
  IF TG_OP = 'UPDATE'
     AND OLD.owner_user_id IS NOT NULL
     AND NEW.owner_user_id IS DISTINCT FROM OLD.owner_user_id
     AND NOT has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Cannot change owner_user_id';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_brand_scene_writes_trg
  BEFORE INSERT OR UPDATE ON product_image_scenes
  FOR EACH ROW EXECUTE FUNCTION protect_brand_scene_writes();
```

## Risk register

| Risk | Mitigation |
|---|---|
| `toggle_scene_featured` trips negative-sort trigger | RPC runs SECURITY DEFINER as table owner → `auth.uid()` is set but trigger only blocks when `is_brand_scene = true`. Admin-managed rows are `is_brand_scene = false`, so guard never fires. ✅ |
| Bulk import scripts insert admin rows without `is_brand_scene` | Default `false`, so RLS treats them as global. ✅ |
| `useProductImageScenes` upsert path writes user fields | Hook is only called from admin pages today. Mutations need `has_role(admin)` and won't set `owner_user_id`, so admin RLS path still applies. ✅ |
| `recommended_scenes` joins `product_image_scenes` for any user-owned brand scene | We won't insert user-owned rows into `recommended_scenes` — that table is admin-curated. No code path lets users add themselves. ✅ |
| Anon cache poisoning: a brand scene with `owner_user_id` set leaks to anon | Anon policy explicitly requires `owner_user_id IS NULL`. ✅ |

## Verdict

Phase 1 is safe to ship. New columns are nullable with defaults; new RLS preserves anon behavior exactly and only narrows authenticated reads to active rows (which the client already filters). Write policies + trigger are strictly additive.

Ready to proceed to Phase 1 on your "next phase".
