
## Clarify what “Your outfit” means in Step 3

### What is happening now
The screenshot shows the real problem clearly:

- every row says **“Your outfit”**
- but there is **no per-shot editor**
- and the UI does **not show what outfit that actually means**

So the current list is technically true but useless. In the current system, outfit editing is **global**, not per shot:

- you pick **Top / Bottom / Shoes / Accessories** once in the panel above
- those picks apply to all eligible on-model shots
- scenes with their own curated `outfit_hint` can still override that unless global override is enabled

That means **“Your outfit” really means “this shot uses the global outfit picks from above”**. The UI never says that, so it feels broken.

### Root issue
This is mostly a **UX wording + presentation problem**, not a prompt-engine problem:

1. **The label is vague**
   “Your outfit” does not tell the user:
   - global vs per-shot
   - what exact pieces are active
   - whether the scene is editable here or not

2. **The list becomes noisy when all shots use the same source**
   In your screenshot, six rows all say the same thing. That should be one summary, not six repetitive pills.

3. **There is no visible link between the chips above and the shot labels below**
   The panel should explicitly say:
   - what you selected
   - how many shots it affects
   - which shots, if any, are exceptions

### Implementation plan

#### 1. Replace vague labels with plain language
Update the per-shot source labels in `ProductImagesStep3Refine.tsx`:

- `Your outfit` → `Uses your selections above`
- `Your outfit (override)` → `Uses your selections above (forced on all shots)`
- `Scene styling` → `Uses this shot’s built-in styling`
- `Category default — pick outfit` → `Uses automatic styling`

This makes the meaning immediately understandable.

#### 2. Add a global outfit summary directly above the shot list
Under the outfit panel, add a compact summary card like:

```text
Applies to 6 model shots
Using your selections above:
Top: white cropped top
Bottom: black tailored trousers
Accessories: gold jewelry
```

If nothing is selected:

```text
No custom outfit selected
Shots will use built-in scene styling or automatic styling
```

This answers “what is here?” without making users decode the row badges.

#### 3. Only show the per-shot list when sources are mixed
If all eligible shots use the same source, replace the repetitive list with one sentence:

```text
All 6 model shots use your selections above
```

Only render the detailed per-shot breakdown when there is a mix, for example:
- some shots use built-in scene styling
- some use global outfit picks
- some fall back to automatic styling

That keeps the section useful instead of cluttered.

#### 4. Add one explicit explanation: editing is global, not per-shot
Small helper copy under the summary:

```text
Outfit edits here apply across your selected model shots. This is not a per-shot wardrobe editor.
```

That directly addresses the confusion in your message.

#### 5. Show exactly which shots are exceptions
When sources are mixed, keep the row list, but only surface the exceptions clearly:

```text
Luxury Street Walk — Uses this shot’s built-in styling
Resort Seaside Apparel Story — Uses your selections above
```

This makes the section about differences, not repetition.

### Files to update
- `src/components/app/product-images/ProductImagesStep3Refine.tsx`
  - rewrite source labels
  - add global outfit summary
  - collapse identical-source lists
  - add “global, not per-shot” helper copy

Optional small helper extraction if needed:
- `src/lib/productImagePromptBuilder.ts` or a small UI helper file
  - reuse outfit description logic to turn `outfitConfig` into human-readable summary text for the UI

### Expected result
After this change, the user will understand:

- what outfit is currently active
- whether it is coming from their global picks or the scene itself
- that editing above affects all eligible shots
- which shots are exceptions, if any

### Validation
1. Select top + bottom only  
   → UI says exactly what was selected and that it applies to all eligible model shots

2. Select 6 scenes and all use the same source  
   → no repetitive 6-row list; just one clear summary

3. Select mixed scenes where one has built-in scene styling  
   → summary plus only the exception rows

4. Turn override on  
   → summary explicitly says selections are forced across all shots
