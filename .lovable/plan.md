# Brand Scenes — MVP (logic only, no generation yet)

Goal of this MVP: stand up the full data + logic pipeline for Brand Scenes so a user can pick a category, answer only the relevant questions, save structured JSON, and get a clean professional prompt out. No image generation is wired in this MVP — we stop at "prompt produced + saved".

---

## What ships in this MVP

1. A typed option library (every UI option carries `label`, `value`, `promptFragment`, `appliesTo`, `conflictsWith`, `questionsToShow`, `questionsToHide`).
2. Category Scene Modules (one per family, declares which questions appear for which subject mode).
3. A Wizard UI on `/app/brand-scenes/new` that walks the user through: Category → Subcategory → Subject Mode → Relevant Questions → Review.
4. A Validator that strips irrelevant fields, resolves conflicts, and merges category-specific avoid rules.
5. A Prompt Compiler that turns the validated JSON into one coherent natural-language prompt in the exact 11-step order.
6. A `brand_scenes` table that stores the answers, the validated JSON, the compiled prompt, and the aspect ratio (sent separately on future generation calls).
7. A list page `/app/brand-scenes` showing the user's saved scenes with the compiled prompt visible (copy button).

Out of scope for this MVP: image generation, scene previews, sharing, editing after save, admin moderation.

---

## File / module structure

```text
src/lib/brandScenes/
  types.ts                  // Option, Question, Module, SceneAnswers, CompiledScene
  options/                  // shared option pools
    lighting.ts
    colors.ts
    photoLook.ts
    camera.ts
    surfaces.ts
    props.ts
  modules/                  // one file per family
    fashion.ts
    footwear.ts
    bags.ts
    jewelry.ts
    eyewear.ts
    beauty.ts
    fragrance.ts
    home.ts
    foodDrink.ts
    pets.ts
    tech.ts
    kids.ts
    sportsOutdoor.ts
    carsMoto.ts
    other.ts
  registry.ts               // family -> module map, subcategory lookup
  validator.ts              // strip irrelevant, resolve conflicts, inject avoid rules
  promptCompiler.ts         // 11-step natural-language assembler
  aspectRatio.ts            // maps "Portrait 4:5" -> { apiValue: "4:5", promptHint?: "" }

src/pages/
  BrandScenesNew.tsx        // wizard
  BrandScenesList.tsx       // saved list

src/components/brandScenes/
  WizardShell.tsx
  StepCategory.tsx
  StepSubjectMode.tsx
  StepQuestions.tsx         // renders only the visible questions for the current module
  StepReview.tsx
  OptionGrid.tsx            // shared visual picker
  PromptPreview.tsx
```

---

## Core types

```ts
type Family = 'fashion' | 'footwear' | 'bags' | 'jewelry' | 'eyewear'
  | 'beauty' | 'fragrance' | 'home' | 'food_drink' | 'pets'
  | 'tech' | 'kids' | 'sports_outdoor' | 'cars_moto' | 'other';

type SubjectMode =
  | 'product_only'
  | 'product_on_surface'
  | 'product_in_environment'
  | 'with_person_full'
  | 'with_person_hands'
  | 'with_person_faceless'
  | 'flat_lay';

interface Option {
  label: string;                 // plain user-facing text, no jargon
  value: string;                 // stable internal id
  promptFragment: string;        // natural photographic sentence, not a label
  appliesTo?: Family[];          // omit = all families
  conflictsWith?: string[];      // other option values that cannot coexist
  questionsToShow?: string[];    // question ids to reveal when this option is picked
  questionsToHide?: string[];    // question ids to hide when this option is picked
}

interface Question {
  id: string;                    // e.g. "lighting", "surface", "pose"
  label: string;                 // plain user-facing question
  type: 'single' | 'multi' | 'text';
  required?: boolean;
  options?: Option[];            // omit for text type
  showWhen?: (a: SceneAnswers) => boolean; // module-level guard
}

interface SceneModule {
  family: Family;
  subcategories: { value: string; label: string }[];
  subjectModes: Option[];        // options for the Subject Mode step
  questionsBySubjectMode: Record<SubjectMode, Question[]>;
  avoidRules: string[];          // category-specific negative prompt sentences
  defaultAspectRatio?: string;   // e.g. "4:5"
}

interface SceneAnswers {
  family: Family;
  subcategory: string;
  subjectMode: SubjectMode;
  answers: Record<string, string | string[]>; // questionId -> value(s)
  aspectRatio: string;           // sent via API config, not the prompt
  name: string;
}

interface CompiledScene {
  prompt: string;                // final natural-language paragraph
  aspectRatio: string;           // for API config
  validatedAnswers: SceneAnswers;
  removedFields: string[];       // for debugging
  resolvedConflicts: string[];   // for debugging
}
```

