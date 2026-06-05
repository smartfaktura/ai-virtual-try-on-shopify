## Update Dashboard top 3 action cards

Edit `src/pages/Dashboard.tsx` (the "Start here" 3-card grid only). No other files touched.

### Card 1 — Guided product visuals
- Icon: `Layers` (keep)
- Title: `Create Product Visuals`
- Description: `Generate brand-ready product visuals using guided shot scenes tailored to your product category.`
- CTA: `Create now` → `/app/generate/product-images` (keep)
- Keep as the primary filled button

### Card 2 — Prompt-based creation
- Icon: `Wand2` (keep)
- Title: `Create with Prompt`
- Description: `Describe any custom shot, scene, or style and generate it from scratch.`
- CTA: `Open studio` → `/app/freestyle` (keep)

### Card 3 — Advanced editing/tools (repurpose "Explore Examples")
- Icon: swap `Compass` → `Sparkles` (better represents tools/editing; already imported)
- Title: `Explore Examples` → `Visual Studio`
- Description: `Access creative tools like Generate More Angles, Product Swap, Material Swap, Material Change, and more.`
- CTA: `Browse looks` → `Open Visual Studio`; route `/app/discover` → `/app/workflows`

### Out of scope
No changes to sidebar, "Steal the Look", Create Video, More tools, or any other section. No copy changes elsewhere. No new components or routes.
