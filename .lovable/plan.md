

# Fix: Hide Consistency Section + Ensure Outfit Injection for All Model Scenes

## Problems Found

### 1. Consistency section visible to users
The "Consistency" card in Step 3 Refine (lines 2076-2097) is shown when `productCount > 1`. You want it hidden from users entirely.

### 2. Outfit dropped from 13+ model scene prompts
The prompt builder has an `injectIfMissing` system that auto-appends directives when a template doesn't include their token. Currently it covers lighting, shadow, surface, styling, composition, mood, prominence, and body framing — but **NOT** `outfitDirective` or `personDirective`.

13 scene templates in the database have `personDetails` in their `triggerBlocks` but do NOT include `{{outfitDirective}}` in their prompt template (e.g., `beauty_application_skin`, `makeup_in_hand`, `food_in_hand`, `tech_use_interaction`, etc.). For these scenes, the user's outfit config is silently ignored.

### 3. Outfit string lacks specificity for consistency
`buildStructuredOutfitString` produces: `"Wearing slim beige cotton trousers, white leather sneakers — same outfit in every shot."` This is decent but could be stronger on exact color codes, brand-neutral descriptors, and cross-scene enforcement language.

## Fix Plan

### Change 1: Hide Consistency section
**File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`**

Remove or comment out the entire Consistency card (lines 2076-2097). The consistency directive will still be injected into prompts using the default value (`balanced`), ensuring cross-scene consistency without exposing the control.

### Change 2: Auto-inject outfit and person directives for all model scenes
**File: `src/lib/productImagePromptBuilder.ts`**

Add two new `injectIfMissing` calls after the existing block (around line 841):

```typescript
// Outfit + person directives: inject for ALL scenes (not global-only)
// so every on-model scene gets consistent outfit even if template forgot the token
injectIfMissing('wearing', 'outfitDirective', false);
injectIfMissing('model:', 'personDirective', false);
```

This ensures that even if a scene template omits `{{outfitDirective}}`, the user's locked outfit config is appended to the prompt. The keyword check (`wearing`) prevents double-injection for templates that already include it.

### Change 3: Polish outfit string for stronger consistency
**File: `src/lib/productImagePromptBuilder.ts`**

Improve `buildStructuredOutfitString` to produce more precise, AI-friendly descriptions:

- Add "exact" qualifiers: `"Wearing exactly: slim-fit beige cotton trousers, white leather sneakers"` 
- Strengthen the consistency enforcement: `"CRITICAL: This exact outfit must appear identically in every on-model shot — same colors, same fit, same materials. No substitutions."`
- When pieces have color values, emphasize them: `"beige (not tan, not cream — beige)"` to reduce AI drift

Updated function:
```typescript
export function buildStructuredOutfitString(config: OutfitConfig): string {
  const describePiece = (piece?: OutfitPiece): string => {
    if (!piece || !piece.garment) return '';
    const parts: string[] = [];
    if (piece.color) parts.push(piece.color);
    if (piece.material) parts.push(piece.material);
    if (piece.fit) parts.push(`${piece.fit}-fit`);
    parts.push(piece.garment);
    return parts.join(' ');
  };

  const segments: string[] = [];
  const top = describePiece(config.top);
  if (top) segments.push(`Top: ${top}`);
  const bottom = describePiece(config.bottom);
  if (bottom) segments.push(`Bottom: ${bottom}`);
  const shoes = describePiece(config.shoes);
  if (shoes) segments.push(`Shoes: ${shoes}`);

  if (segments.length === 0) return '';
  const outfitStr = segments.join('; ');
  const accStr = config.accessories && config.accessories !== 'none' 
    ? ` Accessories: ${config.accessories}.` : '';
  return `OUTFIT LOCK — Wearing exactly: ${outfitStr}. CRITICAL: This exact outfit must appear identically in every on-model shot — same colors, same fit, same materials, same shoes. Clothing must NOT compete with the product.${accStr}`;
}
```

### Change 4: Ensure fallback defaults also use strong language
In `defaultOutfitDirective`, strengthen the fallback (when no `outfitConfig` exists) to also use the `OUTFIT LOCK` prefix and specificity pattern.

## Files Modified

| File | Change |
|---|---|
| `src/components/app/product-images/ProductImagesStep3Refine.tsx` | Hide Consistency section entirely |
| `src/lib/productImagePromptBuilder.ts` | Add outfit/person auto-injection; polish outfit string for consistency |

