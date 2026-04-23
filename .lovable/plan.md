

## Fix: Remove AI category auto-detection in Add to Discover modal

### Goal
Stop the modal from auto-calling the AI to predict and pre-select a category. User picks the category manually.

### Change — `src/components/app/AddToDiscoverModal.tsx`

1. **Remove the `describe-discover-metadata` invocation** that runs on modal open (the block that AI-guesses category/title/tags from the image).
2. **Keep** the deterministic resolvers we already have:
   - `sceneId` short-circuit (new jobs)
   - Source-job lookup for `scene_name` + `product_type` → `resolveSceneRefByTitleAndCategory`
   - Workflow auto-pick when `sceneId` is a `pis-*` ref
3. **Category state**: leave it empty/unset on open. User selects from the existing dropdown.
4. **Title**: leave empty on open (user types it). No AI suggestion.
5. **Tags**: leave empty (user adds manually if the field exists). No AI suggestion.
6. **Remove now-unused state and helpers** tied only to the AI describe call (loading flag for AI suggestion, the `sceneOptions` payload prep, etc.) — but keep all scene-resolution logic intact.

### Out of scope
- No changes to scene resolution (the `pis-*`/title+category fix from the previous plan still applies).
- No changes to the `describe-discover-metadata` edge function itself (left in place; just not called from this modal).
- No layout/copy changes beyond removing the "AI is suggesting…" loading state if present.

### File touched
```text
EDIT  src/components/app/AddToDiscoverModal.tsx
        - Delete the AI describe-discover-metadata fetch on open
        - Remove related loading state + sceneOptions prep
        - Leave category/title/tags blank for manual user input
        - Preserve all scene_id / sceneRef resolution logic
```

