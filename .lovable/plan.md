## Goal
Make the product category detector route sport-specific apparel (tennis skirts/dresses, padel, golf, yoga, pilates, running, cycling, ski, etc.) to **activewear** instead of falling into `dresses`, `garments`, or `shoes`.

## Where the bug lives
`supabase/functions/analyze-product-category/index.ts`

Three problems chain together:

1. **`TITLE_CATEGORY_PATTERNS`** — the activewear regex only matches:
   `activewear|sportswear|yoga|gym wear|athletic|workout|legging|sports bra`
   It misses tennis, padel, golf, pilates, running, cycling, ski, training, jersey, rash guard, performance/compression wear, etc.

2. **Order of patterns** — `dresses` (`/\bdress\b|gown|...`) is listed *before* `activewear`. So "Tennis Dress" matches `dresses` first and never reaches the activewear branch.

3. **`GARMENTS_REFINEMENT_PATTERNS`** — only kicks in when the AI returns `garments`. A "Tennis Skirt" classified as `garments` would refine, but "Tennis Dress" classified as `dresses` (or `dress` matched directly) is never re-evaluated. Same for `shorts` → could be golf/tennis shorts.

## Plan

### Step 1 — Expand the activewear keyword vocabulary
Update the activewear regex (used in `TITLE_CATEGORY_PATTERNS` and `GARMENTS_REFINEMENT_PATTERNS`) to include sport contexts:

```
activewear|sportswear|athleisure|athletic|gym wear|workout|training|performance|compression|
legging|sports bra|rash guard|jersey|track suit|tracksuit|
\byoga\b|pilates|\brunning\b|jogger|marathon|
tennis|padel|pickleball|squash|badminton|
\bgolf\b|
cycling|bike (?:short|jersey)|cyclist|
ski(?:ing)?|snowboard|base layer|thermal|
hiking pant|trail (?:short|pant)
```

### Step 2 — Add a high-priority "sport intent" override
Before the existing `TITLE_CATEGORY_PATTERNS` loop runs, and before `SPECIFICITY_OVERRIDES`, add a new check: if the title/description matches a **sport keyword + apparel noun** (skirt, dress, shorts, top, polo, pants, leggings, jacket, jersey, set, kit), force `activewear` — regardless of what the AI returned.

New helper:
```ts
const SPORT_INTENT_RE =
  /(tennis|padel|pickleball|squash|badminton|golf|yoga|pilates|running|cycling|ski|snowboard|crossfit|gym|workout|training|athletic|performance|compression)\b.*\b(skirt|dress|short|shorts|top|polo|pant|pants|legging|leggings|jacket|jersey|set|kit|tee|tank|bra|hoodie|zip)\b/i;
```

Called as the very first step inside `applyCategoryFallback` (and also called for `garments` / `dresses` / `shoes` / `tops` regardless of AI confidence).

### Step 3 — Demote `dresses` and `garments` when sport intent is present
Extend `refineGenericGarments` into a more general `refineSportApparel` that runs for `dresses`, `garments`, **and** when category is `shoes` (e.g. "tennis shoe" stays as sneakers, but "tennis dress" → activewear).

Specifically:
- If `analysis.category === 'dresses'` AND title matches sport intent → set to `activewear`.
- If `analysis.category === 'garments'` AND title matches sport intent → set to `activewear` (existing logic, just expanded vocab).

### Step 4 — Strengthen the system prompt
Append to the AI system prompt a short "ACTIVEWEAR GUIDANCE" block:

> ACTIVEWEAR GUIDANCE: Any garment marketed for sport — tennis, padel, pickleball, golf, yoga, pilates, running, cycling, ski, gym, training, performance/compression — must be categorised as `activewear`, even if the silhouette is a dress, skirt, shorts, or polo. Only use `dresses`/`garments` when there is no sport context.

This reduces reliance on regex fallback.

### Step 5 — Verify
- No DB or UI changes required; the recommended-category badge in *Create Product Visuals → scenes* reads from the same field this function writes (`detectedCategory`).
- Manually re-trigger product analysis on a tennis skirt / padel polo / yoga set in dev and confirm `activewear` is recommended.

## Out of scope
- No changes to `scene_categories`, scene library, or UI components.
- No DB migration.
- "Tennis bracelet" is already correctly disambiguated by the existing jewellery rule (it runs first); we keep that order.
