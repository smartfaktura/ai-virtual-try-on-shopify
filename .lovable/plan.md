

## Refined Empty State -- Cohesive, Minimal Layout

### Issues with Current Design
- The large icon box (`w-20 h-20 rounded-3xl bg-muted/50`) feels like a separate UI element floating above the avatar -- two competing focal points
- Too many vertically stacked layers: icon box, avatar, name, quote, buttons -- feels like a list, not a composition
- The icon container background color (`bg-muted/50`) draws too much attention and looks "boxy"

### New Approach
Merge the icon and avatar into one cohesive visual group. Remove the icon container background entirely and place the icon inline above the avatar with no box -- just a subtle, large icon as a watermark/backdrop effect.

**Layout (top to bottom):**
1. Icon rendered large (w-10 h-10) in muted color with no background container -- just the bare icon, lighter and more decorative
2. Quote text as the single message
3. CTA buttons row

Remove the avatar and name entirely. The team member concept added clutter without clear value in this context. The icon alone provides the visual anchor, and the quote provides the personality.

### Changes

**`src/components/app/EmptyStateCard.tsx`** -- Simplify teamMember layout:
- Remove the avatar image and name display when `teamMember` is present
- Remove the `bg-muted/50 rounded-3xl` container around the icon -- render icon bare with `text-muted-foreground/40` for a soft watermark feel, sized at `w-12 h-12`
- Tighten spacing to `space-y-3` for a more cohesive grouping
- Keep `py-20 sm:py-28` padding and CTA buttons

**`src/pages/Jobs.tsx`** -- Pass icon sized at `w-12 h-12` (the component will handle styling)

**`src/pages/Products.tsx`** -- Same icon size adjustment

### Result
Goes from 5 visual layers to 3 (icon, message, buttons), feeling unified and Apple-clean rather than fragmented.
