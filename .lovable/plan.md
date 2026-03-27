

# Add Inline Prompt Editing to Scene Manager + Fix Discover Metadata Bug

## Problem
1. The Discover detail modal (`DiscoverDetailModal.tsx` line 572) overwrites `prompt_hint` with `editPrompt || ''` when saving scene metadata. Since Discover's "prompt" field is often empty for scenes, this wipes out the scene's actual prompt hint — explaining the disappeared prompts.
2. The Scene Manager (`/app/admin/scenes`) currently only shows a truncated prompt hint in a tooltip. There's no way to edit the prompt hint or toggle prompt-only mode inline.

## Changes

### 1. Fix the Discover metadata bug (`src/components/app/DiscoverDetailModal.tsx`)
- **Line ~572**: Stop overwriting `prompt_hint` with `editPrompt`. Only update `name`, `description`, and `category` for custom scenes — leave `prompt_hint` untouched unless there's a dedicated prompt hint field in the Discover modal.
- Change the update call to omit `prompt_hint` entirely, or only include it when explicitly edited.

### 2. Add inline prompt editing to SceneRow (`src/pages/AdminScenes.tsx`)
- Below each scene's metadata row, show the `promptHint` text (full, not truncated) for custom scenes that are prompt-only or have a prompt hint.
- Make this text editable inline: clicking it opens a textarea. Confirm/cancel saves to local state + marks dirty.
- Add a prompt-only toggle (small switch or checkbox) next to the "Prompt Only" badge for custom scenes, so admins can toggle it on/off.
- When "Save" is clicked (existing save button), persist prompt_hint and prompt_only changes to the `custom_scenes` table alongside the existing sort order save.

### 3. Persist prompt & type changes on Save (`src/pages/AdminScenes.tsx` + `src/hooks/useCustomScenes.ts`)
- Add an `useUpdateCustomScene` mutation to `useCustomScenes.ts` that updates `prompt_hint`, `prompt_only`, `name`, and `category` for a given scene ID.
- In `handleSave`, after saving sort order, also batch-update any custom scenes whose prompt_hint, prompt_only, name, or category changed vs. original data.
- Track which custom scenes have been modified (compare against `customScenesRaw` data).

### Technical details
- **No database changes needed** — `custom_scenes` table already has `prompt_hint` and `prompt_only` columns, and admin RLS policies allow updates.
- The `useUpdateCustomScene` mutation will use `supabase.from('custom_scenes').update({...}).eq('id', id)`.
- The SceneRow component will receive additional props for editing prompt hint and toggling prompt_only.
- The inline prompt textarea will be compact (2-3 rows) with a subtle border, only shown for custom scenes.

