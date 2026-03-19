

## Improve White Studio Scene Image & Reposition It

### What needs to happen

1. **Generate a better White Studio image** — The current one looks strange at the top. Generate a clean white studio backdrop with a subtle gradient shadow on the floor, similar in style to the "Shadow Play" scene (directional light creating soft geometric shadows on a white surface). This will be a professional-looking empty white cyclorama with a gentle shadow gradient, no objects or people.

2. **Upload to storage** — Replace the existing file at `landing-assets/scenes/scene-white-studio.png` with the new higher-quality version. No code URL changes needed since the path stays the same.

3. **Move White Studio to first position in the product scenes list** — It's already first in the `clean-studio` category in `mockData.ts` (line 1363), so it should already appear first under the "Product" tab. No reordering needed unless admin sort overrides have changed the position — will verify and ensure it stays at position 1 in `clean-studio`.

### Changes

**Asset generation & upload**
- Generate via `google/gemini-3-pro-image-preview`: "Professional empty white photography studio cyclorama with subtle gradient shadow on the floor from soft directional window light, clean minimal commercial product photography backdrop, no objects, no people, elegant shadow play on white surface"
- Upload to `landing-assets/scenes/scene-white-studio.png` (overwrites current)

**`src/data/mockData.ts`** — No changes needed
- White Studio (`scene_038`) is already the first entry under `// === PRODUCT ENVIRONMENT SCENES ===`
- URL already uses `getLandingAssetUrl('scenes/scene-white-studio.png')`

### Summary
This is purely an asset quality fix — regenerate a cleaner, more professional white studio image with gradient shadow styling, and upload it to the same storage path.

