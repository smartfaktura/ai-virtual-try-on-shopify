

## Problem
1. Empty state click on "Product URL" / "CSV" / "Shopify" → opens the same big drawer that re-shows the entire 5-method rail. User picked the method already, but UI makes them feel like nothing decisive happened.
2. Drawer at 600px feels narrow for image upload + form fields, especially after a method is chosen the secondary rail eats vertical space.
3. After clicking a method, there's no clear "you are in X mode" — title still says "Add Products" generically.

## Fix — two-part redesign

### Part 1 — Direct entry, no method rail when user already chose one
When opening the drawer **from a specific empty-state method** (URL / CSV / Shopify / Paste), skip the method rail entirely. Show only that one workflow with a clear titled header and a tiny "Switch method ▾" link.

```text
┌─ Sheet ────────────────────────────────────┐
│ ← Import from URL                       X │
│ Paste a product page link to import       │
│                                            │
│ [ https://shop.com/products/...      ]    │
│ [ Import ]                                 │
│                                            │
│ Switch method ▾   (small, bottom-left)    │
└────────────────────────────────────────────┘
```

When opened from the **"Add Products" main button** (returning user, no method preselected), keep the current method rail — that's the discovery surface.

### Part 2 — Wider, calmer drawer
- Bump desktop Sheet from `sm:max-w-[600px]` → `sm:max-w-[720px]` so upload + form breathe.
- Header gets a contextual title per method: "Upload images", "Import from URL", "CSV import", "Shopify import", "Paste an image".
- Header gets a contextual subtitle replacing the generic one.

### Part 3 — Light pop UX for "Paste image"
Currently Paste opens the full drawer in Upload mode. Replace with: clipboard read attempt → if image present, instantly open the drawer **already at the metadata-confirm step** (files preloaded). If clipboard empty, show inline toast "Press Cmd/Ctrl+V to paste — listening…" and keep page-level paste listener live for 15s. No drawer opens at all until an image arrives.

### Part 4 — Empty-state polish
- Make the "Other ways" rows visibly clickable (currently feels passive): add subtle hover lift + arrow that slides on hover.
- Add tiny inline result feedback when a method is selected (button micro-press + 80ms delay before drawer opens) so the action feels confirmed.
- Tighten secondary panel header from "Other ways" → "Or import from".

## Files to edit
- `src/components/app/AddProductModal.tsx` — accept `compact?: boolean` (default true when `initialTab` is preset from empty-state method); when compact, hide method rail, render contextual header per `activeTab`, show small "Switch method ▾" popover toggling back to full rail; widen Sheet to 720px.
- `src/pages/Products.tsx` — when calling `openAddDrawer` from an empty-state method, pass `compact: true`. When calling from main "Add Products" button, pass `compact: false`. Improve paste flow: try clipboard read first; if empty, just arm a 15s window paste listener + toast (no drawer open).
- `src/components/app/ProductsEmptyUpload.tsx` — micro-interaction polish on method rows (hover arrow slide, subtle press), copy tweak.

## Out of scope
- No backend, no tab internals (`StoreImportTab` / `CsvImportTab` / etc unchanged), no product card / grid changes.

## Acceptance
- Click "Product URL" on empty state → drawer opens showing **only** the URL input with title "Import from URL". No 5-row rail.
- Click main "Add Products" button (returning user) → drawer opens with full method rail as today.
- Click "Paste image" → if clipboard has image, drawer opens already at metadata step. If not, toast appears and any Cmd/Ctrl+V on the page within 15s opens drawer with that image.
- Drawer is visibly wider (720px) on desktop; mobile drawer unchanged.
- A small "Switch method ▾" link in compact mode lets user expand back to full rail without closing the drawer.

