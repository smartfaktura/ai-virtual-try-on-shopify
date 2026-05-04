
## Fix: Sports bra not conflicting with the "top" outfit slot

The `getConflictingSlots()` function in `src/lib/productImagePromptBuilder.ts` (line 634) lists keywords that map to the `top` slot conflict. "Sports bra", "bra", and similar top-layer garments are missing from this list, so the system doesn't recognize them as tops and leaves the top slot editable.

### Change in `src/lib/productImagePromptBuilder.ts`

Add these keywords to the top garment conflict list (line 634):
`'bra'`, `'sports bra'`, `'sports-bra'`, `'bustier'`, `'corset'`, `'bandeau'`, `'camisole'`, `'halter top'`, `'tube top'`, `'wrap top'`, `'track jacket'`

This ensures that when the product is a sports bra (or similar), the top outfit slot is automatically hidden/conflicted — the product itself fills that role.
