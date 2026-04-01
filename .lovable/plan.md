

# Redesign `/ai-product-photography-for-ecommerce` — From Flat to Engaging

## Problem
The page is currently a flat sequence of text blocks, icon grids, and basic card layouts. No team branding, no visual rhythm, no storytelling. It reads like a spec sheet, not a product landing page.

## Design Direction
Mirror the engaging patterns already used on the main landing page: team avatar social proof, staggered animations, gradient accent sections, hover cards, testimonial quotes, and visual storytelling with the Discover images. Make it feel like a VOVV product page, not a generic SEO template.

## Changes to `src/pages/seo/AIProductPhotographyEcommerce.tsx`

### 1. Hero — Add team avatars + social proof below CTAs
- Add the overlapping VOVV team avatar row (same pattern as `FinalCTA.tsx`) with `TeamAvatarHoverCard` wrappers right below the CTA buttons.
- Add "Your studio team is ready" label beneath.
- Import `TEAM_MEMBERS`, `TeamAvatarHoverCard`, `getOptimizedUrl`.

### 2. Hero grid — Staggered reveal animation
- Add per-card staggered delay using inline `transition-delay` so cards fade in one-by-one instead of all at once (delays: 0ms, 100ms, 200ms, etc.).
- Add a subtle scale-up animation on each card (from `scale-95 opacity-0` to `scale-100 opacity-100`).

### 3. Proof bar — Upgrade to metrics with numbers
- Replace the current 4 generic icon+text items with real stat-style metrics matching `SocialProofBar`: bold number, supporting label, icon.
- Values: "50,000+" visuals generated, "12s" avg delivery, "2,000+" brands, "∞" visual styles.
- Add a short testimonial quote below the stats (same pattern as `SocialProofBar`).

### 4. Outcome tabs — Left image gets a subtle card treatment
- Add a soft gradient background behind the tab image (like `bg-gradient-to-br from-muted to-muted/50`).
- Add a small "Click to explore" hint overlay on hover.

### 5. Why section — Staggered card entrance
- Add per-card stagger delays (0, 100, 200, 300ms) so cards cascade in as they scroll into view.
- Add `hover:-translate-y-1` for a lift effect.

### 6. Comparison section — Stronger visual contrast
- Add a red-tinted left border on the "Traditional" card.
- Add a primary-tinted left border + subtle glow on the "VOVV" card.
- Makes the comparison immediately scannable.

### 7. Shopify section — Add team avatars
- Add the team avatar row here too with "Your creative team handles it" — reinforces the brand identity.

### 8. How It Works — Connected step indicators
- Add a horizontal connecting line between steps (hidden on mobile, visible on lg) to create a visual flow.
- Use the numbered step badges as anchors on the line.

### 9. Final CTA — Add team avatars + hover cards
- Mirror `FinalCTA.tsx` exactly: add the overlapping team avatar row with hover cards and "Your studio team is ready" below the trust badges.

### 10. Overall polish
- Add `will-change-transform` to animated sections for smoother GPU rendering.
- Ensure all section transitions use consistent easing.
- Remove any leftover unused imports.

## Files
| File | Change |
|------|--------|
| `src/pages/seo/AIProductPhotographyEcommerce.tsx` | All changes above — team avatars, staggered animations, metrics bar, card effects, CTA branding |

No new components needed — everything reuses existing patterns from the main landing page.

