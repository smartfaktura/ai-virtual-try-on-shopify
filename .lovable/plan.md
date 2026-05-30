## Goal

Upgrade both search inputs on `/app/product-swap` (Scene step library picker + Products step) so they match Library's behavior: match across multiple fields instead of just `title`.

## Scope

Frontend only — `src/pages/ProductSwap.tsx`. No DB, hooks, or query changes. Library picker still uses the existing client-side fetch (200 freestyle + 200 jobs); search is just filtered locally over more fields.

## Changes

### 1. Library picker search (Scene step)

Currently:
```ts
libraryItems.filter(i => i.title.toLowerCase().includes(librarySearch.toLowerCase()))
```

Extend `LibraryPickerItem` to carry extra haystack fields fetched alongside the existing query (already partially selected — just thread them through):

- For freestyle rows: also keep `prompt` text.
- For job rows: also keep `workflow name`, `product title`, `scene_name`, `model_name`, `prompt_final` (add to the `.select(...)`).

Build a per-item `searchHaystack: string` once at load time (lowercased, space-joined). Filter with multi-token AND match — split the query on whitespace and require every token to appear in the haystack. Mirrors the spirit of Library's `.or(ilike)` across `product_name / scene_name / model_name / workflow_slug / prompt_final`.

### 2. Products search (Products step)

Currently:
```ts
products.filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase()))
```

Build a haystack from these `user_products` columns: `title`, `description`, `product_type`, `color`, `materials`, `sku`, `dimensions`, `weight`, and `tags[]` (joined). Same multi-token AND match.

### 3. UX polish (small, matches Library's input feel)

- Keep the existing input styling; just update `placeholder` on both inputs to something like `"Search by name, prompt, scene, model…"` (library) and `"Search by name, type, color, SKU, tag…"` (products).
- No new icons, no debouncing needed (filtering is local and cheap).
- Empty-state copy stays the same.

## Out of scope

- No server-side search for the picker (dataset is already capped at 400 client-side).
- No changes to selection, grids, generation, or the Library page itself.
- No new fields persisted to the DB.
