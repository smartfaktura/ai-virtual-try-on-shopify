

# Reinforce Background Color Accuracy — Prompt Safeguards

## Problem
Even with `flat solid #F8F8F5` in prompts, AI models sometimes drift slightly (warm/cool tint). We need more "safeguards" (saugikliai) — stronger prompt signals to lock the exact color.

## Changes (1 file)

**File: `src/lib/productImagePromptBuilder.ts`**

### 1. Add background-specific negative prompt terms
Add a new constant and inject it when a solid hex background is requested:

```ts
const BG_COLOR_NEGATIVES = 'No warm tint on background, no yellow cast, no beige drift, no color contamination from product onto background, no gradient on background unless requested.';
```

In `buildNegativePrompt`: detect if scene has `background` trigger → append `BG_COLOR_NEGATIVES`.

### 2. Reinforce hex at prompt start (preamble)
When the background resolves to a `flat solid #HEX` instruction, **prepend** a short preamble at the very beginning of the final prompt:

```
CRITICAL: The background must be exactly #F8F8F5 — no warmer, no cooler, no tint variation.
```

This "bookend" technique (hex at start + background instruction in middle + negative at end) gives the model three reinforcement points.

### 3. Add "exact color" emphasis in the resolved background string itself
Change the resolution from:
```
flat solid #F8F8F5 color background, no texture, no pattern
```
to:
```
flat solid exact #F8F8F5 color background, uniform color, no texture, no pattern, no color variation across the background
```

## Summary of reinforcement layers
1. **Preamble** — hex stated as critical requirement at prompt start
2. **Inline** — stronger wording in the `{{background}}` resolution ("exact", "uniform", "no color variation")  
3. **Negatives** — explicit anti-drift terms at prompt end

All changes in one file: `src/lib/productImagePromptBuilder.ts`

