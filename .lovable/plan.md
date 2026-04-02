

# Fix Admin Scene Preview Upload

## Problem 1: Storage RLS Policy Violation
The `product-uploads` bucket requires paths to start with `{user_id}/` (enforced by RLS). But `handlePreviewUpload` uploads to `scene-previews/{timestamp}-{randomId}.{ext}` — no user ID prefix, so the INSERT is rejected.

**Fix in `src/pages/AdminScenes.tsx` (line 752):**
Change the upload path from:
```
scene-previews/${timestamp}-${randomId}.${ext}
```
to:
```
${user.id}/scene-previews/${timestamp}-${randomId}.${ext}
```
This requires passing the user ID into the SceneRow component. Add `userId: string` to `SceneRowProps`, thread it from the parent (which already has `useAuth`), and use it in the path.

## Problem 2: No Visible UI Buttons for Preview Upload
The current UI only shows an upload overlay on hover over the tiny 40×48px thumbnail — easy to miss. Add an explicit small button next to the reset button.

**Fix in `src/pages/AdminScenes.tsx` (lines 993-1004):**
Add an explicit "Change preview" button (ImageIcon) in the actions area for custom scenes, visible alongside the existing reset button. This button triggers a hidden file input.

## Summary of Changes

| What | Where |
|------|-------|
| Prefix upload path with `user.id` | `handlePreviewUpload` in SceneRow (~line 752) |
| Thread `userId` prop to SceneRow | Parent render + SceneRowProps interface |
| Add explicit preview upload button | Actions area in SceneRow (~line 993) |

Single file change: `src/pages/AdminScenes.tsx`

