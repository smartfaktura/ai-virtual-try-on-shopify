
Yes — exactly right. If the user enables the Voiceover audio layer AND picks AI Director, the AI must write narration for every shot. Currently that already works *in theory* (the VO flag is passed to `ai-shot-planner`), but two gaps remain:

1. If the user enables Voiceover but the planner returns empty `script_line` for some shots (model variance), those shots end up silent with no fallback.
2. If the user picks AI Director with VO **off**, nothing should change — but my earlier proposal would have force-enabled VO. That was wrong. Correct rule: **AI Director respects the user's VO toggle.**

**Fix:**

1. **`src/hooks/useShortFilmProject.ts`**
   - Keep passing the user's actual `audioLayers.voiceover` flag to `ai-shot-planner` (no forcing).
   - After receiving the plan, when VO is enabled: auto-set `vo_enabled: true` per shot whenever `script_line` is non-empty (so the checkbox reflects reality).
   - If VO is enabled but the planner returned zero scripts across all shots, surface a toast: "AI Director couldn't generate narration — try regenerating or add scripts manually."

2. **`supabase/functions/ai-shot-planner/index.ts`**
   - Strengthen the prompt: when `wantVoiceover` is true, every shot ≥2s MUST have a non-empty `script_line` (currently it's strongly suggested, not enforced).
   - Add a server-side guarantee: if VO is on and a returned shot has empty `script_line`, fill it with a short purpose-derived line (e.g. "Crafted for everyday." for `brand_finish`) so no shot is silently empty.
   - Redeploy.

3. **`src/components/app/video/short-film/AudioLayersPanel.tsx`** (small hint)
   - Under the Voiceover toggle: "When on, AI Director will write narration for each shot."

**Result:** Voiceover ON + AI Director = guaranteed narration on every shot. Voiceover OFF + AI Director = silent shots, as expected. User stays in control of the toggle.
