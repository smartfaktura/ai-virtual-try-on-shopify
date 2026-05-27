## Apply shared card recipe to ContentPreferencesSection

Restyle the header, sub-section, and footer of `ContentPreferencesSection` (Settings.tsx lines 174–256) to match the rest of the page. Visual only — categories logic, subs logic, save handler, reset all unchanged.

### Changes
- Wrapper `space-y-5` → `space-y-0` (use explicit dividers like other sections).
- Header (177–181):
  - Eyebrow `text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-medium` → "Preferences"
  - Title `text-2xl font-semibold tracking-tight leading-none` → "Content preferences"
  - Subtitle `text-sm text-muted-foreground` → "Select categories that match your products — this tailors your dashboard experience"
- Insert `my-7 border-t border-border/60` divider before the category grid.
- Category grid (182–195): keep 2-col grid, bump to `gap-3`, label `text-sm font-medium`.
- Specific product types block (197–241):
  - Replace `pt-2 border-t border-border` with our standard `my-7 border-t border-border/60` divider above it
  - Sub-header: drop `text-sm font-semibold` h4 and replace with same eyebrow style "Specific product types" + `text-xs text-muted-foreground` helper
  - Family label: keep uppercase mini-label but match tracking to `tracking-[0.18em]` for consistency
  - Chip buttons: keep behavior, slightly larger `px-3.5 py-2 text-[13px] rounded-full`
- Footer (243–254):
  - Add `my-7 border-t border-border/60` divider above
  - Save button → `h-11 rounded-xl px-6` (drop `size="pill"`)
  - Reset link → `text-sm text-muted-foreground hover:text-foreground` with `w-3.5 h-3.5` icon

### Files
- `src/pages/Settings.tsx` lines 174–256 only

### Out of scope
- Logic, data loading, save/reset behavior, categories source, toast copy