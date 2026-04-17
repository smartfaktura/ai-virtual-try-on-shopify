
User wants Brand Models gated to Growth+ (not Starter). So the badge "Growth & Pro" is actually correct copy-wise, but the underlying `isPaid` check at L817 currently includes Starter implicitly via paid-plan logic — need to verify and tighten.

Let me check the file to confirm gating logic before planning.

## Goal
Restrict Brand Models access to **Growth and Pro plans only** (exclude Starter), and apply remaining audit fixes.

## Changes

1. **`src/pages/BrandModels.tsx:~817`** — Tighten `isPaid` gate to only allow `growth | pro | enterprise` (exclude `starter`). Verify the current check and adjust so Starter users see the upgrade hero.

2. **`src/pages/BrandModels.tsx:38`** — Keep badge as **"Growth & Pro"** (already correct under new gating). No change needed if copy already matches.

3. **`src/pages/BrandModels.tsx:113`** — `'~1-2 min'` → `'~1–2 min'` (en-dash for range consistency).

4. **`src/pages/BrandModels.tsx:40`** — UpgradeHero `<h2>` "My Brand Models" → **"Brand Models"** (drop "My" on marketing surface).

5. **`src/pages/Discover.tsx:472`** — "Try different keywords or browse all" → **"Try a different category or browse all"** (page uses category bar, not keyword search).

## Out of scope
- Pricing page copy (separate audit if Starter messaging needs updating to reflect Brand Models exclusion)
- Admin-only blocks

## Acceptance
- Starter users see upgrade hero on `/app/models` (not the generation UI)
- Badge accurately reads "Growth & Pro"
- En-dash applied to time estimate
- Marketing hero heading reads "Brand Models"
- Discover empty state matches actual UI controls
- ~4 strings + 1 logic check across 2 files
