

## Fix: Hand/Wrist Framing Timeout

### Root Cause
The generation timed out because the AI model received **contradictory instructions**:
- The MODEL requirement says: *"The person must be the exact individual from [MODEL IMAGE] -- same face, hair, skin tone, body"*
- The Hand/Wrist framing says: *"Do NOT include the face"*

The AI struggles to reconcile "show this exact face" with "don't show a face," causing it to loop until timeout (90s x 2 attempts = timed out).

### Fix

**File: `supabase/functions/generate-freestyle/index.ts`**

1. **Modify the MODEL instruction in the condensed path** (around line 117-120): When framing is `hand_wrist`, `lower_body`, or `back_view`, change the MODEL line from *"same face, hair, skin tone, body"* to *"match skin tone and body type only -- face is not visible in this framing"*. This removes the contradiction.

2. **Remove the duplicate `return parts.join("\n")`** on line 169 (leftover from the last edit).

### Technical Detail

The condensed path MODEL instruction (line 119-120) will be modified like this:

```text
// Current (always):
"MODEL: The person must be the exact individual from [MODEL IMAGE] — 
 same face, hair, skin tone, body..."

// New (when framing is hand_wrist, lower_body, or back_view):
"MODEL: Match the skin tone, body type, and physical characteristics 
 of the person in [MODEL IMAGE]. Face is not visible in this framing."

// New (all other framings — unchanged):
"MODEL: The person must be the exact individual from [MODEL IMAGE] — 
 same face, hair, skin tone, body..."
```

This way the AI only tries to replicate the face when the framing actually shows it.

### Files Changed
- `supabase/functions/generate-freestyle/index.ts` -- conditional MODEL instruction + remove duplicate return

### No other changes needed
- The framing prompts themselves are fine
- Credits from the failed attempt were already refunded
- No UI changes required
