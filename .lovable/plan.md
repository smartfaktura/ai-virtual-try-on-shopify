Update CRITICAL REQUIREMENTS #2 in the edge function prompt to remove the packaging-centric "MUST look EXACTLY like" language and replace it with a source-of-truth framing that works for any product type.

Changes:
- In `supabase/functions/generate-workflow/index.ts` line 617, replace:
  `The product MUST look EXACTLY like [PRODUCT IMAGE] — preserve 100% accurate packaging, labels, colors, branding, shape, and materials.`
  with:
  `Use [PRODUCT IMAGE] as the product source of truth — preserve the same shape, proportions, colors, materials, texture, finish, structure, and visible details without redesigning it.`
- Also update the multi-product template in the same line (additionalProducts loop) for consistency:
  `Product ${n} MUST look EXACTLY like [PRODUCT IMAGE ${n}] — same packaging, shape, colors, and branding.`
  becomes:
  `Use [PRODUCT IMAGE ${n}] as the product source of truth — preserve the same shape, proportions, colors, materials, texture, finish, structure, and visible details without redesigning it.`

No other CRITICAL items are affected. The interior workflow block is unchanged.