

# Brand Models Page — Name, Badge, Loading & UX Improvements

## Changes

### 1. Add Model Name Input
- Add a text input field at the top of the generator form: "Model Name" (e.g., "Sarah", "Alex")
- Pass the name to the edge function so it's stored in `user_models.name` instead of the auto-generated "Female Model" / "Male Model"
- On model cards, show an edit (pencil) icon on hover to rename inline

### 2. Change "MY MODEL" → "BRAND MODEL"
- Update the badge text in `ModelCard` on the Brand Models page
- Update the badge in `ModelSelectorChip.tsx` where user models are displayed
- Position the badge **inside the image area**, overlaying near the bottom-left (already done, just change text)

### 3. Improved Loading State with VOVV.AI Team Avatars
- Replace the generic pulsing silhouettes with actual VOVV.AI team member avatars from `TEAM_MEMBERS` (Sophia, Luna, Sienna, Kenji, etc.)
- Show them rotating in a carousel/grid with subtle fade transitions, matching the branded loading pattern used elsewhere in the app
- Keep the rotating tips text below

### 4. Window Close Behavior — Inform User
- The edge function runs server-side, so closing the window **will NOT cancel** the generation — the model will still be created and appear when the user returns
- Add a small info note below the generate button: "Generation happens server-side. You can safely navigate away — your model will appear here when ready."
- This is purely informational; no code change needed on the backend

### 5. Improve "Distinctive Trait" Field
- Rename label from "Distinctive Trait (optional)" → **"Signature Feature"**
- Add a helper subtitle: "Add a unique characteristic to make your model stand out"
- Keep the same options (Freckles, Dimples, Sharp jawline, etc.)

## Files Changed

| File | Change |
|------|--------|
| `src/pages/BrandModels.tsx` | Add name input, rename badge to "BRAND MODEL", team avatar loading state, rename Distinctive Trait, add server-side info note, inline rename on model cards |
| `src/components/app/freestyle/ModelSelectorChip.tsx` | Change "MY MODEL" badge text to "BRAND MODEL" |

No database or edge function changes needed.

