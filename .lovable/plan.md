## Add `{{specification}}` token and improve auto-injection

No trigger needed — just a simple token that resolves to the product's dimensions string, and smarter auto-injection positioning.

### Changes in `src/lib/productImagePromptBuilder.ts`

**1. Add `{{specification}}` token** (in `resolveToken` switch, after `productColor` ~line 1272):
```
case 'specification': {
  if (!ctx.productDimensions) return '';
  return `[PRODUCT DIMENSIONS — ${productName.toUpperCase()}] ${ctx.productDimensions}. Render this product at exactly these proportions.`;
}
```
If dimensions are empty, returns empty string — template just gets nothing inserted. No trigger block needed.

**2. Improve auto-injection for templates without `{{specification}}`** (~lines 1389-1392):
- Check if template already contains `{{specification}}`; if yes, skip auto-injection (token already handled it)
- If no token in template, inject the same structured block right after the first sentence (product intro) instead of appending at the very end
- Fallback path (no template, ~line 1362): same structured block right after `Product: {title}`

**Result**: Scene templates can optionally use `{{specification}}` to place specs exactly where they want. Templates that don't use it still get specs auto-injected near the product identity. Empty specs = nothing added anywhere.
