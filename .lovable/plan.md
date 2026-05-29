## Why you see TEST and GHA Lobby

`info@tsimkus.lt` is an **admin** user. The RLS policy `Auth read scenes` on `product_image_scenes` lets admins read every row — including other users' brand scenes. The hook that powers the "Brand Scenes" group in Step 2 (`useUserBrandScenes` in `src/hooks/useSceneCatalog.ts`, lines 160–190) filters by `is_brand_scene = true` and category, but **does not filter by `owner_user_id = auth.uid()`**. It relies on RLS to do that — which silently breaks for admins.

Result: as admin, your "Brand Scenes" row in the activewear category shows every other user's brand scenes too (TEST belongs to `lanny@activelyblack.com`, GHA Lobby Image belongs to `g.harmonyactive@gmail.com`).

## Fix (one-line, UI only)

In `src/hooks/useUserBrandScenes`, explicitly scope the query to the current user:

```ts
const { data: { user } } = await supabase.auth.getUser();
if (!user) return [];

let q = supabase
  .from('product_image_scenes')
  .select(SLIM_COLUMNS)
  .eq('is_active', true)
  .eq('is_brand_scene', true)
  .eq('owner_user_id', user.id)   // <-- add this
  .order('created_at', { ascending: false })
  .limit(24);
```

Also include the user id in the React Query key so admin/user switches don't share a cache:
`queryKey: ['user-brand-scenes', user.id, family ?? null, categoryCollection ?? null]`

No DB / RLS / backend changes needed. Other users are already correctly isolated by RLS — this fix only stops admins from accidentally seeing every brand scene in their own picker.

## Files changed
- `src/hooks/useSceneCatalog.ts` — add `owner_user_id` filter and userId in query key inside `useUserBrandScenes`.
