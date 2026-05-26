## Goal

Help users who haven't uploaded any products complete Product Swap, and refine the subtitle styling under the main header without touching the "Product Swap" title itself.

## 1. Guide users with no products

Detect empty product state once products query resolves: `products.length === 0` (only when `!isLoading` so we don't flash empty UI).

**A. Subtle hint on Step 1 (Scene)** — under the page header area, when products are empty, show a small inline note:
> "Heads up: you haven't added any products yet. You'll need at least one to swap. **Add product →**"
Styled as a muted soft card (border-dashed, `bg-muted/30`), with a Package icon and a primary link button to `/app/products/new`. Dismissable is not needed — disappears as soon as a product exists.

**B. Empty state on Step 2 (Products)** — replace the current one-liner ("No products found. Add one") with a richer empty state shown only when `products.length === 0` (vs. only filtered-out by search):
- Centered card with Package icon
- Title: "No products in your library yet"
- Body: "Upload a product photo (PNG/JPG, ideally on white). It becomes the reference we swap into your scene."
- Primary CTA: "Add your first product" → `/app/products/new`
- Secondary ghost CTA: "Learn how it works" → `/app/learn` (or relevant guide)

Keep the existing "No products match your search" message for the search-empty case (products exist but filter is empty).

**C. Step 3 / generation guard** — already blocked by `canAdvanceFrom2` requiring a selection; no change needed there beyond the upstream guidance.

## 2. Refine the subtitle design

Keep `<h1>Product Swap</h1>` exactly as-is. Only restyle the line below it and show it across all steps (not just step 1) so the page identity is consistent.

Changes in the header block (lines ~557–569):
- Show subtitle on every step (drop the `currentStep === 1` gate).
- Replace the plain `<p>` with a small refined caption: `text-[13px] text-muted-foreground/90 tracking-wide font-light mt-0.5`, with a thin vertical accent bar (`before:` 2px primary/40, rounded) and tighter rhythm. No period at the end (per memory rule).
- On Step 2/3 the subtitle reads the same line — single source of identity, removing any duplicate step subtitles below.

Visual idea:

```text
[icon]  Product Swap
        │ Same scene, different product
```

The "│" is a 2px primary-tinted bar to add quiet structure without competing with the H1.

## Files

- `src/pages/ProductSwap.tsx`
  - Header subtitle block (lines ~561–568): restyle, always-visible.
  - Step 1 body (after the H2 around line 583): inject inline "no products yet" hint when `products.length === 0`.
  - Step 2 empty state (around lines 771–775): split into "no products at all" vs "no search matches" branches.

No backend, hook, or routing changes.