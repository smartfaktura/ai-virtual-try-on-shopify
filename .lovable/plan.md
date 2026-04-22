

## Mobile chip grid — final row order

Update the mobile (<768px) grid in `src/components/app/freestyle/FreestyleSettingsChips.tsx` so rows read:

```text
Row 1:  [ Upload Image  ]  [ Product       ]
Row 2:  [ Scene Look                       ]   ← full width (col-span-2)
Row 3:  [ Model         ]  [ Ratio  1:1 ▾  ]
Row 4:  [ Prompt Helper ]  [ Advanced ▾    ]
```

### Change

Inside the mobile `grid grid-cols-2 gap-2` wrapper:
- Row 1: Upload (left), Product (right)
- Row 2: **Scene Look** wrapped with `col-span-2` so it spans the full row — chip stretches edge-to-edge
- Row 3: Model (left), Aspect Ratio (right)
- Row 4: Prompt Helper (left), Advanced ▾ (right)

Everything else from the previous mobile-grid plan stays the same:
- Each cell uses `[&>button]:w-full [&>button]:justify-between` so chips fill the cell with right-aligned chevrons.
- Aspect Ratio remains promoted out of Advanced.
- Advanced popover keeps the redesigned accordion (Framing / Camera / Quality / Brand) with primary-dot indicators and "Reset defaults".
- Modified-dot indicator on the Advanced chip when any tucked setting differs from default.

### Untouched

Desktop ≥768px row, Scene Look label, Advanced popover internals, all selector components, types, hooks, RLS, `Freestyle.tsx`.

### Validation (390×818)

- Mobile shows 4 rows in the order above; Scene Look visibly spans the full width on row 2.
- Model + Ratio sit side-by-side on row 3, equal widths.
- Prompt Helper + Advanced sit side-by-side on row 4, equal widths.
- Advanced still shows the primary dot when any hidden setting is modified.
- Desktop unchanged.

