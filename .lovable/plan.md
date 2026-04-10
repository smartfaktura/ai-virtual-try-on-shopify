

# Group "Explore More" Categories for Easy Browsing

## Problem
The "Explore More" section in Step 2 (Scene Selection) dumps all non-recommended categories in a flat list — 15+ rows with no visual hierarchy. Hard to scan and find what you need.

## Solution
Group the categories into logical super-groups with subtle section headers. Each super-group gets a muted label (like the existing "Explore more" header), and the category rows sit underneath.

### Proposed groupings:

```text
FASHION & APPAREL
  ├── Garments (T-shirts, Shirts…)
  ├── Dresses
  ├── Hoodies
  ├── Jeans
  ├── Jackets
  ├── Activewear
  ├── Swimwear
  ├── Lingerie
  ├── Kidswear
  └── Streetwear

FOOTWEAR
  ├── Shoes
  ├── Sneakers
  ├── Boots
  └── High Heels

BAGS & ACCESSORIES
  ├── Bags & Structured Accessories
  ├── Backpacks
  ├── Wallets & Cardholders
  ├── Belts
  ├── Scarves
  └── Hats & Headwear

JEWELRY & WATCHES
  ├── Rings
  ├── Necklaces
  ├── Earrings
  ├── Bracelets
  ├── Watches
  └── Eyewear

BEAUTY & FRAGRANCE
  ├── Beauty & Skincare
  ├── Makeup & Lipsticks
  └── Fragrance

FOOD & DRINK
  ├── Food & Snacks
  └── Beverages

HOME & LIFESTYLE
  ├── Home Decor / Furniture
  ├── Tech / Devices
  ├── Supplements & Wellness
  └── Other / Custom
```

### Implementation

**File: `ProductImagesStep2Scenes.tsx`** (~30 lines changed)

1. Add a `CATEGORY_SUPER_GROUPS` constant mapping group labels to ordered arrays of category IDs
2. In the "Explore More" render block, replace the flat `.map()` with a grouped render:
   - Loop over super-groups
   - Filter to only categories present in `unifiedOther`
   - Skip empty groups
   - Render a small muted group header + the category rows beneath
3. Any categories not in any super-group fall into an "Other" section at the bottom

The category rows themselves stay identical — just wrapped in visual groups with headers.

### Visual style
- Group headers: `text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest` with a small top margin between groups
- No extra nesting or borders — lightweight visual separation only

## Files
- `src/components/app/product-images/ProductImagesStep2Scenes.tsx` — one edit block

