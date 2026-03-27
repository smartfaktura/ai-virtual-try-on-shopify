

# Add Scene Name & Category Editing to Admin Metadata Editor

## Problem
When viewing a scene-type item in the Discover detail modal, the admin metadata editor doesn't let you edit the scene's own **name** or **category** — the fields that control what appears as the label and subtext on workflow cards (e.g., "Studio Chair Pose" / "fashion").

## Changes

**File: `src/components/app/DiscoverDetailModal.tsx`**

### 1. Add editable fields for scene-type items

When `item.type === 'scene'` and the scene is a custom scene (`poseId.startsWith('custom-')`), add two new fields to the admin editor:

- **Scene Name** — text input, pre-filled with current `item.data.name`, saves to `custom_scenes.name`
- **Scene Category** — dropdown of scene categories (fetched from `scene_categories` table or using the existing category constants), pre-filled with `item.data.category`, saves to `custom_scenes.category`

Built-in scenes remain read-only (already marked as such).

### 2. Wire up save handler

The existing `handleSaveMetadata` function already handles custom scene updates (writing to `custom_scenes` table). Extend it to include `name` and `category` fields in the update payload when those values have changed.

### 3. State initialization

Add `editSceneDisplayName` and `editSceneCategory` state variables, initialized from `item.data.name` and `item.data.category` when the modal opens with a scene-type item.

### 4. Include in unsaved-changes detection

Add these two new fields to the `hasChanges` check so the Save button highlights when name or category has been modified.

## What this enables

Admins can click any custom scene in Discover, edit its display name (e.g., rename "Studio Chair Pose" → "Chair Studio") and category (e.g., change from "fashion" → "lifestyle"), hit Save, and see the change reflected everywhere — workflow cards, Freestyle scene grid, and Discover feed.

