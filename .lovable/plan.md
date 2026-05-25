## Changes

### 1. Add "Brand Scenes" to plan feature matrices

Insert a new row directly after `Brand Models (custom trained)` in both feature tables, with **NEW** badge. Tier availability: `free: false, starter: false, growth: true, pro: true` (matches Brand Models since Brand Scenes is the same growth+ feature class).

Files:
- `src/components/landing/LandingPricing.tsx` (line 33 area) — add row
- `src/pages/AppPricing.tsx` (line 43 area) — add row

The existing `FeatureRow` type already supports a `badge` field (used elsewhere). Verify; if not, extend the row type to render a small "NEW" pill next to the label and update the `FeatureRow` rendering to show it.

### 2. Add "Brand Scenes" line item to plan cards on `/settings`

`src/data/mockData.ts` `pricingPlans` — Growth and Pro `features[]` currently end with `{ text: 'Brand Models', badge: 'NEW' }`. Append `{ text: 'Brand Scenes', badge: 'NEW' }` to both Growth and Pro plans so the new feature surfaces in `/settings` and `/pricing` plan cards (they share this data source).

### 3. Sidebar nav — "NEW" badge on Brand Scenes

`src/components/app/AppShell.tsx`:
- Extend the `NavItem` type with an optional `badge?: string`.
- On the Brand Scenes entry (line 78), add `badge: 'NEW'`.
- In `NavItemButton` render (line 175-184), render a small uppercase pill next to `{item.label}` when `item.badge` is present, styled like the existing "Soon" pill but in a subtle accent (e.g. `bg-white/[0.12] text-white/80`). Hidden when sidebar is `collapsed`.

### 4. Starter users — make "Top up" actually visible from Settings

Functionality already exists: `BuyCreditsModal` defaults paid users (including Starter) to the **Top Up** tab. The problem is `/settings` only exposes "Manage Billing & Invoices" — there's no button to open the top-up modal. Users assume the only path is to "upgrade".

Fix in `src/pages/Settings.tsx` (around lines 510-516, the `Billing CTA` block for paid users):
- Add a primary `Top up credits` button above (or beside) "Manage Billing & Invoices" that calls `openBuyModal('settings')` from the `useCredits()` hook (already imported on line 264 — just add `openBuyModal` to the destructure).
- Keep the existing "Manage Billing & Invoices" secondary button unchanged.

No backend, RLS, Stripe price, or edge function changes — top-up checkout already works for Starter via the existing `creditPacks` flow.

## Out of scope

- No new feature tier rules — Brand Scenes inherits Growth+ availability from Brand Models (confirm with user if Starter should also get access; current `access.ts` enforces existing gating).
- No copy/marketing changes to landing hero, only the comparison tables.
- No changes to `BuyCreditsModal` itself.
