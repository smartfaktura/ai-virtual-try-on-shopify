# Redesign Layer 2 — Value Drawer

## Summary

Rebuild the `UpgradeValueDrawer` from a generic pricing panel into a 4-section B2B upgrade decision surface with category-aware content, price-per-credit economics, and smart plan recommendations.

## Files to Change


| File                                        | Change                                                                                                                                                                                                      |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/conversionCopy.ts`                 | Replace `outcomes: string[]` with `unlockItems: { label: string }[]` per category (6 items each). Add `getLayer2Headline(category)` and `getLayer2Subline(category)`. Add B2B value metrics as static data. |
| `src/components/app/UpgradeValueDrawer.tsx` | Full redesign — 4 sections, price-per-credit display, recommended plan badge, avatar integration                                                                                                            |
| `src/pages/AdminConversion.tsx`             | Update L2 outcomes reference table to show new unlock items                                                                                                                                                 |


## New Drawer Layout (4 sections)

```text
┌─────────────────────────────────────────────┐
│ [avatar] Scale your fashion visual library  │
│          You started with 1 direction —     │
│          brands create 8–12 per product     │
│                                             │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│                                             │
│ What you can create next                    │
│ ┌─────┐ ┌─────┐ ┌─────┐                    │
│ │Studi│ │On-  │ │Life-│                     │
│ │  o  │ │Model│ │style│                     │
│ └─────┘ └─────┘ └─────┘                    │
│ ┌─────┐ ┌─────┐ ┌─────┐                    │
│ │Campa│ │Detai│ │Video│                     │
│ │ ign │ │  l  │ │     │                     │
│ └─────┘ └─────┘ └─────┘                    │
│                                             │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│                                             │
│ Why brands upgrade                          │
│ ∞ 500–4,500 monthly credits                │
│ ↗ Up to 48% lower cost per visual          │
│ ⚡ Priority processing on Growth+           │
│ 🎯 Brand Models on Growth+                  │
│                                             │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│                                             │
│ Choose your plan                            │
│                                             │
│ Starter   500cr   $39/mo   7.8¢/cr  [Get] │
│                                             │
│ Growth ★  1,500   $79/mo   5.3¢/cr  [Get] │
│ RECOMMENDED · Best value per visual         │
│                                             │
│ Pro       4,500   $179/mo  4.0¢/cr  [Get] │
│ Brand Models · Unlimited products           │
│                                             │
│           Compare all plans →               │
└─────────────────────────────────────────────┘
```

## Section 1: Category-Aware Header

Dynamic headline + subline from `getLayer2Headline(category)` / `getLayer2Subline(category)`.


| Category    | Headline                               | Subline                                              |
| ----------- | -------------------------------------- | ---------------------------------------------------- |
| fashion     | Scale your fashion visual library      | From 1 direction to a full campaign-ready collection |
| beauty      | Build your complete beauty content set | Studio to lifestyle — cover every channel            |
| jewelry     | Complete your jewelry visual catalog   | Every angle, detail, and setting your listings need  |
| electronics | Build your full product visual library | Feature shots to lifestyle — cover every listing     |
| fallback    | Scale your visual production           | Create the complete set your brand needs             |


Include the VOVV avatar (reuse `getLayer1Avatar`) + optional product thumbnail context row.

## Section 2: Category-Aware Unlock Items

Replace the 5-bullet `outcomes` list with a 6-item chip grid (3×2) — compact, scannable labels showing content types the brand can create.


| Category    | Items                                                        |
| ----------- | ------------------------------------------------------------ |
| fashion     | Studio, On-Model, Lifestyle, Campaign, Detail, Video         |
| beauty      | Studio, Close-up, Lifestyle, Flat Lay, Campaign, Video       |
| jewelry     | Macro, Editorial, Lifestyle, Gifting, PDP, Video             |
| fragrances  | Studio, Editorial, Lifestyle, Campaign, Detail, Video        |
| food        | Packshot, Styled Scene, Close-up, Social, Menu/Ad, Video     |
| electronics | Desk Setup, Close-up, Feature, PDP, Launch, Video            |
| home        | Room Scene, Styled Surface, Catalog, Campaign, Social, Video |
| accessories | Studio, Worn, Lifestyle, Close-up, PDP, Video                |
| fallback    | Studio, Lifestyle, Social, Campaign, Product Page, Video     |


UI: small rounded chips with subtle bg (`bg-muted/40`), no icons — just labels. Grid layout `grid-cols-3 gap-2`.

## Section 3: Why Brands Upgrade

4 compact rows with icon + metric + explanation. Static content (not category-dependent):

- **Layers icon** — "500–4,500 monthly credits" / "Keep creating without stopping"
- **TrendingUp icon** — "Up to 48% lower cost per visual" / "Bigger plans = better value"
- **Zap icon** — "Priority processing" / "Faster generation on Growth+"
- **Target icon** — "Brand Models & scale" / "Custom models and unlimited products on Pro"

Design: icon + bold metric on one line, muted explanation below. No borders, just clean rows with `gap-3`.

## Section 4: Plan Comparison

Three plan cards, vertically stacked, each showing:

- Plan name + credits + price + **price per credit** (prominent)
- One-line positioning statement
- CTA button


| Plan    | Credits | Price   | ¢/credit | Positioning                       | CTA                                       |
| ------- | ------- | ------- | -------- | --------------------------------- | ----------------------------------------- |
| Starter | 500     | $39/mo  | 7.8¢     | Start scaling beyond free         | outline button                            |
| Growth  | 1,500   | $79/mo  | 5.3¢     | Best value for active brands      | solid primary button, "RECOMMENDED" badge |
| Pro     | 4,500   | $179/mo | 4.0¢     | Brand Models · Unlimited products | outline button                            |


Growth card gets `border-2 border-primary/40` + top badge. Others get standard `border-border/60`.

Price-per-credit shown as a prominent pill/badge on each card (e.g., `5.3¢/img`).

Secondary: "Compare all plans →" link at bottom.

## Data Changes in conversionCopy.ts

```typescript
// New Layer2Copy structure
interface Layer2Copy {
  headline: string;
  subline: string;
  unlockItems: string[];  // 6 items per category
}

// New exports
export function getLayer2Headline(cat): string;
export function getLayer2Subline(cat): string;
// getLayer2Copy returns full object
```

The old `outcomes: string[]` is replaced by `unlockItems` + `headline` + `subline`.

## Admin Preview Update

Update the "Layer 2 Outcomes" reference table to show the new unlock items per category, and add a column for the L2 headline.

## Design Details

- Drawer width stays `sm:!max-w-[480px]`
- Avatar in header: 28px, same mapping as Layer 1
- Sections separated by `Separator` components
- Typography: Inter 400–500 for body, 600 for section titles only
- Chips: `text-xs bg-muted/40 px-2.5 py-1 rounded-lg` — no borders
- Value rows: no cards/borders, just clean icon+text rows
- Plan cards: rounded-xl, clear hierarchy via border weight
- Price-per-credit badge: `bg-primary/10 text-primary text-[11px] font-medium px-2 py-0.5 rounded-full`
- On mobile: chips stay 3-col, plan cards full-width stack