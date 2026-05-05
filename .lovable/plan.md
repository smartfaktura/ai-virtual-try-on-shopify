## Brite Showcase Refinements

Rewrite `src/pages/showcase/BriteShowcase.tsx` with the following changes:

### 1. White background, no orange accents
- Root div: `bg-white` instead of `bg-[#0a0a14]`
- All text colors switch to dark slate (`#0f172a` headings, `#64748b` body, `#94a3b8` labels)
- Stat cards: `bg-[#f8fafc]` with `border-[#e2e8f0]`, icons in `text-[#94a3b8]`
- Remove the orange/red gradient blobs
- Focus ring: `ring-[#0f172a]/20` instead of orange

### 2. Content rephrased for Brite team (not public case study)
- Remove "Case Study" label → replace with "Prepared for Brite"
- Headline: "Your Brite Blood Orange Visual Collection"
- Subtitle: "From a single product photo, VOVV.AI generated 35 ready-to-use visuals across 18 distinct scenes — editorial, lifestyle, and product-only — in just 73 seconds."
- Stats updated to show "35" instead of "36"

### 3. Remove one Sky Grip Pop
- Delete the Freya Sky Grip Pop entry (line 46), keeping only the Zara one
- Total drops from 36 → 35 images

### 4. CTA section
- Replace `HomeFinalCTA` with a custom inline CTA block
- Dark slate bg `#0f172a`, headline "Ready to create yours?", subtitle "Upload one product photo and get a full visual library in minutes"
- "Try free now" button (white, links to /auth) + "Explore more examples" (outline, links to /discover)

### Files changed
- `src/pages/showcase/BriteShowcase.tsx` — full rewrite with white theme
