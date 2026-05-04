I found the issue: the preset is being applied, but the scene rows are showing the sanitized outfit config after product-slot conflict removal. For your tank top, the selected product locks the `top` slot, so Sport / Active removes the crop-top piece and the summary can keep looking like the old/default outfit. Also the apply-all handler only stores one config by `scene.id`, which is risky when multiple products share the same scene IDs.

Plan:

1. Fix apply-all so the UI clearly reflects the selected preset
   - When applying Sport / Active / Editorial Fashion / any preset to all shots, store the preset name alongside the outfit config in Step 3 state
   - Update each scene row summary to show the applied style label first, e.g. `Sport / Active` or `Sport / Active · black leggings, white sneaker`, instead of only the remaining sanitized pieces
   - Keep the top/product slot lock behavior correct, so the product itself is not replaced by preset clothing

2. Make per-product scene styling more reliable
   - Change the outfit map logic in Step 3 to support product-scoped scene keys where needed, so one product’s scene settings do not accidentally overwrite another product’s settings when categories share scene IDs
   - Add a helper for reading/writing outfit config per product + scene with fallback to the existing scene-only key for current data

3. Fix expanded scene editor consistency
   - When opening a scene after Apply all, pass the actual applied config and preset name into the `ZaraOutfitPanel`
   - Ensure Quick Styles highlight the applied preset and the slot cards reflect the correct remaining configurable pieces after locked product slots are removed

4. Rename the button
   - Rename `Customize` to `Create your own Look` in the Outfit Styling preset bar
   - Keep the existing action the same: it opens the custom apply-to-all look editor

5. Clean up user feedback
   - Toast still says how many shots were updated
   - Row labels should make it obvious the preset is active even when product locking hides one of the preset’s slots