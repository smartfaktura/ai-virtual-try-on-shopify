

# Add Image Paste/Upload + Show Prompt in Draft Scenes

## What we're building

1. **Paste/upload any image** directly on the Trend Watch page to create a draft scene (without needing an Instagram account). The image gets analyzed by the same `analyze-trend-post` edge function, then auto-creates a `scene_recipe`.

2. **Show full prompt** by default on Draft Scene cards (fetching from `prompt_outputs` if a prompt has been generated).

## Changes

### 1. Add "Add Image" button + paste handler to `AdminTrendWatch.tsx`
- Add an "Add from Image" button next to "Add Account" in the feed toolbar (also visible in drafts tab)
- Add a global `paste` event listener on the page so admins can Ctrl+V any image
- When an image is pasted or selected via file picker:
  1. Upload to `scratch-uploads` bucket
  2. Create a temporary `watch_posts` row with `source: 'manual_upload'` (or use the existing manual post flow)
  3. Call `analyze-trend-post` with the post ID
  4. On success, auto-create the `scene_recipe` from analysis and switch to Drafts tab
- Show a small modal/dialog for the paste/upload flow with a preview and "Analyze & Create Draft" button

### 2. New component: `AddImageDraftModal.tsx`
- File input + paste zone (drag & drop optional)
- Shows image preview
- "Analyze & Create Draft Scene" button
- Flow: upload image → create watch_post → analyze → create scene_recipe → close modal, switch to drafts tab
- Uses existing `useReferenceAnalysis` hook for the analyze call

### 3. Update `DraftScenesPanel.tsx` — show prompt by default
- For each draft card, fetch `prompt_outputs` using `usePromptOutputs(recipe.id)`
- If a prompt exists, show it in a `bg-muted` text block below the image (not collapsed, shown by default)
- If no prompt yet, show the `short_description` as before with the "Generate Prompt" button

### 4. Update `analyze-trend-post/index.ts` 
- The function already accepts a `watch_post_id` and reads the image from `media_url`. No changes needed as long as we create the `watch_posts` row with a valid `media_url` pointing to the uploaded image.

## Files to modify/create
- `src/components/app/trend-watch/AddImageDraftModal.tsx` — new modal for paste/upload image
- `src/components/app/trend-watch/DraftScenesPanel.tsx` — add prompt display per card
- `src/pages/AdminTrendWatch.tsx` — add paste listener, "Add Image" button, modal state

