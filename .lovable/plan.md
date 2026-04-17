

## Goal
Make /app/products active and frictionless in both empty and filled states. Reuse existing components — no backend changes, no card/grid changes.

## Architecture decision
- Keep the existing `AddProductModal` (it already wraps `ManualProductTab` + URL/CSV/Mobile/Shopify tabs). Convert it from a centered Dialog to a **right-side Sheet (drawer)** on desktop. Mobile keeps the bottom Drawer.
- Stop navigating to `/app/products/new` from the Products page. Open the drawer in place.
- The route `/app/products/new` stays alive for deep links / edit flow — no removal.

## A. Empty state (`Products.tsx`)
Replace the current `EmptyStateCard` (when `products.length === 0` and not searching) with a new inline upload surface:

```text
┌─────────────────────────────────────────────────┐
│  Add your first product                         │
│  Upload images, paste a link, or import in bulk │
│                                                 │
│  ┌──────────────────────┐  ┌─────────────────┐ │
│  │  ⬆  Drag & drop      │  │ • Upload images │ │
│  │     or browse files  │  │ • Paste image   │ │
│  │  PNG · JPG · WEBP    │  │ • Product URL   │ │
│  │  Multiple supported  │  │ • CSV import    │ │
│  └──────────────────────┘  │ • Shopify       │ │
│                             └─────────────────┘ │
│  Best results: clean background, good lighting │
└─────────────────────────────────────────────────┘
```

- **Left (primary)**: large dashed drop zone wired to the same upload handler `ManualProductTab` uses. Dropping/selecting files immediately opens the drawer in "Upload" tab with files pre-loaded — user lands directly in the metadata-confirm step.
- **Right (secondary)**: 4 quiet rows (Paste image, Product URL, CSV, Shopify). Click → opens drawer pre-selected on that tab.
- New component: `src/components/app/ProductsEmptyUpload.tsx` — purely presentational; emits `onFilesSelected(files)` and `onMethodSelect(method)`.

## B. Non-empty state
- Keep grid/cards/search/filters/sort exactly as-is.
- Change "Add Products" button: instead of `navigate('/app/products/new')`, set `addOpen=true` to open the drawer.
- Remove the duplicated "Add Products" button (currently rendered twice — once gated on `products.length > 0`, redundant with toolbar).

## C. Convert AddProductModal → right-side Sheet (desktop)
In `AddProductModal.tsx`:
- Desktop branch: swap shadcn `Dialog` for `Sheet` with `side="right"`, `className="w-full sm:max-w-[560px] flex flex-col p-0"`.
- Header: "Add Products" + subtext "Upload images or import products in seconds" + close X (Sheet provides).
- Body: same Tabs (Upload / URL / CSV / Mobile / Shopify) — visually keep them, they are already underline-friendly pill style and work well in narrow drawer.
- Mobile branch: unchanged (bottom Drawer).
- Accept new optional props: `initialTab?: 'manual'|'store'|'csv'|'mobile'|'shopify'` and `initialFiles?: File[]` so the empty state can deep-link into Upload with files preloaded.
- `ManualProductTab` already exposes drag/drop + browse and a `singleImage`/`batchItems` model — accept `initialFiles` via a small `useEffect` that runs the existing file-handler once on mount.

## D. Page-wide drag overlay
In `Products.tsx`, add window-level `dragenter`/`dragover`/`dragleave`/`drop` listeners. While dragging files anywhere on the page, render a full-page overlay:
> "Drop to add products"
On drop → open drawer with files preloaded. Works in both empty and filled states.

## E. Drawer behavior after upload
- After successful add: invalidate queries (already handled), keep drawer open and reset form so user can keep dropping more.
- Add small inline confirmation toast already exists — leave as-is.
- Close button or clicking outside closes.

## Files to edit
- `src/pages/Products.tsx` — open drawer instead of navigating; new empty-state surface; page-level drag overlay
- `src/components/app/AddProductModal.tsx` — desktop becomes right Sheet; accept `initialTab` + `initialFiles`
- `src/components/app/ManualProductTab.tsx` — accept `initialFiles` prop and feed to existing handler on mount
- New: `src/components/app/ProductsEmptyUpload.tsx`

## Out of scope (per request)
- Product card design, grid layout, backend, storage, /app/products/new route (kept for direct links and edit), search/filter/sort

## Acceptance
- Empty page shows active dual-panel upload surface — no passive icon
- Dragging files anywhere triggers overlay; dropping opens drawer with files queued
- "Add Products" opens right drawer (desktop) / bottom drawer (mobile), never navigates
- Filled-state grid, cards, filters unchanged
- Same upload logic and copy in both states

