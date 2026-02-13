

## Fix: Remaining Framing Conflicts in Standard Path

### Problems Found

The `noFaceFramings` fix from the last edit only covers the **condensed path** (2+ reference images). But when a user selects just a model (no product, no scene), the code takes the **standard path** (lines 244-270) where the MODEL IDENTITY block still demands full face matching for ALL framings -- causing the same timeout contradiction for `back_view` and `lower_body`.

Additionally, the `close_up` framing uses "shoulders and chest upward" which risks triggering safety filters.

### Scene + Framing: No Issues

The scene instruction ("placed in EXACT environment from SCENE IMAGE") is purely about background/environment and works with any body crop. No changes needed.

### Changes

**File: `supabase/functions/generate-freestyle/index.ts`**

1. **Standard path MODEL IDENTITY (line 245-249)**: Make the identity instruction conditional on framing, same pattern as the condensed path:
   - If framing is `hand_wrist`, `lower_body`, or `back_view`: use "Match skin tone, body type, and physical characteristics" without face-matching demands
   - All other framings: keep the current full identity matching instruction

2. **Standard path default framing (lines 264-269)**: The existing `if (!framing)` block already correctly skips when framing is set -- no change needed here.

3. **Rephrase `close_up` framing** in both the condensed path (line 151) and standard path (line 299):
   - Current: "Close-up shot from the shoulders and chest upward"
   - New: "Close-up portrait from the shoulders upward, emphasizing fine product details. Professional headshot composition."

**File: `src/lib/framingUtils.ts`**

4. **Update `close_up` prompt** (line 86) to match the safer wording for consistency.

### Summary of All Framings After Fix

| Framing | Face visible? | Model instruction | Safety risk | Scene conflict |
|---------|--------------|-------------------|-------------|----------------|
| full_body | Yes | Full identity match | None | None |
| upper_body | Yes | Full identity match | None | None |
| close_up | Yes | Full identity match | Fixed (rephrased) | None |
| hand_wrist | No | Skin tone/body only | Already fixed | None |
| neck_shoulders | No (partial) | Skin tone only | Already fixed | None |
| lower_body | No | Skin tone/body only | None | None |
| back_view | No | Body match only | None | None |

### Technical Details

The key change in the standard path MODEL IDENTITY block (~line 245):

```text
// Current (always full identity):
"MODEL IDENTITY: The generated person MUST be the EXACT same person... 
 face must be recognizable..."

// New (conditional):
if framing in [hand_wrist, lower_body, back_view]:
  "MODEL IDENTITY: Match the skin tone, body type, and physical 
   characteristics of [MODEL IMAGE]. Face is not visible in this 
   framing composition."
else:
  (keep current full identity instruction)
```

### Files Changed
- `supabase/functions/generate-freestyle/index.ts` -- conditional MODEL IDENTITY in standard path + rephrase close_up
- `src/lib/framingUtils.ts` -- rephrase close_up for consistency

### No other changes needed
- No UI changes
- No database changes
- Scene logic is clean

