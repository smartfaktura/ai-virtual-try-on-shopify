## Goal
Brand Scene wizard at `/app/brand-scenes/new`:
1. Auto-cast picks a *cohesive editorial look* across every category (not just two random tokens).
2. Rings / necklaces / earrings / bracelets / watches actually render *worn on the right body part in the right position*.
3. The Interaction step stops offering wrong gestures (e.g. "Wrist showing watch" on Rings — see screenshot).

## Problem
- `Step4Cast.setMode("skip")` (Auto-cast) only seeds `preset` + `interaction`. No pose, body-part focus, hands-on-product gesture, vibe, gaze, framing — so the model improvises and results look random.
- `assembleSceneDirective` ignores `module + sub_family` for jewelry/watches/eyewear/hats. `subfamilyGuides` only covers fashion, lingerie, swim, scarves, caps, hats, beanies → no PRODUCT FOCUS line, no NEGATIVE safeguard for "ring must be worn on the ring finger". Result: ring floats beside the hand, necklace nowhere on neck, etc.
- The `castHasPeople` gate excludes the `"hands"` preset, which is the default for rings/bracelets/watches — so even a future jewelry guide would silently no-op.
- `categoryPresets.jewelry` doesn't declare `hands_on_product`, so the resolver returns ALL gestures including "Wrist showing watch" + "Pouring" on Rings.

## Changes

### 1. `src/features/brand-scenes/wizard/constants/sceneExtras.ts`
Add jewelry-specific gestures to `HANDS_ON_PRODUCT` so each sub-family can map cleanly:
- `ring_finger` — "ring worn on the model's ring finger, finger gently extended toward camera"
- `necklace_clasp` — "necklace worn at the base of the neck, clasp behind, pendant centered on the collarbone"
- `earring_place` — "earring worn on the earlobe, hair tucked behind the ear so the piece reads cleanly"
- `bracelet_wrist` — "bracelet wrapped around the wrist, clasp aligned naturally"

### 2. `src/features/brand-scenes/wizard/registry/categoryPresets.ts`
Per jewelry sub-family, declare correct `hands_on_product` and `body_part_focus` so the wizard stops surfacing wrong gestures and Auto-cast can pick a sensible default:
- `jewellery-rings`: `hands_on_product: ["ring_finger","pinch","cradle"]`, `body_part_focus: ["hands","detail"]`
- `jewellery-necklaces`: `hands_on_product: ["necklace_clasp"]`, `body_part_focus: ["neck","face","detail"]`, default cast `"solo"`
- `jewellery-earrings`: `hands_on_product: ["earring_place"]`, `body_part_focus: ["face","neck","detail"]`, default cast `"solo"`
- `jewellery-bracelets`: `hands_on_product: ["bracelet_wrist","wrist_show","pinch"]`, `body_part_focus: ["wrist","hands","detail"]`
- Jewelry family default: `hands_on_product: ["cradle","pinch"]` (so generic jewelry never shows "Pouring" / "Wrist showing watch").

Sanity-check eyewear / hats families have sensible `hands_on_product` too; add minimal defaults if missing (out of immediate scope unless trivially adjacent).

### 3. `src/features/brand-scenes/wizard/registry/subfamilyGuides.ts`
Add placement guides keyed `module/sub_family`. Each becomes a PRODUCT FOCUS line + hard NEGATIVE safeguards:

- `jewelry/jewellery-rings` — "The brand's ring is worn on the model's ring finger (left hand by default), fully on, band and any stone or setting clearly readable; finger relaxed and lit so the metal renders true to material."
  Safeguards: "Do not float, hover or detach the ring from the finger. Do not show the ring held in the other hand instead of worn. Do not crop out the wearing hand. Do not show bare fingers where the ring should be."
- `jewelry/jewellery-necklaces` — "The brand's necklace is worn at the base of the neck, clasp behind, pendant centered on the décolletage; neckline kept clean so the chain reads."
  Safeguards: "Do not show the necklace draped over a hand or surface instead of worn. Do not hide the pendant with hair, collar or shadow. Do not omit the chain."
