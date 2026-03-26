

# Fix: Context-Aware Outfit Completion Instead of Blanket "Must Wear Pants"

## Problem

The current directive says: *"The model must NEVER appear without pants/skirt/shorts."* This is too rigid — if the user's prompt or scene implies sportswear, beachwear, swimwear, or activewear, forcing full bottoms contradicts the creative intent. A user generating a sports jacket on a running track should see shorts or athletic wear, not formal trousers.

## Solution

Replace the hardcoded "must wear pants" rule with a **context-aware** directive that tells the AI to complete the outfit **appropriately for the scene/prompt context**, while still preventing the "naked legs with a jacket" problem for standard fashion shoots.

### File: `supabase/functions/generate-freestyle/index.ts`

**1. Update both OUTFIT COMPLETION blocks (lines 235 and 531)**

Replace the rigid rule with:

```
OUTFIT COMPLETION: The product is the hero piece. The model must wear 
a COMPLETE outfit — never appear partially dressed or missing clothing. 
Choose complementary garments (bottoms, shoes, accessories) that match 
the scene context and style: e.g. tailored trousers for studio/urban, 
shorts or athletic wear for sport/outdoor/active scenes, swimwear for 
beach/pool settings. The outfit must look intentional and styled — 
never accidentally incomplete.
```

This keeps the core protection (no accidentally half-dressed models) while letting the AI pick contextually appropriate clothing based on the prompt and scene.

**2. No other changes needed**

The prompt already contains scene context (scene description, user text) that the AI can read to determine the appropriate outfit style. We just need to stop over-constraining it.

## What This Does NOT Do
- No UI changes
- No database changes
- No changes to fallback or model selection logic

## Files Modified
- `supabase/functions/generate-freestyle/index.ts` — update 2 outfit completion blocks

