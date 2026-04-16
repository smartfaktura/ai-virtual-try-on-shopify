

## Goal

Refine `/app/pricing` to feel like the upgrade modal: compact selectable plan rows, a full SaaS-style feature comparison table with checkmarks, smarter CTA logic for users with no plan, and sharper FAQs.

## File
- `src/pages/AppPricing.tsx` only

## Changes

### 1. Plan cards → compact rows (modal style)
Replace the current 4 large stacked cards with the **same selectable row pattern** used in `UpgradePlanModal` (lines 250–306 of the modal):
- One row per plan, `rounded-2xl border p-4`
- Left: radio circle + plan name + badge ("Recommended for You" on Growth, "Current plan" on user's plan) + small line `1,500 credits · ~300 images/mo · 5.3¢/credit`
- Right: `$79` `/mo` (annual shows monthly equiv + tiny "save $X")
- Selected state: `border-primary bg-primary/[0.04] ring-1 ring-primary/30`
- Click row → selects it (highlights). Single CTA below: **"Continue to checkout"** (or "Current plan" disabled / "Reactivate" / "Downgrade to X" depending on selected vs current)
- Default selection: Growth (or current plan if user has one higher)
- Stack vertically — no more 4-column grid. Same compact feel as modal.
- Drop the per-card "+ N more" feature lists (the comparison table below replaces them)

### 2. Full feature comparison table (new section, replaces "What you actually get" pillars)
Premium SaaS-style table with **checkmarks across every plan** for every platform feature. Grouped by category for scannability:

**Generation**
- Product photography scenes (1,000+)
- Lifestyle & editorial scenes
- AI Models (on-model imagery)
- Brand Models (custom trained) — Growth+
- Bulk generation — Starter+
- Multi-angle / perspectives
- Freestyle (text-to-image)
- Image editing & background swap

**Video**
- Product videos — Starter+
- Short Films (AI Director) — Growth+
- Audio & dialog — Pro

**Quality & output**
- 2K resolution — all
- 4K upscaling — Starter+
- All aspect ratios (1:1, 4:5, 3:4, 16:9, 9:16)
- PNG / JPG export

**Brand & workflow**
- Brand Profiles — Starter+
- Saved aesthetics & color systems — Growth+
- Catalog Studio — Growth+
- Trend Watch (curated drops) — Pro
- Bulk export (ZIP)

**Account**
- Generation queue speed (Standard / Priority / Fastest)
- Monthly credits (number)
- Per-credit cost
- Support (Community / Email / Priority)

Layout: sticky header row with plan names + prices. First column = feature name. Other columns = ✓ (primary color) / — (muted) / text value. Mobile: horizontal scroll wrapper. Same `rounded-2xl border-border/50` shell as the rest.

Keeps the existing "ROI snapshot" section (math/comparison vs traditional) — that one stays.

### 3. CTA logic for users with no plan (Free users)
In the **final CTA strip** (currently "Top up credits" + "Talk to sales"):
- If `plan === 'free'` (no active subscription) → **hide "Top up credits"**, show only **"Choose a plan"** (scrolls to plan section) + "Talk to sales"
- If `plan !== 'free'` (paid user) → keep current "Top up credits" + "Talk to sales"

Rationale: top-ups are a paid-user feature; new users must subscribe first.

### 4. Improved FAQs (rewrite all 6 + add 2)
Replace generic copy with sharper, objection-handling answers. New set:

1. **How does VOVV compare to a real photoshoot?** — Side-by-side comparison: cost, time, iterations.
2. **What exactly counts as 1 credit?** — Breakdown per workflow (image 4–6, video 30–60, upscale 5, Brand Model training X).
3. **Do unused credits roll over?** — No, credits reset monthly (use-it-or-lose-it). Top-ups never expire.
4. **Can I use the images commercially?** — Yes, full commercial license on all paid plans.
5. **What happens if I cancel mid-cycle?** — Plan stays active until period end, then drops to Free. No prorated refund, no surprise charges.
6. **How accurate are AI Models for on-model shots?** — Brand Models train on your real product/people for full identity consistency.
7. **Can I switch plans anytime?** — Yes. Upgrades take effect immediately with prorated credits; downgrades at next renewal.
8. **Is my product data private?** — Your uploads, generations, and Brand Profiles are private to your workspace. We never train shared models on your data.

## Out of scope
- No backend, Stripe, or data file changes
- `UpgradePlanModal` untouched
- Public `/pricing` (LandingPricing) untouched
- Hero, billing toggle, ROI snapshot, How credits work, Enterprise CTA — unchanged

## Expected result
Plans feel like the modal (selectable rows, single CTA), users get a scannable feature comparison table to justify upgrading, free users see a "Choose a plan" CTA instead of "Top up", and FAQs handle real objections.

