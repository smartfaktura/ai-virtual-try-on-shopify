

## Comprehensive Audit: Creative Drops Flow -- Issues & Fixes

This plan covers security gaps, data integrity problems, missing backend logic, and error handling weaknesses across the full Creative Drops pipeline.

---

### 1. SECURITY: `creative_drops` has no INSERT policy

The `creative_drops` table has RLS enabled with SELECT and UPDATE policies, but **no INSERT policy**. When the backend trigger service (which doesn't exist yet) tries to create drop records, it will fail unless using the service role key. More critically, if any frontend code ever attempts to insert a drop, it will silently fail.

**Fix**: Add an INSERT policy for the service role (or for authenticated users if drops can be user-initiated), and also add a DELETE policy for cleanup:

```sql
CREATE POLICY "Service role can insert drops"
  ON public.creative_drops FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own drops"
  ON public.creative_drops FOR DELETE
  USING (auth.uid() = user_id);
```

---

### 2. SECURITY: `creative_schedules` UPDATE policy has no WITH CHECK

The UPDATE policy uses `USING (auth.uid() = user_id)` but has no `WITH CHECK` clause. This means a user could theoretically update the `user_id` column to another user's ID, transferring ownership. This is a data integrity risk.

**Fix**: Add `WITH CHECK (auth.uid() = user_id)` to the update policy:

```sql
DROP POLICY "Users can update their own schedules" ON public.creative_schedules;
CREATE POLICY "Users can update their own schedules"
  ON public.creative_schedules FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Same fix for `creative_drops` UPDATE policy.

---

### 3. DATA: "Generate Now" saves schedule but never triggers generation

When `deliveryMode === 'now'`, the wizard saves a `creative_schedules` row with `frequency: 'one-time'` and `start_date: now()`, then shows a success toast saying "Drop created -- generating now!" But **no code actually triggers generation**. There is no edge function that reads the schedule, creates a `creative_drops` record, enqueues generation jobs, or dispatches them. The user sees a success message but nothing happens.

**Fix**: Create a `trigger-creative-drop` edge function that:
1. Reads the schedule config
2. Creates a `creative_drops` record
3. For each product x workflow combination, enqueues generation jobs via `enqueue_generation` RPC
4. Updates the schedule's `next_run_at` (or marks as completed for one-time)

Wire the wizard to call this function after saving when `deliveryMode === 'now'`.

---

### 4. DATA: `model_ids` column is `UUID[]` but wizard saves string mock IDs

The `creative_schedules.model_ids` column is typed as `UUID[]` in the database. But mock model IDs like `"model_1"`, `"model_2"` from `mockModels` are NOT valid UUIDs. Inserting them will cause a database error:

```
invalid input syntax for type uuid: "model_1"
```

Custom models from the `custom_models` table have proper UUIDs, but mock models do not.

**Fix**: Either change the column type to `TEXT[]`, or filter out non-UUID mock model IDs before saving. Since mock models are placeholder data, the cleanest fix is to change the column to `TEXT[]` so it accepts both mock IDs (for development) and real UUIDs.

---

### 5. DATA: `selected_product_ids` column is `UUID[]` but wizard sends strings

Same issue as above -- the column type is `UUID[]`. If product IDs from the database are proper UUIDs this works, but the type mismatch with the `Set<string>` conversion (`Array.from(selectedProductIds)`) should be verified. This is likely fine since product IDs come from the `user_products` table which uses UUID primary keys, but worth noting.

---

### 6. LOGIC: Cost estimate is per-workflow but doesn't account for per-product multiplication

The credit estimate shows `imagesPerDrop x workflows`, but the actual generation will run each workflow for EACH selected product. If a user selects 5 products and 3 workflows with 25 images each, the actual cost is `5 x 3 x 25 x costPerImage`, not `3 x 25 x costPerImage`.

The current estimate dramatically understates the real cost, which will cause credit balance surprises.

**Fix**: Multiply by product count in `calculateDropCredits`, or adjust the wizard to clarify that `imagesPerDrop` means "per product per workflow". Update the calculator:

```typescript
export function calculateDropCredits(
  workflows: WorkflowCostConfig[],
  imagesPerDrop: number,
  frequency: string,
  productCount: number = 1  // NEW parameter
): DropCostEstimate {
  // Each workflow runs for each product
  const breakdown = workflows.map(wf => ({
    ...wf,
    imageCount: imagesPerDrop * productCount,
    subtotal: imagesPerDrop * productCount * getCostPerImage(...),
  }));
}
```

---

### 7. LOGIC: `hasCustomScene` is always `false`

In the wizard (line 219), `hasCustomScene` is hardcoded to `false` for every workflow. But users can select custom scenes from their scene library. If a user has custom scenes selected, the cost should be 15 credits (model + scene) instead of 12. This undercharges users.

**Fix**: Set `hasCustomScene` based on whether any selected scenes in `workflowSceneSelections[w.id]` come from custom scenes (vs. built-in workflow variations).

---

### 8. ERROR: Wizard doesn't handle save errors gracefully

The `saveMutation.onError` callback (line 386) shows a generic "Failed to create schedule" toast. It doesn't show the actual error message, so if the UUID type mismatch (issue #4) causes a DB error, the user has no idea what went wrong.

**Fix**: Pass the error message to the toast:

```typescript
onError: (error: Error) => toast.error(
  editingScheduleId 
    ? `Failed to update: ${error.message}` 
    : `Failed to create: ${error.message}`
),
```

---

### 9. LOGIC: No validation that 0 scenes = "all scenes"

When a user selects a workflow but doesn't expand the Scenes section and leaves 0 scenes selected, the `selected_variation_indices` array will be empty (`[]`). In `generate-workflow`, empty `selected_variations` means "generate ALL variations" (line 501-506). This is undocumented behavior -- the user thinks they selected nothing, but will get everything, which costs more credits than expected.

**Fix**: Either auto-select all scenes when a workflow is first selected (so the UI matches the behavior), or require at least 1 scene to be selected (add to validation in `canNext()`). The clearest UX is to auto-select all scenes on first selection.

---

### 10. MISSING: No drop trigger/runner edge function exists

The entire backend pipeline to execute a Creative Drop is missing:
- No function reads `creative_schedules` and creates `creative_drops` records
- No function dispatches per-product, per-workflow generation jobs
- No function handles scheduled recurring runs
- No cron job or scheduler triggers drops at `next_run_at`

This needs to be built before Creative Drops actually work.

---

### Summary of Changes

**Database migration:**
- Add INSERT + DELETE policies on `creative_drops`
- Add WITH CHECK to UPDATE policies on both tables
- Change `model_ids` column type from `UUID[]` to `TEXT[]`

**File: `src/lib/dropCreditCalculator.ts`**
- Add `productCount` parameter
- Multiply image counts by product count

**File: `src/components/app/CreativeDropWizard.tsx`**
- Pass `selectedProductIds.size` to `calculateDropCredits`
- Auto-select all scenes when a workflow is first selected
- Improve error message in `onError` handler
- Add post-save trigger call for "Generate Now" mode

**New edge function: `supabase/functions/trigger-creative-drop/index.ts`**
- Accept a schedule ID
- Create a `creative_drops` record
- For each product x workflow, enqueue generation jobs
- Handle credit pre-validation
- Update schedule `next_run_at`

**Priority order:**
1. Database security fixes (policies, column types) -- critical
2. Credit calculation fix (product count multiplication) -- high, prevents incorrect charges
3. Scene auto-selection -- medium, prevents unexpected behavior
4. Error handling improvements -- medium
5. Trigger edge function -- high, but this is a separate feature buildout

