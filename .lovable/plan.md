

# Merge Universal + Category Scenes into Unified Per-Category Sections

## Current Problem
Step 2 shows scenes in 3 separate sections: "Universal Scenes" (global), "Recommended for your products" (category), and "Explore more" (other categories). This is confusing because:
- Users don't know which universal scenes are relevant to their product type
- Some universal scenes (In-Hand, Tabletop) don't suit certain categories but still show
- The separation creates a disconnect between "universal" and "recommended"

## New Approach
Merge everything into a single per-category view. When the user's products are detected as e.g. "Clothing & Apparel", they see ONE section containing both the relevant universal scenes AND the garment-specific scenes together, organized by sub-groups within that section.

### How it works

**Detected categories** (e.g. garments): Show a single expanded section titled "Clothing & Apparel" containing:
- Sub-group "Essential Shots" — universal scenes compatible with that category (Clean Studio, Marketplace, Editorial Surface, Close-Up Detail, Side Profile, Back View, Top-Down, Accent Backdrop, etc. minus excluded ones)
- Sub-group "Category Shots" — the garment-specific scenes (Folded Display, Hanging Display, On-Model Look, etc.)

**Non-detected categories**: Collapsed as before under "Explore more scenes"

**Multi-category**: If user has garments + fragrance, they get two expanded sections each with their own merged universal + category scenes. Universal scenes that apply to both appear in both sections (selection is shared — selecting "Clean Studio" in one section selects it everywhere).

### Files to change

**`src/components/app/product-images/ProductImagesStep2Scenes.tsx`** — Main restructuring:
- Remove the standalone "Universal Scenes" grid section (lines 303-318)
- For each detected category, build a merged scene list: filtered global scenes (respecting `excludeCategories`) + category collection scenes
- Render each detected category as a single expanded section with internal sub-group labels ("Essential Shots" / "Category-Specific Shots")
- Keep "Explore more" collapsed sections for non-detected categories, also including relevant universal scenes within them
- Scene selection remains unified across sections (same `selectedSceneIds` Set)

**`src/components/app/product-images/sceneData.ts`** — No structural changes needed. The `excludeCategories` and `isGlobal` flags already provide the data needed to filter and merge.

**`src/hooks/useProductImageScenes.ts`** — Add a new derived helper: `getUnifiedCategoryView(categoryId)` that returns global scenes (filtered for that category) + category-specific scenes merged into one array. Or this logic can live in the Step2 component directly.

### UI Layout (per detected category section)

```text
▼ Clothing & Apparel                    [Recommended] [7 selected]
  [Select All] [Deselect All]
  
  ── Essential Shots ──
  [Clean Studio] [Marketplace] [Editorial Surface] [Product on Pedestal]
  [Tabletop Lifestyle] [Close-Up Detail] [Side Profile] [Back View]
  [Top-Down / Flat Lay] [Accent Color Backdrop]
  
  ── Clothing-Specific Shots ──
  [Folded Display] [Hanging Display] [Styled Flat Lay] [Fabric Detail]
  [Editorial Garment] [On-Model Look] [Movement Shot]

▼ Fragrance                              [Recommended] [3 selected]
  ...same pattern with fragrance-relevant universal + fragrance scenes...

▸ Beauty & Skincare                      (collapsed, not detected)
▸ Shoes                                  (collapsed, not detected)
```

### Edge cases
- If NO category is detected: show a single "All Scenes" section with all universal scenes + an "Explore by category" collapsed area
- Packaging scenes (`Product + Packaging`, `Packaging Detail`) already have `excludeCategories: ['garments']` so they won't appear in clothing sections
- In-Hand scenes already exclude garments, home-decor, tech-devices

### Technical detail
The `CategorySection` component will be extended to accept an optional `universalScenes` prop. When provided, it renders two sub-groups within the collapsible. The `toggleScene` and `selectAllCategory` functions will operate on the merged list.

