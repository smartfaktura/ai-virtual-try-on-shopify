

## Fix: "Full Height" Prompt Being Overridden by Default Upper-Body Framing

### Problem
When a model reference is selected and framing is left on "Auto", the edge function injects a default framing instruction that says "upper body + head visible". This overrides the user's explicit "full height" request in the prompt text, causing the AI to crop at the knees instead of showing the full figure.

### Solution
Add keyword detection in the edge function so that when the user's prompt contains full-body intent words, the system either auto-injects the `full_body` framing or skips the restrictive default upper-body framing entirely.

### Changes

**File: `supabase/functions/generate-freestyle/index.ts`**

1. Add a helper function `detectFullBodyIntent(prompt)` that checks for keywords like "full body", "full height", "head to toe", "full figure", "full length", "entire body".

2. Modify the default framing logic (around line 279) so that when `!framing` but `detectFullBodyIntent(prompt)` is true, inject the `full_body` framing instruction instead of the upper-body default:

```text
Before (line 278-284):
  if (!framing) {
    layers.push("FRAMING: Ensure the subject's full head, hair, and upper body...");
  }

After:
  if (!framing) {
    if (detectFullBodyIntent(rawPrompt)) {
      // User explicitly wants full body — inject full_body framing
      layers.push("FRAMING: Full body shot, head to toe...");
    } else {
      layers.push("FRAMING: Ensure the subject's full head, hair, and upper body...");
    }
  }
```

3. Apply the same logic in the condensed multi-reference path (lines 151-166) — if no explicit framing is set but the prompt contains full-body keywords, auto-inject the full_body framing instruction there too.

### Technical Detail

New helper (added near the top of the file, after `detectSelfieIntent`):

```typescript
const FULL_BODY_KEYWORDS = [
  'full body', 'full height', 'head to toe', 'full figure',
  'full length', 'entire body', 'whole body', 'from head',
];

function detectFullBodyIntent(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  return FULL_BODY_KEYWORDS.some(kw => lower.includes(kw));
}
```

This ensures the user's natural language intent ("full height") is respected instead of being silently overridden by the system's default upper-body framing.

