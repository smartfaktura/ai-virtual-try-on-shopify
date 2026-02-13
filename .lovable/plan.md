

## Replace "Quick Create" with "Workflows + Freestyle" Section

### What Changes

**File: `src/pages/Dashboard.tsx` (lines 268-272)**

Remove the current "Quick Create" section that renders `GenerationModeCards` (Product Photos + Virtual Try-On cards) and replace it with a new section containing two premium cards:

1. **Workflows** -- Navigate to `/app/workflows`
   - Icon: `Layers`
   - Description: "Outcome-driven visual sets -- Try-On, Product Listing, UGC, Flat Lay. Pick a workflow and get a complete set."
   - CTA: "Browse Workflows"

2. **Freestyle Studio** -- Navigate to `/app/freestyle`
   - Icon: `Sparkles`
   - Description: "Full creative control -- mix prompts, products, models, scenes, and brand profiles to generate any image you imagine."
   - CTA: "Open Studio"

### Design

- Same premium card styling as the current `GenerationModeCards` (rounded-2xl, hover shadow, border)
- Workflows gets the primary CTA button, Freestyle gets outline
- Compact layout matching the `compact` mode already used in the dashboard (short descriptions, no credit info)
- Section title changed from "Quick Create" to "Create"

### Technical Detail

- Edit `src/pages/Dashboard.tsx` lines 268-272: replace the `GenerationModeCards` usage with inline card markup using `Layers` and `Sparkles` icons
- The `GenerationModeCards` component itself stays untouched (still used in the first-run dashboard)
- No new components needed -- the cards are simple enough to inline

