
## Fix Prompt Builder mobile card text truncation

### Problem (from screenshot)

In every step of the mobile Prompt Builder, card text is being **cut off with ellipsis** — "Fashion & Apparel" shows as "Fashion …", "Beauty & Wellness" as "Beauty &…", "Accessories" as "Accesso…", and descriptions like "Skincare, makeup" become "Skincare, m…". Caused by the `truncate` class on both label and description spans inside the mobile branch of `OptionCard`, which forces single-line display and clips overflow.

### Fix — `src/components/app/freestyle/PromptBuilderQuiz.tsx`

Single component edit: the mobile branch of `OptionCard` (lines 107–119).

**1. Allow labels to wrap (up to 2 lines, no clipping)**
- Remove `truncate` from the label `<span>`.
- Add `break-words` so long category names wrap cleanly.
- Use `line-clamp-2` as a safety net on labels — visible on 2 lines, no ellipsis on common copy since none exceed two lines at the new column width.

**2. Allow descriptions to wrap to 2 lines**
- Remove `truncate` from the description span.
- Add `line-clamp-2 break-words` so "Skincare, makeup" / "Furniture, decor" / "Vitamins, wellness" all stay visible.

**3. Let the card grow vertically**
- Change mobile container from `items-center` to `items-start` so the icon stays top-aligned when text wraps to 2 lines.
- Keep existing `gap-3 p-3` padding — already comfortable; vertical growth is fine.

**4. Reduce label/desc font weight collision risk on small widths**
- Drop the right-side `pr-5` on the text wrapper to `pr-6` only when `selected` (so it clears the absolute Check badge), `pr-1` otherwise — gives ~12px more horizontal room for the label per card. Implemented via `cn(... selected && 'pr-6')`.

**5. Apply consistently to all steps**
The same `OptionCard` is used by Category / Subject / Interaction / Setting / Mood / Framing — fix once, every step benefits.

### Result (390×818 mobile)

- Step 1 Category: "Fashion & Apparel", "Beauty & Wellness", "Accessories", "Home & Living", "Food & Beverage", "Sports & Fitness", "Health & Wellness", "Other Products" all fully readable, wrapping to 2 lines as needed; descriptions ("Skincare, makeup", "Furniture, decor") fully visible.
- Steps 2–6: same horizontal-card layout, no clipped text. Cards in a row size to the tallest sibling so the grid stays tidy.
- Selected card: Check badge in top-right unaffected; text reserves space for it via conditional padding.

### Untouched

Desktop layout, grid column counts, step logic, sheet/dialog container, header, footer, all icon mappings, prompt assembly logic.
