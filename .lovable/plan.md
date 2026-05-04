
## Outfit Styling card redesign + AI prompt improvements

### UI changes (`ProductImagesStep3Refine.tsx`)

**1. Scene thumbnail strip** — Add model shot thumbnails (same style as bg/aesthetic cards) with green check badges on built-in-look scenes so users see exactly which shots need outfit styling.

**2. Better mode pills** — Replace flat card layout with taller pills that have icon boxes (8x8 rounded-lg with icon), more padding (px-4 py-3.5), and a filled primary circle checkmark instead of bare check icon.

**3. Always default to AI** — Change `effectiveMode` from auto-detecting based on existing configs to simply: `details.outfitMode === 'manual' ? 'manual' : 'ai'`. AI is always default.

**4. Move custom note into main card** — Remove custom styling note from the Appearance collapsible. Place it directly in the outfit card after the mode selector, visible in both AI and manual modes. Label: "Additional styling direction (optional)" with helper text "Applies to all N on-model shots — guides AI styling choices and color direction". Placeholder adapts to mode.

**5. Remove custom note from Appearance section** — Delete the `customOutfitNote` textarea from the Collapsible content since it now lives in the main card.

### Prompt builder improvements (`productImagePromptBuilder.ts`)

**6. AI mode adds smart product-aware direction** — When `outfitMode === 'ai'` and a scene has no `outfitHint`, instead of injecting nothing, inject a lightweight product-aware directive:
```
WARDROBE — Choose an outfit that naturally complements [PRODUCT]. Style should be editorial, minimal, and never compete with the product. Let clothing tones stay neutral and cohesive. [customOutfitNote if set]
```
This gives the model enough direction to make good choices without locking specific garments.

**7. Custom note in AI mode gets stronger prompt weight** — When `customOutfitNote` is set in AI mode, wrap it as: `STYLING PRIORITY: {note}` so it has higher weight than generic direction.

**8. Custom note for hint scenes too** — When a scene HAS an `outfitHint`, append `customOutfitNote` with proper framing so it adds user preference on top of the curated direction (already works, just verify).

### Files changed
1. `src/components/app/product-images/ProductImagesStep3Refine.tsx` — UI redesign (items 1-5)
2. `src/lib/productImagePromptBuilder.ts` — AI prompt improvements (items 6-8)
