

## Goal
Three fixes on /app/products:
1. Hide "Help us improve VOVV.AI / Share feedback" banner when user has no products
2. Make all "OTHER WAYS" buttons fully functional from the empty state
3. Redesign the right-side Add Products drawer to match the premium empty-state aesthetic

## A. Hide FeedbackBanner on empty state
`src/pages/Products.tsx` line 448: render `<FeedbackBanner />` only when `!hasNoProducts`. Keep it visible once products exist.

## B. Wire "OTHER WAYS" buttons properly
Current state: `onMethodSelect` already opens drawer on the right tab — but two methods need real behavior:

- **Paste image** currently maps to `manual` tab with no actual paste hook → opens Upload tab silently. Fix: when "Paste image" is clicked, open drawer in `manual` tab AND focus a paste-capture zone. Simplest robust approach: read `navigator.clipboard.read()` at click time, extract image blobs, convert to `File[]`, then `openAddDrawer('manual', files)`. If clipboard is empty/denied, fall back to opening drawer with a one-time toast: "Press Cmd/Ctrl+V to paste an image".
- **Product URL → store**, **CSV → csv**, **Shopify → shopify** already map to existing tabs and work — verify by re-confirming `AddProductModal` `useEffect` syncs `activeTab` from `initialTab` on each open (it does, lines 51-55 of AddProductModal).

Add a global paste listener in `Products.tsx` (only active when `addOpen` and on empty page) that captures `ClipboardEvent` images and feeds them into the drawer's `initialFiles` — same pipeline as drag-drop.

## C. Redesign the right drawer to match empty-state premium look
Current drawer (`AddProductModal.tsx` desktop branch) uses small pill tabs in a 60% muted bar. Replace with the same visual language as `ProductsEmptyUpload`:

```text
┌─ Sheet (right, 600px) ─────────────────────────┐
│ Add Products                                  X│
│ Upload images or import in seconds             │
│                                                │
│ ┌─ method rail (vertical, quiet) ────────────┐ │
│ │ ⬆  Upload images        ● active           │ │
│ │ 📋 Paste image                             │ │
│ │ 🌐 Product URL                             │ │
│ │ 📊 CSV import                              │ │
│ │ 📱 Mobile upload                           │ │
│ │ 🛍 Shopify import                          │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ ┌─ active method panel ──────────────────────┐ │
│ │   (current ManualProductTab / StoreImport  │ │
│ │    / CsvImport / Mobile / Shopify content) │ │
│ └────────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

Specifically:
- Replace the `TabsList` pill row with a **segmented icon+label list** styled like the right column of `ProductsEmptyUpload` (rounded border container with divided rows + ChevronRight indicator on hover, active row highlighted with `bg-muted` + primary-tinted icon).
- Compact horizontal variant on mobile (4-col scrollable chips) preserved via `useIsMobile`.
- Keep all `TabsContent` bodies untouched — pure visual swap of the selector.
- Header gets the same typographic treatment as the empty card: `text-lg font-semibold tracking-tight` title + muted subtitle (already close, just align spacing/padding).
- Remove the small uppercase chips currently used as TabTriggers, but keep semantic Tabs primitive for state management.

No backend, no tab logic, no `ManualProductTab`/`StoreImportTab`/etc. internals changed.

## Files to edit
- `src/pages/Products.tsx` — conditional `FeedbackBanner`, add clipboard paste handler, paste-button clipboard read
- `src/components/app/ProductsEmptyUpload.tsx` — make Paste button trigger clipboard read before opening drawer
- `src/components/app/AddProductModal.tsx` — redesign desktop Sheet with vertical method rail matching empty-state aesthetic; mobile keeps current compact selector

## Acceptance
- Empty Products page: no Feedback banner visible
- Clicking any of Paste / URL / CSV / Shopify on empty state opens the drawer pre-set to that method, ready to use
- Paste image: reads clipboard if granted; otherwise opens Upload tab with toast prompting Cmd/Ctrl+V
- Drawer visual matches the empty-state card's quiet, premium look — no pill-tab strip
- All existing import flows keep working; no backend changes

