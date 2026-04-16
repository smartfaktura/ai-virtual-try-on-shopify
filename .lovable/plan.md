

## Goal

Transform `/app/pricing` from the reused public landing pricing into a **premium, in-app pricing experience** that visually echoes `UpgradePlanModal` (selectable rows, primary "Recommended for You" badge, "Cancel anytime · No commitment", quiet luxury minimalism) and replaces marketing fluff with sharp, value-first copy. Keep the public marketing page untouched.

## Strategy

Create a new dedicated component `AppPricing.tsx` for `/app/pricing` (used only inside the app shell). The public `/pricing` route keeps using `LandingPricing` unchanged. This protects landing SEO/copy while letting the in-app page feel native to the product.

## Files

- **New**: `src/components/app/AppPricing.tsx` — premium in-app pricing
- **Edit**: `src/pages/Pricing.tsx` — swap `LandingPricing` → `AppPricing`, drop `PageLayout` (it's already inside AppShell), keep SEO + JSON-LD
- **Verify**: `src/App.tsx` route mapping (will check during impl) to confirm `/app/pricing` → `Pages/Pricing.tsx`

## Page structure (top → bottom)

### 1. Hero (compact, no marketing bloat)
- Eyebrow: `PRICING`
- H1: **"Studio-grade visuals. Without the studio."**
- Sub: *"Pick the plan that matches your output. Cancel anytime — no commitment."*
- Billing toggle (Monthly / Annual −20%) — same pill style as upgrade modal

### 2. Plan grid (4 cards: Free, Starter, Growth, Pro)
- Card style mirrors modal selection cards: `rounded-2xl border` + `ring-1 ring-primary/30 bg-primary/[0.04]` for the **recommended (Growth)** card
- Badge: **"Recommended for You"** in primary on Growth (matches modal exactly), `Current plan` on the user's plan
- Per-card content (tightened):
  - Plan name + recommended/current badge
  - Big price `$X` `/mo` (annual shows monthly equivalent + small "Save $Y/year")
  - Credits + `~N images/mo` line (5 cr/img)
  - Per-credit micro line in muted color
  - Top 4–5 features only (Check icons), then "+ N more" expander pulled from `plan.features`
  - CTA: `Continue to checkout` for upgrade, `Current plan` (disabled) for current, `Downgrade to X` for lower
- Mobile: 1 col → md: 2 → lg: 4
- Trust line under grid: `Cancel anytime · No commitment` (centered, mirrors modal)

### 3. "What you actually get" — value pillars (replaces 12-feature grid bloat)
Reduce to **6 sharp cards** with outcome-led titles:
- *"Replace your photo studio"* — 1,000+ scenes, lighting, props
- *"Models without the model fee"* — AI Models + Brand Models
- *"From product → ad in minutes"* — Bulk + Multi-angle + 4K
- *"Video, not just stills"* — Short Films, product videos
- *"On-brand, every time"* — Brand Profiles + saved aesthetics
- *"Edit anything, anytime"* — Freestyle + image editing

### 4. ROI snapshot — replaces "Team Comparison" 7-row table
A **clean 3-stat row** above a tighter 4-row comparison:
- Stat 1: `~$0.04` per credit (avg)
- Stat 2: `~$8,000+` saved per shoot vs traditional
- Stat 3: `5 min` from upload to first visual

Followed by a 4-row, scannable comparison (Photographer / Studio / Models / Retouching) — collapsed from 7. "From $0/mo" total in primary.

### 5. How credits work — keep, polish copy
3 cards (Images / Video & Upscale / Monthly Refresh), tightened copy, same modal-style rounded cards.

### 6. FAQ — keep accordion, tighten to 6 questions
Remove redundant ones. Keep: trial, credit cost, cancel, Brand Profile, formats, what can I create.

### 7. Final CTA strip
- For signed-in users: `Top up credits` button (opens `UpgradePlanModal` topup variant) + `Talk to sales` link
- Replaces the "Start with 20 free credits" block (irrelevant in-app)
- Enterprise banner stays at bottom — slimmer

## Visual language (match modal)
- `rounded-2xl` everywhere (cards, buttons, toggle)
- `border-border/50`, `ring-1 ring-primary/30` for selected/recommended states
- `bg-primary/[0.04]` highlight
- Primary `Recommended for You` badge: `text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground`
- Center-aligned trust lines with `text-xs text-muted-foreground`
- Buttons: `rounded-xl min-h-[44px]` for primary CTAs
- Generous vertical rhythm: `py-12 sm:py-16`, sections separated by `mt-20`

## Copy principles
- No "Simple, Transparent Pricing" cliché → "Studio-grade visuals. Without the studio."
- Every section subtitle is one short sentence, value-first
- Replace "Stop hiring photographers…" with stat-driven proof
- Drop emoji-y / salesy phrases; keep tone confident, quiet, premium
- All price math labels are precise (annual = `$X/mo billed yearly` + `Save $Y`)

## CTA wiring
- `Continue to checkout` on plan card → `startCheckout(priceId, 'subscription')` via `useCredits`
- `Top up credits` → opens `UpgradePlanModal` with `variant="topup"`
- `Current plan` → disabled
- Downgrade → routes to `/app/settings` (existing pattern)
- Enterprise → `/contact`

## Out of scope
- No data changes (pricingPlans, creditPacks untouched)
- No backend/Stripe changes
- Public `/pricing` route untouched
- `LandingPricing` component preserved

## Expected result
`/app/pricing` becomes a focused, premium pricing page that visually flows from the upgrade modal — selectable plan cards with the Growth "Recommended for You" treatment, sharper value copy, ROI proof, tightened FAQ, and a clean top-up/contact final CTA. No marketing fluff, all clarity.

