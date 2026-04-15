

# Polish Desktop Model & Scene Picker Panels

## Summary
Redesign both the Model and Scene selector popovers on `/app/freestyle` to feel like premium floating picker panels with better hierarchy, spacing, hover/selection states, and visual polish. Desktop-focused, mobile unchanged.

## Files changed

### 1. `src/components/app/freestyle/ModelSelectorChip.tsx`

**Header** — Replace the tiny uppercase label with a structured header block:
- Title: "Character Reference" (text-sm font-semibold)
- Helper: "Choose a model to guide the look and composition" (text-xs text-muted-foreground)
- Visually separated from filters with a bottom border or spacing gap

**Filters** — Restyle both filter rows:
- Increase pill padding (px-3.5 py-1.5) and font size (text-xs)
- Active state: `bg-foreground text-background` for primary, `bg-muted border border-foreground/20` for secondary
- Add `gap-1.5` between pills and `mb-3` / `mb-4` between rows
- Wrap filters + header in a sticky top area

**Grid** — Improve card grid:
- Increase `gap` from `gap-2` to `gap-2.5`
- Increase `max-h` from `max-h-64` to `max-h-80` for more breathing room
- Card hover: `hover:border-border/60 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200`
- Selected state: `border-primary ring-2 ring-primary/20` + small check circle overlay (top-right, 16px circle with checkmark)
- Label below image: increase to `text-[11px]` with `py-1.5`

**Footer** — Restyle MissingRequestBanner area:
- Add `pt-3 mt-3 border-t border-border/30` separator
- The banner text already reads correctly

**PopoverContent** — Widen to `w-[340px]`, increase padding to `p-4`, add premium shadow: `shadow-xl shadow-black/8 border-border/50 rounded-xl`

### 2. `src/components/app/freestyle/SceneSelectorChip.tsx`

**Header** — Same structured header:
- Title: "Scene / Environment" (text-sm font-semibold)
- Helper: "Choose a scene to guide mood, framing, and visual context" (text-xs text-muted-foreground)
- Remove the `Maximize2` expand icon (unclear purpose, user wants it removed)

**Filters** — Keep only All / On-Model / Product:
- Match the same pill styling as Model picker
- Increase padding, active state uses `bg-foreground text-background`
- Remove the expanded column-count controls from inline popover

**Grid** — Major visual improvement:
- Change from `grid-cols-3` to `grid-cols-3` but with `gap-2.5` (up from `gap-1.5`)
- Card hover: same premium hover as Model picker
- Selected: `border-primary ring-2 ring-primary/20` + check overlay
- Title: change from `truncate` to `line-clamp-2` to avoid harsh truncation like "Mid-Century Modern L..."
- Increase label font to `text-[11px]` with `py-2 px-2`
- Category labels: increase to `text-[11px]` with `mb-2 mt-3`

**Footer** — Same `border-t` separator treatment

**PopoverContent** — Widen to `w-[520px]` (larger than Model picker for visual browsing), padding `p-4`, same premium shadow/border. Max height for grid: `max-h-[420px]`.

**Expanded Dialog** — Keep as-is (it's a separate full dialog), but remove the expand button from the inline popover since user says to remove unclear icon.

### 3. `src/components/ui/popover.tsx` — No changes needed (shadow/rounding overridden per-instance)

## Design tokens (shared)
- Panel: `rounded-xl border border-border/50 shadow-xl shadow-black/8`
- Active pill: `bg-foreground text-background`
- Inactive pill: `bg-muted/60 text-muted-foreground hover:bg-muted`
- Card hover: `hover:border-border/60 hover:shadow-sm hover:-translate-y-0.5`
- Card selected: `border-primary ring-2 ring-primary/20` + 16px check circle
- Separator: `border-t border-border/30`

## What stays the same
- Mobile behavior (MobilePickerSheet) — unchanged
- All data fetching, filtering logic, brand model cards, delete handlers
- Trigger chip buttons — unchanged
- The expanded Dialog for scenes stays functional but expand icon removed from inline popover

