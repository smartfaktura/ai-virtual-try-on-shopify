
## Redesign Outfit Styling block with AI/Manual mode selector

### Current state
The Outfit Styling card shows presets (Minimal Premium, Editorial Fashion, etc.) immediately, followed by per-product scene lists. Users must understand the system to navigate it.

### New UX flow

**1. Clearer header with context**
- "Outfit Styling" header stays
- Subtitle: "Pick an outfit for {N} shots that feature a model"
- Show how many shots have built-in looks vs need styling

**2. Two mode cards (radio-style selection)**

Option A: **"Let AI match your product"** (default)
- Description: "AI will pick complementary outfits that match your product style"
- Only applies to shots without a built-in outfit direction (scenes with `outfitHint` keep their curated look)
- When selected: collapse the entire preset bar and per-scene outfit UI — just show a confirmation that AI will handle it
- This is the simplest path — zero configuration needed

Option B: **"Style each shot manually"**
- Description: "Choose presets or customize outfits per shot"
- When selected: show the existing preset bar + per-product scene list exactly as today

**3. State management**
- Add `outfitMode` field to `DetailSettings` type: `'ai' | 'manual'`
- Default to `'ai'` when no outfit configs have been set
- Switch to `'manual'` automatically if user had already configured per-scene outfits
- The prompt builder reads this flag: when `'ai'`, skip injecting structured outfit strings for non-hint scenes (let the model decide)

**4. AI matching logic (prompt side)**
- When `outfitMode === 'ai'` and a scene has no `outfitHint` and no per-scene config: the prompt builder omits the outfit block entirely for that scene, allowing the generation model to choose complementary styling
- Scenes WITH `outfitHint` always use their built-in direction regardless of mode

### Files to change

1. **`src/components/app/product-images/types.ts`** — Add `outfitMode?: 'ai' | 'manual'` to `DetailSettings`
2. **`src/components/app/product-images/ProductImagesStep3Refine.tsx`** — Replace Outfit Styling card header/body with mode selector UI, conditionally show preset bar and per-scene list only in manual mode
3. **`src/lib/productImagePromptBuilder.ts`** — When `outfitMode === 'ai'`, skip structured outfit injection for scenes without `outfitHint`
