## Add Edit + Generate More Angles to the Product Images results lightbox

The results-page preview is `ImageLightbox` opened from `ProductImagesStep6Results`. It currently exposes only Download. On mobile, the icon row already exists but lacks the new actions; there is no kebab/overflow menu.

### Changes

1. **`src/components/app/ImageLightbox.tsx`** — add two optional props and render them on both desktop and mobile bars (additive only, no breaking changes for other consumers):
   - `onEdit?: (index: number) => void` — `Pencil` icon, label "Edit Image"
   - `onGenerateAngles?: (index: number) => void` — `Layers` icon, label "Generate More Angles"
   - Mobile: appended as icon-only buttons in the existing row (no kebab needed — total stays ≤4 icons in this surface: Download, Edit, Angles).
   - Desktop: pill buttons next to Download.

2. **`src/components/app/product-images/ProductImagesStep6Results.tsx`** — pass new handlers to `<ImageLightbox>`:
   - `onEdit={(idx) => navigate('/app/freestyle?editImage=' + encode(lightboxImages[idx]) + '&imageRole=edit')}`
   - `onGenerateAngles={(idx) => navigate('/app/perspectives?source=' + encode(lightboxImages[idx]))}`
   - Both close the lightbox before navigating.
   - Import `useNavigate` from react-router-dom (verify if not already present).

### Out of scope
- No grid-card kebab menu changes — actions live in the lightbox where the user already taps to preview.
- No changes to other lightbox callers (LibraryDetailModal etc.), no backend or routing changes.
- Brand mark preserved; no terminal periods in button labels.

### Risk
Low. Both props are optional; existing consumers keep current behavior.
