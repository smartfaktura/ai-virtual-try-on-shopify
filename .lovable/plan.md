

## Improve "Results Gallery" → "One Product. Every Channel." Section

Replace the current `DiscoverGallery` (random discover_presets images) with a curated, interactive showcase section inspired by the reference screenshot. One product (white crop top) shown across 6 different channel contexts.

### Approach

1. **Generate 6 images** using Gemini 3 Pro image model via an edge function call, each showing a white crop top in a different context:
   - **Instagram Ad** — styled flat lay or on-model with bold ad framing
   - **Amazon Listing** — clean white background product shot with model
   - **Website Hero** — woman running outdoors wearing the crop top
   - **Seasonal** — model in autumn fields wearing the crop top
   - **Lifestyle** — casual at-home setting
   - **Blog** — editorial lifestyle shot

2. **Upload generated images** to `landing-assets` storage bucket under `try-showcase/` folder

3. **Replace the Results Gallery section** with a new "One Product. Every Channel." component:
   - Headline: "One Product. Every Channel."
   - Subtext: "One upload creates visuals for every channel and campaign."
   - Filter chips: All, Ads, Website, Listing, Seasonal, Lifestyle (interactive toggle)
   - 3-column grid of cards, each showing the generated image with a small product thumbnail overlay (the original crop top), a title (e.g. "Instagram Ad"), and a category label
   - Filtering animates cards in/out

4. **Add a small product reference image** — a simple white crop top flat lay used as the "source" thumbnail overlay in each card corner (matching the reference screenshot pattern)

### Files to Modify

- **`src/pages/TryFree.tsx`** — Replace `DiscoverGallery` component and the "Results Gallery" section with new `ChannelShowcase` component featuring filter chips and curated cards using `getLandingAssetUrl('try-showcase/...')` paths
- Remove `useDiscoverPresets` import (no longer needed on this page)

### Image Generation

Will generate 6 images + 1 source product image during implementation using Gemini 3 Pro, upload to storage, then wire up the URLs.

