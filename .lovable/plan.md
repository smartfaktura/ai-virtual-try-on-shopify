## Hide redundant identity fields when a Featured model is locked

When a Featured model is picked in the Brand Scenes wizard, the model image already encodes gender, age, build and ethnicity — so asking the user to also pick those is confusing and can contradict the locked face.

### Behavior

In `Step4Cast.tsx` → `PeopleTab`, when `cast?.model_ref` is set:

- **Hide:** Gender, Age range, Build, Ethnicity sections, and the lingerie-specific build chips that mirror these.
- **Keep:** Energy / vibe (mood/styling), Lingerie mood, group dynamic (multi-person scenes), pose/action — none of these are identity.
- Add a single hint under the Featured model card: *"Gender, age and build are locked to this model"*.

Cast **summary chips** at the top of Step 4: drop gender/age/build chips when a model is locked and replace them with a `Model: {name}` chip that jumps back to the People tab.

### Prompt side-effect

`buildCastDirective.ts`: when `cast.model_ref` is present, skip the `age/gender` descriptors in the cast head (the `[MODEL IMAGE]` reference encodes them). `vibe` is still emitted separately if set.

### Files touched

- `src/features/brand-scenes/wizard/steps/Step4Cast.tsx` — conditional hides in `PeopleTab`, updated summary chips
- `src/features/brand-scenes/prompt/buildCastDirective.ts` — skip identity descriptors when `model_ref` set

### Out of scope

- No schema, edge-function, or API changes.
- Wardrobe/outfit picker stays as-is (clothes ≠ identity).