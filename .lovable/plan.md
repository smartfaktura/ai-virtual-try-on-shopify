

# Add 6 Example Freestyle Images Using Same Image Cards

## Overview
Add a "Get Inspired" section to the Freestyle empty state showing 6 pre-made example images rendered with the **exact same `ImageCard`** component from `FreestyleGallery.tsx` — same shimmer loading, hover gradient overlay, and action buttons.

## Changes

### 1. Extract `ImageCard` for reuse
**File: `src/components/app/freestyle/FreestyleGallery.tsx`**

Export the existing `ImageCard` component (currently a private function at line 322). Just add `export` in front of `function ImageCard`.

### 2. New component: `src/components/app/freestyle/FreestyleExamples.tsx`

- Import the exported `ImageCard` from `FreestyleGallery`
- Define 6 hardcoded examples with the provided image URLs + realistic prompts
- Render in a `grid-cols-2 md:grid-cols-3` grid
- Each card uses `ImageCard` with:
  - `onExpand` → opens a lightbox or just does nothing (no gallery context)
  - `onDownload` → downloads the example image
  - `onCopySettings` → copies the full prompt into the editor via `onUsePrompt` callback
- No delete, no share, no admin buttons — just download + copy settings
- Section header: "Get Inspired" with Sparkles icon, subtitle: "Copy a prompt to try it yourself"

### 3. Update Freestyle page empty state
**File: `src/pages/Freestyle.tsx`** (lines 1053-1065)

- Import `FreestyleExamples`
- Add it above `FreestyleQuickPresets` in the empty state block
- Pass `onUsePrompt` callback that sets the prompt text + shows toast

### Example prompts (to be refined after image analysis during implementation)

| # | Image | Prompt |
|---|-------|--------|
| 1 | `e6a330f2` (freestyle) | "Luxurious perfume bottle on sculpted marble, warm golden hour lighting, shallow depth of field, editorial beauty campaign" |
| 2 | `ba13c796` (tryon) | "Fashion model in oversized streetwear jacket, industrial warehouse, dramatic side lighting, raw concrete, editorial photography" |
| 3 | `642c61fa` (tryon) | "Elegant model in minimalist outfit, clean white studio, soft diffused lighting, full body, high-end lookbook" |
| 4 | `596ae7d1` (freestyle) | "Premium skincare on natural stone with botanicals, morning window light, clean beauty editorial, soft earth tones" |
| 5 | `7fb523ac` (tryon) | "Model with statement accessories on urban rooftop at golden hour, city skyline bokeh, warm cinematic tones, lifestyle campaign" |
| 6 | `aac4c8f5` (freestyle) | "Artisanal candle collection on textured linen, dried flowers and ceramics, warm ambient glow, home décor editorial" |

## Technical details
- Images use `getOptimizedUrl(url, { quality: 70 })` — no width param (per memory rules)
- `ImageCard` expects a `GalleryImage` shape — we'll construct minimal objects with `id`, `url`, `prompt`, `aspectRatio`
- 3 files total: 1 export change, 1 new component, 1 integration point

