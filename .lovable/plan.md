

# Refine Step — UX Cleanup

## Problems from Screenshot

1. **Expanded scene panel is overwhelming** — clicking "Editorial on S..." opens a huge inline panel showing Visual Direction (Mood, Product Size, Lighting) + Environment (Environment, Surface, Styling) all at once as a wall of chips. Too many options visible simultaneously in a narrow column.

2. **Scene cards show truncated names** — "Clean Studio...", "Editorial on S...", "Tabletop Life..." are unreadable. The grid is too tight.

3. **Template controls + block controls mixed together** — the expanded panel shows both `BlockFields` (Visual Direction, Environment) and `TemplateControlChips` (Style section) without clear hierarchy. Users see 15+ chip selectors at once.

4. **No progressive disclosure in expanded panel** — all controls dump at once. Users who want to change just one thing (e.g. lighting) have to visually scan through everything.

5. **"customized" dot is too subtle** — tiny 1.5px dot + 10px text doesn't communicate what was changed or invite exploration.

6. **Background strip + Advanced details compete with scene card expansion** — three levels of controls for the same fields (BG strip → Advanced → scene card inline) creates confusion about which one controls what.

## Proposed Fixes

### 1. Collapsible sub-sections inside expanded panel
Instead of dumping all `BlockFields` + `TemplateControlChips` at once, wrap each block in its own mini-collapsible with the block title as trigger. First block auto-opens, rest collapsed. This way clicking "Editorial on Street" shows:
- **Visual Direction** ▾ (open by default)
- **Environment** ▸ (collapsed)  
- **Style** ▸ (collapsed)

Each section only 3-4 chips, not 15.

### 2. Wider scene cards with readable titles
- Change grid from `grid-cols-5` to `grid-cols-4` on lg screens
- Use `line-clamp-2` instead of `truncate` for titles
- Increase thumbnail from `w-12 h-12` to `w-14 h-14`

### 3. Simplify the Background strip
- Remove the "Advanced details" collapsible from the BG strip entirely — those controls are already available inside each scene card's expansion. Having them in two places is confusing.
- Keep the BG strip as a single-purpose quick action: just background tone chips + scene count label.

### 4. Better "tap to customize" affordance
- Add subtle text below scene title: `"Lighting, Shadow..."` (first 2 control names) in muted 10px — gives users a preview of what they'll find inside without a confusing "⚙ 7 settings" pill.
- On hover, show a soft `→ Customize` text replacing the control names.

### 5. Scene card expansion opens as a slide-down panel
- Add `overflow-hidden` transition with max-height animation for smoother expand/collapse instead of the current `animate-in fade-in slide-in-from-top` which feels jumpy.

## Files to Update

| File | Changes |
|---|---|
| `ProductImagesStep3Refine.tsx` | (1) Wrap each block inside expanded panel in a mini-Collapsible — first auto-opens, rest collapsed. (2) Widen grid to `grid-cols-4` on lg, increase thumbnail to `w-14 h-14`, use `line-clamp-2` for titles. (3) Remove "Advanced details" collapsible from BG strip — keep only background tone chips. (4) Show first 2 control names as subtle preview text below scene title. (5) Smoother expand animation. |

