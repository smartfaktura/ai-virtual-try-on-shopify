

## Fix Perspective Library Labels — Not "Freestyle", Hide Technical Prompts

### Problem
Perspective generations are stored in `freestyle_generations` and the library maps all freestyle records to `source: 'freestyle'`, `label: 'Freestyle'`, and shows the raw technical prompt (the full photography DNA text). This is wrong — they should show as workflow results with a clean label and no exposed prompt.

### Solution

#### 1. Add `workflow_label` column to `freestyle_generations` (migration)
Add a nullable `workflow_label` text column to distinguish perspective results from regular freestyle. No FK needed — just a label string like `"Product Perspectives"` or the variation label.

#### 2. `src/hooks/useGeneratePerspectives.ts` — Pass workflow metadata in payload
Add `workflow_label` (e.g., `"Product Perspectives — Back Angle"`) to the payload so the edge function stores it.

#### 3. `supabase/functions/generate-freestyle/index.ts` — Save `workflow_label`
Write `workflow_label` from the payload into the new column on insert.

#### 4. `src/hooks/useLibraryItems.ts` — Use `workflow_label` for label and hide prompt
- Select `workflow_label` in the freestyle query
- If `workflow_label` is set, use it as `label` instead of `'Freestyle'`
- If `workflow_label` is set, set `source` to `'generation'` (not `'freestyle'`) so it shows as "Generation" in the detail modal
- If `workflow_label` is set, suppress the prompt (set `prompt: undefined`)

#### 5. `src/components/app/LibraryDetailModal.tsx` — No changes needed
The existing logic already hides prompt when `item.prompt` is falsy and shows `item.label` as the title. By setting `label` correctly and `prompt: undefined` in the hook, the modal will display correctly.

### Files changed
| File | Change |
|------|--------|
| Migration | Add `workflow_label text` column to `freestyle_generations` |
| `src/hooks/useGeneratePerspectives.ts` | Add `workflow_label` to payload |
| `supabase/functions/generate-freestyle/index.ts` | Save `workflow_label` on insert |
| `src/hooks/useLibraryItems.ts` | Use `workflow_label` for label, hide prompt for workflow items |

