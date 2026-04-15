# Post-First-Success Conversion Strategy — Detailed Implementation Plan

## Current Free vs Paid Reality (from code audit)


| Capability            | Free                   | Starter ($39/mo) | Growth ($79/mo) |
| --------------------- | ---------------------- | ---------------- | --------------- |
| Credits               | 20 (60 via onboarding) | 500/mo           | 1,500/mo        |
| Scenes per generation | 1                      | 99               | 99              |
| Models per generation | 1                      | Multi            | Multi           |
| Image count per job   | 1                      | Up to 4          | Up to 4         |
| Products              | Up to 5                | Up to 100        | Up to 250       |
| Brand Profiles        | 1                      | 3                | 10              |
| Bulk/batch generation | No                     | Yes              | Yes             |
| Brand Models          | No                     | No               | Yes (NEW)       |
| Priority queue        | No                     | No               | Yes             |


**Key insight**: Free users can access ALL workflows — they're just limited to 1 scene, 1 model, 1 image per run. This is the leverage point: they see what works, but only one direction at a time.

---

## 3-Layer Conversion Flow

### Layer 1: Inline Success Expansion Card

**Where it appears**: Injected as a new `<Card>` between the "Generation Summary" card and the "Generated Images" card on the results step in `Generate.tsx` (line ~4390), and equivalently in Freestyle results and TextToProduct results.

**Trigger**: `currentStep === 'results' && plan === 'free' && !sessionStorage.getItem('vovv_l1_dismissed')`

**Delay**: 3 seconds after results render (CSS fade-in, not blocking render)

**Exact content structure**:

```
┌─────────────────────────────────────────────────────────┐
│ ✨  You just created your first [fashion] direction     │
│                                                         │
│ This is 1 of the 8–12 looks brands typically need       │
│ per product to cover campaigns, social, and e-commerce. │
│                                                         │
│ [ + More Scenes ] [ + More Models ] [ + Batch Export ]  │
│ [ + Video ]                                             │
│                                                         │
│ [See what you can unlock →]            [Dismiss ✕]     │
└─────────────────────────────────────────────────────────┘
```

**Dynamic text per category** (from `product_categories` in profiles or product analysis):


| Category               | Line 1                                          | Line 2                                                                            |
| ---------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------- |
| fashion                | "You just created your first fashion direction" | "This is 1 of the 8–12 looks brands typically need per product"                   |
| beauty                 | "You just created your first beauty visual"     | "Skincare brands run 6+ scene variations per SKU for social, ads, and e-commerce" |
| jewelry                | "You just created your first jewelry shot"      | "Jewelry brands need 8+ angles and lighting setups per piece"                     |
| fragrances             | "You just created your first fragrance visual"  | "Fragrance campaigns need 6+ conceptual directions per bottle"                    |
| food                   | "You just created your first food shot"         | "Food brands typically shoot 6–10 styled scenes per product"                      |
| electronics            | "You just created your first product visual"    | "Tech brands need 5+ lifestyle and detail shots per device"                       |
| home                   | "You just created your first home visual"       | "Home brands showcase products in 4–8 styled room settings"                       |
| accessories            | "You just created your first accessories shot"  | "Accessory brands need 6+ styled and lifestyle shots per piece"                   |
| fallback (any/unknown) | "You just created your first visual direction"  | "Professional brands create full visual sets — not single shots"                  |


**Unlock chips** (category-adaptive):


| Category            | Chips shown                                                 |
| ------------------- | ----------------------------------------------------------- |
| fashion/accessories | More Scenes, More Models, Batch Export, Video               |
| beauty/fragrances   | More Scenes, Close-ups & Detail, Batch Export, Video        |
| jewelry             | More Angles, Detail Shots, Batch Export, Studio Lighting    |
| food/home           | More Scenes, Styled Settings, Batch Export, Seasonal Sets   |
| electronics         | More Angles, Lifestyle Context, Batch Export, Feature Shots |
| fallback            | More Scenes, More Looks, Batch Export, Video                |


**Dismissal**: Sets `sessionStorage.setItem('vovv_l1_dismissed', 'true')` + increments `localStorage` counter `vovv_l1_dismiss_count`. After 3 total dismissals across sessions, Layer 1 never shows again — only Layer 2 on limit hits.

---

### Layer 2: Value Drawer (right-side Sheet)

**UI**: `Sheet` component from shadcn/ui, slides from right, 480px wide on desktop. Results stay visible on left — user doesn't lose context.

