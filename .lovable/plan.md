

# Improve Background Swatch Selector — Inline Custom Pickers

## Problem

The Custom Color and Custom Gradient buttons open floating popovers that feel disconnected from the swatch grid. The user wants them to feel like part of the same grid — consistent card style, smaller cards overall.

## Changes

### File: `ProductImagesStep3Refine.tsx`

**1. Make swatch cards smaller — switch from 3:4 to 4:3 aspect ratio**
- Change `aspect-[3/4]` → `aspect-[4/3]` for a more compact, landscape-oriented card
- This reduces vertical space significantly while keeping 6-per-row

**2. Add Custom Color and Custom Gradient as the 13th and 14th grid cards (not separate buttons)**
- Remove the separate `+ Custom Color` and `+ Custom Gradient` buttons below the grid
- Instead, append two permanent cards at the end of the grid:
  - Card 13: "Custom Color" — shows a `+` icon or the chosen color fill when active, with a dashed border when inactive
  - Card 14: "Custom Gradient" — same pattern, dashed border + icon when inactive, gradient fill when active
- Clicking these cards opens an inline panel (not a floating popover) that slides in below the grid, containing the color palette + HEX input (or dual pickers for gradient)
- The inline panel uses `Collapsible` for smooth expand/collapse animation
- Closing/toggling deselects the custom value if desired (or keeps it selected with an X to remove)

**3. Inline picker panels replace floating popovers**
- Custom Color panel: slides open below the grid with the curated 6×5 palette + HEX input + live preview swatch, all in a bordered rounded card
- Custom Gradient panel: same slide-open pattern with dual From/To palettes + live gradient preview bar
- Only one panel open at a time — selecting Custom Gradient closes Custom Color panel and vice versa
- Panel has a subtle top border connecting it visually to the grid

**4. Visual consistency**
- Custom cards use the same `rounded-xl`, label overlay, and checkmark badge as preset cards
- Inactive custom cards show a dashed `ring-1 ring-dashed` border with a centered `Plus` icon and muted label
- Active custom cards show the chosen fill with the same `ring-2 ring-primary` selected state

## Layout

```text
Grid (6 per row, aspect 4:3):
┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│Wht │ │Off │ │Gry │ │Wrm │ │Coo │ │Tau │
└────┘ └────┘ └────┘ └────┘ └────┘ └────┘
┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│Sag │ │Blu │ │Chr │ │Sft │ │Wrm │ │Col │
└────┘ └────┘ └────┘ └────┘ └────┘ └────┘
┌╌╌╌╌┐ ┌╌╌╌╌┐
│ +  │ │ +  │  ← dashed-border cards
│Cust│ │Grad│
└╌╌╌╌┘ └╌╌╌╌┘

[▼ Inline picker panel when custom card is active]
```

## Files

| File | Changes |
|---|---|
| `ProductImagesStep3Refine.tsx` | Integrate custom color/gradient as grid cards; replace floating popovers with collapsible inline panels; change aspect ratio to 4:3 |

