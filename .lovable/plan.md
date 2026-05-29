I found the issue in `src/components/app/ManualProductTab.tsx`: the analyzer fills `userCategory` for the single Add Product modal, but it does not also store the AI pick in `suggestedCategory`, so the `Suggested` pill has nothing to render.

Plan:

1. Update the single-image analyzer result handling
   - When AI returns `data.userCategory`, store it in `suggestedCategory` write-once.
   - Fill `userCategory` only if the user has not already selected a category.
   - Use functional state updates so an in-progress analysis cannot overwrite a user’s manual category choice.

2. Add the analyzing visual state to Product Category
   - While analysis is running and no category is available yet, show `Analyzing…` in the Product Category field.
   - Apply the same pulse/ring styling used by Product Name and Description.

3. Keep the Suggested pill behavior consistent
   - Show `Suggested` beside the category after analysis when the visible category matches the AI suggestion.
   - Hide it automatically when the user manually changes to a different category.
   - Keep existing bulk Add Products behavior unchanged except for any shared safety improvement needed by the same logic.

No backend, database, or analyzer prompt changes are needed.