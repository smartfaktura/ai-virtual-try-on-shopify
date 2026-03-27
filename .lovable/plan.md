

# Remove Category Grouping from Product Workflow Scene Selection

## What changes

**File: `src/pages/Generate.tsx` (~lines 3637-3639)**

Instead of iterating `Object.entries(posesByCategory)` and rendering a `PoseCategorySection` per category (which shows category headers like "Studio Essentials", "Surface & Texture", etc.), render all scenes in a single flat grid directly.

Replace the category-grouped rendering block with a flat grid of `PoseSelectorCard` components using `allScenePoses` (already computed at line 740), filtered the same way `posesByCategory` filters (e.g. excluding non-on-model categories for try-on workflows).

### Specifically

Replace lines ~3637-3639:
```tsx
{Object.entries(posesByCategory).map(([category, poses]) => (
  <PoseCategorySection key={category} ... />
))}
```

With a flat grid:
```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
  {Object.values(posesByCategory).flat().map((pose) => (
    <PoseSelectorCard
      key={pose.poseId}
      pose={pose}
      isSelected={selectedPoses.has(pose.poseId)}
      onSelect={() => handleSelectPose(pose)}
      selectedGender={selectedModel?.gender}
      selectionIndex={...compute from selectedPoses...}
    />
  ))}
</div>
```

This keeps the same filtering logic (via `posesByCategory`) but removes category headers entirely, showing all scenes in one flat grid.

