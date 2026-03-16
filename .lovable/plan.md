

## Add "Missing a scene?" request card to Virtual Try-On grid

### Change

**File: `src/pages/Generate.tsx`** (~line 2925)

After the last `PoseCategorySection`, add a "Missing a scene?" card styled like a grid item (dashed border, muted background, centered icon + text). When clicked, it expands inline to show a textarea (reusing the same feedback submission logic as `MissingRequestBanner`).

Instead of building a custom card, simply add a `<MissingRequestBanner category="scene" />` (non-compact mode) after the category sections, just before `</CardContent>`. This already handles the expand → textarea → submit flow and writes to the `feedback` table.

```tsx
{Object.entries(posesByCategory).map(([category, poses]) => (
  <PoseCategorySection key={category} ... />
))}

{/* "Missing a scene?" request card */}
<MissingRequestBanner
  category="scene"
  title="Missing a scene? Tell us and we'll create it."
  placeholder="Describe the scene or environment you'd like…"
/>
```

- Import `MissingRequestBanner` at the top of `Generate.tsx`
- Place it inside `CardContent`, after the scene grid categories, before the closing `</CardContent>`

