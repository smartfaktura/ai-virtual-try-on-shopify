

## Add bulk "personDetails" toggle in Import Scenes modal

In `/app/admin/product-image-scenes` → "Import to specific category" → Step 2 (Configure), add a one-click control next to the existing **Sub-category for all scenes** picker that toggles the `personDetails` trigger block on every scene being imported.

### Change (single file: `src/components/app/ImportFromScenesModal.tsx`)

In the bulk-controls bar (lines 333–405), add a second control on the right side: a small button labeled **+ Add personDetails to all** / **− Remove personDetails from all**.

Behavior:
- Reads current state across all configs:
  - If **every** scene already has `personDetails` in `trigger_blocks` → button shows "Remove personDetails from all" and clicking it strips the trigger from every config.
  - Otherwise → button shows "Add personDetails to all" and clicking it adds `personDetails` to every config (no duplicates).
- Single click updates all imported scenes at once. Per-scene checkboxes still work afterward for fine-tuning.
- Uses the existing `Users` (or `UserCheck`) lucide icon for clarity.

### Why
`personDetails` is needed on most apparel/accessory scenes during import. Today admins must check it 10–20 times per import session. One bulk toggle removes that friction without changing the per-scene UI.

### Validation
- Open Import Scenes modal in any category → select 5+ scenes → Step 2 shows the new "Add personDetails to all" button next to the sub-category picker.
- Click it → every scene card's `personDetails` checkbox becomes checked.
- Click again → all become unchecked.
- Import → DB rows have `trigger_blocks` containing `personDetails` as expected.

### Out of scope
- No other trigger gets a bulk control (only `personDetails`, per request).
- No changes to Step 1, scene defaults, or the analyze flow.
- No schema, edge function, or prompt-builder changes.

