

# Redesign Outcome Tabs Section

## Problem
The current "Ecommerce Product Images for Every Channel" section uses the standard Radix `Tabs` component with a boxy `TabsList` that looks outdated. The layout is a basic 2-column grid with one image and text — feels generic. Images are single discover presets which may not be compelling.

## Solution
Replace the Radix `Tabs` with pill-style category chips (matching the `DiscoverCategoryBar` pattern used elsewhere in the app) and a richer layout showing **multiple images per tab** in a masonry-style grid alongside the text content.

### Changes in `src/pages/seo/AIProductPhotographyEcommerce.tsx`

1. **Remove Radix Tabs import** — no longer needed for this section (keep if used elsewhere; it's not).

2. **Replace Tabs with state-driven pill chips**:
   - Add `const [activeTab, setActiveTab] = useState('white-bg')` 
   - Render pills using the same `rounded-full bg-foreground text-background` active style from `DiscoverCategoryBar`
   - Horizontally scrollable on mobile

3. **Show 3 images per tab instead of 1**:
   - Update `tabImages` memo to pick **3 presets per tab** (instead of 1), using `pickByCategory` with count=3 and featured fallbacks
   - Layout: left side shows a 2+1 image grid (2 stacked small + 1 tall), right side has the text content
   - Each image is a clickable `DiscoverCard`

4. **Use different featured fashion/lifestyle images**:
   - For each tab category, prioritize `is_featured` presets first, then fall back to category matches, then any featured preset

5. **Refined layout**:
   - Images in a `grid grid-cols-2 gap-3` with the first image spanning both columns for emphasis
   - Text side gets the tab title, description, and CTA
   - Section background stays `bg-background`

### Visual result
```text
┌─────────────────────────────────────────────────┐
│  Ecommerce Product Images for Every Channel     │
│  subtitle text                                  │
│                                                 │
│  (●White Background) (○PDP) (○Lifestyle) ...    │  ← pill chips
│                                                 │
│  ┌──────────┬──────────┐  ┌──────────────────┐  │
│  │  img 1   │  img 2   │  │  Clean Product   │  │
│  │          │          │  │  Images           │  │
│  ├──────────┴──────────┤  │                  │  │
│  │      img 3          │  │  description...  │  │
│  │                     │  │  [Try This →]    │  │
│  └─────────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Files
| File | Change |
|------|--------|
| `src/pages/seo/AIProductPhotographyEcommerce.tsx` | Replace Radix Tabs with pill chips + multi-image grid layout |

