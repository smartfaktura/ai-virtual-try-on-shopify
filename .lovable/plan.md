

## What plan/upgrade pop-ups exist today

I audited every plan-/credit-related surface. There are **6 distinct components** with different triggers, audiences, and dynamic copy:

| # | Component | Type | Trigger | Audience | Dynamic bits |
|---|-----------|------|---------|----------|--------------|
| 1 | `BuyCreditsModal` | Full-screen modal | Sidebar "Top up", `openBuyModal()` from anywhere | All users | Tabs (Top up / Upgrade), monthly/annual toggle, plan grid, credit packs, defaults differ for free vs paid |
| 2 | `UpgradePlanModal` | Compact dialog | Sidebar "Upgrade" pill | Users with a higher tier available | Lists all higher tiers, billing toggle, ~images estimate (5 cr/img) |
| 3 | `PlanChangeDialog` | Confirmation dialog | Confirm step inside `BuyCreditsModal` | Anyone changing tier | 4 modes: `upgrade` / `downgrade` / `cancel` / `reactivate` — each with its own title, icon, color, copy, CTA label |
| 4 | `NoCreditsModal` | Full-screen modal | When `balance < cost` on Generate / ProductImages / BrandModels / Upscale | Out-of-credits users | 7 `ConversionCategory` variants (fashion, beauty, food, etc.) × Layer 3 headline/subline, free vs paid view, plan grid + credit packs |
| 5 | `UpgradeValueDrawer` | Side drawer | "See plans" from post-gen card (Layer 2) | Free users post-generation | Per-category Layer 2 copy, 3 plan cards (Starter/Growth/Pro) with cents-per-credit, "recommended" badge on Growth |
| 6 | `PostGenerationUpgradeCard` | Inline card (not modal) | 7s after first successful gen (Layer 1) | Free users | Per-category headline/subline/value-chips, avatar from team, behavior-hint subline override |

Plus dynamic data sources:
- `pricingPlans` (mockData) — Starter/Growth/Pro/Enterprise prices, credits, Stripe price IDs
- `creditPacks` (mockData) — top-up packs
- `PLAN_CONFIG` (CreditContext) — plan order, max credits, nextPlanId
- `conversionCopy.ts` — Layer 1/2/3 copy × 7 categories × behavior hints

It's genuinely scattered — an admin "showroom" page would help a lot.

## Proposed: `/app/admin/plan-popups`

A single internal admin page that lets you preview every plan/credit popup with all its variants live, without having to set up real conditions (out of credits, free user, specific category, etc.).

### Layout

```text
┌────────────────────────────────────────────────────────────┐
│  Plan & Credit Pop-ups                            [Admin]  │
│  Preview every upgrade surface in one place.               │
├────────────────────────────────────────────────────────────┤
│  GLOBAL CONTROLS                                            │
│  Category: [fashion ▾]   Billing: (Monthly | Annual)       │
│  Preview as plan: [free ▾]   Behavior hint: [none ▾]       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ Card ─────────────────────────────────┐                │
│  │ 1. BuyCreditsModal                     │  [Open] [Code] │
│  │ Full upgrade + top-up modal            │                │
│  │ Triggers: Sidebar "Top up", openBuy…   │                │
│  └────────────────────────────────────────┘                │
│                                                             │
│  ┌─ Card ─────────────────────────────────┐                │
│  │ 2. UpgradePlanModal                    │  [Open]        │
│  │ Compact next-tier picker               │                │
│  └────────────────────────────────────────┘                │
│                                                             │
│  ... same for the other 4 components ...                   │
│                                                             │
│  ┌─ Card: PlanChangeDialog ───────────────────────────┐    │
│  │ Mode:  [upgrade] [downgrade] [cancel] [reactivate] │    │
│  │ Target plan: [growth ▾]                            │    │
│  │                                  [Open with mode]  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ Card: NoCreditsModal ─────────────────────────────┐    │
│  │ Category × generationCount × previewPlan           │    │
│  │                                  [Open]            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ Inline preview: PostGenerationUpgradeCard ────────┐    │
│  │ (renders in-page, not a modal)                     │    │
│  │ [forceVisible] [compact] [behaviorHint ▾]          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─ Reference table ──────────────────────────────────┐    │
│  │ Component | Trigger | Audience | Props | File path │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────┘
```

### Implementation

1. **New page** `src/pages/AdminPlanPopups.tsx`
   - Admin-gated via existing `useIsAdmin()` (redirect / "not authorized" if not admin).
   - Local state for: `category`, `billing`, `previewPlan`, `behaviorHint`, plus per-component open flags and `dialogMode` for `PlanChangeDialog`.
   - Renders all 6 components directly with controlled props. Uses `previewPlan` to pass to `NoCreditsModal` (already supports `previewPlan` prop). For others where the component reads from `useCredits()`, we just open them as-is and label that they reflect the **current logged-in user's plan** (note shown on the card).

2. **Route** in `src/App.tsx`
   - Add `<Route path="/admin/plan-popups" element={<AdminPlanPopups />} />` next to existing admin routes (lazy loaded).

3. **Sidebar entry**
   - Locate the existing admin section in the sidebar (where `/admin/scenes`, `/admin/models` etc. live) and add **"Plan Pop-ups"** item under it. (I'll find the file during build — likely `AppSidebar.tsx` or similar.)

4. **Reference table** at the bottom listing for each component:
   - Name, file path, trigger sources, audience, key props, dynamic copy source (e.g. `conversionCopy.ts`).
   - This makes future iteration much faster — one place shows what exists.

5. **No changes** to any of the 6 popup components themselves — page only consumes them. Zero risk to production flows.

### Out of scope
- Editing copy from the admin page (can be a follow-up — would require moving copy from `conversionCopy.ts` constants into a DB table).
- Toggling which popup shows when (still controlled by the original triggers).

## Expected result

You get a single `/app/admin/plan-popups` page where you can open every plan/upgrade/credit popup with any category, billing cycle, plan-change mode, and behavior hint — plus a reference table mapping each popup to its trigger and source file. Massively faster to QA copy and iterate.

