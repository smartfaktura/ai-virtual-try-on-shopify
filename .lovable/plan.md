

## Add "Move to Top" Button for Each Scene

### Changes

**`src/pages/AdminScenes.tsx`**

1. Add a `movePoseToTop` function that removes the pose from its current position within its category and inserts it at the top (before the first pose of that category in the global array).

2. Add a "Move to Top" button (using `ArrowUp` with a double-arrow or `ChevronsUp` icon from lucide) next to each scene row, disabled when the scene is already at index 0. Place it before the existing up/down arrows.

### Implementation Detail

```typescript
const movePoseToTop = (poseId: string) => {
  setOrderedPoses(prev => {
    const pose = prev.find(p => p.poseId === poseId);
    if (!pose) return prev;
    const cat = pose.category;
    const withoutPose = prev.filter(p => p.poseId !== poseId);
    // Find first pose of same category in the array
    const firstCatIdx = withoutPose.findIndex(p => p.category === cat);
    const result = [...withoutPose];
    result.splice(firstCatIdx >= 0 ? firstCatIdx : 0, 0, pose);
    return result;
  });
  setDirty(true);
};
```

Button added to each scene row with `ChevronsUp` icon, disabled when `idx === 0`.

| File | Change |
|---|---|
| `src/pages/AdminScenes.tsx` | Add `movePoseToTop` function + `ChevronsUp` button per scene row |

