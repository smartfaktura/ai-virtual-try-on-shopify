

## Fix tablet (768–1023px) layout on `/app/freestyle`

### Problem

The prompt panel and its surrounding layout in `src/pages/Freestyle.tsx` use `lg:` breakpoint (≥1024px) for:
- Floating overlay (`lg:absolute lg:bottom-0 lg:left-0 lg:right-0`)
- Centering with max-width (`lg:max-w-2xl lg:mx-auto`)
- Gradient fade above the panel (`hidden lg:block`)
- Right padding to clear the fixed sidebar (`lg:pr-20`, `sm:pr-16`)

On tablets (iPad portrait ≈768–1023px), none of the `lg:` rules apply, so:
1. The prompt sits in normal flow → grey/muted area shows above it and gallery scrolls under nothing.
2. It spans full width with no centering → looks misaligned vs. the gallery grid.
3. No gradient fade → hard cut.
4. Inconsistent right-padding produces an asymmetric off-center feel.

### Fix — change breakpoint from `lg:` → `md:` for the floating prompt treatment

Apply the same floating, centered, faded prompt panel starting at `md:` (≥768px) so tablets get the desktop-style behavior. Mobile (<768px) keeps the current in-flow stacked layout.

**File: `src/pages/Freestyle.tsx`**

1. **Root container** (line 925): `flex flex-col lg:block` → `flex flex-col md:block`. Root height stylesheet: keep `100dvh` for both, fine as-is.

2. **Scrollable content area** (line 932):
   - `lg:h-full` → `md:h-full`
   - `lg:pt-3` → `md:pt-3`
   - `lg:pb-72` → `md:pb-72` (so gallery has space behind the floating prompt on tablet too)

3. **Empty-state quick-presets wrapper** (lines 1083–1093):
   - `pb-16 lg:pb-20` → `pb-16 md:pb-20`
   - `sm:px-8 sm:pr-16 lg:pr-20` → `sm:px-8 md:px-8 md:pr-20` (symmetric horizontal padding on tablet)
   - `lg:max-w-2xl lg:mx-auto` → `md:max-w-2xl md:mx-auto`

4. **Prompt panel wrapper** (line 1099):
   - `lg:mt-0 lg:absolute lg:bottom-0 lg:left-0 lg:right-0` → `md:mt-0 md:absolute md:bottom-0 md:left-0 md:right-0`
   - `-mt-4` stays for true mobile only.

5. **Gradient fade** (line 1101): `hidden lg:block` → `hidden md:block`.

6. **Inner padding row** (line 1102):
   - `sm:px-8 lg:pt-2 lg:pointer-events-none sm:pr-16 lg:pr-20` → `sm:px-8 md:px-8 md:pt-2 md:pointer-events-none md:pr-20` (drop the asymmetric `sm:pr-16` so the panel is symmetrically padded and the centered max-w-2xl truly centers).

7. **Centered max-width wrapper** (line 1103): `lg:max-w-2xl lg:mx-auto lg:pointer-events-auto` → `md:max-w-2xl md:mx-auto md:pointer-events-auto`.

### Untouched

- Mobile layout (<768px) — keeps the current bottom-stacked, full-width prompt with `-mt-4` overlap.
- Desktop ≥1024px — visually identical (the `md:` rules already cover it).
- Inside `FreestylePromptPanel` / `FreestyleSettingsChips` — no changes; they already adapt internally based on `useIsMobile()` (`<768`), which still maps tablet to the desktop chip layout that fits at 768+.
- Gallery, sidebar, scene catalog, types, hooks, RLS.

### Validation

- **Tablet 820×1180 (iPad)**: Prompt panel floats at the bottom, centered, max-width ~672px, with gradient fade above it. Gallery scrolls behind it. No grey block, no off-center.
- **Tablet 768×1024**: Same as above, panel symmetrically padded.
- **Mobile 390×844**: Unchanged — prompt sits below gallery with the slight `-mt-4` overlap, no floating.
- **Desktop ≥1024**: Visually identical to today.

