

## Fix mobile chips not filling their grid columns

### Cause

In `src/components/app/freestyle/FreestyleSettingsChips.tsx` line 297, `cellClass` uses the **direct-child** combinator `[&>button]:w-full`:

```
[&>button]:w-full [&>button]:justify-center [&>button]:relative [&>button]:px-4
[&>button>svg:last-child]:absolute [&>button>svg:last-child]:right-3 …
```

This works for chips that render a button as the direct child of the cell:
- Upload Image, Aspect Ratio (1:1), Prompt Helper, Advanced ✅

But **Product**, **Model**, and **Scene Look** chips are wrapped in an extra `<div>` for the disabled-state opacity (lines 217–231, 244–256, 258–270):

```text
<div class="cellClass">       ← cell
  <div class="opacity-…">     ← disabled wrapper
    <button>…</button>        ← actual chip — NOT a direct child
  </div>
</div>
```

So `[&>button]` never matches → those three chips keep their intrinsic content-width and appear undersized inside their full-width grid cells (visible in screenshot: Product, Model don't fill, Scene Look stays small instead of spanning the full row).

### Fix — one-line change

Replace the direct-child combinator `[&>button]` with the descendant combinator `[&_button]` so it reaches chip buttons regardless of wrapper depth. Same fix for the trailing chevron selector.

`src/components/app/freestyle/FreestyleSettingsChips.tsx` line 297:

**Before**
```
const cellClass = '[&>button]:w-full [&>button]:justify-center [&>button]:relative [&>button]:px-4 [&>button>svg:last-child]:absolute [&>button>svg:last-child]:right-3 [&>button>svg:last-child]:opacity-40';
```

**After**
```
const cellClass = '[&_button]:w-full [&_button]:justify-center [&_button]:relative [&_button]:px-4 [&_button>svg:last-child]:absolute [&_button>svg:last-child]:right-3 [&_button>svg:last-child]:opacity-40';
```

Also add `w-full` to the disabled-state wrapper `<div>`s on Product/Model/Scene (lines 218, 245, 259) so the wrapper itself stretches and lets the inner button fill it:

- Line 218: `cn(disabledChips?.product && 'opacity-40')` → `cn('w-full', disabledChips?.product && 'opacity-40')`
- Line 245: `cn(disabledChips?.model && 'opacity-40 pointer-events-none')` → `cn('w-full', disabledChips?.model && 'opacity-40 pointer-events-none')`
- Line 259: same pattern with `'w-full'` prepended

### Result

- **Row 1**: Upload Image | Product → both stretch equally ✅
- **Row 2**: Scene Look truly spans full width as a single wide pill ✅
- **Row 3**: Model | 1:1 → both stretch equally ✅
- **Row 4**: Prompt Helper | Advanced → unchanged (already correct) ✅
- All chips keep centered icon + label, faint chevron pinned right, primary modified-dot on Advanced.

### Untouched

Desktop layout (the `if (isMobile)` branch is the only place using `cellClass`), Advanced popover internals, all selector components, types, hooks, RLS, `Freestyle.tsx`.

### Validation (390×818)

- Product, Model, Scene Look chips visibly fill their grid cells edge-to-edge.
- Scene Look reads as one full-row button on row 2.
- No layout shift on desktop ≥768px.

