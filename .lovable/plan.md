## Stop pre-highlighting Product Scale + expand options

### Root cause of the visible preselect
`Step4Cast.tsx` line 432 marks a chip active using the fallback constant:

```tsx
active={scalePreset === s.value}        // scalePreset = scale?.preset ?? resolved.scale.default
```

So even with no user selection, the resolved default ("handheld" for food/tech/wellness) lights up. The reducer in `useWizardState.ts` (line 183) also seeds `{ preset: "handheld" }` whenever a scale patch (e.g. exact size) is dispatched without a preset.

### Changes

**1. `src/features/brand-scenes/wizard/steps/Step4Cast.tsx`**
- Line 432: `active={scale?.preset === s.value}` — never highlight unless the user actually picked one.

**2. `src/features/brand-scenes/wizard/useWizardState.ts`**
- Line 177 (`setCast`): drop the `{ preset: "solo" }` fallback → `(prev ?? {})`.
- Line 183 (`setScale`): drop the `{ preset: "handheld" }` fallback → `(prev ?? {})`.
Patches that only set e.g. dimensions or interaction will no longer silently seed a preset.

**3. `src/features/brand-scenes/wizard/constants/scale.ts` — add more options + "Other"**
New preset list, in this order:
- `mini` — "Mini" — <5 cm — rings, earbuds, USB sticks
- `pocket` — Pocket — ≤15 cm (existing)
- `handheld` — Handheld — 15–35 cm (existing)
- `tabletop` — "Tabletop" — 35–80 cm — small appliances, lamps, decor
- `carry` — Carry — 35–80 cm (existing, retitled hint to "carried at torso" so it doesn't overlap with tabletop)
- `furniture` — Furniture (existing)
- `architectural` — Architectural (existing)
- `on_body` — Wearable on body (existing)
- `other` — "Other" — user-supplied size descriptor

Each new entry includes `directive` and `CAST_VS_PRODUCT` mapping in `buildScaleDirective.ts`:
- mini → "product is dwarfed by a fingertip" / directive "miniature scale ~3 cm, smaller than a finger"
- tabletop → "person leans over the product on a surface" / directive "tabletop scale ~50 cm, sized to a countertop"
- other → no directive; uses the user's free-text label

**4. Add `scale.note` free text for "Other"**
- Extend `BrandSceneScale` schema in `src/features/brand-scenes/schema.ts` (or `types.ts` — whichever holds it) with optional `note?: string`.
- In `Step4Cast.tsx`, when `scale?.preset === "other"`, render a small `Input` under the chips bound to `scale.note` (placeholder: "Describe the size — e.g. wall-mounted, 1.2 m wide").
- In `buildScaleDirective.ts`, when preset is `other`, emit `Product scale: ${scale.note || "scaled naturally to the product"}.` and skip the cast-vs-product line.

**5. Registry exposure**
- `categoryPresets.ts` — add `mini`, `tabletop`, `other` to the default `scale` values list for every family so they appear in the picker (subfamily restrictions like rings → `pocket` only stay as-is; `other` is appended universally).
- `resolvePresets.ts` — no change needed; it already maps from registry values.

### Out of scope
Prompt-side semantics for "Other" beyond inserting the user's note verbatim. Translation files / tests for new presets are not in the registry tests today.