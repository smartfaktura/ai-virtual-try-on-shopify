

## Fix Source Label: Product Name & Sentence Case

### Problem
1. **"Generation" fallback** — Jobs without a linked `product_id` show "Generation" instead of a meaningful name. For historical jobs this data isn't recoverable, but we can improve the fallback by using the workflow name as context (e.g. "Flat Lay Set" is better than generic "Generation").
2. **ALL CAPS product names** — Product titles like "DIAGO V2 HOODED ZIP JACKET" display in uppercase because that's how they were stored. Should display in sentence case for cleaner UI.

### Changes — `src/pages/Dashboard.tsx`

**A. Better fallback label (line 463)**
When `user_products?.title` is null, fall back to workflow name, then "Generation":
```tsx
{toSentenceCase(job.user_products?.title || job.workflows?.name || 'Generation')}
```

**B. Add sentence case helper**
Add a small utility function at top of file:
```tsx
function toSentenceCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
```
This converts "DIAGO V2 HOODED ZIP JACKET" → "Diago v2 hooded zip jacket". However, for product names with acronyms/model numbers, a smarter approach would preserve words that look like acronyms. A simpler approach: just capitalize each word's first letter (title case):
```tsx
function toSentenceCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}
```
Result: "Diago V2 Hooded Zip Jacket" — cleaner and preserves readability.

**C. Apply to alt text too (line 453)**
Use the same formatted name for the image alt attribute.

Single file change, ~10 lines added/modified.

