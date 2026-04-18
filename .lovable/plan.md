
Raise the cap to 15s for all intents.

**Edits:**
1. `supabase/functions/ai-shot-planner/index.ts` — set every value in `INTENT_MAX` to 15 (and the fallback `cap` stays 15).
2. `src/lib/commerceVideo/durationPlanner.ts` — set every `INTENT_RANGES` entry to `[12, 15]` (or similar) so the client targets ~15s.

**Result:** All intents (social, PDP, performance ad, etc.) plan and cap at 15 seconds, matching the legacy Short Film behavior.

After approval I'll deploy `ai-shot-planner`.
