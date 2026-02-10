
## Strengthen Scene Matching in AI Generation

### Problem

When a scene like "Autumn Park" is selected, the AI receives the scene reference image but the instructions are too weak. Currently the prompt says:

- **In the prompt text**: `Scene/Environment: [description]` (appended to user prompt)
- **In the system polish**: "Match the lighting direction and color temperature" 
- **In the content array label**: "match this setting, lighting direction, and color temperature"

The AI treats the scene image as a loose lighting reference rather than a **mandatory environment** to place the subject in. It often ignores the scene entirely when the user's text prompt doesn't explicitly describe that environment.

### Solution

Strengthen scene instructions at three levels:

1. **Content array label** (what the AI sees next to the scene image) -- make it a hard requirement to reproduce the environment, not just lighting
2. **Polish layer** -- strengthen the ENVIRONMENT instruction to demand placing the subject IN the scene
3. **Prompt text** -- make the scene description more prominent

### Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/generate-freestyle/index.ts` | Strengthen scene label text and ENVIRONMENT polish layer |
| `src/pages/Freestyle.tsx` | Make scene description more prominent in the prompt |

### Technical Details

**Edge function -- content array label (line 330-331):**

Change from:
```
"SCENE/ENVIRONMENT REFERENCE IMAGE -- match this setting, lighting direction, and color temperature:"
```
To:
```
"SCENE/ENVIRONMENT REFERENCE IMAGE -- You MUST place the subject IN this exact environment/location. Reproduce the same setting, background elements, lighting direction, color temperature, and atmosphere. Do NOT use a different environment:"
```

**Edge function -- polish layer (lines 168-171):**

Change from:
```
"ENVIRONMENT: Match the lighting direction and color temperature of the SCENE REFERENCE IMAGE. Integrate the subject naturally into the environment with consistent shadows and reflections."
```
To:
```
"ENVIRONMENT: The subject MUST be placed in the EXACT environment shown in the SCENE REFERENCE IMAGE. Reproduce the same location, background elements, props, foliage, architecture, and atmosphere. Match the lighting direction, color temperature, and time of day. The final image should look like it was photographed in that exact location. Do NOT substitute a different environment or background."
```

**Freestyle.tsx -- scene prompt text (line 183):**

Change from:
```tsx
finalPrompt = `${prompt}. Scene/Environment: ${selectedScene.description}`;
```
To:
```tsx
finalPrompt = `${prompt}. MANDATORY SCENE: Place the subject in this environment — ${selectedScene.description}. The background and setting must match the scene reference image exactly.`;
```
