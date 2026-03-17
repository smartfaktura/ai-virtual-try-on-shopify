

## Update Hero Product Pills and Ring Images

### Changes Overview
1. **Rename** "White Crop Top" → "Crop Top" (pill label only)
2. **Replace** "Face Serum" showcase → "Ring" with your uploaded images
3. **Replace** "Gold Ring" showcase → "Headphones" with placeholder images (you'll provide real ones later)

### Image Mapping (Ring)
Your uploaded images will be copied to `public/images/hero/` with clean names, then referenced directly:

| Uploaded file | Target name | Role |
|---|---|---|
| yourupload.png | hero-product-ring-new.png | Product source |
| 02707975...png | hero-ring-fabric.png | Output: Linen Close-Up |
| abc37921...png | hero-ring-hand.png | Output: On the Hand |
| freestyle-1_42-2.png | hero-ring-concrete.png | Output: Concrete Block |
| freestyle-1_43_copy_2.png | hero-ring-eucalyptus.png | Output: Stone & Eucalyptus |
| freestyle-1_43_copy.png | hero-ring-floating.png | Output: Studio Floating |
| freestyle-1_43.png | hero-ring-golden-light.png | Output: Golden Light |
| freestyle-1_44.png | hero-ring-portrait.png | Output: Model Portrait |
| Selfie_UGC_Set_2.png | hero-ring-ugc.png | Output: Selfie / UGC |

### Code Changes

**File: `src/components/landing/HeroSection.tsx`**
- Line 27: `'White Crop Top'` → `'Crop Top'`
- Lines 40-52: Replace Face Serum showcase with Ring (using `/images/hero/hero-ring-*` local paths)
- Lines 54-67: Replace Gold Ring showcase with Headphones (keep existing ring images as temporary placeholders, update labels)
- Update captions accordingly

**File: `src/components/landing/FreestyleShowcaseSection.tsx`**
- Line 26: `'White Crop Top'` → `'Crop Top'`

**Files: `src/components/landing/HowItWorks.tsx`** and **`CreativeDropsSection.tsx`**
- Update "White Crop Top" references to "Crop Top"

### Optimization Note
Since these images are served from `public/` (not the landing-assets storage bucket), `getOptimizedUrl()` won't apply server-side compression. I'll ensure the images are reasonably sized for the hero carousel cards (~400-600px display width). For full optimization parity with the other hero assets, they should eventually be uploaded to the landing-assets storage bucket — I can help with that as a follow-up.

### Headphones Placeholder
The third pill will show "Headphones" with the existing ring images as temporary placeholders until you provide the real headphones images.

