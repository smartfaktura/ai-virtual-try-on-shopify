## Fix home-decor Aesthetic Color scenes — dynamic color injection

### Problem
All 6 home-decor color scenes have the color **hardcoded** as "Dusty Olive Plaster (#9A9882)" in the prompt text alongside the `{{aestheticColor}}` token. When a user selects a different color (e.g., red), `{{aestheticColor}}` resolves correctly but the surrounding hardcoded text still says "Dusty Olive Plaster", creating a conflicting prompt.

### Fix (6 database updates)

**For all 6 scenes** (`decor-color-wall-hero`, `decor-color-console-story`, `decor-color-surface-still`, `decor-color-shelf-story`, `decor-color-reflection-mood`, `decor-color-hero-campaign`):

1. **Remove all hardcoded color references** — replace every instance of "Dusty Olive Plaster (#9A9882)" and "Dusty Olive Plaster" with `{{aestheticColor}}` so the prompt is fully dynamic
2. **Change `suggested_colors`** from `Dusty Olive Plaster (#9A9882)` to **Warm Grey Stone (#A8A39D)** — a neutral grey that works universally with home-decor products
3. When a user picks any color (red, blue, etc.), `{{aestheticColor}}` will resolve to that color throughout the entire prompt

### Technical approach
- Create a temporary `admin-scene-bulk-update` edge function to perform the 6 UPDATE operations via service_role
- Deploy, call it once with the user's admin auth, then delete the function
- Alternatively use a migration if the tool becomes available
