

## Fix: Virtual Try-On Aspect Ratio, Ring Duplication, and Framing Conflicts

### Problem 1: Aspect Ratio Not Applied (Story Format Ignored)

The `generate-tryon` edge function receives `aspectRatio` (e.g., `"9:16"`) in the payload but never uses it. The AI model receives no instruction about image orientation, so it defaults to roughly square compositions regardless of what the user selected.

**Fix:** Inject an explicit aspect ratio / orientation instruction into the prompt so the AI generates the correct shape. Add a line like:
```
IMAGE FORMAT: Portrait orientation (9:16 aspect ratio). The image must be taller than it is wide, formatted for Instagram/TikTok Stories.
```

Mapping:
- `9:16` -> "Portrait orientation (9:16), tall and narrow, Stories format"
- `4:5` -> "Portrait orientation (4:5), slightly taller than wide, Instagram feed format"
- `1:1` -> "Square format (1:1), equal width and height"
- `16:9` -> "Landscape orientation (16:9), wider than tall, cinematic format"

### Problem 2: Ring Duplicated on Both Hands

When framing is "Auto" (null) and the product is a ring, the prompt gives no guidance about which hand to show it on. The AI sees a ring product image and places one on each hand.

**Fix:** When framing is Auto and the product type contains jewelry-related keywords (ring, bracelet, watch, etc.), auto-detect the appropriate framing and inject a targeted instruction:
- For rings: "The ring must appear on ONE hand only, exactly matching the product from [PRODUCT IMAGE]. Do NOT place rings on both hands."
- Add this as a product-specific instruction within the prompt.

### Problem 3: Framing Conflicts with Identity Preservation

The `buildFramingInstruction` function has a fundamental conflict. For framings where the face is not visible (`hand_wrist`, `lower_body`, `back_view`, `side_profile`), it still includes `modelRef` which says "Match the exact skin tone, age, and body characteristics" -- but the main prompt section 1 simultaneously demands "Keep the EXACT same face, facial features". The AI tries to reconcile both, leading to distortions or safety blocks.

**Fix:** Apply conditional identity logic (already documented in memory) inside the edge function:
- For face-visible framings (`full_body`, `upper_body`, `close_up`): Keep full identity preservation (face + body).
- For faceless framings (`hand_wrist`, `neck_shoulders`, `side_profile`, `lower_body`, `back_view`): Replace step 1 identity block with a skin-tone-only instruction and explicitly state "The face is not visible in this framing."

### Technical Changes

**`supabase/functions/generate-tryon/index.ts`**

1. Add `buildAspectRatioInstruction(aspectRatio)` function that returns orientation text
2. Refactor `buildFramingInstruction` to support conditional identity:
   - Accept the full request, not just framing + model
   - For faceless framings: return framing instruction + "Match skin tone and body type only. The face is NOT visible."
   - For face-visible framings: return framing instruction + full identity ref
3. Modify `buildPrompt`:
   - Inject aspect ratio instruction after the quality requirements section
   - For faceless framings, replace the "MUST look exactly like the model" block (step 1) with a softer "match skin tone, body proportions" version
   - Add jewelry-specific guard: when product type matches ring/bracelet/watch keywords and no explicit framing is set, inject "Product worn on ONE hand/wrist only"
4. Add `side_profile` to the framing instructions map (currently missing)

### Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/generate-tryon/index.ts` | Add aspect ratio prompt injection, fix framing identity conflicts, add jewelry guard |

### Prompt Structure After Fix

```text
Create a professional fashion photograph...

IMAGE FORMAT: Portrait 9:16 (Stories). The image must be significantly taller than wide.

CRITICAL REQUIREMENTS:
1. [Full identity block OR skin-tone-only block depending on framing]
2. The clothing MUST look exactly like [PRODUCT IMAGE]...
   [+ jewelry guard if applicable: "Wear on ONE hand only"]
3. Photography style...
4. Quality requirements...
5. FRAMING: [specific framing instruction if selected]

Remember: ...
```

