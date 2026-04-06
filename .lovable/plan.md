

# Refine Step — Premium UX Redesign

## Current Problems (from screenshots)

1. **Tiny pills everywhere** — `text-[10px]`, `px-2 py-0.5` chips for garments, colors, fits, materials. Nearly unreadable, feel like debug UI not a creative tool.
2. **Outfit presets unclear** — "Studio Standard", "Editorial", "Minimal" are tiny text-only pills with no visual differentiation. Users can't understand what each preset means.
3. **Too many raw options** — Top/Bottom/Shoes each show Garment + Color + Fit + Material as flat chip grids. That's 4×3 = 12 chip groups just for outfit. Overwhelming.
4. **Person details cramped** — Presentation, Age, Skin Tone, Expression all crammed in a 4-col grid with `text-[10px]` labels and chips.
5. **No visual hierarchy** — Everything is the same visual weight. Presets, individual fields, section headers all blur together.
6. **Color chips are text-only** — "white", "black", "beige" should show actual color swatches, same pattern we used for backgrounds.

## Design Direction

Shift from "dense settings panel" to "visual creative studio" — fewer visible options, better visual cues, progressive disclosure.

## Changes

### 1. Outfit Presets → Visual Preset Cards
Replace the tiny text pills with **visual preset cards** (~120px wide) that show a mini outfit summary:
- Card with outfit name + a vertical stack of 3 color dots (top/bottom/shoes colors)
- Active state: primary border + subtle glow
- Size: `px-4 py-2.5 rounded-xl` — much more tappable

### 2. Outfit Pieces → Compact Visual Rows
Replace the 4-field grid per piece with a **single-row layout**:
- Each piece (TOP, BOTTOM, SHOES) becomes a horizontal row: `[Garment dropdown] [Color swatch row] [Fit chip] [Material chip]`
- **Color options get actual color dot swatches** (12×12 circles) — same approach as background swatches
- Increase chip sizes from `text-[10px] px-2 py-0.5` → `text-xs px-3 py-1.5` (matching ChipSelector)
- Show only the most common 4-5 garments inline, with "More..." to expand

### 3. Person Details → Larger Chips with Better Spacing
- Increase from `text-[10px]` to `text-xs` 
- Use `gap-2` instead of `gap-1` between chips
- Group labels get `text-xs font-semibold` instead of `text-[9px]`
- Skin tone chips get small color indicator dots

### 4. Accessories → Visual Chip Bar
Keep the chip selector but increase sizes to match the rest of the UI.

### 5. Section Headers → Clearer Visual Breaks
- Outfit section pieces use slightly larger headers with icons
- Color constants get visual swatch definitions

## Files to Update

| File | Changes |
|---|---|
| `ProductImagesStep3Refine.tsx` | (1) Redesign `PieceField` — larger chips (`text-xs px-3 py-1.5`), color swatches as colored circles, horizontal layout. (2) Redesign preset bar — larger preset buttons with color dot summaries. (3) Increase `InlinePersonDetails` chip sizes and spacing. (4) Add `COLOR_SWATCHES` map for outfit colors with hex values. (5) Add skin tone indicator dots. |