**Triggers** (any of these):

1. User clicks "See what you can unlock" from Layer 1
2. User hits free scene limit (currently shows `toast.info` — replace with drawer)
3. User hits free model limit
4. User tries to set image count > 1
5. User clicks a premium-only workflow card (Catalog Studio, Creative Drops)

**Content sections in order**:

```
┌──────────────────────────────────┐
│ What you created                 │
│ ┌────┐                          │
│ │ 📷 │ 1 fashion direction      │
│ └────┘ White crop top × Studio  │
│                                  │
│ ─────────────────────────────── │
│                                  │
│ What brands like yours create    │
│                                  │
│ ☐ 8–12 campaign directions      │
│ ☐ Multiple models per product   │
│ ☐ Full scene coverage           │
│ ☐ Batch export for social       │
│ ☐ Video content from same shots │
│                                  │
│ ─────────────────────────────── │
│                                  │
│ Unlock with Starter              │
│                                  │
│ ┌─────────────────────────────┐ │
│ │ Starter $39/mo              │ │
│ │ 500 credits · ≈100 images   │ │
│ │ Multi-scene · Multi-model   │ │
│ │ Batch export · Video        │ │
│ │ [Start with Starter]        │ │
│ └─────────────────────────────┘ │
│                                  │
│ ┌─────────────────────────────┐ │
│ │ Growth $79/mo   POPULAR     │ │
│ │ 1,500 credits · ≈300 imgs  │ │
│ │ Everything in Starter +     │ │
│ │ Brand Models · Priority     │ │
│ │ [Get Growth]                │ │
│ └─────────────────────────────┘ │
│                                  │
│ [Compare all plans →]           │
└──────────────────────────────────┘
```

**Section 1 — "What you created"**: Shows the actual product thumbnail from the generation + scene/model used. Uses data already available in the results step (`selectedProduct`, `selectedPoseMap`, `selectedModelMap`).

**Section 2 — "What brands like yours create"**: Category-specific outcome list. NOT feature list. Phrased as outcomes, not capabilities:


| Category | Outcomes                                                                                                                                                                       |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| fashion  | "8–12 campaign directions", "Multiple models for diversity", "Full scene coverage — studio to street", "Batch export for social & ads", "Video lookbook from same product"     |
| beauty   | "6+ scene variations per SKU", "Close-up and texture details", "Lifestyle and studio coverage", "Batch-ready for all channels", "Video content for social"                     |
| jewelry  | "8+ angles and lighting setups", "Macro detail and texture shots", "Editorial and e-commerce coverage", "Batch export for marketplace listings", "360° product video"          |
| fallback | "Full visual set across scenes and models", "Multiple directions per product", "Campaign-ready batch exports", "Video content from existing shots", "Consistent brand visuals" |


**Section 3 — Plans**: Show only Starter and Growth (2 cards). Not all 5 plans — too much choice. Link to `/app/settings` for full comparison.

**CTAs**:

- Primary: "Start with Starter" → calls `startCheckout(stripePriceIdMonthly, 'subscription')`
- Secondary: "Get Growth" → same with Growth price
- Tertiary: "Compare all plans →" → navigates to `/app/settings`

---

### Layer 3: Enhanced No-Credits Modal

**Trigger**: Existing — credits = 0 and user tries to generate. Keep `NoCreditsModal.tsx`.

**Enhancements**:

- Add category-aware header: "Your [fashion] visuals are just getting started" instead of generic "You're out of credits"
- Add context line: "You've created [N] images so far. Brands at your stage typically need 50–100+ per month."
- Keep existing credit pack grid
- Add plan upgrade section (already exists)

---

## Trigger Ranking


| Rank          | Trigger                                    | Layer   | Why                                                |
| ------------- | ------------------------------------------ | ------- | -------------------------------------------------- |
| 1 (Primary)   | First successful generation visible for 3s | Layer 1 | Highest emotional value — user just felt success   |
| 2 (Secondary) | User hits free scene/model limit           | Layer 2 | Natural friction point — user wants more but can't |
| 3 (Secondary) | User clicks premium workflow               | Layer 2 | Shows intent for advanced features                 |
| 4 (Hard gate) | Credits = 0                                | Layer 3 | Only blocking moment — can't generate at all       |
| ✕ Avoid       | During generation loading                  | Never   | User is anxious, worst timing                      |
| ✕ Avoid       | On page navigation                         | Never   | Feels like a trap                                  |
| ✕ Avoid       | Immediately on result render (0s)          | Never   | Kills the wow moment                               |