---

## Validator (`validator.ts`)

Pure function `validate(answers, module): { answers, removedFields, resolvedConflicts }`.

Steps in order:
1. Drop any answer whose question id isn't in `questionsBySubjectMode[subjectMode]`.
2. For multi-select answers, deduplicate values.
3. For every selected option, if it lists `conflictsWith`, remove the lower-priority option (priority = order in the question's options array — earlier wins).
4. For every selected option with `questionsToHide`, drop those questions' answers.
5. For required questions with no value after the above, fill from module default if present, otherwise mark missing (wizard blocks Save).
6. Append the module's `avoidRules` to a reserved `_avoid` bucket used only by the compiler.

The validator never throws — it returns a clean answers object the compiler can trust.

---

## Prompt Compiler (`promptCompiler.ts`)

Pure function `compile(validated, module): string`. Produces ONE paragraph in this fixed order, joined with single spaces and natural punctuation:

1. **Opening command** — always: `Create a realistic commercial photograph of` + one-line subject summary built from family + subcategory + subject mode (e.g. "a single perfume bottle presented as the hero subject").
2. **Category and subject mode summary** — one sentence describing what we're shooting and how the subject relates to the scene.
3. **Scene environment** — `promptFragment` from the environment / setting question.
4. **Subject placement or action** — fragments from pose / placement / interaction questions.
5. **Styling and props** — fragments from props / surface / accessories.
6. **Lighting** — fragment from lighting question.
7. **Colors** — fragment from color palette question.
8. **Photo look** — fragment from photo-look question (e.g. "muted premium tones, soft contrast, smooth shadows, refined commercial finish, no harsh saturation.").
9. **Camera and composition** — fragments from framing / angle / depth-of-field.
10. **Realism / quality direction** — fixed sentence appended for every scene: "Sharp focus on the product, true-to-life textures, accurate proportions, professional commercial photography quality."
11. **Avoid rules** — single trailing sentence: "Avoid: " + joined `_avoid` items + category-specific avoid rules.

Cleanup pass at the end:
- Collapse repeated words/phrases that appear in more than one fragment (case-insensitive).
- Trim duplicate punctuation, ensure each step ends with a period before the next begins.
- Never emit a `key: value` shape; never emit option labels verbatim — only `promptFragment` text.

Result reads like one creative direction written by a photographer, not a checklist.

---

## Example: Fragrance module behaviour

User picks: Fragrance → Eau de Parfum → "Bottle on surface" → answers a few questions → Portrait 4:5.

- Subject Mode "Bottle on surface" carries:
  - `promptFragment`: "place one perfume bottle upright on the selected surface as the clear main subject, with the cap visible and realistic glass reflections."
  - `questionsToShow`: ["surface", "lighting", "colors", "photo_look", "camera", "props_light"]
  - `questionsToHide`: ["pose", "outfit", "person_framing"]
- "Premium matte photo" option for `photo_look` carries:
  - `promptFragment`: "muted premium tones, soft contrast, smooth shadows, refined commercial finish, no harsh saturation."
- Module `avoidRules`: ["text or logos on the bottle that aren't in the reference", "extra bottles", "liquid spills", "human hands unless requested"].
- `aspectRatio` "4:5" goes into `CompiledScene.aspectRatio` and is NOT injected into the prompt text.

Compiled prompt (shape):
> Create a realistic commercial photograph of a single perfume bottle presented as the hero subject. The shot focuses on one eau de parfum bottle staged as a clean product still life. The scene sits on a warm travertine surface in a softly lit studio corner. Place one perfume bottle upright on the selected surface as the clear main subject, with the cap visible and realistic glass reflections. A few small dried botanicals rest beside the bottle for quiet styling. Soft directional daylight from the left creates gentle highlights along the glass. The palette stays in warm sand and cream tones. Muted premium tones, soft contrast, smooth shadows, refined commercial finish, no harsh saturation. Shot at eye level with an 85mm-equivalent lens and a shallow depth of field. Sharp focus on the product, true-to-life textures, accurate proportions, professional commercial photography quality. Avoid: text or logos on the bottle that aren't in the reference, extra bottles, liquid spills, human hands unless requested.

---

## Wizard UX

Step 1 — Category: family grid, then subcategory chips.
Step 2 — Subject Mode: visual cards from `module.subjectModes` (only modes that apply to that subcategory).
Step 3 — Questions: render only the questions returned by `module.questionsBySubjectMode[subjectMode]`, applying `showWhen` and `questionsToHide` reactively as the user clicks options. Plain labels, no fancy naming.
Step 4 — Review: shows chips for every answer + a live `PromptPreview` that re-runs `validate → compile` on every change. Aspect ratio shown as its own field, labelled "Sent to the generator separately".
Save → inserts a row in `brand_scenes` (see schema below) and routes to `/app/brand-scenes`.

---

## Database — `brand_scenes`

Columns (created via migration when this plan is approved):
- `id` uuid pk default gen_random_uuid()
- `user_id` uuid not null (RLS: owner-only read/write/delete)
- `name` text not null
- `family` text not null
- `subcategory` text not null
- `subject_mode` text not null
- `answers` jsonb not null            // raw answers before validation
- `validated_answers` jsonb not null  // after validator
- `compiled_prompt` text not null
- `aspect_ratio` text not null        // e.g. "4:5", consumed by future API config
- `avoid_rules` text[] not null default '{}'
- `created_at`, `updated_at` timestamps with the standard updated_at trigger

RLS: `auth.uid() = user_id` on select/insert/update/delete. No public read.

---

## Acceptance checklist for the MVP

- Picking Fashion → Dresses → "Single model wearing it" hides surface / flat-lay questions and shows pose / outfit fit.
- Picking Fragrance → "Bottle on surface" hides every person/outfit question.
- Selecting two options that conflict keeps only the earlier-listed one and surfaces a small "adjusted" note under the field.
- The live preview never shows raw labels like "photo_look: premium_matte" — only natural sentences.
- Aspect ratio is stored on the row and shown as a separate field on Review, not glued into the prompt text.
- A scene saved today can be reopened tomorrow and the compiled prompt is byte-identical (compiler is pure, no randomness).

---

## What's intentionally NOT in this MVP

- No image generation call. The compiled prompt is only stored and copyable.
- No edit-after-save flow (saves are immutable for now).
- No admin tools, no sharing, no presets library.
- Only the 4 most important families ship with FULL question sets at launch — Fashion, Footwear, Fragrance, Beauty. The other 11 families ship with the Subject Mode step plus a minimal universal question set (environment, lighting, colors, photo look, camera) so the compiler still produces a strong prompt. We expand them in the next iteration.

---

## Compiler v2 — dynamic tokens + photographer-grade prose

The compiler must produce output in the same shape as the activewear example: multi-paragraph, weaves in reference-image tokens, an explicit hex color palette, and rich photographic language — not a single short paragraph.

### Tokens the compiler injects

**Scenes are reusable templates.** A saved scene gets paired with a different product (and optionally a different model) every time it's generated. So the saved prompt MUST always contain the reference tokens — they are not optional and not conditional on what's attached during authoring.

- `[PRODUCT IMAGE]` — **always inserted in every saved scene, no exceptions.** The fidelity paragraph is rendered family-specific (activewear: compression fit, waistband, seams / fragrance: glass, cap, label / footwear: sole, upper, laces / jewelry: stones, setting, metal finish, etc.).
- `[MODEL IMAGE]` — **always inserted whenever the subject mode includes a person** (full / hands / faceless), regardless of whether a model reference exists at authoring time. Carries the identity-preservation block (facial structure, body proportions, skin tone, posture, natural presence) tuned to the family vibe. Omitted only for pure product-only / surface / flat-lay modes.
- `{{productName}}` — left as a literal token in the saved prompt; the existing generator pipeline resolves it at run time.
- `{{brandLogoText}}` — same as existing system, left literal, resolved at run time when packaging is visible.
- `{{subcategoryNoun}}` — resolved at compile time (e.g. "activewear", "perfume bottle", "sneakers"), since it's a property of the scene itself.
- `{{poseSentence}}`, `{{environmentSentence}}`, `{{stylingSentence}}` — resolved at compile time from each option's `prosePromptFragment`.

The validator does NOT swap `[PRODUCT IMAGE]` or `[MODEL IMAGE]` for generic phrasing — they're required tokens in the saved output. The existing reference-attachment system in the product visuals pipeline is what binds them to real files at generation time, exactly like every other prompt in the app.

### Option schema, upgraded

Every option now carries TWO fragment fields:

```ts
interface Option {
  label: string;
  value: string;
  promptFragment: string;          // short one-liner (kept for chips / fallback)
  prosePromptFragment?: string;    // 2-4 sentence photographer-grade version used by compiler v2
  paletteHints?: { name: string; hex: string }[]; // contributes to the color block
  appliesTo?: Family[];
  conflictsWith?: string[];
  questionsToShow?: string[];
  questionsToHide?: string[];
}
```

Example for the "Yoga flow beside villa pool" pose option in Activewear:
- `prosePromptFragment`: "The model performs a dynamic three-legged downward dog variation, both hands grounded on the stone terrace, one foot firmly planted, the other leg lifted high with a soft bend at the knee. The pose feels powerful, controlled, feminine, and athletic, with realistic yoga mechanics and believable balance."
- `paletteHints`: `[{name:"pale stone terrace", hex:"#D8D2C5"},{name:"deep garden green", hex:"#1F331F"},{name:"pool shadow blue-green", hex:"#2F5B5A"}]`

### Output structure (multi-paragraph)

`compile()` now emits paragraphs in this fixed order, blank line between each:

1. **Reference fidelity block** — `[MODEL IMAGE]` paragraph (if person), then `[PRODUCT IMAGE]` paragraph with `{{productName}}` and family-specific fidelity list.
2. **Hero command + subject action** — "Create a realistic … image of {{subcategoryNoun}} …" + the pose / placement `prosePromptFragment`.
3. **Composition & framing** — assembled from aspect ratio (as prose hint, e.g. "Frame the image vertically from a medium distance"), framing, angle, depth of field.
4. **Environment** — `prosePromptFragment` from environment + setting questions; rich sensory description.
5. **Color palette** — opening sentence "Use a natural [vibe] palette:" followed by a bulleted list rendered with hex codes, including the product color line tied to `[PRODUCT IMAGE]` (e.g. "black activewear preserved from [PRODUCT IMAGE]: #111111"). Palette is the union of: product color + module defaults + every selected option's `paletteHints`, deduped.
6. **Lighting** — `prosePromptFragment` from lighting option, tuned with time-of-day modifier.
7. **Photo look / finish** — grain, contrast, editorial finish sentence(s) from photo-look option.
8. **Styling & negative styling guards** — what the model wears/holds, and what to exclude (no sneakers, no sunglasses, etc.) — driven by the family's `stylingGuards` block + selected accessory answers.
9. **Product fidelity reminder** — short reminder paragraph re-anchoring `[PRODUCT IMAGE]` for the specific subcategory (garment vs bottle vs shoe vs ring), listing the parts that must stay clearly visible.
10. **Mood + realism close** — closing paragraph: campaign mood + realism directives (skin texture, anatomy, fabric tension, true shadows, subtle grain) + the "Avoid:" sentence merged from module + selected-option negative rules.

The compiler reuses existing project safeguards (saugikliai) from `src/lib/brandPromptBuilder.ts` so wording stays consistent with the rest of the app.

### Aspect ratio

Still travels two ways:
- **API config**: stored on the row, sent to the generator as `aspectRatio`.
- **Prose hint**: a short sentence in the Composition paragraph (e.g. 4:5 → "Frame the image vertically…", 16:9 → "Frame the image horizontally for a wide cinematic crop"). The hex/ratio itself is not written into the prose.

### Validator additions

- Verify every `[PRODUCT IMAGE]` / `[MODEL IMAGE]` token has a matching attached reference; if not, swap the fidelity paragraph for a generic equivalent ("the provided product / model") so the prompt never ships with unresolved tokens.
- Deduplicate palette entries by hex; keep the first label seen.
- Strip the negative styling line for any item the user explicitly opted into (e.g. don't say "no sunglasses" if the user chose sunglasses as an accessory).

### Acceptance, upgraded

- Generating a scene with Activewear → Yoga pose → Villa pool + a product named "Onyx Compression Set" produces output structurally identical to the user's reference example: opens with `[MODEL IMAGE]` and `[PRODUCT IMAGE]` paragraphs, includes a hex palette bullet list, closes with realism + avoid paragraph.
- Removing the model reference makes the `[MODEL IMAGE]` paragraph disappear and shifts the prompt to a product-only narrative without leftover person language.
- Changing aspect ratio from 4:5 to 16:9 changes only the composition sentence + the stored `aspect_ratio` column; no other paragraph changes.
