

## Fix Pluralization + Category UX Polish

Two issues: (1) all CTAs say "Add Product" (singular) even though the system supports batch uploads, and (2) the "Change category" toggle still looks like a button rather than subtle text.

### Changes

**1. `src/pages/Products.tsx`** — Update button and empty state CTA:
- Line 171: `Add Product` → `Add Products`
- Line 243: empty state action content → `Add Products`

**2. `src/pages/AddProduct.tsx`** — Update page title and subtitle:
- Line 54: `'Add Product'` → `'Add Products'`
- Line 58: subtitle → `'Upload images, import from a URL, or bulk-add via CSV. Each image = one product.'`

**3. `src/components/app/ManualProductTab.tsx`** — Two fixes:

**a) Single product submit button** (line 894): Keep `'Add Product'` when single mode — already correct since it's 1 product.

**b) "Change category" styling** (batch: lines 589-595, single: lines 829-835):
- Remove the `<button>` wrapper, use a plain `<span>` or `<p>` styled as subtle inline text link
- Style: `text-[11px] text-muted-foreground/60 hover:text-muted-foreground cursor-pointer underline decoration-dotted underline-offset-2`
- Remove the `ChevronDown` icon — just show "Change category" as a dotted-underline text link, not a button-like element

### Summary of label changes
- Products page button: "Add Products"
- AddProduct page title: "Add Products" (singular "Edit Product" stays for edit mode)
- AddProduct page subtitle: updated to mention batch
- Batch submit button: already says "Add N Products" — no change
- Single submit button: already says "Add Product" — no change
- "Change category" becomes a subtle dotted-underline text, not a button

