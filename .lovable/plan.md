

# Two Fixes: Seedream 1:1 Aspect Ratio + Revert Aggressive Scene Angle Matching

## Issue 1: Seedream Not Respecting 1:1 Aspect Ratio

**Root cause**: When Seedream receives reference images (via `image` field), it tends to output at the input image's resolution/aspect rather than the requested `aspect_ratio`. The prompt text that says "Output aspect ratio: 1:1" is stripped by `cleanPromptForSeedream` (line 426-429), so Seedream has no textual reinforcement of the ratio.

**Fix**: Keep the `Output aspect ratio:` line in the prompt for Seedream instead of stripping it. Modify `cleanPromptForSeedream` to preserve the aspect ratio line rather than removing everything after it.

### Changes in `supabase/functions/generate-freestyle/index.ts`:

**A. `cleanPromptForSeedream` (~line 425-429)**: Instead of stripping the "Output aspect ratio:" block entirely, extract and preserve it:
```typescript
// Strip everything AFTER the aspect ratio line, but keep the ratio instruction itself
const aspectIdx = prompt.indexOf("Output aspect ratio:");
if (aspectIdx !== -1) {
  const lineEnd = prompt.indexOf("\n", aspectIdx);
  const aspectLine = lineEnd !== -1 ? prompt.substring(aspectIdx, lineEnd) : prompt.substring(aspectIdx);
  prompt = prompt.substring(0, aspectIdx).trimEnd() + "\n\n" + aspectLine.trim();
}
```

---

## Issue 2: Scene Angle Matching Too Aggressive

**Root cause**: The recent change added "Match the scene's camera angle, viewpoint" and "Replicate the exact perspective and viewing angle" to scene instructions. This causes Nano Banana to obsess over replicating the exact camera position from the scene reference, often at the expense of proper product display and composition.

**Fix**: Revert to softer language — use the scene for environment, lighting, and atmosphere while allowing the AI creative freedom on camera angle. Remove "Replicate the exact perspective and viewing angle" and the "camera angle, viewpoint" matching.

### Changes in `supabase/functions/generate-freestyle/index.ts`:

**B. Line 223** (scene+model): Revert to:
```
"Place the person naturally INTO the environment shown in [SCENE REFERENCE]. Match the scene's lighting direction, color temperature, and ambient shadows on the person's body and face. The person must appear physically present in this space — correct perspective, scale relative to surroundings, feet/body grounded on surfaces, consistent shadow direction. Ignore any products or people already in the scene image."
```

**C. Line 225** (scene-only): Revert to:
```
"Use [SCENE REFERENCE] for environment, lighting, atmosphere. Ignore any products in the scene image."
```

This restores the original behavior where scenes guide the environment/mood without forcing the AI to copy exact camera angles.

## Files Modified
- `supabase/functions/generate-freestyle/index.ts` — 3 changes

