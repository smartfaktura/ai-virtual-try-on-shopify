## 1. Add a "Models" section to `/home`

**Recommended placement:** between `HomeTransformStrip` ("Built for every category") and `HomeCreateCards` ("What do you want to create first?").

Rationale for the order:
- `HomeTransformStrip` proves the visual range of the engine across product categories.
- A models section right after answers the natural next question — *"who can wear/hold my product?"* — before pivoting to the broader "what you can create" cards.
- It also breaks up two card-grid sections (category grid + create cards) with a horizontally-scrolling marquee, giving the page rhythm.

**Implementation:** Create a thin Home wrapper `src/components/home/HomeModels.tsx` that re-uses the existing `ModelShowcaseSection` marquee internals but with Home-tuned copy and the cohesive `#FAFAF8` background (same as the rest of `/home`).

Copy adjustments to better match the Home page tone (Home is more benefit-led and conversational than the marketing landing page):

- Eyebrow: `Models · 40+ looks` (small uppercase, matches the eyebrow pattern used by `HomeTransformStrip` — "One photo · Every shot")
- Title: `Every face. Every look. Every campaign.` (parallels the punchy, period-separated style of "Built for every category.")
- Subtitle: `Pick from 40+ ready-to-shoot AI models — or create your own brand model in minutes.`

Two implementation options:

- **Option A (simpler, recommended):** Extract the marquee body of `ModelShowcaseSection` into a small internal `ModelsMarquee` component and have both `ModelShowcaseSection` (landing) and a new `HomeModels` wrapper render it with their own headings. Avoids duplicating the marquee/CTA logic.
- **Option B (fastest, low-risk):** Just import `ModelShowcaseSection` directly into `Home.tsx`. Drawback: the heading copy will read "Professional models. Every look." which is fine but less aligned with Home's voice.

I'll go with **Option A** so Home gets its own copy without code duplication.

Then in `src/pages/Home.tsx`, insert `<HomeModels />` between `<HomeTransformStrip />` and `<HomeCreateCards />`.

## 2. Add 1 image to Footwear in "Built for every category"

In `src/components/home/HomeTransformStrip.tsx` → `FOOTWEAR_CARDS`, append one entry so the row goes from 9 → 10 visible cards (the desktop grid is 6 cols, last row has 4 = 10 total ✓; mobile shows first 9, so the 10th will be desktop-only just like the other categories).

New entry, inserted just before `Sculpt Balance Edge` (which is currently the last card):

```ts
{ label: 'Studio Hero',  src: 'https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/render/image/public/product-uploads/fe45fd27-2b2d-48ac-b1fe-f6ab8fffcbfc/scene-previews/1776770347820-s3qwmr.jpg?quality=75' },
```

Final Footwear count: 11 cards. Wait — current count is 11 already (Original + 10 others), and you said only 9 are visible. Let me re-check during implementation: the current array length is 11; mobile shows 9 (`hideOnMobile` when `i >= 9`), desktop shows all. If your screenshot only shows 9 on desktop, the cause is likely the grid layout; adding one more image brings the total to 12 (= 6×2 full rows on desktop, exactly matching Bags). I'll verify the count at edit time and end up with **12 cards total** for Footwear so it visually matches Bags' full 6×2 grid.

## Files touched

- `src/components/home/HomeModels.tsx` (new)
- `src/components/landing/ModelShowcaseSection.tsx` (extract marquee into a shared sub-component, no visual change to landing page)
- `src/pages/Home.tsx` (insert `<HomeModels />`)
- `src/components/home/HomeTransformStrip.tsx` (add 1 footwear image)