

## Fix White Studio Scene Image

### Problem
The "White Studio" scene (`scene_038`) uses an image that contains a **person wearing headphones** in a white studio. When the AI receives this as `[SCENE IMAGE]`, it reproduces elements from it (hands, props, human presence) despite prompt instructions to "use for environment only." This is a content problem, not a prompt engineering problem — the scene-isolation logic is working correctly but the image itself contains too much subject matter for the AI to ignore.

### Solution
Replace the White Studio scene image with a **clean, empty white studio environment** — no people, no props, just the white backdrop with soft lighting. This matches what all other product scenes do (surfaces, backdrops, environments without human subjects).

### Changes

**1. Generate a clean white studio image**
- Use the AI image generation endpoint (`google/gemini-3-pro-image-preview`) via a one-time edge function call or manual upload to generate a proper clean white studio backdrop
- Upload to storage at `landing-assets/scenes/scene-white-studio.png` (replacing the current file)

**2. No code changes needed**
- `mockData.ts` already points to `getLandingAssetUrl('scenes/scene-white-studio.png')` — the URL stays the same
- The prompt engineering logic is correct — it already tells the AI to ignore scene props
- The fix is purely replacing the image asset at the existing storage path

### Why this works
Other product scenes (White Seamless, Gradient Backdrop, Marble Surface, etc.) all use images of **empty environments**. The AI successfully uses those for lighting/atmosphere without bleeding in unwanted elements. White Studio just needs the same treatment.

