## What I found

`/product-visual-library` uses `src/hooks/usePublicSceneLibrary.ts`, not the Product Images picker hook we already patched.

That hook currently queries active `product_image_scenes` with only:

```text
is_active = true
category_collection != bundle
```

It does not explicitly exclude user-owned Brand Scenes. The database currently has active user-owned Brand Scenes in `activewear`, including `GHA Lobby Image` and `TEST`, so they can appear on the public Visual Library if the request is authenticated or if any permissive path/cache returns them.

## Safe fix

1. Update `src/hooks/usePublicSceneLibrary.ts`
   - Add `owner_user_id` and `is_brand_scene` to the selected columns
   - Add database filters:
     - `owner_user_id IS NULL`
     - `is_brand_scene = false`
   - Add a defensive client-side filter before returning scenes, so private Brand Scenes are hidden even if a cached or unexpected payload includes them

2. Keep the public page public
   - Do not add auth requirements
   - Do not show any user-owned Brand Scenes on `/product-visual-library`
   - Keep only global/public catalog scenes there

3. Keep user Brand Scenes working elsewhere
   - Do not change `/app/brand-scenes`
   - Do not change the user-facing Product Images picker fix already made
   - Do not change admin scene management

4. Optional hardening after the frontend fix
   - Add a dedicated public database function/view for the Visual Library that only returns global non-brand scenes, then point this hook to it
   - This is safer long-term, but the smallest immediate fix is the hook-level query + filter above

## Files to change

- `src/hooks/usePublicSceneLibrary.ts` only

## Why this is safe

- It only narrows public Visual Library results
- It does not touch RLS, migrations, admin tools, or saved Brand Scenes
- It prevents another user’s Brand Scenes from rendering on the public marketing/library page