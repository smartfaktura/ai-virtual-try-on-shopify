

## Goals
1. **Simplify all 11 Learn guides** — strip complexity, lead with "what / who / how" in plain language
2. **Fix Product Images examples** — show only aesthetic-color scenes (more visual, more on-brand)
3. **Add real screenshots of wizard steps** to the Product Images guide

---

## 1. Simplify guide content (`src/data/learnContent.ts`)

Each guide currently has long `bestFor`, `whatYouNeed`, `whatYouGetBack`, multi-line `tips`, `vsAlternatives`, and dense `quickStart`. Too much.

New shape per guide (content-only edit, no schema change):
- **`tagline`** → 1 short sentence, plain language: *"What it is + who it's for"*
- **`bestFor`** → keep max 3, each ≤ 8 words
- **`whatYouNeed`** → keep max 2, each ≤ 8 words
- **`tips`** → keep max 2 do + 2 avoid, each ≤ 12 words
- **`vsAlternatives`** → keep max 2 rows, each ≤ 14 words
- **`quickStart`** → trim each step to a single sentence

Tone rule: write like talking to a busy founder, not a manual. No jargon ("creative direction", "brand consistency engine"). Use verbs ("Pick", "Upload", "Generate").

Applies to all 11 guides:
`product-images`, `catalog-studio`, `try-shot`, `freestyle-studio`, `text-to-product`, `picture-perspectives`, `brand-models`, `short-film`, `library`, `discover`, `creative-drops`.

---

## 2. Aesthetic-color scenes only on Product Images guide

Replace the 4 hardcoded `EXAMPLE_SCENES` in `ProductVisualsGuide.tsx` with 4 scenes that use the `{{aestheticColor}}` system (per memory: scenes resolved from aesthetic color tokens — usually under "Aesthetic Color Editorial" / studio aesthetic templates).

I'll query `product_image_scenes` for scenes whose `prompt_template` contains `{{aestheticColor}}` and pick 4 visually distinct ones with strong color presence (one warm, one cool, one neutral-soft, one bold). Update the section heading to:

> **Aesthetic-color scenes — pick a mood, we color-match it**

This makes the gallery row pop visually and reinforces a real differentiator.

---

## 3. Add wizard step screenshots to Product Images guide

The 4 step cards (`Product → Shots → Setup → Generate`) currently use placeholder ASCII-style visuals. I'll capture **4 real screenshots** from the live wizard at `/app/generate/product-images` and embed them inside each step card.

### How
- Use the **product-shot skill** is overkill — we want raw UI captures, not framed marketing shots.
- Instead: take 4 plain screenshots via the browser tool of the running preview app, walking through each wizard step.
- Save them to `/mnt/documents/learn/` then upload to Supabase Storage `landing-assets/learn/product-images/step-01.jpg` … `step-04.jpg` (quality-only optimization, no width param per memory).
- Reference via `getLandingAssetUrl()` in `ProductVisualsGuide.tsx`.

Each step card becomes:
```
[ 01 ]  Product                    [ thumbnail screenshot ]
        Add a product or pick one.
        VOVV reads materials, color, category.
```
Screenshot sits in the same right-side slot the current `<StepVisual>` uses. Aspect 16:10, ~140px wide, rounded border matching card, soft shadow. On mobile: stacks below the text with full-width.

### Capture plan
1. Step 01 — Products grid with one product selected (Step 1 of wizard)
2. Step 02 — Shots grid with category tabs visible (Step 2)
3. Step 03 — Setup panel showing model + background color + advanced controls (Step 3)
4. Step 04 — Review/Generate screen with batch summary (Step 4)

I'll need to navigate the live preview, set up minimal state per step, and capture each. If wizard state is hard to reach without real account data, I'll fall back to capturing whatever the empty/example state shows — the goal is *recognition*, not perfect data.

---

## 4. Files touched

| File | Change |
|---|---|
| `src/data/learnContent.ts` | Rewrite all 11 guides with simpler, shorter copy |
| `src/components/app/learn/ProductVisualsGuide.tsx` | Swap to 4 aesthetic-color scenes; replace `<StepVisual>` with `<img>` of step screenshot |
| `supabase storage: landing-assets/learn/product-images/` | Upload 4 screenshots (`step-01.jpg` … `step-04.jpg`) |

No schema changes. No new dependencies. No changes to other guide components — they auto-pick up the simplified `learnContent.ts`.

---

## 5. Acceptance

- All 11 guide pages read like a friendly explainer, not a spec sheet
- Product Images guide examples row shows only color-aesthetic scenes
- Each of the 4 step cards has a real wizard screenshot inline
- Mobile: screenshots stack cleanly under text
- No layout regressions on hub or other guide pages
- No console errors, no broken images

