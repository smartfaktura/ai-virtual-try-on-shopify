

## Fix mobile prompt-bar pills — equal 2-column sizing

### What's wrong (from screenshot)

In the 2-column mobile grid, pills don't fill their cells equally:

- **Row 1**: "Upload Image" (narrow, content-width) sits next to "Product" (140px capped) — both float left in their cells with empty space on the right.
- **Row 3**: "Model" (140px capped) is much narrower than "1:1" (which already happens to be wider).
- **Row 4**: "Prompt Helper" content-width vs "Advanced" content-width — also misaligned.

**Cause**: The `cellClass` rule `[&_button]:w-full` is too blunt and is being beaten by:
- Selector chips (`ProductSelectorChip`, `ModelSelectorChip`, `SceneSelectorChip`) that hardcode `max-w-[140px]` on their trigger button.
- Inline buttons (Upload Image, Prompt Helper, Aspect Ratio, Advanced) declared as `inline-flex` with no width.

The same `[&_button]:w-full` also leaks onto nested icon-buttons (like the chip's "✕ remove" button), and the `[&_button>svg:last-child]:absolute` rule can hit the wrong svg.

### Fix — `src/components/app/freestyle/FreestyleSettingsChips.tsx` (mobile branch ONLY)

1. **Pass `fullWidth` to the three selector chips on mobile.** Add `fullWidth={isMobile}` (or unconditional `fullWidth` since this whole branch is mobile) to:
   - `<ProductSelectorChip ... fullWidth />`
   - `<ModelSelectorChip ... fullWidth />`
   - `<SceneSelectorChip ... fullWidth />`
   
   Each already supports `fullWidth ? "w-full max-w-none" : "max-w-[140px]"` — wired and ready.

2. **Make inline mobile buttons `w-full`** by switching from `inline-flex` to `flex` with `w-full justify-center`, and add `relative` so the absolute chevron anchors correctly:
   - **Aspect Ratio chip** (line 114): currently `inline-flex ... h-8 px-3` → wrap in mobile-aware variant or just add `w-full justify-center relative` (since the chip is shared with desktop, instead pass a new optional `fullWidth` prop OR — simpler — wrap in the cell with `[&>button]:w-full [&>button]:justify-center` targeting only the **direct** child button, not all descendants).
   - **Upload Image button** in `FreestylePromptPanel.tsx` (line 283–289): same — restructure so when used on mobile it gets `w-full justify-center relative`.
   - **Prompt Helper button** (line 420–426): same.
   - **Advanced button** (line 376): already has `relative`; just needs `w-full` instead of fixed.

3. **Replace the leaky descendant selector** `cellClass = '[&_button]:w-full ...'` with a **direct-child** selector that won't bleed into nested icon buttons:
   ```
   cellClass = '[&>*]:w-full [&>*>button]:w-full [&>*>button]:justify-center [&>*>button]:relative [&>*>button]:px-4 [&>*>button>svg:last-child]:absolute [&>*>button>svg:last-child]:right-3 [&>*>button>svg:last-child]:opacity-40'
   ```
   - `[&>*]` ensures the wrapper `<div className="w-full">` inside chips also expands.
   - `[&>*>button]` only targets the chip's actual trigger button — never a nested remove/clear button.
   - Combined with explicit `fullWidth` props (step 1) and explicit `w-full` on inline buttons (step 2), the layout is now belt-and-suspenders.

4. **Aspect Ratio chip on mobile** — since this chip doesn't have a `fullWidth` prop, take the simplest path: render an inline mobile-only version inside `FreestyleSettingsChips.tsx` that mirrors the desktop one but uses `w-full justify-center relative`. Reuses same Popover state / handlers — purely a className swap when `isMobile`.

### Why this works

- **Row 1**: Upload Image + Product → both now `w-full` inside their grid cells → equal 50/50.
- **Row 2**: Scene Look (`col-span-2`) → already full width, unaffected.
- **Row 3**: Model + 1:1 → both `w-full` → equal 50/50.
- **Row 4**: Prompt Helper + Advanced → both `w-full` → equal 50/50.
- Centered icon+label preserved; subtle right-edge chevron preserved; "Advanced" modified-dot preserved.

### Untouched

Desktop branch (≥768px), Advanced popover internals, all selector logic/data, props API of selector chips (only `fullWidth` flag turned on), `Freestyle.tsx`, hooks, RLS.

### Validation (390×818 mobile)

- All 7 mobile chips render at equal 50% column width (Scene Look at 100%).
- Icon + label centered in each pill; chevron pinned faintly to right.
- Tapping "✕" on a selected Product/Model/Scene chip still works (no width leakage to nested buttons).
- Desktop unchanged.

