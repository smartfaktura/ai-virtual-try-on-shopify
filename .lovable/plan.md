## Fix: AI Shot Planner reliability — use tool calling for structured output

### Problem

The `ai-shot-planner` edge function asks the AI model to return JSON in free text, then uses regex (`/\{[\s\S]*\}/`) to extract it. When the model wraps output in markdown code fences (` ```json ... ``` `) or adds commentary, the regex either fails or captures malformed JSON, causing the "AI planning failed, using auto plan instead" error.

### Solution

Switch from free-text JSON extraction to **tool calling** — the AI gateway's structured output mechanism. This guarantees valid JSON matching our schema every time, eliminating parse failures entirely.

### Changes

**`supabase/functions/ai-shot-planner/index.ts`**

1. Add a `tools` array and `tool_choice` to the AI gateway request body, defining a `generate_shot_plan` function with the exact schema (music_direction string + shots array with all required fields and enums).

2. Parse the response from `data.choices[0].message.tool_calls[0].function.arguments` instead of regex-extracting from `content`.

3. Keep the existing regex-based parsing as a **fallback** in case the model returns content instead of a tool call (defensive coding).

4. Strip the "Return ONLY valid JSON" instruction block from the system prompt since the tool schema now enforces structure.

### Technical detail

The tool schema will enforce:
- `music_direction`: string
- `shots`: array of objects with typed fields (`role` as enum of VALID_ROLES, `scene_type` as enum, `camera_motion` as enum, `duration_sec` as integer, etc.)

This means the sanitization/snap logic (lines 305-333) still runs as a safety net but should rarely need to correct anything.
