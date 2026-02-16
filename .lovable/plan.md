

## Redesign Buy Credits Modal -- Visual & UX Overhaul

### Problems in Current Design

1. **Plan cards are flat and cramped** -- all four plans look identical with thin borders, no visual weight difference
2. **Credits block is just plain text** -- "1,500 credits/mo" as a single line has no presence
3. **Per-credit cost is tiny and lost** -- "4.2c/credit" in 11px primary text doesn't pop
4. **No visual hierarchy between plans** -- Growth (Most Popular) barely stands out from Starter
5. **Features are all identical style** -- no differentiation between "included" vs "exclusive to this tier"
6. **Billing toggle is small** -- the annual savings message competes with the toggle for attention
7. **Top-up cards are plain** -- no gradient or visual interest
8. **Balance header feels disconnected** -- progress bar is thin and forgettable

### Design Improvements

**A. Balance Header**
- Make the credit count larger (3xl) with a subtle gradient text effect
- Thicken progress bar to 2px with a glow effect when bonus credits exist
- Add a mini "upgrade" nudge if user is on Free

**B. Billing Toggle Area**
- Center the toggle with the savings message directly beneath it
- Make the annual pill more prominent with a green/emerald savings badge instead of just "-17%" text
- When monthly is selected, show a dismissible "Save up to $432/yr" amber nudge bar

**C. Plan Cards -- Complete Visual Redesign**
- **Distinct card backgrounds**: Free = plain, Starter = subtle warm gradient top border, Growth = primary gradient top border + light primary wash background, Pro = dark card (inverted colors)
- **Credits section as a pill/badge**: Instead of plain text, show credits in a rounded pill with a subtle background: "500 credits/mo" centered with icon
- **Image estimate as hero metric**: Show "~50 images" in large bold text as the primary value anchor, with "per month" below it in small text
- **Per-credit cost in a comparison chip**: Small green chip showing "6.2c/credit" with a subtle "vs 7.5c top-up" comparison on hover
- **Feature list with icons**: Replace plain checkmarks with category-specific mini icons (workflow icon, profile icon, product icon) for visual scanning
- **Pro card gets "Pro exclusive" labels**: Video Generation and Creative Drops features get a small sparkle icon and slightly different text color to highlight exclusivity
- **Growth card gets a subtle animated shimmer** on the border to draw the eye (CSS only)

**D. Top-Up Tab**
- Give pack cards a subtle gradient background (light to transparent)
- Make the "Best Value" pack visually larger (scale slightly)
- Nudge banner gets an icon and slightly more padding for breathing room

**E. Overall Modal Polish**
- Increase `max-w` from `3xl` to `4xl` for more breathing room between 4 plan cards
- Add subtle rounded-3xl to the modal for a more premium feel
- Slightly increase gap between plan cards from `gap-3` to `gap-4`
- Use `backdrop-blur` on the overlay for a frosted glass effect

### Technical Changes

#### File: `src/components/app/BuyCreditsModal.tsx`

Full redesign of the modal content layout:

**Balance header**: Larger credit number, thicker progress bar, plan badge with color coding

**Billing toggle**: Centered layout, savings badge in emerald/green, monthly nudge bar

**Plan cards** (inline, not using PlanCard component since the modal uses its own card rendering):
- Each plan card gets a unique visual treatment based on tier
- Credits shown as a centered hero metric: large number with "images/mo" estimate
- Per-credit cost in a subtle chip
- Feature list limited to 4 items max with better spacing
- Pro card uses `bg-foreground text-background` (dark inverted) style
- Growth card gets `ring-2 ring-primary shadow-xl` for emphasis
- CTA buttons: Growth and Pro get `default` variant; Free and Starter get `outline`

**Top-up tab**: Better card styling, larger "Best Value" card, improved nudge banner

#### File: `src/data/mockData.ts`

No data changes needed -- features and credits are already correct from the previous update. This is purely a visual/layout change.

### Summary

| File | Changes |
|---|---|
| `src/components/app/BuyCreditsModal.tsx` | Complete visual redesign: wider modal, distinct plan card tiers with unique backgrounds/borders, hero image-estimate metrics, centered billing toggle with savings badge, improved top-up cards, Pro card dark theme, Growth card emphasized with ring+shadow |

This is a UI-only change with no data model modifications.
