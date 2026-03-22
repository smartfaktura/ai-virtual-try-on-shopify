

# Polish Personalization Selector Styling

## Current Issue
The "Personalized for" label and pill look flat and slightly disconnected. Needs more visual refinement to feel integrated and premium.

## Changes (1 file only)

### File: `src/components/app/DashboardPersonalizationHero.tsx`

**Visual improvements only — no structural changes:**

1. **"Personalized for" label**: Change from `text-sm text-muted-foreground` to `text-sm text-muted-foreground/70` — slightly softer so the pill stands out more as the interactive element

2. **Pill button styling**: Replace current `border border-border` with:
   - `bg-muted/50 border border-border/40` — softer background tint instead of stark border
   - `hover:bg-muted hover:border-border/60` — gentle hover lift
   - `shadow-sm` — tiny shadow for depth
   - `transition-all duration-200` — smooth state changes
   - Keep `rounded-full`, `text-sm`, `font-medium`

3. **Chevron icon**: Reduce to `w-3 h-3` and `text-muted-foreground/50` — more subtle

4. **Headline text**: Add `max-w-lg` so it doesn't stretch too wide on large screens. Keeps it readable and elegant.

5. **Container spacing**: Change `gap-2` to `gap-2.5` between label and pill for better breathing room

### Result
Same layout, same structure — just more refined surfaces, softer contrasts, and smoother interactions. The pill will feel like a polished interactive element rather than a raw button.

