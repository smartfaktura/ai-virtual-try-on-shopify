

## Fix Model Showcase Carousel & Add Missing Models

### Issue 1: Broken Images (Kai, Emma, Natalie, Jordan, Hannah)

The `m()` helper already prepends `models/`, but these five entries use paths like `models/model-051-jordan.jpg` — resulting in double-nested `models/models/model-051-jordan.jpg` URLs.

**`src/components/landing/ModelShowcaseSection.tsx`**:
- Fix line 17: `'models/model-051-jordan.jpg'` → `'model-051-jordan.jpg'`
- Fix line 18: `'models/model-050-hannah.jpg'` → `'model-050-hannah.jpg'`
- Fix line 19: `'models/model-049-kai.jpg'` → `'model-049-kai.jpg'`
- Fix line 33: `'models/model-054-natalie.jpg'` → `'model-054-natalie.jpg'`
- Fix line 60: `'models/model-052-emma.jpg'` → `'model-052-emma.jpg'`

### Issue 2: Name Mismatches (Landing Carousel vs Model Selector)

The carousel shows different names than what appears in `mockModels`. Align carousel names to match the model selector data:

| Carousel Name | mockModels Name | Action |
|---|---|---|
| Luca | Liam | Change carousel to "Liam" |
| Charlotte (mature-european) | Victoria | Change carousel to "Victoria" |
| Amara (plussize-african) | Nia | Change carousel to "Nia" |
| Hiro | Jin | Change carousel to "Jin" |
| Sophie (average-european) | Charlotte | Change carousel to "Charlotte" |
| Callum (athletic-scottish) | Rowan | Change carousel to "Rowan" |
| Nadia (athletic-black) | Amara | Change carousel to "Amara" |
| Max (plussize-european) | Henrik | Change carousel to "Henrik" |
| Niamh (athletic-mixed) | Tyler | Already Tyler in mockData — use "Tyler" or keep distinct |
| Erik (slim-nordic) | Anders | Already in ROW_1 — duplicate image, remove or rename |
| Astrid (average-nordic) | Freya | Already in ROW_1 — duplicate image, remove |

Actually, some of these share images with ROW_1 models (e.g., Astrid uses the same image as Freya). I'll remove duplicates and align remaining names.

### Issue 3: Add Aubrey, Madison, Zoe to Model Selector

**`src/data/mockData.ts`** — add three new entries to `mockModels`:
- Aubrey: `model-female-average-american-redhead.jpg`, female, average, American Redhead, young-adult
- Madison: `model-female-slim-american-blonde.jpg`, female, slim, American Blonde, young-adult  
- Zoe: `model-female-athletic-american-black.jpg`, female, athletic, African American, young-adult

Also add the three image URL constants near the other model URL declarations.

### Issue 4: Hide Models with Failed Images (Defensive)

**`src/components/landing/ModelShowcaseSection.tsx`** — update `ShimmerImage` usage in the `MarqueeRow` to add an `onError` handler that hides the card if the image fails to load. This prevents broken image placeholders from appearing if any future images are missing.

### Summary of files to change
1. **`src/components/landing/ModelShowcaseSection.tsx`** — fix 5 broken paths, align names, add error hiding, remove duplicate-image entries
2. **`src/data/mockData.ts`** — add Aubrey, Madison, Zoe to `mockModels` with correct image URLs

