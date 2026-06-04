## Goal
In `/app/generate/product-images` Setup step, the Socks "Product Details" panel currently shows **Size / Length / Style** with limited options. Size (S/M/L/XL) is meaningless for image generation. Replace with prompt-useful fields so they get injected into the generation prompt.

## Edit
Single file: `src/lib/productSpecFields.ts` (lines 78–82), socks entry.

These fields are already auto-serialized as `Key: Value` into the prompt via `buildSpecsPromptLine` (used in `src/pages/ProductImages.tsx`), so no other code is needed.

## New socks fields

**1. Length** (select) — expanded, super-specific:
- No-show / liner
- Ankle (low-cut)
- Quarter (just above ankle)
- Crew (mid-shin)
- Mid-calf
- Knee-high
- Over-the-knee
- Thigh-high

**2. Material** (select) — replaces Style; drives knit texture + sheen in prompt:
- Cotton
- Combed cotton
- Merino wool
- Cashmere
- Bamboo
- Linen
- Silk blend
- Modal / micromodal
- Performance synthetic (nylon/polyester)
- Compression knit
- Terry / cushioned
- Ribbed knit
- Sheer / mesh

**3. Knit pattern** (select) — visual texture cue:
- Smooth flat knit
- Ribbed
- Cable knit
- Jacquard / patterned
- Argyle
- Striped
- Mesh / sheer
- Terry loop

**Remove:** `size` (S/M/L/XL — not visually useful) and `style` (replaced by Material + Knit pattern, which are more prompt-actionable).

## Result
When a user picks Crew + Merino wool + Ribbed, the prompt gets:
`Length: Crew (mid-shin), Material: Merino wool, Knit pattern: Ribbed` — directly steering knit texture, sheen, and leg coverage in the generated image.
