## Improve scene outfit UX: reset, bigger buttons, review validation, AI logic transparency

### 1. Add per-scene reset button on the scene row (outside the dialog)

Currently the only way to clear a scene's outfit is inside the edit dialog ("Clear outfit" link). Add a small `X` / reset icon button on the scene row itself, visible only when `perSceneCfg` exists, next to the AI and Edit buttons. Clicking it calls `handleResetSceneOutfit(scene.id)`.

**File:** `ProductImagesStep3Refine.tsx` ~lines 3016-3035

### 2. Make AI and Edit buttons larger and more visible

Current buttons use `text-[10px]`, `w-3 h-3` icons, and `px-2 py-1` — too small. Changes:
- Increase to `text-xs`, `w-3.5 h-3.5` icons, `px-2.5 py-1.5`
- Make Edit a proper outlined pill button (not just text+icon)
- Add subtle border to both pills for better contrast
- Keep `flex-shrink-0` so they don't collapse on mobile

### 3. Handle "Needs styling" scenes when going to Review

When user clicks Review (step 3 → 4) in manual mode, check if any scene still has `source === 'ai' && !perSceneCfg` (unstyled). If so:
- Show a toast warning: "Some shots still need outfit styling. AI will choose complementary outfits for unstyled shots."
- Allow proceeding (not blocking) — the prompt builder already handles this case gracefully by injecting a generic "choose complementary outfit" wardrobe note (line 1442-1445 in promptBuilder)

**File:** `ProductImages.tsx` ~line 1316 (case 3 of handleNext)

### 4. How AI outfit selection works (answer to user's questions)

**Current behavior:** The AI auto-pick system does NOT analyze the actual product (e.g., "white crop top" vs "black long-sleeve"). It works like this:

1. `pickDefaultPresetPerProduct` hashes `productId + seed` to deterministically pick from 5 universal presets (Minimal Premium, Editorial Fashion, Casual Everyday, Streetwear/Urban, Sport/Active)
2. `filterPresetsByCategories` currently returns ALL 5 presets regardless of category (line 258-259: `return [...BUILT_IN_PRESETS]`)
3. The hash selects one preset, preferring neutral-colored ones first
4. **Result:** A white crop top and a black long-sleeve t-shirt would get different presets only if their `productId` hashes differ — NOT because of their color/style

**For the prompt:** When AI mode is active and no outfit config is set, the prompt builder injects a generic note: "Choose an outfit that naturally complements the product" (line 1445). The AI model then decides the outfit contextually.

**This is actually fine** — the generic prompt approach lets the image generation model make contextual outfit choices. The preset system is more for manual mode defaults.

No code changes needed here — the system works as designed.

### Technical details

**Files modified:**
- `src/components/app/product-images/ProductImagesStep3Refine.tsx` — scene row buttons (reset + sizing)
- `src/pages/ProductImages.tsx` — toast warning on step 3→4 transition with unstyled scenes
