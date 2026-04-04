

# Smart Defaults + Auto-Inject for Fashionable Generations

## Problem

When a user skips the Refine step (or leaves everything on "Auto"), the prompt builder produces weak, generic instructions:

| Setting | Current default when "Auto" | Result |
|---------|----------------------------|--------|
| Background | `"clean neutral"` | AI invents random bokeh/warm tones |
| Surface | `"on a premium styled surface"` | Vague — AI picks anything |
| Styling direction | empty string | No aesthetic guidance at all |
| Shadow | `"soft, natural contact shadow"` | OK but could be better per category |
| Lighting | category-aware function | Good — keep as-is |
| Consistency | `"balanced"` | OK |
| Accent | empty string | Fine as default |
| Person details | empty string | AI invents random model traits |

Additionally, 82 of 91 scene templates lack `{{background}}`, `{{shadowDirective}}`, `{{surfaceDirective}}`, and `{{stylingDirective}}` tokens — so even when users DO select values, they never reach the prompt.

## Solution: Two Changes

### Change 1: Category-aware smart defaults (prompt builder)

Replace all weak "auto" fallbacks with strong, fashionable defaults keyed by product category. When `isAuto()` is true, instead of returning generic strings, return production-quality descriptions.

**File: `src/lib/productImagePromptBuilder.ts`**

New default functions:

```text
defaultBackground(category):
  garments / shoes / bags → "soft warm white seamless studio background"
  fragrance / beauty / makeup → "soft neutral light gray seamless background"  
  tech-devices → "clean matte white seamless background"
  food-beverage → "warm off-white background with natural warmth"
  home-decor → "soft white studio background"
  default → "soft warm white seamless studio background"

defaultSurface(category):
  garments → "on a clean, minimal studio surface with seamless backdrop"
  shoes / bags → "on a clean, minimal studio surface with seamless backdrop"
  fragrance / beauty → "on a clean, minimal studio surface with seamless backdrop"
  food-beverage → "on a warm, natural wood surface with visible grain"
  home-decor → "on a premium styled surface with complementary texture"
  default → "on a clean, minimal studio surface with seamless backdrop"

defaultShadow(category):
  garments / shoes / bags → "soft diffused shadow beneath for a refined, airy feel"
  fragrance / beauty → "barely-visible contact shadow for floating elegance"
  tech-devices → "crisp, well-defined shadow adding depth and dimension"
  default → "soft, natural contact shadow grounding the product"

defaultStyling(category):
  garments → "Clean commercial styling — crisp, professional composition"
  fragrance / beauty / makeup → "Beauty-clean styling — luminous, minimal composition"
  shoes / bags → "Minimal luxury styling — clean, restrained, premium"
  tech-devices → "Modern sleek styling — contemporary, geometric, sharp"
  food-beverage → "Organic natural styling — relaxed, authentic"
  default → "Clean commercial styling — crisp, professional"
```

Update each `resolveToken` case to call these instead of returning vague strings.

### Change 2: Auto-inject missing directives after template resolution

**File: `src/lib/productImagePromptBuilder.ts`** — In `buildDynamicPrompt`, after line 512 (template resolution + cleanup), auto-append any directive the template didn't include:

```typescript
// After template resolution, inject key directives if missing
const injectIfMissing = (keyword: string, tokenName: string) => {
  const resolved = resolveToken(tokenName, ctx);
  if (resolved && !prompt.toLowerCase().includes(keyword)) {
    prompt += ` ${resolved}`;
  }
};

injectIfMissing('background', 'background');      // "Background: soft warm white..."
injectIfMissing('shadow', 'shadowDirective');
injectIfMissing('surface', 'surfaceDirective');
injectIfMissing('styling', 'stylingDirective');
injectIfMissing('lighting', 'lightingDirective');
```

This ensures ALL 91 scenes get background/shadow/surface/styling/lighting regardless of whether their template has the tokens.

### Summary of defaults when nothing is selected

| Setting | Smart default |
|---------|--------------|
| Background | `soft warm white seamless studio background` (category-tuned) |
| Lighting | Already category-aware — keep |
| Shadow | `soft diffused shadow` (category-tuned) |
| Surface | `clean minimal studio surface` (category-tuned) |
| Styling | `Clean commercial styling` (category-tuned) |
| Consistency | `balanced` — keep |
| Hand style | `realistic human hand` — keep |
| Nails | `natural, clean nails` — keep |

When a user DOES select a value, the existing maps (LIGHTING_MAP, SHADOW_MAP, BG_MAP, etc.) already produce strong prompt-engineered sentences — those are all good and stay unchanged.

## Files to Update

| File | Change |
|------|--------|
| `src/lib/productImagePromptBuilder.ts` | Add `defaultBackground()`, `defaultSurface()`, `defaultShadow()`, `defaultStyling()` functions; update `resolveToken` to use them; add auto-inject block after template resolution |

One file, focused change. No UI changes needed — defaults work silently in the backend prompt builder.

