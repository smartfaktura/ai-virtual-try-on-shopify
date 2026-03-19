

## Fix Missing Images for Custom Scenes in Admin Scene Manager

### Problem
Custom scenes stored in the database reference `image_url` values pointing to `freestyle-images` or `tryon-images` bucket files. When these files no longer exist (or fail to load for any reason), the `<img>` tag in AdminScenes silently breaks and collapses to a thin invisible line — no placeholder, no fallback.

Built-in scenes from `mockData` work fine because their images are in the permanent `landing-assets` bucket.

### Solution
Add a visual fallback for broken images in the AdminScenes scene rows:

**`src/pages/AdminScenes.tsx`** — Replace the bare `<img>` with an error-handled version:
- Add `onError` handler that swaps the `src` to a placeholder or hides the image and shows a colored fallback `<div>` with the scene's initial letter
- Add a `bg-muted` background to the image container so even before load, there's a visible placeholder area

This is a small, self-contained UI fix — one file, ~10 lines changed.

