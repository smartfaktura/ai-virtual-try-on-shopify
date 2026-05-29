# Remove "All text on packaging must be perfectly legible" from CRITICAL REQUIREMENTS

## Why
Currently `supabase/functions/generate-workflow/index.ts` (line 618) injects this on **every** non-interior generation:

> 3. All text on packaging must be perfectly legible.

99% of products (apparel, shoes, eyewear, jewelry, bags, etc.) have no packaging at all. Forcing the model to think about "packaging text legibility" on these:
- Wastes a numbered CRITICAL slot
- Can bias the model toward inventing labels/tags on items that shouldn't have any (hangtags on dresses, stickers on sneakers)
- CRITICAL #2 already covers it for true packaging products: "preserve 100% accurate packaging, labels, colors, branding, shape, and materials"

## Change

`supabase/functions/generate-workflow/index.ts` — delete line 618 entirely and renumber subsequent items.

Before:
```
2. The product MUST look EXACTLY like [PRODUCT IMAGE]...
3. All text on packaging must be perfectly legible.
4. Ultra high resolution, professional quality, no AI artifacts.
5. This specific variation must clearly match...
6. The person MUST match [MODEL IMAGE]...
7. BACKGROUND ISOLATION (CRITICAL): ...
8. OUTFIT CONSISTENCY (CRITICAL): ...
```

After:
```
2. The product MUST look EXACTLY like [PRODUCT IMAGE]...
3. Ultra high resolution, professional quality, no AI artifacts.
4. This specific variation must clearly match...
5. The person MUST match [MODEL IMAGE]...
6. BACKGROUND ISOLATION (CRITICAL): ...
7. OUTFIT CONSISTENCY (CRITICAL): ...
```

Also update the `additionalProducts` inline numbering on line 617 which currently references `idx + 4` — shift to `idx + 3` so multi-product numbering stays continuous, and adjust the final count line from `additionalProducts.length + 4` to `additionalProducts.length + 3`.

## Effect
- Label/text fidelity for true packaging products still covered by CRITICAL #2 ("packaging, labels, colors, branding")
- No more spurious "packaging text" hint pushing the model toward inventing tags/labels on apparel/shoes/jewelry
- One less CRITICAL line per prompt

## Out of scope
- Interior workflow block (lines 572-586) — no change, doesn't include this line.
- Builder-side negatives — already trimmed in previous step.