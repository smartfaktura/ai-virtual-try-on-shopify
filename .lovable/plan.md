Three small UI cleanups on `/app/generate/product-images`:

**1. Drop "Quality" from Generate (Setup) step** — file: `src/components/app/product-images/ProductImagesStep4Review.tsx`
- Remove the Quality block (lines 246–256) from the Format & Output card. The grid becomes Format + Images per scene only, giving more breathing room.
- Also remove the Quality row (lines 430–433) from the right-side Credits summary so it stays consistent.
- Quality stays Pro under the hood — no logic change.

**2. Remove camera icon under scene/shot name** — file: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`
- Delete the fallback `<Camera className="w-3 h-3 text-muted-foreground/30" />` (line 298–300) shown when a scene has neither background nor aesthetic color. Card just shows the name without the empty camera glyph.

**3. Accent row: drop Paintbrush icon + relabel** — same file `ProductImagesStep2Scenes.tsx` (lines 282–297)
- Remove the `<Paintbrush ... />` icon.
- Change label "Accent" → "Accent Color Selected".
- Keep the color swatches as-is.

No logic, state, or layout changes beyond these copy/icon removals.