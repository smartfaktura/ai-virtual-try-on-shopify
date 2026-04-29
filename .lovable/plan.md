I found that the previous change only softened the focus color, but the input can still visually overflow because the focus style is applied directly on a pill-shaped `Input` inside a tight flex row. The screenshot shows the focus border/ring being clipped/merged at the left edge rather than behaving like a contained control.

Plan:

1. Update the Step 1 toolbar layout in `src/pages/ProductImages.tsx`
   - Make the search wrapper explicitly constrained with `min-w-0` so it can shrink safely inside the row
   - Make the toolbar responsive so action buttons do not squeeze the search input on narrower widths
   - Keep the input width at `w-full` within its parent instead of letting it visually exceed the available space

2. Replace the input’s ring-based focus with a contained border/shadow focus style
   - Remove the default `focus-visible:ring-*` behavior for this specific search field
   - Use a subtle inner/contained focus treatment such as:
     - `focus-visible:ring-0`
     - `focus-visible:ring-offset-0`
     - `focus-visible:border-muted-foreground/35`
     - a soft `focus-visible:shadow-[0_0_0_1px_...]` if needed
   - This avoids the “error-like” outline and prevents the focus indicator from extending outside the pill

3. Add safe clipping/padding around the search field container only where needed
   - Give the search container enough horizontal breathing room so the rounded border is not cut by the parent
   - Keep the visual style minimal and consistent with the existing UI

4. Verify the Step 1 grid underneath still aligns correctly
   - Ensure the upload card and product grid remain unchanged
   - Confirm no horizontal page overflow is introduced at the current 1203px viewport and smaller responsive widths

Technical details:

```tsx
<div className="flex flex-col sm:flex-row gap-3 sm:items-center min-w-0">
  <div className="relative flex-1 min-w-0">
    <Search ... />
    <Input
      className="h-10 w-full rounded-full text-sm pl-9 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-muted-foreground/35 focus-visible:shadow-[0_0_0_1px_hsl(var(--muted-foreground)/0.18)]"
    />
  </div>
  <div className="flex gap-2 shrink-0">
    ...buttons
  </div>
</div>
```

Expected result:
- Clicking the search box will no longer show a clipped/heavy highlight
- The search input will fit inside the left panel/screen area
- The focus state will look like a normal active input, not an error