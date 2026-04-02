

# Add Workflow Variation Scenes to Admin Scenes Control

## Problem
The Admin Scenes page (`/app/admin/scenes`) currently only shows:
- Built-in scenes from `mockTryOnPoses` (30 on-model + 30 product scenes)
- Custom scenes from `custom_scenes` DB table

But 6 workflows contain **120+ variation scenes** stored in `workflows.generation_config.variation_strategy.variations` that are invisible to admins. These include Product Listing Set (31), Selfie/UGC Set (12), Flat Lay Set (12), Mirror Selfie Set (30), Interior/Exterior Staging (22), and Picture Perspectives (9).

## Approach
Add a **separate collapsible section per workflow** below the existing scene categories. Each section lists that workflow's variations with inline editing of `label`, `instruction`, `category`, and `preview_url`. Changes save back to the workflow's `generation_config` JSON via a Supabase update.

This keeps the existing scene management untouched (no mixing of data models) while giving full visibility and edit access to workflow-specific scenes.

## Changes

### 1. Add admin RLS policy for workflow updates
Currently the `workflows` table only allows `SELECT` for authenticated users. Need an admin-only `UPDATE` policy.

**Migration SQL:**
```sql
CREATE POLICY "Admins can update workflows"
ON public.workflows FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

### 2. `src/pages/AdminScenes.tsx` — Add workflow variations section

**New component: `WorkflowVariationsSection`** (inside AdminScenes or extracted)
- Fetch workflows (already done via `useQuery(['workflows-admin'])`)
- For each workflow with variations > 0, render a collapsible section
- Each variation row shows:
  - Preview thumbnail (from `preview_url` if available)
  - Label (editable inline)
  - Category chip (editable)
  - Instruction text (editable textarea, collapsible)
  - Preview URL upload button (reuse existing upload pattern)
- "Save Workflow Scenes" button per workflow that patches `generation_config` JSON back to DB
- Filter by the same search query already in use

### 3. Wire up save logic

On save, construct the updated `generation_config` JSON with modified variations and call:
```typescript
supabase.from('workflows').update({ generation_config: updatedConfig }).eq('id', workflowId)
```

## What stays the same
- Existing built-in + custom scene management is untouched
- Sort order, hide/unhide, category overrides all remain as-is
- Workflow variations remain stored in workflow JSON (no new tables)

## Summary

| What | Where |
|------|-------|
| Admin UPDATE policy for workflows | New migration |
| Workflow variations section UI | `src/pages/AdminScenes.tsx` (new section at bottom) |
| Save handler for workflow variation edits | Same file, writes back to `workflows.generation_config` |

