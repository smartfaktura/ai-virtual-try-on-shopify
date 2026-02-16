

## Clean & Spacious Buy Credits Modal Redesign

### Problems in Current Design
1. Too many visual elements competing: shimmer borders, dark Pro card, green chips, crossed-out prices, image estimate boxes -- all fighting for attention
2. Cards are cramped with dense information stacking (price + strikethrough + savings + image box + credit chip + features + CTA)
3. The dark Pro card and shimmer Growth card create visual chaos instead of elegant hierarchy
4. Per-credit cost chips, image estimate boxes, and feature lists create 3 redundant value layers
5. Modal requires scrolling despite being designed to avoid it
6. Doesn't match the VOVV.AI luxury restraint aesthetic (warm stone, minimal, Apple-inspired)

### Design Philosophy
Strip everything back to the VOVV.AI brand: warm stone palette, generous whitespace, single clear value metric per card, no visual gimmicks. Let the content breathe.

### Changes

#### A. Modal Container
- Keep `max-w-4xl` but remove `rounded-3xl` (use standard `rounded-2xl` matching the brand)
- Remove the shimmer CSS animation entirely from `index.css`
- Simplify padding and remove unnecessary gaps

#### B. Balance Header -- Simplify
- Remove the gradient background -- use a clean flat header
- Remove the progress bar entirely (it's confusing with bonus credits)
- Simple layout: credit count left, plan badge right, single line

#### C. Plans Tab -- Complete Simplification
- **Remove the dark Pro card** -- all cards share the same clean white/card background
- **Remove shimmer animation** from Growth
- **Remove per-credit cost chips** -- too much noise
- **Remove the separate image estimate box** -- integrate into a single clean line
- **Remove crossed-out prices** -- just show the active price cleanly
- **Growth card** gets only: `ring-1 ring-primary` and the "Most Popular" badge -- subtle, not screaming
- Each card shows: Plan name, price, one key value line (e.g., "500 credits -- ~100 images"), 3-4 features as simple text, CTA button
- Update image estimate to use standard mode calculation: credits / 4 = images (not / 10)
  - Free: 20 credits = ~5 images
  - Starter: 500 credits = ~100 images  
  - Growth: 1,500 credits = ~375 images
  - Pro: 4,500 credits = ~1,125 images

#### D. Billing Toggle -- Keep Clean
- Keep centered toggle, keep "SAVE 17%" badge
- Remove the dynamic savings text below (clutters)
- Just the toggle, nothing else

#### E. Top Up Tab -- Simplify
- Remove the subscription nudge banner (too pushy)
- Clean cards with credits, price, and a single "~X images" line
- Update image estimates: pack credits / 4 (standard mode)
  - 200 credits = ~50 images
  - 500 credits = ~125 images
  - 1,500 credits = ~375 images

#### F. Features -- Simplify
- Remove all custom icons (featureIcon mapping) -- use simple bullet/check marks
- Remove "Pro exclusive" sparkle treatment -- just list features plainly
- Show max 4 features, clean small text

### Technical Changes

**File: `src/components/app/BuyCreditsModal.tsx`**

Complete rewrite focusing on:
- Flat, clean card design for all plans (no dark/inverted cards)
- Single value line per card: "500 credits -- ~100 images" (using /4 for standard mode)
- Growth card: just `ring-1 ring-primary` border
- Simple check icons for features (no icon mapping)
- Remove image estimate boxes, per-credit chips, crossed-out prices
- Compact balance header without progress bar
- Clean billing toggle without dynamic savings text
- Top-up cards without nudge banner
- No scrolling needed -- everything fits in viewport

**File: `src/index.css`**

Remove the `plan-card-shimmer` keyframe animation and class.

### Files Modified

| File | Changes |
|---|---|
| `src/components/app/BuyCreditsModal.tsx` | Complete cleanup: flat cards, single value metric, no visual gimmicks, spacious layout, standard-mode image estimates (/4) |
| `src/index.css` | Remove shimmer animation CSS |
