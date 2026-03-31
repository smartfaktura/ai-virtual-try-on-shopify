

# Fix Catalog Poses: Separate Mood Step, Add Poses, Regenerate Expressions

## Changes

### 1. Move Mood/Expression to its own step
Currently mood is a sidebar inside the Poses step — bad UX. Move it to a new **Step 3: Expression** between Poses and Models.

- Update `STEPS` array: Products → Poses → Expression → Models → Backgrounds → Style Shots → Review (7 steps)
- Add new icon (e.g. `Smile`) for Expression step
- Create `CatalogStepExpression.tsx` — clean grid of mood cards (3 columns), bigger cards, proper labels
- Remove mood props from `CatalogStepPoses` — it becomes poses-only (full width grid)
- Wire `selectedMood` / `onMoodChange` to the new Expression step
- Adjust all step numbers in `CatalogGenerate.tsx` (Models becomes 4, Backgrounds 5, etc.)

### 2. Add more poses to reach 5-5-5

Currently: 5 Front, 4 Angled, 2 Detail = 11 total. Need 5-5-5 = 15.

**Angled — add 1 more:**
- "Leaning" (model leaning against invisible wall, angled)

**Detail — add 3 more:**
- "Fabric Detail" (close-up of fabric/texture on garment)
- "Accessory Detail" (hands/wrist detail shot)
- "Back Detail" (back neckline/collar detail)

Generate 4 new pose preview images via AI.

### 3. Regenerate all 5 mood expression images

Current ones look unnatural/inconsistent. Regenerate with better prompts emphasizing:
- Same model consistency (young woman, natural makeup, hair pulled back)
- Ultra-realistic photography, not AI-looking
- Clean white background, shoulders-up framing
- Each expression clearly distinct and natural

Generate 5 new mood images (joyful, radiant, neutral, unapologetic, confident).

### 4. Clean up Poses step UI (now full-width)

With mood removed, the poses grid gets full width. Use 5-column grid consistently for all categories. Remove the right sidebar. Cleaner header.

## Files to modify/create

| Action | File |
|--------|------|
| Generate | 4 new pose images + 5 new mood images via AI script |
| Create | `src/components/app/catalog/CatalogStepExpression.tsx` |
| Update | `src/components/app/catalog/CatalogStepPoses.tsx` — remove mood, full-width |
| Update | `src/data/catalogPoses.ts` — add 4 new poses, update mood image imports |
| Update | `src/pages/CatalogGenerate.tsx` — 7 steps, new Expression step, renumber |

## Image generation

9 images total using `google/gemini-3.1-flash-image-preview`:

**Poses (4):**
- `pose_leaning.png` — "Professional e-commerce photo, female supermodel in white t-shirt and blue jeans, leaning casually against invisible wall at an angle, bright white studio, natural shadows, 85mm lens, full body"
- `pose_fabric_detail.png` — "Professional macro close-up of white cotton t-shirt fabric texture on a model, bright white studio, detail fashion photography"
- `pose_accessory_detail.png` — "Professional close-up of model's hands and wrists wearing a white t-shirt, bright white studio background, fashion detail photography"
- `pose_back_detail.png` — "Professional close-up of back neckline and collar of white t-shirt on female model, bright white studio, fashion detail photography"

**Moods (5) — regenerate all with consistent look:**
- Each: "Ultra-realistic professional headshot portrait photograph of a beautiful 25-year-old female model with natural makeup and hair pulled back, [EXPRESSION], clean white background, shoulders visible, soft studio lighting, shot on Canon R5 85mm f/1.4, no retouching artifacts"
- Expressions: genuinely happy warm smile / glowing radiant soft smile / calm composed neutral face / intense fierce determined look / confident self-assured subtle smile

