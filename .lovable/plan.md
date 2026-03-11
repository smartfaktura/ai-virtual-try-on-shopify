

## Fix AI Creative Pick Thumbnail + Bright Aesthetic Priority

### Issues Found

1. **AI Creative Pick has no preview thumbnail** — In the `workflows` table, the Product Listing Set's `generation_config.variation_strategy.variations[0]` (AI Creative Pick) has `preview_url: null`. All other 29 scenes have preview images stored in the `workflow-previews` bucket.

2. **AI Creative Pick instruction needs bright aesthetic priority** — The current instruction says "autonomously choose the SINGLE most compelling scene" but doesn't bias toward bright, clean, high-impact visuals.

### Plan

**1. Generate a preview thumbnail for AI Creative Pick** — Create a dedicated icon/placeholder card in the frontend for the "AI Creative Pick" scene since it's intentionally dynamic (no fixed preview). Instead of a generic Package icon, render a branded Sparkles icon with a distinctive gradient that signals "AI picks for you."

**File: `src/pages/Generate.tsx`** (~line 2344-2357)
- In the scene card grid, detect when a variation is the "AI Creative Pick" (by label match or index 0 with no preview_url)
- Render a special card with a Sparkles icon, a colorful gradient background, and a subtle shimmer effect instead of the generic Package icon
- This visually distinguishes it as a premium AI-powered option

**2. Update AI Creative Pick instruction for bright aesthetic bias**

**Database migration** — Update the Product Listing Set workflow's `generation_config` to modify the AI Creative Pick variation's instruction. Add emphasis on:
- "Prioritize bright, clean, visually striking scenes with abundant natural or studio light"
- "Favor luminous, airy, high-key aesthetics over dark or moody setups"
- "The image should feel vibrant, inviting, and commercially appealing"

### Files Changed — 1 file + 1 migration
- `src/pages/Generate.tsx` — Special AI Creative Pick card rendering
- Database migration — Update AI Creative Pick instruction text

