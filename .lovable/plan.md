

# Multi-Select Discover Categories for Scenes

## Problem
1. The "Discover Category" selection in the Add Scene modal currently only allows single selection
2. The selected `discoverCategory` is **never actually saved** — it's collected in state but not passed to `addScene.mutateAsync`
3. Both `custom_scenes` and `discover_presets` tables only have a single `category` text column

## Approach
Add a `discover_categories` text array column to `custom_scenes`, update the Add Scene modal to support multi-select, and use this array when promoting scenes to the Discover feed.

## Changes

### 1. Database Migration
Add a `discover_categories text[] default '{}'::text[]'` column to `custom_scenes`. This stores the selected Discover categories as an array (e.g. `{fashion,beauty,jewelry}`).

### 2. `src/components/app/AddSceneModal.tsx`
- Change `discoverCategory` state from `string` to `string[]` (default `['fashion']`)
- Toggle logic: clicking a chip adds/removes it from the array (minimum 1 required)
- Active state uses `discoverCategories.includes(cat.id)` instead of `=== cat.id`
- Pass `discover_categories` array to `addScene.mutateAsync`

### 3. `src/hooks/useCustomScenes.ts`
- Update `useAddCustomScene` mutation to accept and insert `discover_categories: string[]`
- Update `useUpdateCustomScene` to accept `discover_categories`

### 4. Discover Feed Integration
When scenes appear in the Discover feed, they will match against any of their `discover_categories` entries rather than just the single `category` field. This means the same scene shows up when filtering by any of its assigned categories.

## UI Behavior
- Chips toggle on/off with multi-select (filled = selected, outlined = unselected)
- At least one category must remain selected
- Visual feedback: selected chips use primary color (same as current), multiple can be active simultaneously

