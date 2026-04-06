

# Refine Step — UX Overhaul Round 3

## Issues from Screenshots

### Background Strip
1. **Swatches are 12px dots** — impossible to distinguish gradients from solids. Users can't see the actual color.
2. **No custom gradient option** — only custom HEX for solid colors. No way to define a gradient.
3. **"all 9 scenes" label is easy to miss** — not clear enough that this affects everything.

### Scene Card Expansion
4. **Expanded settings squeezed into a narrow card column** — on desktop, the settings panel shows inside a ~250px wide card. Environment chips wrap badly, 3-column grids become 1-column. Should expand to full row width on desktop.

### Outfit & Person Details
5. **Full outfit panel shows for ALL on-model scenes** — even "In-Hand" shots only show a hand, yet users see Top + Bottom + Shoes + Accessories fields. Irrelevant pieces should be hidden based on scene type.
6. **Person details pills are overwhelming** — Presentation, Age Range, Skin Tone, Expression, Hand Style, Nails, Jewelry dumped in a flat grid with tiny 10px pills. No grouping or hierarchy.
7. **"Hand Style" options are cryptic** — "Clean studio", "Natural lifestyle", "Polished beauty" mean nothing to most users. Need clearer labels or descriptions.
8. **Accessories input is a bare inline text field** — looks broken, not interactive enough.

## Fixes

### Fix 1: Larger Background Swatches with Gradient Previews
Replace the tiny `w-3 h-3` swatch dots with `w-8 h-8` rounded rectangles that actually show the color/gradient. For gradients, render the full CSS gradient so users can see the actual fade. Add a "Custom Gradient" option alongside Custom HEX — with two color pickers (start/end color) that construct a linear-gradient prompt directive.

Update `BG_SWATCH_OPTIONS` to include a `gradient-custom` entry. Add `backgroundCustomGradient?: { from: string; to: string }` to `DetailSettings` type. Update prompt builder to handle custom gradients.

### Fix 2: Scene Expansion Goes Full-Width on Desktop
When a scene card is expanded, break it out of the grid and render the settings panel as a full-width row below the grid row. On desktop this means the expanded panel spans all 4 columns (`col-span-full`), giving settings room to breathe in their natural 2-3 column layouts. The card itself stays in its grid position with a highlighted border.

### Fix 3: Context-Aware Outfit Visibility
Determine which outfit pieces to show based on selected scene types:
- **Hand-only scenes** (in-hand, holding): show only Top (since sleeves may be visible) + Accessories
- **Upper body scenes** (close-up portrait): show Top + Accessories
- **Full-body scenes** (editorial, walking): show Top + Bottom + Shoes + Accessories
- Compute `visiblePieces` from the union of all selected on-model scene types

### Fix 4: Reorganize Person Details into Grouped Sections
Split the flat person details grid into two clear groups:
- **Appearance** (collapsible, open by default): Presentation, Age Range, Skin Tone, Expression
- **Styling Details** (collapsible, collapsed by default): Hand Style, Nails, Jewelry

Rename confusing options:
- Hand Style: "Clean studio" → "Manicured", "Natural lifestyle" → "Natural", "Polished beauty" → "Polished"

### Fix 5: Better Accessories Input
Replace the inline text field with a chip-based selector: `none`, `minimal`, `statement`, `custom` — where `custom` reveals a text input. This matches the pattern of every other field.

## Files to Update

| File | Changes |
|---|---|
| `types.ts` | Add `backgroundCustomGradient?: { from: string; to: string }` to `DetailSettings` |
| `ProductImagesStep3Refine.tsx` | (1) Enlarge background swatches to `w-8 h-8` rectangles. (2) Add custom gradient option with dual hex inputs. (3) Scene expansion panel becomes `col-span-full` below the card's grid row. (4) Compute `visibleOutfitPieces` from scene types to hide irrelevant outfit fields. (5) Split person details into Appearance + Styling Details groups. (6) Rename Hand Style options. (7) Replace accessories text input with chip selector. |
| `productImagePromptBuilder.ts` | Handle `backgroundCustomGradient` — resolve as `"smooth gradient background transitioning from #XXX to #YYY"` |

