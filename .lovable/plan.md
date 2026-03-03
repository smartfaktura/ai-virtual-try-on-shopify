

## Remove "Scene" Labels and Update CTA Text on Public Discover

### Changes

**1. `src/components/app/DiscoverCard.tsx`** -- Remove the "Scene" badge (lines 83-88) conditionally, or add a prop to hide it. Since the public page doesn't pass `onToggleSave`/`isAdmin` props, the cleanest approach is to add a `hideLabels` prop that the public page passes as `true`.

**2. `src/pages/PublicDiscover.tsx`** -- Pass `hideLabels` to each `DiscoverCard` in the grid.

**3. `src/components/app/PublicDiscoverDetailModal.tsx`** -- Two text changes:
- Button: "Sign Up Free to Use This" → "Create account for free to generate results like this"
- Also remove the `· Scene` label from the category line in the modal detail panel
- Update the helper text below the button to match the new tone

### Technical Details

| File | Change |
|------|--------|
| `src/components/app/DiscoverCard.tsx` | Add optional `hideLabels?: boolean` prop; wrap Scene badge in `!hideLabels &&` conditional |
| `src/pages/PublicDiscover.tsx` | Pass `hideLabels` to `DiscoverCard` |
| `src/components/app/PublicDiscoverDetailModal.tsx` | Update CTA button text and remove "Scene" label from modal |

