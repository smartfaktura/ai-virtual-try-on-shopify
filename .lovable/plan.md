

## Expand Product Listing Set to 30 Pro Scenes

### What We Learned from the Research

Both Cherrydeck and Squareshot highlight several high-converting photography styles that our current 20 scenes don't cover:

- **Floating/Levitation** -- product suspended mid-air, defying gravity (top trend for 2025)
- **Still Life with Props** -- curated complementary objects that tell a story
- **Monochromatic/Color Blocking** -- bold single-color backdrops for social media impact
- **Mirror/Reflections** -- reflective surfaces creating depth and intrigue
- **Content Pour-out/Texture** -- showing what's inside (cream swirls, ingredients)
- **Hand-in-Shot** -- a human hand holding/interacting with the product for scale and relatability
- **Geometric Shapes** -- architectural pedestals, arches, and abstract shapes
- **Mesmerizing Locations** -- aspirational outdoor environments (beach, poolside)
- **Packaging Showcase** -- celebrating the unboxing experience
- **Color Gel Lighting** -- bold colored lighting for modern, editorial impact

### Updated Scene Library: 30 Scenes in 6 Categories

We expand from 4 categories to 6, going from 20 to 30 scenes total.

**Studio Essentials (5)** -- unchanged
1. Hero White
2. Soft Gray Infinity
3. Gradient Glow
4. Shadow Play
5. Dark and Moody

**Surface and Texture (5)** -- unchanged
6. White Marble
7. Raw Concrete
8. Warm Wood Grain
9. Linen and Fabric
10. Terrazzo Stone

**Lifestyle Context (5)** -- unchanged
11. Bathroom Shelf
12. Kitchen Counter
13. Vanity Table
14. Office Desk
15. Bedside Table

**Editorial and Creative (5)** -- unchanged
16. Botanical Garden
17. Water Splash
18. Golden Hour
19. Neon Accent
20. Flat Lay Overhead

**NEW: Dynamic and Effects (5)**
21. **Floating Levitation** -- product suspended mid-air with soft shadow below, defying gravity, clean background, editorial magic
22. **Mirror Reflection** -- product on a reflective mirror surface creating a perfect symmetrical reflection, dramatic and elegant
23. **Monochrome Color Block** -- bold single saturated color backdrop (matching or complementing the product), Glossier-style pop art feel
24. **Geometric Pedestal** -- product elevated on abstract geometric shapes (cylinders, arches, cubes) in neutral tones, architectural and modern
25. **Smoke and Mist** -- product emerging from soft atmospheric fog or mist, mysterious and premium, soft rim lighting

**NEW: Storytelling and Context (5)**
26. **Hand-in-Shot** -- a clean, well-groomed hand holding or presenting the product naturally, adding human scale and relatability
27. **Still Life Composition** -- product as hero surrounded by curated complementary props (dried flowers, stones, fabric), artful arrangement
28. **Content Pour-out** -- product contents spilling out artfully (powder, liquid, cream texture), showing what's inside, macro-style detail
29. **Beach and Sand** -- product on natural sand with soft ocean light, warm coastal tones, aspirational travel context
30. **Gift and Unboxing** -- product emerging from premium packaging with tissue paper and ribbon, celebrating the unboxing experience

### Technical Details

**Database Migration**
- Update the Product Listing Set workflow's `generation_config` JSONB to replace the current 20 variations with 30 new ones
- Each new scene includes a detailed `instruction` prompt optimized for AI generation and a `category` field

**File: `src/pages/Generate.tsx`**
- Add two new category filter tabs: "Dynamic" and "Storytelling" alongside the existing All, Studio, Surface, Lifestyle, Editorial tabs
- The grid layout already supports 5 columns (`lg:grid-cols-5`), so 30 scenes will fill 6 clean rows

**File: `supabase/functions/generate-scene-previews/index.ts`**
- Add prompt entries for the 10 new scenes in the `scenePreviewPrompts` map so the admin can generate AI preview thumbnails for all 30 scenes

No changes needed to the edge function, credit logic, or angle selector -- those were already implemented correctly in the previous update.

### Changes Summary

| File | Change |
|------|--------|
| Database migration | Update `generation_config` from 20 to 30 scene variations with 2 new categories |
| `src/pages/Generate.tsx` | Add "Dynamic" and "Storytelling" category tabs |
| `supabase/functions/generate-scene-previews/index.ts` | Add 10 new scene preview prompts |

