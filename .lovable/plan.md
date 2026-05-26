## `src/components/app/product-images/ProductImagesStep3Refine.tsx`

**1. Remove always-on "Free plan: 1 background per generation" inline hint above swatches (lines ~664-671)**
- Delete the entire `{isFree && (<div className="flex items-center justify-end gap-2 -mb-1">…)}` block. The flashed `bgLimitHintAt` notification (already pill-styled below the grid) still surfaces when the user actually tries to exceed the limit.

**2. Remove redundant icons in AI styling block (lines ~2832-2860)**
- AI confirmation row (2835-2840): drop the `<Sparkles>` icon, keep text only.
- "Add styling direction" trigger (2852-2861): drop both `<ChevronRight>` and `<Pencil>` icons. Keep the label as a plain link-style trigger.

**3. "Additional note" header → add `(optional)` (line 3710)**
- `Additional note` → `Additional note (optional)`, kept inline in the same span (lighter weight for "(optional)" via `<span class="text-muted-foreground font-normal">`).

No logic changes.