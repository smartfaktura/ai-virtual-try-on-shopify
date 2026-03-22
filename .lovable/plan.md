

# Personalized Dashboard Selector + Settings Preferences

## Overview
Add a "Personalized for: [category]" pill below the welcome greeting, with dynamic headline text, AI team line, and CTAs. Add "Content Preferences" section in Settings. All data saved to existing `profiles.product_categories`.

## Files

### 1. New: `src/lib/categoryConstants.ts`

```typescript
export const PRODUCT_CATEGORIES = [
  { id: 'fashion', label: 'Fashion & Apparel' },
  { id: 'beauty', label: 'Beauty & Skincare' },
  { id: 'fragrances', label: 'Fragrances' },
  { id: 'jewelry', label: 'Jewelry' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'home', label: 'Home & Decor' },
  { id: 'food', label: 'Food & Beverage' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'sports', label: 'Sports & Fitness' },
  { id: 'supplements', label: 'Health & Supplements' },
  { id: 'any', label: 'All products' },
];

export const CATEGORY_HEADLINES: Record<string, string> = {
  fashion: 'Create campaign-ready fashion visuals without photoshoots.',
  beauty: 'Create clean, high-end skincare visuals that feel like luxury campaigns.',
  fragrances: 'Capture the mood of your fragrance through cinematic, emotional visuals.',
  jewelry: 'Highlight every detail with premium, light-perfect jewelry visuals.',
  accessories: 'Turn everyday products into styled, scroll-stopping visuals.',
  home: 'Place your products into beautifully designed interiors instantly.',
  food: 'Create delicious, ad-ready visuals that make people crave your product.',
  electronics: 'Showcase your product in sleek, modern environments built for conversion.',
  sports: 'Create dynamic visuals with energy, movement, and performance.',
  supplements: 'Build trust with clean, premium visuals that feel credible and strong.',
  any: 'Turn your ideas into high-quality, brand-ready visuals in seconds.',
};
```

Helper functions:
- `getCategoryLabel(ids: string[])` — 0 or only "any" → "All products", 1 → category name, 2 → "A & B", 3+ → "Your product mix"
- `getCategoryHeadline(ids: string[])` — 0 or "any" → all products headline, 1 → exact match, 2 → "Create high-quality visuals tailored to your products — from styled campaigns to real-life scenes.", 3+ → "Turn your product mix into consistent, high-quality visuals in seconds."

### 2. New: `src/components/app/DashboardPersonalizationHero.tsx`

Self-contained component. Placed between welcome text and Quick Actions on the returning-user dashboard.

**Data**: Fetches `product_categories` from `profiles` on mount. Local editing state. Saves to `profiles.product_categories` on "Save preferences".

**UI structure** (top to bottom):
1. **Pill selector**: `Personalized for: [label ▼]` — `rounded-full bg-muted px-3 py-1.5 text-sm font-medium` with `ChevronDown` icon. Hover: slightly darker bg. Click opens Popover (desktop) or MobilePickerSheet (mobile).
2. **Dropdown content**: Header "Select your focus". All 11 categories with checkmarks. Multi-select. Footer: "Save preferences" button.
3. **Dynamic headline**: Text from `getCategoryHeadline()`. `text-base text-muted-foreground`. Smooth opacity transition on change.
4. **AI team line**: "Your AI creative team is ready to generate, refine, and scale your visuals." — `text-sm text-muted-foreground`
5. **"Meet your AI team"** — subtle text link → `https://vovv.ai/team`
6. **CTA buttons**: Primary "Generate new visuals" → `/app/freestyle`, Secondary outline "Browse workflows" → `/app/workflows`

**Mobile**: Uses existing `MobilePickerSheet` for category picker. Save button at bottom of sheet.

### 3. Edit: `src/pages/Dashboard.tsx` (lines 402-412)

Insert `<DashboardPersonalizationHero />` between `<p>Here's what's happening...</p>` (line 406) and the Quick Actions div (line 408).

### 4. Edit: `src/pages/Settings.tsx` (lines 473-475)

After "In-App Notifications" section, before `</CardContent>`, add:
- `<Separator />`
- Section header: "Content Preferences"
- Description: "Select categories that match your products. This helps tailor your dashboard experience."
- Checkbox list of all 11 categories (same from `categoryConstants.ts`, showing "All products" for "any")
- "Save preferences" button (writes to `profiles.product_categories`)
- "Reset to onboarding selection" text button (re-fetches and restores original)

### 5. Edit: `src/pages/Onboarding.tsx`

Replace local `PRODUCT_CATEGORIES` array with import from `categoryConstants.ts`. Map "any" label back to "Any Product" in onboarding UI only (or keep consistent as "All products" everywhere).

## No database changes needed
`profiles.product_categories` (text array) already exists.

