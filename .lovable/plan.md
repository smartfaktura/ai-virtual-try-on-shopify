

# Pass Existing Prompt to "Add as Scene" Modal

## Problem
When clicking "Add as Scene" on a freestyle image, the modal calls an AI edge function to generate a new prompt hint from scratch. But the image already has a prompt that was used to generate it — that prompt should be used directly as the `promptHint` pre-fill.

## Changes

### 1. Extend `AddSceneModal` props to accept an optional `sourcePrompt`
- Add `sourcePrompt?: string` to `AddSceneModalProps`
- In `analyzeImage`, still call the AI for `name`, `description`, `category` auto-detection, but skip generating a prompt hint
- After analysis, set `promptHint` from `sourcePrompt` (if provided) instead of relying on the AI or leaving it blank
- If no `sourcePrompt` passed, fall back to `data.description` as before

### 2. Pass the image's prompt from FreestyleGallery
- Change `onAddAsScene` callback signature from `(url: string)` to `(url: string, prompt: string)`
- In `ImageCard`, pass `img.prompt` alongside `img.url` when calling `onAddAsScene`
- Store both `sceneModalUrl` and `sceneModalPrompt` in state
- Pass `sourcePrompt={sceneModalPrompt}` to `AddSceneModal`

### 3. Pass the prompt from LibraryDetailModal
- Same pattern: pass `item.prompt` (or equivalent field) as `sourcePrompt` to `AddSceneModal`

### Result
The prompt hint textarea will show the actual generation prompt, so the admin can verify/edit it before saving. No new AI call needed for the prompt — the AI still handles name/description/category detection from the image.

