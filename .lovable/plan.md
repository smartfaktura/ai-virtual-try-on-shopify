

# Public Freestyle: Clean Up UI, Add Brand Chip Disable, Local Image Upload, SEO

## Changes

### 1. `src/pages/PublicFreestyle.tsx`

**Remove header & categories**: Delete the title/subtitle block (lines 363-370) and the `PublicDiscoverCategoryBar` component (lines 372-377). Remove the `CATEGORIES`, `PRODUCT_CATEGORY_MAP`, `itemMatchesProductCategory` constants and `selectedCategory` state since they're no longer needed. Show all freestyle items unfiltered.

**Local image upload (no storage)**: Add `sourceImagePreview` state. When user uploads/pastes an image, create a local `URL.createObjectURL` preview — never upload to storage. Pass it to `FreestylePromptPanel` so the image appears in the panel. On remove, revoke the object URL.

**Disable brand chip**: Add `brand` to the `disabledChips` prop: `disabledChips={{ product: true, brand: true }}`.

**Improve SEO**: Expand the `SEOHead` with richer title, description, and add `JsonLd` structured data (SoftwareApplication schema) for the freestyle tool page.

### 2. `src/components/app/freestyle/FreestyleSettingsChips.tsx`

**Add `brand` to `disabledChips` type**: Extend `disabledChips?: { product?: boolean; model?: boolean; scene?: boolean; brand?: boolean }`.

**Wrap BrandProfileChip** with same disabled tooltip pattern as product chip: when `disabledChips.brand` is true, show tooltip "Register to create your brand profile", opacity-40, popover disabled.

### 3. `public/sitemap.xml`

Add `/freestyle` entry.

### Files
- `src/pages/PublicFreestyle.tsx` — remove header/categories, add local image preview, disable brand chip, improve SEO
- `src/components/app/freestyle/FreestyleSettingsChips.tsx` — add brand disabled chip support
- `public/sitemap.xml` — add /freestyle

