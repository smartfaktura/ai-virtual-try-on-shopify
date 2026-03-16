

## Plan: Replace 4 old scenes with new ones from the Freestyle library

### What changes
**`src/components/landing/EnvironmentShowcaseSection.tsx`** — Replace 4 specified scenes with newer ones from the Freestyle scene library. Instead of using `getLandingAssetUrl()` for these, reference the scene thumbnails directly from their existing storage URLs (same bucket, already public).

### Replacements

| Remove | Replace with | Source |
|--------|-------------|--------|
| Beach Sunset (`pose-lifestyle-beach.jpg`) | **Brutalist Urban Steps** | `custom_scenes` image_url |
| Studio Back View (`pose-studio-back.jpg`) | **Salt Flat Serenity** | `custom_scenes` image_url |
| Urban Stairs Male (`pose-streetwear-stairs-male.jpg`) | **Urban Dusk Portrait** | `custom_scenes` image_url |
| Urban Walking (`pose-lifestyle-walking.jpg`) | **Airport Transit** | `custom_scenes` image_url |

### Implementation
- Add a helper or inline the full URLs for the 4 new scenes (they're already public URLs in `freestyle-images` storage)
- Keep the `e()` helper for all existing `landing-assets/poses/` images
- No new uploads needed — scenes already exist in storage

