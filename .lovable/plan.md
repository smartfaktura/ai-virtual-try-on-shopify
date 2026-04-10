

# Upgrade Text-to-Product Prompt Templates for Stylish, Aesthetic Output

## Problem
The current prompts are overly clinical and focused on accuracy constraints. They produce sterile, flat product images. The iPhone/Resale scene specifically needs to show appealing on-body shots with nice colors and aesthetic appeal — currently it reads like a "regular person at home" which produces unappealing results. Clothing images across all scenes lack editorial polish.

## Changes — `src/pages/TextToProduct.tsx`

All 6 `SCENE_TEMPLATES` prompt templates will be rewritten to balance accuracy with aesthetic quality.

### 1. White Front — add editorial lighting language
- Add: "premium editorial e-commerce lighting with soft gradient shadows, studio key light from upper-left, subtle rim light to separate product from background"
- Add: "the image should feel like an ASOS or Net-a-Porter product listing"
- Keep accuracy constraints but remove overly restrictive "no styling" language

### 2. White Side — add depth and dimension
- Add sculptural lighting direction: "directional key light revealing contour and dimensionality, subtle gradient on the white background"
- Add: "premium fashion e-commerce quality matching Farfetch or SSENSE product pages"

### 3. Back View — same editorial polish
- Upgrade lighting to match front view quality
- Add subtle depth and premium commercial feel

### 4. Inside View — warm editorial macro
- Add warm controlled lighting to make interior details feel luxurious
- "The image should feel like a luxury brand's detail page"

### 5. iPhone / Resale — complete overhaul for aesthetic appeal
Current: "casual at-home iPhone photo" with "regular person" — produces unappealing images.

New direction:
- **Person**: "attractive fit young woman with toned legs and flattering body proportions, stylish effortless pose"
- **Colors**: "warm golden-hour natural light, beautiful soft tones, flattering warm color grading"
- **Scene**: "bright clean aesthetic space — white wall, warm wood floor, natural light flooding in, minimal Scandinavian interior"
- **Photo style**: "high-quality iPhone photo that looks like a popular Depop/Vinted listing with 500+ likes — aspirational but believable"
- **Framing for clothing**: "show full outfit with legs visible, flattering angle slightly from below or straight-on, clean mirror selfie or tripod shot aesthetic"
- Remove: "not editorial, not influencer-style" (we WANT it to look good)
- Add: "beautiful color palette, aesthetically pleasing composition, the kind of photo that makes people want to buy"

### 6. Detail / Macro — luxury close-up
- Add: "luxury brand campaign detail shot quality, beautiful bokeh, jewel-like precision"
- Warm highlight reflections on hardware, rich texture rendering

### Global improvements across all templates
- Add a clothing-aware instruction block: "For clothing/apparel items: ensure fabric drapes naturally, shows realistic wrinkles and folds that enhance appeal, and materials look touchable and high-quality"
- Upgrade color language: "rich, true-to-life colors with slight warmth, not flat or desaturated"
- Add quality suffix to all: "8K product photography, shot on Phase One IQ4 150MP, tethered to Capture One, color-graded for premium e-commerce"

## File Changed
| File | Change |
|------|--------|
| `src/pages/TextToProduct.tsx` | Rewrite all 6 `SCENE_TEMPLATES` prompt templates with premium aesthetic language |

