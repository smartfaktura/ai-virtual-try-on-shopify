

## Add Side Profile + Regenerate 2 Framing Photos

### Changes

**1. Add `side_profile` framing option**

- Add `'side_profile'` to the `FramingOption` union type in `src/types/index.ts`
- Add config entry in `src/lib/framingUtils.ts` with keywords: `earring`, `earrings`, `ear cuff`, `ear`
- Move earring-related keywords away from `neck_shoulders`
- Add `buildFramingPrompt` case: "Side profile view focusing on the ear and jawline area. The product should be clearly visible on or near the ear."
- Update `neck_shoulders` description to "Necklaces, pendants, chokers" (remove earrings mention)

**2. Regenerate 2 existing photos + create 1 new**

| Photo | Fix |
|-------|-----|
| `neck_shoulders.png` | Faceless crop from chin down to mid-chest, collarbone/jewelry zone only |
| `close_up.png` | Tighter beauty headshot, face fills the frame |
| `side_profile.png` (new) | Side view of head showing ear/jawline area |

Same model (blonde supermodel, white crop top, grey leggings, light grey studio background) for consistency.

**3. Update prompt injection**

- `neck_shoulders` prompt updated to: "...cropped from just below the chin to mid-chest. Do NOT include the face."
- `close_up` prompt updated to: "Tight close-up portrait, face filling most of the frame."

### Files Changed

- `src/types/index.ts` -- add `'side_profile'` to FramingOption type
- `src/lib/framingUtils.ts` -- add side_profile config, move earring keywords, update neck_shoulders description and prompt, update close_up prompt
- `public/images/framing/neck_shoulders.png` -- regenerated (no face)
- `public/images/framing/close_up.png` -- regenerated (tighter crop)
- `public/images/framing/side_profile.png` -- new photo

### No other file changes needed

FramingSelectorChip and FramingSelector are already data-driven from the FRAMING_OPTIONS array, so they automatically pick up the new option.