---

## Frequency & Suppression Rules

```typescript
// useConversionState.ts logic
const RULES = {
  layer1_max_shows_per_session: 1,
  layer1_max_lifetime_dismissals: 3,  // after 3 = never again
  layer2_max_per_session: 2,          // can re-trigger on different limit hits
  layer2_cooldown_after_dismiss: 300, // 5 min before re-eligible
  never_show_if_paid: true,
  never_show_during_generation: true,
};
```

**Storage**:

- `sessionStorage`: `vovv_l1_shown`, `vovv_l2_count`, `vovv_l2_last_dismissed_at`
- `localStorage`: `vovv_l1_dismiss_count` (persists across sessions)

---

## What NOT to Show Early


| Don't show                           | Why                                                 |
| ------------------------------------ | --------------------------------------------------- |
| Pricing numbers in Layer 1           | Triggers price-comparison mode before value is felt |
| Credit math ("10 credits = 1 image") | Too transactional for wow moment                    |
| "You're running low" in Layer 1      | Negative framing kills momentum                     |
| Feature comparison tables            | Too much info, decision fatigue                     |
| Annual pricing toggle                | Too many choices in a drawer                        |
| Enterprise/sales CTA                 | Wrong audience for first conversion                 |


---

## A/B Test Recommendations

1. **Layer 1 format**: Inline card vs floating bottom bar — measures CTR to Layer 2
2. **Category-specific vs generic copy**: Does "Your jewelry needs 8+ angles" beat "Unlock your full visual set"?
3. **Layer 1 timing**: 3s delay vs 5s delay — measures dismiss rate
4. **Layer 2 trigger**: "See what you can unlock" click vs auto-show after 2nd generation
5. **Plan visibility**: 2 plans in drawer vs "See plans" link only

---

## Implementation Plan

### New files to create

1. `**src/hooks/useConversionState.ts**` — Hook managing all conversion state: `shouldShowLayer1`, `shouldShowLayer2`, `dismissLayer1()`, `dismissLayer2()`, `openUpgradeDrawer(reason)`, reads `plan` from `useCredits()`, reads `product_categories` from profile
2. `**src/components/app/PostGenerationUpgradeCard.tsx**` — Layer 1 inline card component. Props: `category`, `onSeeMore`, `onDismiss`. Contains category-aware text maps and unlock chips.
3. `**src/components/app/UpgradeValueDrawer.tsx**` — Layer 2 Sheet component. Props: `category`, `generationContext` (product thumbnail, scene, model), `open`, `onClose`. Contains outcome lists, plan cards, CTAs using `startCheckout`.
4. `**src/lib/conversionCopy.ts**` — All category-specific copy maps extracted into one file: headlines, outcome lists, unlock chip labels. Single source of truth for all conversion text.

### Files to modify

5. `**src/pages/Generate.tsx**` — Insert `PostGenerationUpgradeCard` in results step (~line 4390). Replace free-limit `toast.info` calls with `openUpgradeDrawer('scene_limit')`. Add `UpgradeValueDrawer` to JSX.
6. `**src/pages/Freestyle.tsx**` — Same pattern: insert Layer 1 after freestyle results, wire Layer 2 drawer.
7. `**src/pages/TextToProduct.tsx**` — Insert Layer 1 in results step.
8. `**src/components/app/generate/WorkflowSettingsPanel.tsx**` — Replace `toast.error("Free plan allows 1 scene...")` (line 377) with drawer trigger callback passed via props.
9. `**src/components/app/generate/TryOnSettingsPanel.tsx**` — Same: replace free-limit restrictions with drawer trigger.
10. `**src/components/app/NoCreditsModal.tsx**` — Add category-aware header, generation count context line.

### Execution order

Phase 1: `conversionCopy.ts` + `useConversionState.ts` (data layer)
Phase 2: `PostGenerationUpgradeCard.tsx` (Layer 1)
Phase 3: `UpgradeValueDrawer.tsx` (Layer 2)
Phase 4: Wire into `Generate.tsx`, `Freestyle.tsx`, `TextToProduct.tsx`
Phase 5: Replace toast-based limit messages with drawer triggers
Phase 6: Enhance `NoCreditsModal.tsx` (Layer 3)