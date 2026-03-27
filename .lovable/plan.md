

# Show Item's Discover Categories (Multi-Select)

## Problem
The "Discover Category" dropdown currently includes product label aliases (like "Fashion & Apparel") that aren't real discover categories. Also, items can belong to **multiple** discover categories (stored as `discover_categories` array), but the UI only allows selecting one.

## Plan

**File: `src/components/app/DiscoverDetailModal.tsx`**

1. **Replace `ALL_DISCOVER_OPTIONS` with just `DISCOVER_CATEGORIES`** — only the 18 real discover category slugs, formatted with capitalized labels. Remove `PRODUCT_CATEGORIES` from the options list entirely.

2. **Convert the single-select `<Select>` for "Discover Category" into a multi-select chip/checkbox UI** that:
   - Shows all 18 `DISCOVER_CATEGORIES` as toggleable chips or checkboxes
   - Pre-selects the item's current `discover_categories` array values
   - Uses the first selected category as the primary `category` field (for backward compatibility)

3. **Update the save logic** (~line 643-668) to:
   - Save the full array to `discover_categories` on `custom_scenes`
   - Save the first selected value as the primary `category` on `discover_presets`

### UI approach
Replace the single `<Select>` with a compact grid of small toggleable chips (similar to tag selectors elsewhere in the app). Each chip shows the category name and highlights when selected.

**1 file changed.**

