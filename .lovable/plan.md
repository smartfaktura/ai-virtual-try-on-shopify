

## Fix: AI Replacing Furniture Types Despite "Keep" Instructions

### Root Cause
Two conflicting instructions in the prompt:
1. **Room type descriptions hardcode specific furniture** (line 45): `'Bedroom (Guest)': 'a welcoming guest bedroom with queen/double bed...'` -- this tells the AI to place a double bed regardless of what's actually in the photo.
2. **"Keep & Restyle" prompt is not strong enough** to override the room description's furniture suggestions.

When the user uploads a small guest room with a sofa bed and selects "Keep & Restyle," the AI sees both "keep existing furniture" AND "guest bedroom with queen/double bed" and picks the latter.

### Solution

**File: `supabase/functions/generate-workflow/index.ts`**

1. **When "Keep & Restyle" or "Keep Layout, Swap Style" is selected, strip furniture suggestions from the room type description.** Instead of using the full `ROOM_TYPE_DESCRIPTIONS` (which prescribe specific furniture), use a furniture-neutral version that only describes the room's purpose:
   - Example: `'Bedroom (Guest)'` becomes `'a guest bedroom'` instead of `'a welcoming guest bedroom with queen/double bed, simple nightstand, and hospitality touches'`

2. **Strengthen the "Keep & Restyle" prompt** to explicitly reference analyzing the uploaded photo:
   - Add: "ANALYZE the uploaded photo carefully. Identify EVERY piece of furniture (e.g., sofa bed, desk, shelf). Each piece MUST remain the SAME TYPE -- a sofa bed stays a sofa bed, a desk stays a desk. Do NOT upgrade, resize, or substitute furniture types."

3. **Strengthen the "Keep Layout, Swap Style" prompt** similarly:
   - Add: "ANALYZE the uploaded photo. Identify each furniture piece and its type. Replace with a same-TYPE piece in the new style -- a sofa bed becomes a styled sofa bed, NOT a different furniture category."

4. **Add a universal furniture-realism instruction** that applies to ALL generation modes (including "Replace All"):
   - "CRITICAL: All furniture must be realistically proportioned for the visible room dimensions. Analyze the room's actual walls, floor area, and ceiling height from the photo. Never place furniture that would physically not fit through the door or in the available floor space."

### Changes Summary

| File | Change |
|------|--------|
| `supabase/functions/generate-workflow/index.ts` | Add furniture-neutral room descriptions for Keep modes; strengthen Keep prompts with photo-analysis instructions; add universal furniture-realism block |

### Technical Detail

```text
Current flow:
  Room type "Guest Bedroom" --> "with queen/double bed" (hardcoded)
  + "Keep & Restyle" --> "keep existing furniture" (too weak)
  = AI generates double bed (room description wins)

Fixed flow:
  Room type "Guest Bedroom" --> "a guest bedroom" (neutral, no furniture prescribed)
  + "Keep & Restyle" --> "ANALYZE photo, sofa bed stays sofa bed" (explicit)
  + Universal realism --> "furniture must physically fit the room"
  = AI keeps the sofa bed and restyles it
```

