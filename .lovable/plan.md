

## Premium Credits Pop-up Redesign

Completely overhaul the BuyCreditsModal for a clean, spacious, luxurious feel with proper layouts on both desktop and mobile.

### Problems in Current Design
- 4 plan columns crammed into a max-w-2xl dialog -- too tight, text gets cut off
- Credit pack cards feel dense with insufficient spacing
- Balance bar is functional but bland
- Tabs feel utilitarian, not premium
- On mobile, the 4-column grid collapses poorly

### Design Changes

**1. `BuyCreditsModal.tsx` -- Complete visual overhaul**

**Modal sizing:**
- Expand to `max-w-4xl` to give plan columns room to breathe
- Add `p-0` to DialogContent for full-bleed internal layout

**Balance section (top):**
- Full-width gradient header area with large balance number
- Plan badge and bonus indicator inline
- Thinner, more elegant progress bar with rounded ends
- More whitespace above/below (py-6 px-8)

**Tab styling:**
- Wider tab triggers with more padding
- Subtle bottom-border active indicator instead of filled background

**Top Up tab redesign:**
- Cards get `p-8` padding, more vertical breathing room
- Larger credit number (text-4xl), clear visual hierarchy
- Separator line between credits count and price
- "Best Value" badge refined with a subtle glow/shadow
- Grid: `grid-cols-1 sm:grid-cols-3` with `gap-6`
- Each card: subtle hover scale transform (`hover:scale-[1.02]`)

**Upgrade Plan tab redesign:**
- Billing toggle: pill-style with smoother transitions, slightly larger
- Plan grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` with `gap-5`
- Each plan card:
  - More generous internal spacing (`p-6 space-y-5`)
  - Plan name with larger font weight
  - Price with clear hierarchy: big number + small "/mo"
  - Credits pill: refined with subtle background
  - Features: better line-height, `space-y-2` instead of `space-y-1.5`
  - CTA button: taller (`min-h-[44px]`), rounded-xl
  - Current plan: subtle dashed border instead of solid
  - Highlighted plan: subtle shadow + primary border
- Enterprise banner: more padding, refined icon treatment

**2. `NoCreditsModal.tsx` -- Match new style**
- Same card treatment as Top Up tab
- Better spacing and typography hierarchy
- Larger CTA for "View Plans"

**3. `PlanChangeDialog.tsx` -- Visual polish**
- Slightly larger max-width (`max-w-lg`)
- More generous padding in the summary boxes
- Refined icon backgrounds with subtle gradient

### Files Changed
- **Edit**: `src/components/app/BuyCreditsModal.tsx` -- complete visual redesign
- **Edit**: `src/components/app/NoCreditsModal.tsx` -- match new card style
- **Edit**: `src/components/app/PlanChangeDialog.tsx` -- visual polish

### No Logic Changes
All existing handlers, context usage, and PlanChangeDialog integration remain identical. This is purely visual spacing, typography, and layout improvements.
