

# Improve AI Director Shot Planning

## Problems Found

1. **Role mismatch**: The AI planner's system prompt lists generic roles (`"hook", "hero", "detail", "lifestyle", "closing"`) that don't match the actual system roles (`"product_reveal", "detail_closeup", "brand_finish"`, etc.). When the AI returns `"hero"`, the prompt builder can't find matching cinematics in `ROLE_CINEMATICS`, falling back to generic defaults.

2. **Story structure ignored**: The AI receives `storyStructure` as a string label (e.g., `"hook_reveal_detail_closing"`) but doesn't know the actual role sequence (`["hook", "product_reveal", "detail_closeup", "brand_finish"]`). It invents its own shot roles instead of following the user's chosen structure.

3. **Film type context too thin**: The user prompt just says `Film type: product_launch` — no cinematographic guidance. The rich `TONE_PRESETS` and `ROLE_CINEMATICS` data from the prompt builder never reaches the AI planner.

4. **Custom roles not passed**: The `customRoles` field is sent in the request body but the edge function never reads it from the payload.

5. **No `sfx_trigger_at` in AI output**: The AI generates `sfx_prompt` but doesn't set timing offsets, so all SFX fire at shot start.

6. **Scene type mismatch**: AI uses limited scene types (`"product_closeup"`, `"lifestyle_wide"`) while the prompt builder supports 27+ scene types like `"studio_reveal"`, `"macro_closeup"`, `"mood_abstract"`.

## Solution

### 1. Pass structure roles + film context to edge function
**File: `src/hooks/useShortFilmProject.ts`**
- Send the resolved role array (from `STORY_STRUCTURE_OPTIONS`) to the AI planner
- Send film-type description and tone preset text so the AI has cinematographic context
- Send the valid scene_type and camera_motion enum values

### 2. Rewrite AI planner system prompt with accurate schema
**File: `supabase/functions/ai-shot-planner/index.ts`**
- Replace hardcoded role/scene_type/camera_motion lists with the actual values from the system
- Instruct the AI to use the provided structure roles in order
- Add `sfx_trigger_at` to output schema
- Include film-type-specific creative direction in the prompt
- Read `customRoles` from payload and use them when structure is `custom`

### 3. Validate AI response roles against system roles
**File: `supabase/functions/ai-shot-planner/index.ts`**
- Map AI-returned roles to the closest valid system role (e.g., `"hero"` → `"product_reveal"`, `"detail"` → `"detail_closeup"`)
- Validate scene_type and camera_motion against allowed values
- Add `sfx_trigger_at` defaults based on role

### 4. Send richer reference context
**File: `src/hooks/useShortFilmProject.ts`**
- Include selected style/mood preset names and scene preset names in `referenceDescriptions`
- This gives the AI creative direction matching user's chosen visual tone

## Files to Change

| File | Change |
|------|--------|
| `supabase/functions/ai-shot-planner/index.ts` | Rewrite system prompt with correct role/scene/motion enums; read `customRoles` and `structureRoles`; add role mapping/validation; add `sfx_trigger_at` |
| `src/hooks/useShortFilmProject.ts` | Send resolved structure roles, film description, tone preset, style/scene reference names to AI planner |

