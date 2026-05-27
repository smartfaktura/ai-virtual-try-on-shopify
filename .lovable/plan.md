## Problem

The new "Indoor Portrait" scene was saved successfully to `product_image_scenes` (verified in DB: `supplements-wellness → Editorial Wellness Routine`, active, owner_user_id=NULL). The reason it doesn't show in `/app/generate/product-images` is **stale React Query cache**.

`useProductImageScenes` uses `staleTime: 5 * 60_000` on three query keys (`product-image-scenes`, `…-priority`, `…-rest`). `SaveToPublicScenesDialog` calls the edge function, shows a toast, closes — but never invalidates those keys. So the picker continues to render the previously cached list until the user hard-reloads or 5 minutes elapse.

## Fix (single small change)

**`src/features/brand-scenes/wizard/components/SaveToPublicScenesDialog.tsx`** — after `saveBrandSceneAsPublicScene` resolves successfully, invalidate the three scene query keys so any open product-images wizard refetches on next focus / render.

- Import `useQueryClient` from `@tanstack/react-query`.
- Inside `handleSubmit`, on success and before the toast, call:
  - `queryClient.invalidateQueries({ queryKey: ['product-image-scenes'] })`
  - `queryClient.invalidateQueries({ queryKey: ['product-image-scenes-priority'] })`
  - `queryClient.invalidateQueries({ queryKey: ['product-image-scenes-rest'] })`
- Also invalidate `['public-scene-buckets']` so the dialog's own category/sub-category dropdowns pick up the newly created sub-category on the next open.

That's the entire change. Pure client-side, no schema/RLS/edge changes.

## Why nothing else needs changing

- The Vanity Nook dedupe + stable sort + admin payload fix from the previous turn are still in place and unrelated.
- The scene already saves with correct `category_collection`, `sub_category`, `is_active=true`, `owner_user_id=NULL`, `trigger_blocks`, `description`, `use_scene_reference=true` — verified.
- RLS `Auth read scenes` policy permits it for any authenticated user.

## Verification after build

1. Open Brand Scene wizard, save a test scene to public scenes under any existing sub-category.
2. Without reloading, navigate to `/app/generate/product-images` and open that category — the new scene should appear immediately.
3. Re-open `SaveToPublicScenesDialog` — the sub-category dropdown should include any new sub-category created in step 1.

## Out of scope

- No backfill needed; the Indoor Portrait scene will appear as soon as the user hard-reloads `/app/generate/product-images` once.
- No changes to the edge function, RLS, schema, or admin scene admin page.