

# Redesign Product Images Loading State (Step 5)

## Problems with current design
- Flat, sparse layout with too much whitespace and faded elements
- Team messages feel disconnected — generic photography jargon
- No visual energy or sense of progress beyond a thin bar
- Mobile gets same stretched layout with no adaptation
- Bottom copy uses `muted-foreground/70` (super faded, hard to read)

## Design changes

### `src/components/app/product-images/ProductImagesStep5Generating.tsx` — full rewrite of the return JSX + messages

**Better team messages** — more specific, engaging, brand-personality copy:
```
Sophia — "Dialing in studio lighting for your product…"
Kenji — "Finding the best camera angle for this scene…"
Amara — "Balancing highlights and shadows…"
Luna — "Polishing every detail to pixel perfection…"
Sienna — "Making sure this matches your brand look…"
Leo — "Constructing the perfect background…"
Omar — "Fine-tuning contrast for maximum impact…"
Zara — "Styling the final frame — almost there…"
```

**Layout & visual improvements:**

1. **Contained card** — wrap the entire loading state in a subtle bordered card (`rounded-2xl border bg-background p-8 sm:p-12`) centered with `max-w-lg mx-auto` so it feels intentional, not floating
2. **Larger progress bar** — `h-2.5` with rounded corners, shimmer animation already in place
3. **Phase icon** — add a subtle animated icon above the headline (pulsing camera icon for generating, check for finishing) to give visual anchor
4. **Team message card** — wrap avatar + message in a small pill/chip (`bg-muted/50 rounded-full px-4 py-2`) so it looks like a chat bubble from the team member, not floating text
5. **Progress stats row** — elapsed time and percentage in a cleaner horizontal layout with slightly bolder text (`text-foreground` not `text-muted-foreground`)
6. **Per-product rows** — give them a light background (`bg-muted/30 rounded-lg p-3`) with a mini progress bar per product instead of just count text
7. **Bottom copy** — use `text-muted-foreground` (not `/70`) and add a small info icon, make text readable
8. **Mobile** — reduce padding (`py-10 px-4`), stack elements tighter (`space-y-5`), progress bar full-width with no max-w constraint on small screens

**Responsive breakpoints:**
- Desktop: `max-w-lg`, generous `p-12` padding, 5-col product grid
- Tablet: `max-w-md`, `p-8` padding
- Mobile: full-width with `px-4 py-10`, compact spacing

### Files changed
- `src/components/app/product-images/ProductImagesStep5Generating.tsx` — redesigned UI, better messages, responsive improvements

