

# Update Discover Pages with Product Categories

## Current State
Both `/app/discover` and `/discover` use **style-based** categories: Editorial, Commercial, Lifestyle, Fashion, Campaign. These are mapped via `SCENE_CATEGORY_MAP` and `CATEGORY_ALIAS`. The new requirement is to use **product-based** categories matching onboarding preferences.

## Problem
The existing discover items (presets + scenes) have style-based `category` fields in the database (e.g. "editorial", "lifestyle"). The new product categories (Fashion & Apparel, Beauty & Skincare, etc.) are a completely different taxonomy. Items need a mapping strategy.

## Plan

### 1. Update category lists in both pages

**`src/pages/Discover.tsx` (lines 23-31)** — Replace CATEGORIES with:
```typescript
const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'saved', label: 'Saved' },
  { id: 'fashion', label: 'Fashion & Apparel' },
  { id: 'beauty', label: 'Beauty & Cosmetics' },
  { id: 'fragrances', label: 'Fragrances' },
  { id: 'home', label: 'Home & Decor' },
  { id: 'food', label: 'Food & Beverage' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'sports', label: 'Sports & Fitness' },
  { id: 'supplements', label: 'Health & Supplements' },
  { id: 'accessories', label: 'Accessories' },
];
```

**`src/pages/PublicDiscover.tsx` (lines 45-52)** — Same list without "Saved".

### 2. Create product-category mapping for existing items

Since existing presets/scenes have style categories, we need a mapping from old categories + tags/keywords to new product categories. Add a `PRODUCT_CATEGORY_MAP` that maps scene types and preset tags to product categories:

```typescript
const PRODUCT_CATEGORY_MAP: Record<string, string[]> = {
  // Scene categories → product categories
  beauty: ['beauty', 'fragrances'],
  studio: ['fashion', 'jewelry', 'accessories', 'electronics'],
  lifestyle: ['home', 'food', 'accessories'],
  editorial: ['fashion', 'fragrances', 'jewelry'],
  streetwear: ['fashion', 'accessories'],
  fitness: ['sports', 'supplements'],
  athletic: ['sports', 'supplements'],
  gym: ['sports', 'supplements'],
  outdoor: ['sports', 'home'],
  urban: ['fashion', 'accessories'],
  cafe: ['food', 'home'],
  cozy: ['home', 'fashion'],
  professional: ['electronics', 'accessories'],
  // ... etc
};
```

Update the filter logic in both pages to use this mapping instead of the old style-based one.

### 3. Improve category bar styling

Currently: rounded pills with `px-5 py-2.5`. With 12 categories this will overflow.

Update to a **horizontally scrollable row** with smaller, refined pills:
- `overflow-x-auto scrollbar-hide` on the container
- `whitespace-nowrap` on the flex wrapper
- Slightly smaller pills: `px-4 py-2 text-sm`
- Smooth scroll on mobile
- Hide scrollbar with CSS utility
- On desktop: wrap naturally with `flex-wrap`
- Selected state: `bg-foreground text-background` (keep current)
- Unselected: `bg-transparent text-muted-foreground hover:text-foreground` (lighter, cleaner)

### 4. Add scrollbar-hide utility

Add to `src/index.css`:
```css
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
```

### 5. Files changed
- `src/pages/Discover.tsx` — new categories, new mapping, updated filter logic, improved category bar
- `src/pages/PublicDiscover.tsx` — same changes (no "Saved" tab)
- `src/index.css` — scrollbar-hide utility (if not already present)

### 6. What stays the same
- All item rendering, masonry grid, modals, search, save/featured logic unchanged
- No database changes needed — filtering is done client-side via keyword/tag mapping

