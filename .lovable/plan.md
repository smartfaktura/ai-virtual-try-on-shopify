

# Improve Admin Scene Panel — Category Visibility + Better Controls

## Current Problems

1. **Global scenes don't show which categories they serve**: A global scene like "In-Hand Studio" excludes garments, home-decor, tech — but in admin you can't see at a glance which categories it WILL appear in. You have to mentally invert the exclude list.

2. **Exclude Categories only shown for non-global scenes**: The form hides the "Exclude from Categories" checkboxes when `isGlobal` is true (line 469: `{!isGlobal && ...}`), but global scenes are exactly the ones that NEED exclude controls — they're the universal scenes that should be filtered per category.

3. **No "preview by category" view**: You can't quickly see "what will a Fragrance customer see?" without going to the actual product images flow.

4. **Sub-category labels not prominent enough**: The sub_category field exists but it's just a small badge in the list — hard to scan and manage groupings.

## Plan

### A. Admin list: Show "Appears in" tags for global scenes

In the scene row (lines 298-312), for global scenes, compute and display green badges showing which categories this scene appears in:

```text
Clean Studio  [packshot]  [Essentials]  clean-studio
Appears in: All categories ✓

In-Hand Studio  [lifestyle]  [Essentials]  in-hand-studio  
Appears in: Fragrance, Beauty, Makeup, Bags, Shoes, Supplements
Excludes: Garments, Home Decor, Tech
```

This is just `EXCLUDE_CATS` minus `scene.exclude_categories` — simple set difference, shown as small green/red badges.

### B. Show Exclude Categories for global scenes too

Remove the `{!isGlobal && ...}` guard on line 469 so the exclude checkboxes appear for ALL scenes. Global scenes are the primary users of this feature.

### C. Add "Preview by Category" filter toggle

Add a dropdown at the top of the admin panel: "Preview as category: [All | Fragrance | Garments | ...]". When a category is selected, the list filters to show only scenes that would appear for that category:
- Global scenes where `excludeCategories` doesn't include the selected category
- Category-collection scenes matching that category

This lets you quickly see "what does a garment customer see?" right in admin.

### D. Better sub-category display in list

Group scenes within each admin section by their `sub_category` value with a visible divider label. Instead of a flat list with tiny badges, show:

```text
▼ Global (Universal) — 12 scenes
  ── Essentials (5) ──
  Clean Studio | Marketplace | Editorial Surface | Product on Pedestal | Tabletop Lifestyle
  
  ── Angles & Detail (4) ──
  Close-Up Detail | Side Profile | Back View | Top-Down / Flat Lay
  
  ── Uncategorized (3) ──
  Accent Color Backdrop | In-Hand Studio | In-Hand Lifestyle
```

## Files

| File | Changes |
|---|---|
| `src/pages/AdminProductImageScenes.tsx` | Add "Appears in" badges for global scenes in list rows; remove `!isGlobal` guard on exclude checkboxes; add category preview filter dropdown; group scenes by sub_category with divider labels within each section |