- `jewelry/jewellery-earrings` — "The brand's earrings are worn on the earlobes (matched pair); hair styled or tucked so at least one ear is sharply visible — 3/4 or profile angle preferred."
  Safeguards: "Do not leave the ear bare. Do not show only one earring unless a deliberate profile shot. Do not blur the worn ear."
- `jewelry/jewellery-bracelets` — "The brand's bracelet is wrapped around the model's wrist (clasp aligned); wrist posed so the full circumference reads."
  Safeguards: "Do not float the bracelet beside the wrist. Do not crop the wrist out. Do not show empty wrists."
- `watches/*` (single family-level guide reused for any watch sub-family): "Worn on the wrist with the dial facing camera; strap, case and lugs fully readable."
  Safeguards: "Do not show empty wrists. Do not hide the dial. Do not invent a different watch."

Mark each with `mustWearProduct: true`.

If `watches` has no sub-families, add a `null` sub_family fallback path (see #4).

### 4. `src/features/brand-scenes/prompt/assembleSceneDirective.ts`
Two narrow edits:

a. Extend the gate so jewelry placement also fires for `cast.preset === "hands"`:
```ts
const guideShouldFire = !!guide && (castHasPeople || answers.cast?.preset === "hands");
if (guideShouldFire) productFocus.push(guide.wardrobe);
…
if (guideShouldFire) for (const s of guide.safeguards) negative.push(s);
```

b. Make `resolveSubfamilyGuide` also accept a family-level fallback so a `watches`-only guide fires without a sub_family. Try `${module}/${subFamily}` first, then `${module}/*`.

### 5. `src/features/brand-scenes/wizard/registry/subfamilyGuides.ts` — resolver
Update `resolveSubfamilyGuide` to do the `module/*` fallback used by step 4b.

### 6. `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` — smarter Auto-cast (ALL categories)
In `setMode("skip")` seed a complete editorial look. For each field, only set if the user hasn't already set it. Logic:

- `preset` = `resolved.defaultCast`
- `interaction` = prefer `"wearing"` if it's in `resolved.interactions`, else first visible
- `vibe` = `"editorial"`
- `age` = `["adult"]`
- `gender` = leave undefined (model picks)
- `action` = `"still"` if cast has people
- `gaze` = `"away"` if cast has people
- `hands_on_product` = `resolved.handsOnProduct[0]` if any (now correctly category-tuned per #2)
- `body_part_focus` = `resolved.bodyPartFocus[0]` if any
- `wardrobe_color` = first entry from `resolved.wardrobeColors` if defined and not already set
- `scale.preset` = `resolved.scale.default` (already seeded — keep)

Also seed minimal scene defaults in the same call if missing (so Auto-cast feels "complete" not "barely started"):
- `base.lens` = `resolved.lens[0]`
- `base.depth_of_field` = `resolved.depthOfField[0]`
- `base.finish` = `resolved.finishes[0]`

This requires `setMode` to also accept a `base` patch; pass via the existing `onScaleChange`/`onCastChange` siblings — add a thin `onBaseChange` prop if not already wired (check Step4Cast Props; if absent, add it and thread from `BrandSceneWizard`).

## Out of scope
- No new wizard questions or steps.
- No changes to `Step4ModuleQuestions` (Brand Scene wizard doesn't render it).
- No backend / edge function / DB changes.
- Other categories' subfamily guides (eyewear, hats, etc.) untouched beyond what #2 implies.

## Validation
- Open `/app/brand-scenes/new` → Jewelry → Rings → "Auto-cast" → Continue → Generate. Confirm:
  - Interaction tab no longer shows "Wrist showing watch" or "Pouring" for Rings.
  - Final prompt contains a `PRODUCT FOCUS` line "ring is worn on the model's ring finger…" and a `NEGATIVE` clause forbidding floating rings.
  - `CAST DETAILS` lists pre-seeded body-part-focus = hands, action = still, vibe = editorial, hands-on-product = ring-finger.
- Repeat for Necklaces, Earrings, Bracelets, Watches.
- Run a non-jewelry category (e.g. Fashion / Activewear) → Auto-cast → confirm it still seeds a cohesive pose/gaze/wardrobe without regressions.
