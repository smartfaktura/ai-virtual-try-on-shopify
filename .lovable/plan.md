

# Fix Product Section in Submit to Discover Modal

## Problem
The modal currently shows a generic product library dropdown, even when the generation already has a product attached. The user expects to see the product this generation was created with, displayed directly — not buried in a dropdown.

## Solution
Replace the dropdown with a simpler approach:

1. **If the generation has a product attached** (props `productName` + `productImageUrl` are set): Show the product card directly (thumbnail + name) with a Switch toggle to include/exclude it. No dropdown needed.

2. **If no product was attached**: Show nothing (or a subtle "No product attached" note). Remove the library dropdown entirely — users shouldn't pick a random product for a generation that wasn't made with one.

### Changes in `src/components/app/SubmitToDiscoverModal.tsx`

- Remove the `useQuery` for `myProducts` (no longer needed)
- Remove `selectedProductId` state
- Add `includeProduct` boolean state (default `true` when props have product data)
- Replace the `<Select>` dropdown block (lines 236-271) with:
  - If `productName && productImageUrl`: show the product preview card with a `<Switch>` toggle labeled "Include product"
  - If no product props: show nothing
- Update `handleSubmit`: if `includeProduct` is true and product props exist, call `generate-discover-preview` and include product data; otherwise omit product fields
- Remove the second `useEffect` that tried to match products from library (lines 96-100)

This makes the modal shorter, clearer, and directly shows the product context from the generation.

