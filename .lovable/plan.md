

# Add Product Fidelity Directive to Generation Prompts

## Problem
The AI sometimes halluccinates product details (wrong shape, colors, labels, textures) because the current `REFERENCE_ISOLATION` instruction only tells the AI to **ignore the background** of the reference image. It never explicitly demands pixel-accurate reproduction of the product itself.

## Solution
Add a new `PRODUCT_FIDELITY` constant alongside `REFERENCE_ISOLATION` in the prompt builder, and prepend it to every resolved prompt. This is a single-file change — no admin UI or template edits needed, it applies universally to all scenes.

## Proposed directive text

```
PRODUCT FIDELITY (NON-NEGOTIABLE): Reproduce the product from [PRODUCT IMAGE] with 100% accuracy — exact shape, exact colors, exact labels, exact textures, exact branding, exact proportions. Do NOT invent, alter, or simplify any detail. If the product has text, logos, or patterns, they must be pixel-accurate. Any deviation from the reference product is a generation failure.
```

This is modeled on the same authoritative language already used successfully in the workflow generator (line 560: "preserve 100% accurate packaging, labels, colors, branding, shape, and materials").

## Changes

**File: `src/lib/productImagePromptBuilder.ts`**

1. Add a new constant `PRODUCT_FIDELITY` after the existing `REFERENCE_ISOLATION` (line 235)
2. At line 977, prepend both: `prompt = PRODUCT_FIDELITY + ' ' + REFERENCE_ISOLATION + ' ' + prompt`

That's it — two lines changed, one file. Every Product Images generation will now carry this directive regardless of which scene template is used.

