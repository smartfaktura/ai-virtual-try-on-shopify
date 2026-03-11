

## Fix: Remove emojis from toast notifications + Timeout explanation

### Why timeouts happen

The generation timed out because the backend has a ~90-100s watchdog. If the AI model takes longer than that (common with Pro model + complex prompts + reference images), the job is marked failed and credits are auto-refunded. This is expected behavior — retrying usually works.

### Changes: Remove emojis from all toast messages

**`src/hooks/useGenerationQueue.ts`** (line 191):
- `'⏱ Generation timed out. Your credits have been refunded.'` → `'Generation timed out. Your credits have been refunded.'`

Additionally, scan all toast calls across the codebase for emoji usage and remove any found. Based on the search, line 191 is the only toast with an emoji character.

Single line change, no structural modifications.

