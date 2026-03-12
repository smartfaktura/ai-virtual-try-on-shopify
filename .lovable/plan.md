

## Fix Upscale: Resolution Output, Detail Modal Loading State, Team Avatars in Loading Bar

### Problems Identified

1. **Output is always 1024x1024** — Gemini image generation models have a fixed output resolution (~1024px). The prompt text asking for "2048px" is ignored by the model. The model cannot upscale images — it regenerates them at its native output size. This is an inherent limitation.

2. **Clicking an image being enhanced shows no upscale status** — The `LibraryDetailModal` has no awareness of whether the clicked image is currently being upscaled. The "Enhancing..." overlay only shows on the grid card.

3. **No team avatars in the Global Generation Bar** for upscale jobs — the bar shows generic spinner/text but no VOVV.AI team personality.

### Changes

**1. `supabase/functions/upscale-worker/index.ts` — Fix actual output resolution**

The generative model outputs fixed 1024px images. To achieve true 2K/4K, we need a **two-pass approach**:
- Pass 1: Ask Gemini to enhance/sharpen the image (quality improvement)
- Pass 2: After getting the enhanced image back, **tile-upscale by requesting the model to output different quadrants** — but this is unreliable

**Realistic fix**: Since generative AI models cannot control output pixel dimensions, the honest approach is to:
- Keep using Gemini Pro for quality enhancement (sharpening, detail recovery)
- After receiving the AI output, use a canvas-based resize on the server to scale to 2048px or 4096px using high-quality interpolation
- This gives actual 2K/4K pixel dimensions while leveraging AI for detail enhancement

However, Deno edge functions don't have canvas. Instead, we should **acknowledge the limitation in the prompt and request the largest possible output**, and log the actual output dimensions. The model's max output is typically 1024x1024 or 1536x1536.

**Alternative practical fix**: Use `google/gemini-3.1-flash-image-preview` with explicit output size instructions. Some newer Gemini models respect size hints better. We can also try requesting the image in a specific format that forces higher resolution output.

For now, the most honest fix: update the prompt to explicitly request maximum output resolution, and add a log of the actual output byte size so we can verify quality.

**2. `src/components/app/LibraryDetailModal.tsx` — Show upscale progress when image is being enhanced**

- Accept an `isUpscaling` prop
- When `isUpscaling` is true, show a branded loading state inside the detail modal's info panel with team avatar + "Enhancing..." message
- Replace the Enhance button with a progress indicator

**3. `src/pages/Jobs.tsx` — Pass `isUpscaling` to `LibraryDetailModal`**

- Check if the selected item's ID is in the `upscalingSourceIds` set
- Pass that as `isUpscaling` prop to the modal

**4. `src/components/app/GlobalGenerationBar.tsx` — Add team avatars for upscale jobs**

- Import `TEAM_MEMBERS` from teamData
- For upscale jobs in the expanded detail list, show Luna's avatar (she's the "Retouch & Image Refinement Specialist")
- In the compact pill, show a small rotating team avatar when upscale jobs are active
- Use Luna specifically for upscale jobs since her role matches (retouching/refinement)

**5. `src/components/app/LibraryImageCard.tsx` — Improve the enhancing overlay**

- Add a team avatar (Luna) to the "Enhancing..." overlay on the grid card
- Make the overlay slightly more informative with "Luna is enhancing..."

### Files Changed — 5 files
- `supabase/functions/upscale-worker/index.ts` — Improve prompt, log output size
- `src/components/app/LibraryDetailModal.tsx` — Add upscaling state with team avatar
- `src/pages/Jobs.tsx` — Pass isUpscaling to detail modal
- `src/components/app/GlobalGenerationBar.tsx` — Add team avatars for upscale jobs
- `src/components/app/LibraryImageCard.tsx` — Add Luna avatar to enhancing overlay

