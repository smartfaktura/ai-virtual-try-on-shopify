

# Fix: Stop Leaking Admin UUIDs via Public SELECT Policies

## Problem

Three tables expose the admin UUID to anonymous/unauthenticated users through permissive SELECT policies:
- `hidden_scenes` — `hidden_by` column
- `featured_items` — `featured_by` column  
- `custom_scenes` — `created_by` column

## Approach

Rather than creating views (which would require changing all client queries and losing typed access), the simplest fix is to drop the public/anon SELECT policies and replace them with column-restricted policies using security definer functions. However, Postgres RLS policies cannot restrict columns — they only filter rows.

The cleanest approach: **create views that exclude identity columns** for public/anon reads, and restrict base table reads to admins only (for writes they already are). Admin mutations continue hitting the base tables directly.

### Key observations from client code:
- `useHiddenScenes` SELECT only reads `scene_id` — view is a perfect fit
- `useFeaturedItems` SELECT reads `*` but only uses `item_type`, `item_id`, `sort_order`, `created_at` — view works
- `useCustomScenes` SELECT reads `*` but never uses `created_by` on the client — view works
- All INSERT/UPDATE/DELETE operations are admin-only and already gated by admin RLS — no change needed
- `PublicDiscover.tsx` reads `custom_scenes` for anon users — needs the view

## Changes

### 1. Database migration

```sql
-- 1a. hidden_scenes: replace anon/public SELECT with a view
DROP POLICY "Anon can read hidden scenes" ON hidden_scenes;
DROP POLICY "Anyone can read hidden scenes" ON hidden_scenes;

CREATE VIEW public.hidden_scene_ids AS
  SELECT scene_id FROM hidden_scenes;
GRANT SELECT ON public.hidden_scene_ids TO anon, authenticated;

-- 1b. featured_items: replace anon/public SELECT with a view
DROP POLICY "Anyone can view featured items publicly" ON featured_items;
DROP POLICY "Authenticated can view featured items" ON featured_items;

CREATE VIEW public.public_featured_items AS
  SELECT id, item_type, item_id, sort_order, created_at FROM featured_items;
GRANT SELECT ON public.public_featured_items TO anon, authenticated;

-- 1c. custom_scenes: replace anon/public SELECT with a view
DROP POLICY "Anyone can view active scenes publicly" ON custom_scenes;

CREATE VIEW public.public_custom_scenes AS
  SELECT id, name, description, category, image_url, optimized_image_url,
         prompt_hint, prompt_only, discover_categories, is_active, created_at
  FROM custom_scenes WHERE is_active = true;
GRANT SELECT ON public.public_custom_scenes TO anon, authenticated;

-- Add admin SELECT on base tables so admin mutations/reads still work
CREATE POLICY "Admins can read hidden scenes"
  ON hidden_scenes FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can read featured items"
  ON featured_items FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can read custom scenes"
  ON custom_scenes FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
```

### 2. Client code updates

| File | Change |
|---|---|
| `src/hooks/useHiddenScenes.ts` | SELECT query → `hidden_scene_ids` view; mutations stay on `hidden_scenes` (admin-only) |
| `src/hooks/useFeaturedItems.ts` | SELECT query → `public_featured_items` view; mutations stay on `featured_items` |
| `src/hooks/useCustomScenes.ts` | SELECT query → `public_custom_scenes` view; mutations stay on `custom_scenes` |
| `src/pages/PublicDiscover.tsx` | SELECT query → `public_custom_scenes` view |
| `src/hooks/useLibraryItems.ts` | SELECT on `custom_scenes` → `public_custom_scenes` (only reads `id, name, image_url`) |
| `src/components/app/AddToDiscoverModal.tsx` | SELECT on `custom_scenes` → `public_custom_scenes` |

Admin write operations (INSERT/UPDATE/DELETE) continue to use the base tables — those are already restricted to admin role.

| # | Action | Detail |
|---|---|---|
| 1 | Database migration | Drop public SELECT policies, create restricted views, add admin-only SELECT policies on base tables |
| 2 | Update 6 client files | Point SELECT queries at views; keep mutations on base tables |

