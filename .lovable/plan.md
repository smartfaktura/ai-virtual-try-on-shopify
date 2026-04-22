

## Fix mobile chip alignment + recommend centered layout

### What's wrong now

The `[&>button]:justify-between` rule pushes the icon to the far left and the chevron to the far right, leaving the **label stranded on the right side** with a big empty gap (screenshot: "Upload Image", "Product", "1:1" all look misaligned and unbalanced). On full-width mobile cells this looks like a broken form input, not a tappable chip.

### UX recommendation — **centered icon + label**, chevron tucked subtly to the right

For mobile chips that span a full grid cell, the cleanest pattern (used by Linear, Arc, Notion mobile) is:

- **Icon + label centered together** as a single visual unit — this is what the eye expects on a "button" shape.
- **Chevron** kept small and faded, absolutely positioned at the right edge — it's a hint, not a column.
- This reads as a **button**, not a misaligned form row, and stays balanced regardless of label length.

```text
┌─────────────────────────┐  ┌─────────────────────────┐
│     + Upload Image    ▾ │  │   📦  Product         ▾ │
└─────────────────────────┘  └─────────────────────────┘
┌───────────────────────────────────────────────────────┐
│              📷  Scene Look                         ▾ │
└───────────────────────────────────────────────────────┘
```

### Change

In `src/components/app/freestyle/FreestyleSettingsChips.tsx`, mobile branch only (lines 297, 354–461):

- Replace `cellClass = '[&>button]:w-full [&>button]:justify-between'` with:
  ```
  cellClass = '[&>button]:w-full [&>button]:justify-center [&>button]:relative [&>button>svg:last-child]:absolute [&>button>svg:last-child]:right-3 [&>button>svg:last-child]:opacity-40'
  ```
  - `justify-center` centers the icon + label as a unit.
  - The trailing chevron (always the last `<svg>` child of the chip button) is absolutely pinned to the right edge at low opacity, so it never disturbs the centered group.
  - Add `[&>button]:px-4` so the centered content has breathing room from the absolute chevron.

- Apply the same centered treatment to the inline **Advanced** chip (lines 372–380): change its trigger to `justify-center relative` with the chevron `absolute right-3`. Keep the modified-dot indicator as-is.

- The full-width Scene Look row (`col-span-2`) automatically inherits the same centered alignment — no extra change needed.

### Why centered (not left-aligned)

- **Left-aligned** (`justify-start`) works for list rows / dropdowns, but chips are perceived as buttons — buttons should center their label.
- **Justify-between** only looks right when the label is genuinely long enough to fill the row; on short labels like "1:1" or "Model" it creates the lopsided gap visible in the screenshot.
- **Centered** is robust to any label length and matches the desktop chip aesthetic (where chips are content-width and centered by nature).

### Validation (390×818)

- All 7 mobile chips show icon + label centered as one group, with a faint chevron pinned right.
- Scene Look row centers cleanly across the full width.
- Advanced chip keeps its primary-dot modified indicator.
- Desktop ≥768px and the Advanced popover internals are untouched.

### Untouched

Desktop layout, popover internals, all selector components, types, hooks, RLS, `Freestyle.tsx`.

