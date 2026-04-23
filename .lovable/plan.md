

## Replace sub-category pill row with a quiet text-link sub-nav

You're right — the second pill row doesn't belong. Two pill rows stacked feels heavy and foreign to the rest of the site (which uses underlines, hairlines, and restraint). The fix is to drop the chip metaphor entirely for level-2 and use a thin **text-link rail** — same pattern Apple, Linear, and Stripe use for nested filters.

### What changes visually

```text
Before:  [All] [Bags] [Backpacks] [Belts] [Scarves] …    ← chips, blur fade, redundant "All"

After:    Bags · Backpacks · Belts · Scarves · Hats · Wallets · Eyewear
                ────────                                              ← thin underline = active
```

Plain text labels separated by hairline dividers. The active sub-type gets a 1px underline (`underline underline-offset-4 decoration-1 text-foreground`). Inactive = `text-muted-foreground/70 hover:text-foreground`. No chips, no background fills, no fade mask, no border.

### Why this fixes every complaint

| Complaint | Fix |
|---|---|
| "Blurred transparent effect on the side" | Remove `fade-scroll` mask. Text rail uses simple `overflow-x-auto scrollbar-hide` with no gradient overlay. |
| "Selected sub-button looks bad" | Replace flat gray `bg-foreground/10` chip with elegant underline — matches the site's underline-driven typography aesthetic (footer links, learn guides). |
| "Fewer inputs than whole line" feels off-balance | Text rail naturally fills its width without chip sizing constraints; visually subordinate by design, not awkward. |
| "Redundant info" (All pill) | Drop the All pill. Clicking the family pill itself = All. To clear a sub-type, user clicks the active sub-type again (toggles off) OR clicks the family pill above. Tooltip on first visit not needed — pattern is intuitive. |
| "Different style from overall website" | Text + underline is the same level-2 nav pattern used elsewhere in the app (Settings tabs, Learn nav). |

### Interaction details

- **Click an inactive sub-type** → filters to that sub-type (sets `selectedSubcategory = sub.id`).
- **Click the active sub-type** → toggles back to `__all__` (shows everything in the family).
- **Click any family pill above** → resets `selectedSubcategory` to `__all__` (already wired via the existing `useEffect`).
- Keyboard accessible: `<button>` elements, `aria-pressed` reflects active state.

### Spacing & rhythm

The wrapper stays `<div className="space-y-2.5">` so the text rail sits ~10px under the family pills on both `/discover` and `/app/discover`. Container indent reduced from `pl-1` to `pl-0` (text rail aligns flush-left under the family bar — no need to indent text the way you'd indent secondary chips).

### Files touched

```text
EDIT  src/components/app/DiscoverSubCategoryBar.tsx
        - Drop "All" item from items array
        - Replace pill button styles with:
            inactive: 'text-muted-foreground/70 hover:text-foreground'
            active:   'text-foreground underline underline-offset-4 decoration-1'
        - Remove fade-scroll class (no gradient mask)
        - Remove pl-1; add subtle separators (· interpunct between items, muted)
        - Click active → call onSelectSubcategory('__all__') to toggle off
        - Smaller scroll arrows kept (only show if overflow), no chevron background
```

No changes to `Discover.tsx`, `PublicDiscover.tsx`, `DashboardDiscoverSection.tsx`, taxonomy, or DB — they all already pass the same props. The component swap is fully drop-in.

### Validation

1. `/app/discover` → click *Fashion*: under the family bar, a single line of plain text reads `Clothing · Hoodies · Dresses · Jeans · Jackets · Activewear · Swimwear · Lingerie · Streetwear` — no chips, no blur, no "All".
2. Click *Hoodies* → underlined, grid filters to hoodies.
3. Click *Hoodies* again → underline gone, grid shows all Fashion (toggled back to family-wide view).
4. `/discover` looks identical to `/app/discover` (same component, same spacing).
5. Visually the level-2 rail reads as a quiet refinement — not a competing component.
6. No "blurred transparent edge" anywhere on the sub-row.

