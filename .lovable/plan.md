# Footer (3 columns) + Mobile Horizontal Scroll Fix

Two changes: rebuild footer with full 3-column structure, and fix the mobile horizontal scroll on the home page.

## 1. Footer — `src/components/landing/LandingFooter.tsx`

Brand block on the left + 3 columns on the right. All links are real `<a href>` (react-router `<Link>` renders `<a href>`). Mobile collapses each column into a native `<details>` accordion (links remain in DOM, crawlable).

### Route mapping (verified against `src/App.tsx` and category data)

**PRODUCT**
- AI Product Photography → `/ai-product-photography`
- AI Product Photo Generator → `/ai-product-photo-generator`
- Visual Studio → `/features/workflows`
- Freestyle Studio → `/freestyle` (PublicFreestyle)
- Virtual Try-On → `/features/virtual-try-on`
- Image Upscaling → `/features/upscale`
- Product Perspectives → `/features/perspectives`
- Pricing → `/pricing`
- **Brand Models — omitted** (no public route; only the in-app `/app/models` exists, which requires auth)

**SOLUTIONS**
- Shopify Product Photos → `/shopify-product-photography-ai`
- Etsy Product Photos → `/etsy-product-photography-ai`
- Fashion Product Photography → `/ai-product-photography/fashion`
- Footwear Product Photography → `/ai-product-photography/footwear`
- Beauty & Skincare → `/ai-product-photography/beauty-skincare`
- Fragrance Photography → `/ai-product-photography/fragrance`
- Jewelry Product Photography → `/ai-product-photography/jewelry`
- Food & Beverage → `/ai-product-photography/food-beverage`
- AI vs Photoshoot → `/ai-product-photography-vs-photoshoot`
- VOVV.AI vs Studio → `/ai-product-photography-vs-studio`

**RESOURCES**
- Help Center → `/help`
- Blog → `/blog`
- About → `/about`
- Contact → `/contact`
- Privacy Policy → `/privacy` (actual route; user wrote `/privacy-policy` but page is mounted at `/privacy`)
- Terms of Service → `/terms`
- Cookie Policy → `/cookies`
- **Tutorials — omitted** (no public route exists; in-app `/app/learn` requires auth)

### Layout
- Desktop: brand `md:col-span-4 lg:col-span-3` + 3-column link grid `md:col-span-8 lg:col-span-9`, `gap-10`.
- Tablet (≥sm): 3 columns side-by-side.
- Mobile (<sm): each column inside `<details>` with chevron, short and scannable.
- Bottom bar: copyright left, "A product by 123Presets" right. Inline legal links removed (legal now lives inside Resources column as requested).

## 2. Mobile Horizontal Scroll Fix — `src/index.css`

The hero section uses several `overflow-x-auto` carousels. They are properly contained, but on iOS/Android the page can still pick up sub-pixel overflow from large background blurs and full-bleed elements. There is currently no `overflow-x` guard on the root.

Add to the existing `@layer base`:

```css
html, body {
  overflow-x: clip;
}
```

Why `clip` over `hidden`:
- `clip` prevents horizontal scroll without creating a new scroll container, so sticky headers and `position: sticky` elements keep working (which `overflow-x: hidden` would break on `html`).
- Vertical scroll behavior is unaffected.

This is a one-line, surgical fix that resolves accidental horizontal scroll across all pages without touching any section component.

## Versioning
- Bump `public/version.json` patch.
- Run `tsc --noEmit` to confirm no type errors.

## Out of Scope
- Other footers (`HomeFooter.tsx`) unchanged.
- No new pages or routes added.
