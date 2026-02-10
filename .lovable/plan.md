

## Fix Prompt Display and Enrich Scene Descriptions

### Problem 1: Internal instructions visible to users

When a scene is selected, the code builds a `finalPrompt` that includes internal AI instructions like "MANDATORY SCENE: Place the subject in this environment..." This augmented prompt is passed to `saveImages()` and stored in the database. When users view their images in the Library, they see these raw system instructions instead of just their original prompt.

**Fix**: Save the original user `prompt` to the database, not `finalPrompt`. The `finalPrompt` is only needed for the AI generation call.

**File**: `src/pages/Freestyle.tsx` (line 234)

Change:
```tsx
prompt: finalPrompt,
```
To:
```tsx
prompt: prompt,
```

### Problem 2: Scene descriptions lack pose/action context

Current descriptions are short environment-only lines like "Fall foliage with warm golden tones and soft light." They don't tell the AI what the person should be *doing* in that scene, which leads to generic standing poses regardless of context.

**Fix**: Enrich each scene description to include the subject's pose, body language, and interaction with the environment. This gives the AI stronger guidance for natural-looking results.

**File**: `src/data/mockData.ts` -- update `description` for all on-model scenes (pose_001 through pose_030). Examples:

| Scene | Current | Updated |
|-------|---------|---------|
| Studio Front | "Classic lookbook pose, full body front view with clean white background" | "Model standing facing camera in a classic lookbook pose, full body front view, relaxed shoulders, clean white studio background" |
| Urban Walking | "Candid street style, walking in city with golden hour light" | "Model walking confidently down a city street, mid-stride with natural arm swing, candid street style, golden hour warm light" |
| Relaxed Seated | "Casual seated pose in modern interior with natural light" | "Model sitting casually in a modern chair, one leg crossed, leaning back relaxed, natural window light in contemporary interior" |
| Coffee Shop Casual | "Relaxed pose at cafe table with natural morning light" | "Model sitting at a cafe table holding a coffee cup, relaxed posture, soft smile, natural morning light through large cafe windows" |
| Beach Sunset | "Coastal lifestyle scene with golden sunset backdrop" | "Model walking barefoot along the shore at golden hour, wind gently blowing hair, relaxed coastal lifestyle mood" |
| Autumn Park | "Fall foliage with warm golden tones and soft light" | "Model walking along a tree-lined park path surrounded by fall foliage, hands in pockets, warm golden tones and soft dappled light" |
| Park Bench | "Casual outdoor pose on wooden park bench with greenery" | "Model sitting casually on a wooden park bench, one arm resting on the backrest, lush greenery and dappled sunlight" |
| Rooftop City | "Urban rooftop with city skyline in background at dusk" | "Model standing at a rooftop railing gazing over the city skyline, relaxed lean, twilight sky with city lights below" |
| Gym & Fitness | "Athletic setting with gym equipment and natural light" | "Model in active stance near gym equipment, confident athletic pose, natural light streaming into modern fitness space" |
| Resort Poolside | "Luxury resort pool area with warm golden light" | "Model lounging on a poolside daybed at a luxury resort, relaxed summer pose, warm golden afternoon light reflecting off water" |

Similar enrichments will be applied to all 30 on-model scenes (Studio, Lifestyle, Editorial, Streetwear categories) -- each will describe the subject's pose, body language, and interaction with the environment.

### Technical Details

The changes are minimal:
1. One line change in `Freestyle.tsx` to save `prompt` instead of `finalPrompt`
2. Update all 30 scene `description` strings in `mockData.ts` to include pose/action context

No edge function changes needed -- the scene description is already injected into the AI prompt via `finalPrompt` construction and the ENVIRONMENT polish layer.
