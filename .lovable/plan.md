

# Overhaul /home Landing Page — Premium Visual Upgrade

## Problems Identified
1. **Hero visual is broken** — the "original" card and output cards are tiny, awkwardly positioned, and look like colored rectangles floating randomly. The layout doesn't communicate "transformation" at all.
2. **Every section uses empty gradient placeholder boxes** — no visual richness, no texture, no depth. The page looks like a wireframe, not a premium landing page.
3. **Sections feel sparse and generic** — the category cards, transform strip, create cards, quality proof, and how-it-works sections all look like colored rectangles with labels.
4. **No visual storytelling** — there's no sense of a product being transformed. Just colored boxes with text labels.

## Strategy
Since we don't have real product images yet, we need to make the placeholder visuals much more convincing and premium using:
- Richer gradient compositions with multiple layers
- Faux product silhouettes using CSS shapes and shadows
- Inner shadows, glass morphism, and layered depth
- Better proportions and spatial relationships
- More sophisticated card compositions with overlapping elements
- Real visual hierarchy that communicates transformation

## Files to Modify

### 1. `src/components/home/HomeHero.tsx` — Complete rewrite
- Make the right-side visual composition much larger and more impressive
- Center card should be bigger (w-64 h-80) with a faux product silhouette (CSS circle/shape inside)
- Output cards should orbit around it in a structured, overlapping arrangement — not randomly scattered
- Add subtle floating animation via CSS keyframes
- Add depth with layered shadows and glass borders
- Make the visual area take up proper space (min-h-[400px] on desktop)
- Tighten the left side copy — reduce eyebrow to just a subtle tag, keep headline tight

### 2. `src/components/home/HomeTransformStrip.tsx` — Visual upgrade
- Make cards taller and add inner visual elements (faux product shape + background variation per card type)
- Add a connecting flow line between cards (SVG or border-based)
- Make the "Original" card visually distinct (darker, with a camera/upload icon feel)

### 3. `src/components/home/HomeCreateCards.tsx` — Richer preview areas
- Add layered inner cards inside each preview area to simulate actual outputs
- Each card type gets a distinct visual treatment (e.g., product card shows a centered product shape on white, social card shows a square format with overlay text hint, video card shows a play button overlay)
- Make cards taller with more visual weight

### 4. `src/components/home/HomeCategoryExamples.tsx` — More visual depth
- Make the 3 example thumbnails inside each category card larger and more detailed
- Add hover state that scales the first image
- Use more varied and richer gradients per category

### 5. `src/components/home/HomeHowItWorks.tsx` — Faux UI mockups
- Replace plain gradient boxes with structured UI mockups using CSS (e.g., step 1 shows a dashed upload zone, step 2 shows selection cards, step 3 shows a gallery grid)
- Each step visual should feel like an actual product screenshot

### 6. `src/components/home/HomeOnBrand.tsx` — Richer output grid
- Add faux product silhouettes inside the 4 output cards on the right
- Add subtle matching warm-tone backgrounds to prove "consistency"
- All 4 should share the same background tone to visually prove the point

### 7. `src/components/home/HomeQualityProof.tsx` — Better gallery
- Make the grid more editorial with varied sizes
- Add zoom/magnifier icon overlay on hover
- Add richer inner visual elements

### 8. `src/components/home/HomeWhySwitch.tsx` — Minor polish
- Add subtle gradient border or glow effect on hover for the cards
- This section is the strongest already, just needs minor refinement

### 9. `src/components/home/HomeFinalCTA.tsx` — More visual presence
- Add subtle floating product card silhouettes in the background (absolute positioned, low opacity)
- Make the background more visually interesting

### 10. `src/components/home/HomeNav.tsx` — Minor tweak
- Increase height slightly (h-16 → h-[68px])
- Add subtle shadow when scrolled instead of just border

## Design Details
- All placeholder visuals will use layered CSS: gradients + inner shadows + CSS shapes + glass borders
- Faux product silhouettes: rounded rectangles or circles with soft inner shadows simulating a product bottle/box shape
- Color palette stays the same (warm porcelain, charcoal, muted accents)
- No external images needed — pure CSS visual richness
- Add a small CSS keyframe for subtle float animation on hero cards

