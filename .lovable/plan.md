

# Safety Analysis: Prompt Redundancy Cleanup

## What's SAFE to remove (true duplicates)

| Client constant | Edge function equivalent | Identical? |
|---|---|---|
| `PRODUCT_FIDELITY` (line 237, prepended at 1169) | CRITICAL REQUIREMENT #2 (line 560) | Yes — same intent, same detail level |
| `REFERENCE_ISOLATION` (line 235, prepended at 1169) | CRITICAL REQUIREMENT #7 (line 565) | Yes — nearly word-for-word identical |
| `QUALITY_SUFFIX` (line 1077, appended at 1175-1177) | CRITICAL REQUIREMENT #4 (line 562) | Yes — "Ultra high resolution, professional quality" |

These 3 removals are safe. The edge function already says the same thing.

## What's NOT safe to remove

**`buildNegativePrompt` (line 750-755) — has a GAP.**

The client appends 3 negative blocks:
- `BASE_NEGATIVES`: "No watermarks, no text overlays, no chromatic aberration, **no lens flare artifacts, no color banding, no over-saturation**."
- `PRODUCT_NEGATIVES`: "No warped product edges, **no melted or distorted labels**, no duplicated products, **no floating elements. No background from reference image, no original product photo environment**."
- `PERSON_NEGATIVES` (conditional, only for model/hand scenes): "**No extra fingers, no distorted joints, no unnatural hand anatomy, no missing limbs, no fused fingers, no deformed nails, correct human proportions.**"

The edge function's `allNegatives` only contains:
- `config.negative_prompt_additions` = "No watermarks, no text overlays, no chromatic aberration, no warped product edges, no duplicated products."

**Missing from edge function:**
1. `PERSON_NEGATIVES` — critical for hand/model scenes (extra fingers, distorted joints)
2. "no lens flare artifacts, no color banding, no over-saturation"
3. "no melted or distorted labels, no floating elements"
4. "no background from reference image" (though req #7 covers this narratively)

If we blindly remove `buildNegativePrompt`, **hand scenes and model scenes lose finger/anatomy safeguards**.

## Revised Safe Plan

### Step 1: Remove 3 safe duplicates from client builder
**File**: `src/lib/productImagePromptBuilder.ts`
- Remove `PRODUCT_FIDELITY` + `REFERENCE_ISOLATION` prepend (line 1169)
- Remove `QUALITY_SUFFIX` append (lines 1175-1177)
- Delete the now-unused constants: `PRODUCT_FIDELITY`, `REFERENCE_ISOLATION`, `QUALITY_SUFFIX`

**Keep** `buildNegativePrompt` and its constants — the edge function does NOT cover `PERSON_NEGATIVES`.

### Step 2: Lower temperature
**File**: `supabase/functions/generate-workflow/index.ts` (line 752)
- `temperature: 1.0` → `temperature: 0.8`

### Step 3: Update workflow DB config
Slim `prompt_template` in the `workflows` table for slug `product-images` to a minimal line (the verbose version is redundant with CRITICAL REQUIREMENTS).

### Step 4: Negative-to-positive template conversion (DB migration)
Targeted `REPLACE()` on ~650 scene templates:
- `"No mannequin, no model, no hanger."` → `"Product standalone, isolated."`
- `"No model, no mannequin, single garment."` → `"Single garment, product-only."`
- `"No different model, no different garment."` → `"Same model, same garment throughout."`
- `"Single garment folded, no props."` → `"Single garment folded, product-only."`

### What we are NOT touching (confirmed unsafe to remove)
- `buildNegativePrompt` — `PERSON_NEGATIVES` has no edge function equivalent
- Camera directive — not duplicated anywhere
- Brand logo text — not duplicated
- Custom note — not duplicated

### Net result
- ~400 tokens removed per prompt (fidelity + isolation + quality suffix = 3 blocks gone)
- `PERSON_NEGATIVES` preserved for hand/model safety
- Temperature lowered for consistency
- Negative framing converted to positive in templates
- **2 files changed, 1 DB workflow update, 1 DB migration for templates**

