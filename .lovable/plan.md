

## Fix: Make Add Product Page Feel Native to the App

The Add Product page currently uses raw `div` elements for its header while every other app page uses the shared `PageHeader` component. This creates visual inconsistency. The fix is straightforward.

### Changes

**`src/pages/AddProduct.tsx`** — Refactor to use `PageHeader` component

1. Replace the manual header (`div` + `Button` + `h1` + `p`) with `<PageHeader>` using its `backAction`, `title`, and `subtitle` props — matching the pattern used by Products, BrandProfiles, etc.
2. Wrap the tabs content inside `PageHeader` children so layout spacing is consistent.
3. Remove the `max-w-2xl` constraint on the Tabs — let it breathe more on desktop (use `max-w-3xl` or remove entirely to match other pages).
4. Move the `ProductUploadTips` inside the `PageHeader` children block so spacing is uniform.

Result: The page will have the same header layout, spacing, and back-button style as every other app page.

