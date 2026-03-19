

# Creative Drops — Comprehensive Frontend Gap Analysis & Implementation Plan

## Current Workflows Available

| Workflow | Scenes | Model? | Custom Settings | Notes |
|----------|--------|--------|-----------------|-------|
| Virtual Try-On Set | 4 (paired) | Yes + Pose | — | Try-on based |
| Product Listing Set | 31 scenes | No | Product Angles (Front/Side/Back/All) | Most scenes |
| Selfie / UGC Set | 12 scenes | Yes | — | Uses try-on engine |
| Flat Lay Set | 12 surfaces | No | — | Locked 1:1 ratio |
| Mirror Selfie Set | 30 environments | Yes | — | Model picker |
| Interior / Exterior Staging | 22 styles | No | Room Type, Wall Color, Flooring | **HIDDEN** in drops wizard |
| Picture Perspectives | 5 angles | No | — | Angle-based |
| Image Upscaling | — | No | Resolution (2K/4K) | **HIDDEN** in drops wizard |

## Issues Found

### Critical Bugs

**1. "Run Now" on DropCard doesn't trigger generation (DropCard.tsx:106-125)**
The `runNowMutation` only inserts a `creative_drops` row with `status: 'scheduled'` — it never calls `trigger-creative-drop`. The drop sits forever as "scheduled."

**Fix:** Replace the insert-only logic with a call to `supabase.functions.invoke('trigger-creative-drop', { body: { schedule_id } })`, same as the wizard does on line 454.

**2. Drop images never populate — no backend aggregation**
The `trigger-creative-drop` function creates queue jobs with `creative_drop_id` in the payload. But nothing collects completed job results back into `creative_drops.images`. The DropDetailModal always shows "No images."

**Fix (frontend interim):** When `drop.images` is empty but `generation_job_ids` exist, fetch images from `generation_jobs` table using those IDs and display them. This makes drops viewable immediately without backend changes.

**3. No polling or completion notification**
Once generation starts, the user must manually refresh to see progress. No polling, no toasts on completion.

**Fix:** Add `refetchInterval: 10_000` to the `creative-drops` query when any drop has `status === 'generating'`. Track previous statuses and show a toast when a drop transitions from `generating` to `ready` or `failed`.

### UI/UX Gaps

**4. Per-workflow config step missing custom settings for some workflows**
The wizard's per-workflow config step renders scenes, models, poses, and generic `custom_settings`. But:
- **Selfie/UGC**: Has `custom_settings: []` in DB — the UGC Mood picker from `WorkflowSettingsPanel` is missing. Users can't select mood (excited/chill/confident/etc).
- **Flat Lay**: The aesthetic picker and prop style selector from `WorkflowSettingsPanel` are absent. Users get surfaces but no styling options.
- Product Listing "Product Angles" setting works via custom_settings — OK.

**Fix:** Add mood selector for Selfie/UGC workflows and aesthetic/prop style selectors for Flat Lay in the per-workflow config step, matching the standalone workflow experience.

**5. No "Group by Workflow" or folder view in DropDetailModal**
The detail modal shows a flat grid. Users generating 50+ images across workflows need organization.

**Fix:** Add a "Group by Workflow" toggle that renders collapsible sections with per-section download buttons.

**6. No "Save to Library" from drop gallery**
Drop images can only be downloaded, not saved to the user's main library for use in other features.

**Fix:** Add "Save to Library" button (single + bulk) that inserts into `generation_jobs` so images appear in Library.

**7. Review step doesn't show per-workflow scene/model details clearly**
The review step shows scene counts and model counts but not the selected scene names prominently. It does show them in small chips — this is adequate but could show format breakdown more clearly.

**8. Credit renewal date not shown on Schedule step**
Users scheduling drops for after credit renewal have no visibility into when that happens.

**Fix:** Fetch `profiles.credits_renewed_at` and show it on the Schedule step.

**9. Drop card for "generating" status has no real progress**
The progress bar estimates based on elapsed time, but doesn't reflect actual completed images since `drop.images` is always empty (issue #2). Once #2 is fixed, the progress bar should use real completed image counts.

## Implementation Plan (Frontend Only)

### Phase 1 — Fix Critical Bugs

**File: `src/components/app/DropCard.tsx`**
- Replace `runNowMutation` (lines 106-125) to call `trigger-creative-drop` edge function with `{ schedule_id }` instead of just inserting a row

**File: `src/pages/CreativeDrops.tsx`**
- Add `refetchInterval` to `creative-drops` query — poll every 10s when any drop is `generating`
- Track previous drop statuses via `useRef`, show toast on status transitions

**File: `src/components/app/DropDetailModal.tsx`**
- When `drop.images` is empty and `generation_job_ids.length > 0`, fetch from `generation_jobs` table
- Map `generation_jobs.results` (jsonb array of image URLs) into `DropImage[]` format
- Show a "generating" placeholder state when drop status is still `generating`

### Phase 2 — Enhance Wizard Per-Workflow Config

**File: `src/components/app/CreativeDropWizard.tsx`**
- Add UGC Mood picker for Selfie/UGC workflows (same mood cards as WorkflowSettingsPanel)
- Add Flat Lay aesthetic picker and prop style toggle for Flat Lay workflow
- Store these in `workflowCustomSettings` so they flow into `scene_config.mapped_settings`

### Phase 3 — Drop Gallery Improvements

**File: `src/components/app/DropDetailModal.tsx`**
- Add "Group by Workflow" toggle with collapsible sections
- Per-section download buttons
- "Save to Library" button (single image and bulk selection)
- Save inserts into `generation_jobs` with appropriate metadata

### Phase 4 — Schedule Step Enhancements

**File: `src/components/app/CreativeDropWizard.tsx`**
- Fetch `profiles.credits_renewed_at` from user profile
- Display renewal date on the Schedule step: "Your credits renew on [date]"

### Not in This Phase (Backend Work for Later)
- Database trigger/function to aggregate completed job results into `creative_drops.images` and flip status to `ready`
- Cron job to auto-trigger scheduled drops at `next_run_at`
- Push notification / email on drop completion
- ZIP pre-generation on the server side

