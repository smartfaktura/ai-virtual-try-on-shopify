

## Match sub-category row to family pill style — outlined, smaller, coherent

Your screenshot shows the right pattern: **same pill shape as the family row, but smaller and outlined** instead of solid muted fill. This creates a clear weight ladder without introducing a foreign style (text-link rail).

### Visual spec

```text
Row 1 (family):  [All] (●Fashion●) [Footwear] [Bags & Accessories] …    ← solid black active
Row 2 (sub):     ( All ) ( Clothing ) ( Hoodies ) (●Activewear●) …      ← outlined, smaller, solid black active
```

Both rows now speak the same visual language (rounded-full pills), just at different scales — exactly like the screenshot.

### Sub-pill styling

- **Shape**: `rounded-full` (matches family pills)
- **Size**: `px-4 py-1.5 text-[12px] font-medium tracking-wide` (smaller than family's `px-5 py-2 text-sm`)
- **Inactive**: `bg-transparent border border-border/60 text-muted-foreground/80 hover:border-foreground/40 hover:text-foreground`
- **Active**: `bg-foreground text-background border border-foreground shadow-sm` (same solid black as active family pill — keeps the active state strong and recognizable as a peer-level selection)
- **Gap between pills**: `gap-2` (tighter than the `gap-3` text rail)
- **No interpunct dividers** (those belonged to the text-link version)

### Bring back the "All" pill

With pills (vs text links), an explicit **All** pill reads naturally — same as your screenshot. Clicking it sets `selectedSubcategory = '__all__'`. Drop the toggle-off-by-clicking-active behavior since "All" is now the explicit clear action.

Label is just **"All"** (not "All Fashion") — family context is already obvious from the highlighted family chip above, no redundancy.

### Scroll arrows

Keep the existing collapse-when-not-needed arrows (they already match the family row's chevrons) — bump icon size from `w-3.5` to `w-4` so they read at the same weight as the family row's arrows.

### Spacing (unchanged)

`<div className="space-y-2.5">` wrapper in `Discover.tsx` and `PublicDiscover.tsx` keeps the ~10px gap between rows — already in place from the prior plan.

### Files touched

```text
EDIT  src/components/app/DiscoverSubCategoryBar.tsx
        - Prepend an "All" item (id '__all__', label 'All')
        - Click handler: always sets selectedSubcategory = sub.id (no toggle-off)
        - Remove interpunct <span> separators
        - Pill className:
            base:     'rounded-full px-4 py-1.5 text-[12px] font-medium tracking-wide
                       transition-all duration-200 whitespace-nowrap shrink-0 border'
            inactive: 'bg-transparent border-border/60 text-muted-foreground/80
                       hover:border-foreground/40 hover:text-foreground'
            active:   'bg-foreground text-background border-foreground shadow-sm'
        - Container: gap-3 → gap-2
        - Arrow icons: w-3.5 → w-4 to match family row weight
```

No DB, no other components, no taxonomy changes. Drop-in replacement.

### Validation

1. `/app/discover` → click *Fashion*: sub-row reads `(All) (Clothing) (Hoodies) (Dresses) (Jeans) (Jackets) (Activewear) (Swimwear) (Lingerie) (Streetwear)` — outlined pills, same shape as the family row, visibly smaller.
2. Click *Activewear* → fills solid black (matches active family pill style); grid filters.
3. Click *All* → returns to family-wide view, *All* pill goes solid.
4. `/discover` looks identical to `/app/discover`.
5. Two rows now read as **one coherent pill family at two scales** — no foreign text-link element, no chip vs link mismatch.

