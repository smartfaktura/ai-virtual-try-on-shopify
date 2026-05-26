## Brand Models upsell modal: match Brand Scenes design

Restyle `BrandModelsInfoModal.tsx` to mirror the upgraded `BrandScenesInfoModal` so both upsell modals feel like one design system. Replace the sparkles icon with 3 fixed model preview thumbnails, tighten copy, and reuse the same numbered feature list and CTA pattern.

### File: `src/components/app/product-images/BrandModelsInfoModal.tsx`

**Layout swap** — match Brand Scenes modal exactly:
- Container: `max-w-md sm:max-w-lg w-[calc(100%-2rem)] p-6 sm:p-8 rounded-3xl`
- Remove `DialogHeader` + `Sparkles` icon block.

**Mini thumbnails** (replaces the icon) — 3 fan-stacked model previews using the same pattern as Brand Scenes:
```ts
const BRAND_MODEL_THUMBNAILS = [
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/render/image/public/scratch-uploads/models/model_011-1776096967441.png?width=360&height=480&quality=72&resize=cover',
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/render/image/public/scratch-uploads/models/model_016-1776096975176.png?width=360&height=480&quality=72&resize=cover',
  'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/render/image/public/scratch-uploads/models/model_063-1776097161032.png?width=360&height=480&quality=72&resize=cover',
];
```
Rendered the same way: `w-12 h-14 rounded-xl overflow-hidden ring-2 ring-background bg-muted shadow-sm`, overlap `-ml-3`, `rotate((i-1)*5deg)`, `zIndex: 3 - i`, with `ShimmerImage`.

**Copy refresh** (parallel to Brand Scenes, action-led, no terminal periods on the title/eyebrow/single-sentence subtitle):
- Eyebrow: `BRAND MODELS`
- Title: **"Your brand's own model lineup"**
- Subtitle: **"Custom AI models. Reused across every visual you create."**
- Feature list (numbered, same `01 / 02 / 03` styling as Brand Scenes):
  - 01 — Lock in your brand's signature face
  - 02 — Any ethnicity, age, gender, or body type
  - 03 — Reuse them across every campaign

**Actions** — same shape as Brand Scenes:
- Primary: `Create Brand Model` (eligible) / `Unlock Brand Models` (gated), rounded-full pill, ArrowRight with hover translate.
- Secondary: ghost `Not now`.
- Footer hint (gated only): `Included on Growth and above`.

### Out of scope
- No changes to gating logic, navigation, or `useCredits` plumbing.
- No changes to where the modal is opened from.
