

## White Studio: Prompt-Only Mode (No Scene Image)

### Problem
Sending a scene image for "White Studio" can cause visual bleeding — the AI picks up unwanted elements from the reference photo. A plain white background is better described purely through prompt engineering.

### Solution
When White Studio (`scene_038`) is selected, **skip sending the scene image** and instead inject a strong prompt directive for a clean white background. This applies only to this specific scene.

### Changes

**1. `src/pages/Freestyle.tsx`** — Skip scene image for White Studio
In the generation handler (~line 409-412), add a check: if `selectedScene.poseId === 'scene_038'`, don't set `sceneImageUrl`. The scene's `promptHint` will still be included in the auto-built prompt text.

**2. `src/data/mockData.ts`** — Strengthen the White Studio `promptHint`
Update `scene_038`'s `promptHint` to a much more explicit directive:

```
"Pure clean white background, seamless white infinity backdrop, bright even studio lighting, no environment, no room, no walls visible, no props, no shadows except subtle product shadow, isolated product on solid white, e-commerce hero shot style"
```

**3. `supabase/functions/generate-freestyle/index.ts`** — Add scene-ID-based override
Pass `sceneId` from the frontend payload. In the edge function, if `sceneId === 'scene_038'` and `sceneImage` is present, clear `sceneImage` and append the white-background directive to the prompt. This acts as a backend safety net.

### Flow

```text
User selects White Studio
  ↓
Frontend: sets sceneImageUrl = undefined (no image sent)
Frontend: auto-prompt includes strong white-bg directive from promptHint
  ↓
Backend: double-checks sceneId, ensures no scene image leaks through
Backend: appends white background instruction to enriched prompt
  ↓
AI receives: product image + strong "white background only" text prompt
Result: clean white background, no bleeding
```

### Why this works
- White backgrounds are trivially described in text — no reference image needed
- Eliminates all possible visual contamination from scene images
- Other scenes continue using reference images as before
- The White Studio thumbnail still shows in the UI for selection

