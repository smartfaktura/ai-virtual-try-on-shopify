
## Plan: Revert the OUTFIT LOCK safety-net

You want the previous safety-net auto-injection removed. No new conflict rules added.

### What gets removed
In `src/lib/productImagePromptBuilder.ts`, delete the safety-net block (around line 1332) that auto-appends `OUTFIT LOCK: ...` to prompts when a scene needs a person but the template lacks `{{outfitDirective}}`.

### What stays untouched
- `{{outfitDirective}}` and `{{personDirective}}` token replacement (normal template path) — unchanged.
- `getConflictingSlots()` — unchanged.
- Step 3 outfit picker UI — unchanged.
- All scene templates — unchanged.

### Consequence (so you know)
The original bug returns: scene templates missing `{{outfitDirective}}` (the ~509 templates including "Vintage Cinematic Campaign") will silently drop your locked outfit pieces. If you want to address that later, the clean path is patching the templates themselves — separate plan when you're ready.

### Memory update
Update `mem://features/product-images/product-aware-outfit-system` to remove the safety-net documentation and note that locked outfits only apply when templates explicitly include the token.

### Files touched
- `src/lib/productImagePromptBuilder.ts` (remove one block)
- `mem://features/product-images/product-aware-outfit-system` (doc update)

### Risk
None. Pure revert of additive logic.
