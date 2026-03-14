

## Fix: Stop Suppressing People in Prompt-Only Freestyle Generations

### Problem
When no Model/Product/Scene chips are selected, `wantsPeople` is `false`, causing:
1. **Generic DNA** instead of Photography DNA (loses skin/portrait quality)
2. **"No people, no human figures, no body parts"** injected into negatives — directly contradicting the user's prompt

A keyword list approach is brittle. Users can describe people in infinite ways ("young female," "a couple walking," "chef preparing food," etc.).

### Solution: Let the AI Decide via the Polish Step

Instead of keyword detection, leverage the **existing AI polish call** (which already rewrites the prompt via LLM) to also classify people intent. This is zero-cost since the polish call already happens.

**How it works:**

In `supabase/functions/generate-freestyle/index.ts`:

1. **When `polishPrompt` is ON** (majority of generations): The polish LLM call already processes the user's prompt. Add a simple instruction to the system prompt asking it to prepend `[PEOPLE:YES]` or `[PEOPLE:NO]` before the polished output. Parse this tag from the response to set `wantsPeople`. The LLM understands natural language far better than any keyword list — it will correctly identify "young female model," "a couple," "chef," "someone wearing," etc.

2. **When `polishPrompt` is OFF** (raw mode): For the unpolished path, use a lightweight heuristic but **flip the default** — assume people are wanted unless the prompt clearly describes only objects/scenes/architecture. This is safer because incorrectly adding anatomy constraints is harmless, while incorrectly injecting "No people" destroys the generation.

3. **Fallback**: If no assets AND no prompt text at all, keep current behavior (generic/no-people).

### Changes in `generate-freestyle/index.ts`

**A. Polish path (~line 232):**
- Move `wantsPeople` determination to AFTER the polish step returns
- In the polish system prompt, add: "Before your response, output exactly `[PEOPLE:YES]` if the scene includes any human subjects, or `[PEOPLE:NO]` if it's purely objects/architecture/landscape."
- Parse the tag, strip it from the polished prompt, use result for DNA + negatives

**B. Unpolished path (~line 376):**
- Change default: when no assets are selected AND prompt exists, default `wantsPeople = true` (safe default — anatomy rules are harmless for non-people prompts, but "No people" kills people prompts)
- Only set `wantsPeople = false` when prompt is empty or very short

**C. `buildNegativePrompt` (line 96):**
- No changes needed — it already accepts `hasPeople` param correctly

### Why This Is Better Than Keywords
- **LLM understands context**: "leather jacket on marble" = no people; "leather jacket on a tall man" = people
- **Zero maintenance**: No keyword list to update
- **Zero extra cost**: Piggybacks on the existing polish API call
- **Language-agnostic**: Works regardless of how users phrase things

### Files Changed
| File | Change |
|------|--------|
| `supabase/functions/generate-freestyle/index.ts` | Add people-classification to polish prompt; parse `[PEOPLE:YES/NO]` tag; flip default for unpolished path |

