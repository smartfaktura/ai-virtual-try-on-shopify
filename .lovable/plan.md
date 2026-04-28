# Fix /pricing — restore primary blue, clean table greys, full-width final CTA

## What's wrong today

Looking at `src/components/landing/LandingPricing.tsx`:

1. **CTAs and accents render near-black, not the brand blue.** Almost every accent on the page is hardcoded to `#1a1a2e` (a cold violet-grey). The design token `--primary` is `hsl(217 33% 17%)` — a proper dark navy blue (~`#1d2939`). The hardcoded `#1a1a2e` reads as flat black; the intended `--primary` reads as deep blue. 23 hits in this file.
2. **Table looks "muddy grey".** The table uses 5 different grey washes stacked together: `bg-[#FAFAF8]` header row, `bg-[#FAFAF8]` group label rows, `bg-foreground/[0.03]` recommended-column wash, `hover:bg-[#FAFAF8]/60` row hover, plus a `border-foreground/30` ring on the recommended column. Combined with the page bg (also `#FAFAF8`) this creates the flat, washed-out grey look the user is complaining about. Same issue on the "Replaces a studio" table (zebra striping `#FAFAF8/60`).
3. **Final CTA is constrained.** The "Start with 20 free credits" / "Go to Studio" card is wrapped in `max-w-3xl`, so it sits as a narrow box. The user wants it as a full-width band. The button itself (white pill on dark card) is fine in shape but should also use the proper primary blue, not `#1a1a2e`.

## Plan

### A. Restore the primary blue everywhere on the page
Replace every hardcoded `#1a1a2e` / `#2a2a3e` (and the `rgba(26,26,46,...)` shadows) with the design system token:
- backgrounds: `bg-primary`
- text: `text-primary` or `text-primary-foreground` for on-dark
- text on secondary text colors (`#6b7280`, `#9ca3af`, `#4b5563`): switch to `text-muted-foreground` / `text-foreground/75` so the page stays consistent with the rest of the site
- shadows: `shadow-[...hsl(var(--primary)/0.15)]`
- hover state on primary CTA: `hover:bg-primary/90` (instead of the current "lighter black" `#2a2a3e`)

Net effect: every CTA, badge, monthly/annual toggle, "Recommended" pill, plan price, plan name, and check icon goes back to the brand dark navy blue instead of looking flat black.

### B. Clean up the comparison table
- Remove the muddy zebra/grey washes on the main feature matrix:
  - Plan headers: keep white card background; only the "Recommended" column gets a very subtle `bg-primary/[0.025]` accent (not grey).
  - Group label rows (`Generation`, `Video`, …): drop the `#FAFAF8` background, use a thin `border-t border-[#eceae6]` divider with the label sitting on white in tiny tracked uppercase.
  - Feature rows: drop `hover:bg-[#FAFAF8]/60` hover; rely on row separators only.
  - Cell `Minus` icon: lighter (`text-muted-foreground/30`) so empty cells recede.
  - Recommended column gets a soft top accent bar in `bg-primary` (already present) — keep, since that's color, not grey.
- Same cleanup for the "Replaces a studio" table:
  - Remove the alternating `bg-[#FAFAF8]/60` zebra; all rows white, separated by `border-[#eceae6]`.
  - The summary / total row gets a single subtle `bg-primary/[0.04]` band so the eye lands there.

### C. Final CTA → full-width band
Restructure the "Start with 20 free credits" block:
- Pull it out of the `max-w-6xl` container so it spans the full viewport width (full-bleed `bg-primary` band).
- Section padding stays generous (`py-20 lg:py-28`).
- Inner content stays centered and capped at ~`max-w-3xl` for readability, but the colored band itself goes edge-to-edge.
- Button refinement: keep white-on-primary pill, but use design tokens (`bg-white text-primary hover:bg-white/95`) and add a subtle inner shadow so it feels intentional rather than a generic pill. Same height/spacing.

### D. Files touched
- `src/components/landing/LandingPricing.tsx` — color and structure changes only (no copy changes, no schema changes).
- No changes to `index.css`, no token changes, no migrations.

## Out of scope
- Homepage, /app/pricing, comparison pages — left as-is.
- Plan data, copy, FAQ content, schema/SEO — unchanged.
