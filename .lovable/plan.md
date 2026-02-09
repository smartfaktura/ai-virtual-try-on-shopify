

## Simplify Upload Guide UI + Generate New "What to Avoid" Images

### What Changes

**1. Generate 2 new "What to Avoid" images using AI**
- **"Busy background"** (replaces flat-lay): An Alo Yoga-style model wearing athletic wear on a busy New York City street with people and cars -- realistic street photography style
- **"Too many items"** (replaces low-contrast): A flat-lay photographer's desk with camera, laptop, sunglasses, and multiple clothing items scattered together

The third image (cropped/missing full view) stays as-is.

**2. Simplify the guide text -- less words, more visual**
- Shorten labels to 2-3 words max (e.g., "Front-facing" instead of "Clear front-facing photo")
- Remove the long tip/avoid paragraph at the bottom entirely
- Keep just the images + short labels -- the visuals speak for themselves

**3. Match section sizing and balance**
- Make the guide column narrower so the upload area gets more space
- Reduce internal padding further for a tighter, cleaner card

**4. Mobile optimization**
- On mobile, show guide as a single horizontal strip (smaller thumbnails inline) instead of a tall stacked card
- Ensure upload area is always visible without scrolling

### Updated Labels

**What Works Best:**
- "Front-facing" 
- "Single item"
- "Clean background"

**What to Avoid:**
- "Busy background"
- "Too many items"
- "Cropped photo"

### Files Changed
- `src/assets/products/avoid-flatlay.jpg` -- replaced with busy NYC street scene
- `src/assets/products/avoid-lowcontrast.jpg` -- replaced with cluttered desk flat-lay
- `src/components/app/TryOnUploadGuide.tsx` -- shorter labels, remove tip paragraph, tighter padding, mobile-optimized layout
- `src/pages/Generate.tsx` -- adjust grid column ratio for better balance

