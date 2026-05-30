## Fix recommended category header on `/app/generate/product-images`

File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx` (lines ~750-771)

### Issues
1. "Recommended" badge uses `variant="default"` so it inherits `hover:bg-primary/80` from `Badge` → on hover it turns dark navy with unreadable text.
2. Layout currently: `[Title] [Recommended] [count] … [chevron]`. User wants the count next to the title and the Recommended pill next to the chevron.

### Changes
1. Replace the `<Badge>` for "Recommended" with a plain `<span>` styled as a soft pill (`bg-primary/10 text-primary`) so no hover color change occurs — or pass `variant="outline"` plus explicit classes and override hover (`hover:bg-primary/10`). Use the span approach for simplicity and consistency.
2. Reorder the trigger row:
   - Left cluster: title + selected count / total number (e.g. `32`).
   - Right cluster (just before chevron): the Recommended pill, then the chevron icon.
3. Keep the row hover background subtle (`hover:bg-primary/[0.05]`) unchanged.

### Resulting markup (conceptual)
```
[Phone Cases  32]                          [Recommended] [▾]
```

No logic, data, or other component changes.
