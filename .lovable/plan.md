

# Fix Short Film Generation: Prompt Length Exceeds Kling 512-Char Limit

## Root Cause

The actual error from the most recent failed job:
```
multiPrompt[0].prompt: size must be between 0 and 512
```

Kling's `omni-video` multi-shot endpoint has a **512 character hard limit per shot prompt**. The current `buildShotPrompt()` in `src/lib/shortFilmPromptBuilder.ts` concatenates ~12 sections of cinematic language (tone preset, image ref, role directive, purpose, lighting, lens, camera motion, subject motion, script line, preservation, aspect ratio hint, production footer) — producing prompts of 500–650 characters. Most exceed the limit.

The prior `job_type` routing bug (already fixed) was the first failure. Once that was fixed, the prompts themselves became the blocker.

## Fix

**File**: `src/lib/shortFilmPromptBuilder.ts` — `buildShotPrompt()` function

Truncate each shot prompt to 512 characters maximum. The approach:

1. Build the prompt as today (all cinematic parts joined).
2. Before returning, check if `prompt.length > 510`. If so, intelligently truncate:
   - Keep the most important parts (image reference, role directive, purpose, camera motion).
   - Drop the lower-priority padding (aspect ratio hint, production footer, preservation note, lighting/lens details).
   - If still over 510, hard-truncate at 510 chars on a word boundary.
3. This preserves the creative intent while respecting the API constraint.

### Priority order for prompt sections (keep → drop):
1. **Keep**: Image reference (`<<<image_N>>>`) — critical for visual consistency
2. **Keep**: Role directive — defines the shot's narrative purpose  
3. **Keep**: Purpose — user-defined shot intent
4. **Keep**: Camera motion — defines movement
5. **Drop if needed**: Tone preset (shorten to key phrase)
6. **Drop if needed**: Lighting, lens, subject motion, script line, preservation, aspect ratio, footer

### Implementation

Replace the current linear concatenation with a priority-based builder that caps at 510 characters:

```typescript
export function buildShotPrompt(...): { prompt: string; negative_prompt: string } {
  const MAX_PROMPT_LENGTH = 510;
  
  // Priority tiers — higher priority = included first
  const priority1: string[] = []; // Must have
  const priority2: string[] = []; // Important  
  const priority3: string[] = []; // Nice to have
  
  // Image ref (P1)
  if (imageIndex) priority1.push(`Feature subject from <<<image_${imageIndex}>>>.`);
  
  // Role directive + purpose (P1)
  priority1.push(roleCine.directive);
  priority1.push(shot.purpose);
  
  // Camera/subject motion (P2)
  // Tone preset shortened (P2)
  // Lighting, lens (P3)
  // Footer, aspect, preservation (P3)
  
  // Build prompt adding tiers until at limit
  let prompt = priority1.join(' ');
  for (const part of [...priority2, ...priority3]) {
    if ((prompt + ' ' + part).length > MAX_PROMPT_LENGTH) break;
    prompt += ' ' + part;
  }
  
  // Hard truncate safety net
  if (prompt.length > MAX_PROMPT_LENGTH) {
    prompt = prompt.slice(0, MAX_PROMPT_LENGTH).replace(/\s\S*$/, '');
  }
  
  return { prompt, negative_prompt: allNegatives.join(', ') };
}
```

## Files to Change

| File | Change |
|------|--------|
| `src/lib/shortFilmPromptBuilder.ts` | Rewrite `buildShotPrompt` with priority-based 510-char cap |

No edge function changes needed — the backend is correct now. This is purely a client-side prompt construction issue.

