

# Fix: Scene items in Discover detail modal should match preset UI

## Problem
The detail modal hides three sections for `type: 'scene'` items:
1. **"Created with" section** (line 218: `{isPreset && (`)
2. **Admin metadata editor** (line 289: `{isAdmin && isPreset && (`)
3. **CTA button** says "Use Scene" instead of "Recreate this" (line 527)

Scene items in Discover are also `discover_presets` rows, so they should show the same UI.

## Changes — `src/components/app/DiscoverDetailModal.tsx`

### 1. Show "Created with" for all items (line 218)
```typescript
// Before:
{isPreset && (

// After:
{(
```
Remove the `isPreset &&` guard so scenes also show scene/model/product thumbnails.

### 2. Show admin metadata editor for all items (line 289)
```typescript
// Before:
{isAdmin && isPreset && (

// After:
{isAdmin && (
```

### 3. Unify CTA button label (line 527)
```typescript
// Before:
{isPreset ? 'Recreate this' : 'Use Scene'}

// After:
Recreate this
```

### 4. Unify CTA onClick (line 499-523)
The `else` branch (line 520-523) calls `onUseItem(item)` for scenes instead of navigating to Freestyle. Change the CTA to always use the preset navigation logic — for scene items without workflow_slug, navigate to Freestyle with available params.

### 5. Initialize editor from preset data for scenes too (line 129-138)
The `else` branch resets all fields to defaults for scenes. Since scene items in Discover are also `discover_presets` rows, they should populate from `item.data` just like presets. Remove the `else` branch and always use the preset initialization path (line 115-128). For `type: 'scene'` items, the fields that don't exist on the scene data type will just default to empty — but we should handle this by checking if the data has those fields.

### 6. Save metadata — handle scene item ID (line 458, 485)
The save handler references `item.data.id`. For scene items, the ID field is `poseId`. Need to ensure the correct ID is used when saving. Since scene items that appear in Discover *are* `discover_presets` rows, we should check if `item.data` has an `id` field or fall back.

One file changed, ~6 small edits. Scene items will show "Created with", admin editing, and "Recreate this" — identical to presets.

