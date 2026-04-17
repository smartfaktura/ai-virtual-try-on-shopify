

## Full QA pass for /app/products — all upload methods

### Scope
Deep QA of `/app/products` add-product flow across all 5 methods (Upload, URL, CSV, Mobile, Shopify), edit flow, list/empty states, and visual polish on desktop + mobile. No new features — only verify behavior and fix any bugs found along the way.

### What I'll check (per method)

**1. Upload (Manual)**
- Drop area: drag/drop, click-to-browse, paste from clipboard
- Multi-file batch upload, progress, error states (size, type, count)
- AI auto-analysis (title, type, description) populates correctly
- Multi-angle reference slots (back/side/inside/packaging) save
- Storage path uses `user_id/` prefix (RLS compliance)
- Save → product appears in list, query invalidation works

**2. Product URL**
- URL field focus ring (recently fixed) — no clipping
- `import-product` edge function call, error handling, image preview
- Save flow + duplicate detection

**3. CSV**
- Template download, file parse, row preview
- Batch insert, partial-failure handling, progress
- Image URL validation per row

**4. Mobile (desktop-shown handoff)**
- QR generation, session token, `mobile-upload` edge function reachable
- Hidden on mobile viewport (correct)

**5. Shopify**
- Store URL validation, product list fetch, selection, batch import

**6. Edit flow** (`/app/products/:id`)
- `editingProduct` loads, fields prefilled, image replacement, save updates row

**7. List + empty states**
- Empty state CTA (recently polished) — desktop button visible, mobile card
- Add Products modal on mobile — 2-col card grid after back arrow
- Pagination/scroll, search, filter behavior
- Card actions: edit, delete (with confirm), image count badge

### How I'll execute

1. Read all relevant components: `AddProduct.tsx`, `ManualProductTab`, `StoreImportTab`, `CsvImportTab`, `MobileUploadTab`, `ShopifyImportTab`, `ProductsEmptyUpload`, `Products` list page, `useFileUpload` hook, edge functions (`import-product`, `mobile-upload`, `analyze-product-image`).
2. Cross-check against memory rules: storage RLS prefixes, image quality (no width param), brand terminology.
3. Inspect edge function recent logs for errors.
4. Browser-test the live preview at `/app/products` on desktop (1366×768) + mobile (390×844): empty state, each tab, edit flow, error paths.
5. Triage any bug found into: (a) **must-fix now** (broken behavior, visual regression), (b) **nice-to-fix** (polish), (c) **out of scope** (existing limitation, separate ticket).

### Deliverable

A structured QA report with:
- ✅ Working as expected — per method
- ⚠️ Issues found — with file/line, severity, repro
- 🔧 Fixes applied — code diffs for must-fix items
- 📋 Recommendations — for nice-to-fix items (you decide whether to do them)

### Out of scope
- Backend rewrites, new features, schema changes, payment flows, generation pipeline.

