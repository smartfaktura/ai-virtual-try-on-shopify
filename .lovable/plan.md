
## Debug & Enhance Product Specifications

### Bugs Found

1. **Double "Product specifications:" prefix** — `buildSpecsPromptLine` returns `"Product specifications: Length: 180cm..."` but the prompt builder also wraps with `"Product specifications: ..."`. Result: `"Product specifications: Product specifications: Length..."`.
2. **Select empty string value** — Radix Select with `value=""` can cause rendering issues. Should use `undefined` for unset state.
3. **No input sanitization** — User can paste control characters, extremely long strings, or script tags into text fields. These flow directly into prompts and the DB.
4. **No unit system toggle** — Units are hardcoded to metric (cm/mm). International users need inches/oz/fl oz.

### Fixes

#### 1. `src/lib/productSpecFields.ts`

- Add `UnitSystem = 'metric' | 'imperial'` type
- Add `imperialUnit` field to `SpecField` interface (e.g. `'in'` for `'cm'`, `'oz'` for `'g'`, `'fl oz'` for `'ml'`)
- Add `getDisplayUnit(field, system)` helper
- Add `sanitize(val, maxLen)` helper — strips control characters, trims, limits length
- Update `buildDimensionsString` to accept `unitSystem` param, use `getDisplayUnit`
- **Fix**: `buildSpecsPromptLine` returns raw content WITHOUT "Product specifications:" prefix (caller adds it)
- Apply `sanitize()` to all spec values and notes before building strings

#### 2. `src/components/app/product-images/ProductSpecsCard.tsx`

- Add `unitSystem` state (`'metric' | 'imperial'`), default to `'metric'`
- Add a compact toggle row at the top of the card: `cm / in` pill toggle
- Pass `unitSystem` to `SpecInput` to display the correct unit suffix
- Fix Select: use `value={value || undefined}` instead of `value={value || ''}`
- Limit textarea to 500 chars with `maxLength={500}`
- Add `inputMode="decimal"` to numeric text inputs for better mobile keyboard

#### 3. `src/lib/productImagePromptBuilder.ts`

- No change needed — both injection points already use `"Product specifications: ${ctx.productDimensions}."` which is correct once `buildSpecsPromptLine` stops adding the prefix

#### 4. `src/pages/ProductImages.tsx`

- Pass unit system from details to `buildSpecsPromptLine` calls
- Add `unitSystem` to `DetailSettings` type so it persists with the form state
- DB persistence line: wrap dimensions string with sanitize before writing

#### 5. `src/components/app/product-images/types.ts`

- Add `specUnitSystem?: 'metric' | 'imperial'` to `DetailSettings`

### Files Changed

| File | Change |
|---|---|
| `src/lib/productSpecFields.ts` | Fix prefix bug, add sanitization, add imperial units |
| `src/components/app/product-images/ProductSpecsCard.tsx` | Add unit toggle, fix Select value, add input limits |
| `src/components/app/product-images/types.ts` | Add `specUnitSystem` to DetailSettings |
| `src/pages/ProductImages.tsx` | Pass unit system through generation flow |
