## Goal

Gate Brand Scenes creation behind **Growth, Pro, or Enterprise** plans. Free and Starter users see an upgrade screen instead. Also remove the secondary "Or explore ready-made scenes" CTA from the empty state.

## Plan tiers (recap from `PLAN_CONFIG`)

`free` · `starter` · **`growth`** · **`pro`** · **`enterprise`** ← allowed three

## Changes

### 1. New helper: `canCreateBrandScenes(plan)`

Tiny pure helper in `src/features/brand-scenes/access.ts`:

```ts
export const BRAND_SCENE_PLANS = ['growth', 'pro', 'enterprise'] as const;
export const canCreateBrandScenes = (plan: string) =>
  BRAND_SCENE_PLANS.includes(plan as any);
```

Centralizes the rule so future tier changes are one edit.

### 2. `src/pages/BrandScenes.tsx`

- Read `plan` from `useCredits()`.
- If `!canCreateBrandScenes(plan)`:
  - Hide the top-right "New brand scene" button.
  - Hide the existing-scenes grid CTA paths to wizard.
  - Render a new **`BrandScenesUpgradeState`** component (see #4) in place of the empty state and as a header banner if the user already has saved scenes (they keep read access but cannot create more).
- Existing scenes (if any) remain visible and usable — only **creation** is gated. (Edge case: legacy users who downgraded shouldn't lose their library.)
- Remove the "Or explore ready-made scenes" ghost button from the `EmptyState` component entirely.

### 3. `src/pages/BrandSceneWizard.tsx` (route guard)

Add the same `canCreateBrandScenes(plan)` check at the top of the wizard route. If false, redirect to `/app/brand-scenes` (so the upgrade screen is shown). Prevents direct URL access to `/app/brand-scenes/new`.

### 4. New component: `BrandScenesUpgradeState`

Lives in `src/pages/BrandScenes.tsx` (private component) or alongside it. Mirrors the visual tone of the existing `EmptyState` card — same `rounded-2xl border bg-card` shell, same Mountain icon — but messaging is upgrade-focused:

- Heading: **"Brand Scenes is on Growth and Pro"**
- Subtitle: short single sentence (no terminal period per Core memory) — e.g. *"Design signature scenes locked to your brand on Growth or Pro"*
- 3 value bullets (reuse Sparkles / Layers / Users icons + same copy as EmptyState)
- Single primary CTA: **"Upgrade plan"** — opens the existing `UpgradePlanModal` via `openBuyModal()` from `CreditContext` (already wired to preselect Growth — see `defaultPlanId` logic in `UpgradePlanModal.tsx:151`).
- No secondary CTA.

### 5. Analytics / consistency

- Pass `source: 'brand-scenes-gate'` when opening the modal so the existing `modal_view` analytics event distinguishes this entry point. (`openBuyModal` already accepts a source — verified during exploration.)

## Out of scope

- Server-side enforcement on the `save-brand-scene` edge function. Recommend adding a plan check there in a follow-up so a crafted API call can't bypass the UI gate, but it's outside this UI-only task as requested.
- Changing which plans appear in the upgrade modal — it already filters to plans strictly above the user's current tier and preselects Growth.
- Pricing page copy ("Brand Scenes" feature row) — separate task if needed.

## Files touched

- `src/features/brand-scenes/access.ts` *(new)* — `canCreateBrandScenes` helper
- `src/pages/BrandScenes.tsx` — gate creation, remove ready-made CTA, add upgrade state
- `src/pages/BrandSceneWizard.tsx` — route-level redirect for non-eligible plans
