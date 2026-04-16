

# Contextual Feedback System — MVP Plan

## What Already Exists

**Feedback table** (`feedback`): `id`, `user_id`, `type`, `message`, `page_url`, `email`, `status`, `admin_notes`, `created_at`  
**FeedbackBanner** component: popover with bug/feature/general chips + text, used on Dashboard, Settings, Jobs, Generate, CreativeDrops, Products  
**AdminFeedback page** (`/app/admin/feedback`): table with status/type filters, detail dialog, admin notes, delete  
**AdminFeedbackPanel**: collapsible version used on Settings page  

**Result pages identified:**
- `ProductImagesStep6Results.tsx` — "Your visuals are ready" + image grid + Generate More/Download/Library actions
- `Generate.tsx` (~4500 lines) — Freestyle results inline with prompt composer
- Workflow result sections accessed via Generate.tsx for Try-On and other workflows

**Available context already in scope:** user plan (`useAuth`), route (`useLocation`), workflow slug (from URL params), product IDs, model IDs, scene IDs, generation job results.

---

## Database Change

**Extend the `feedback` table** with new nullable columns (no new table needed):

```sql
ALTER TABLE public.feedback
  ADD COLUMN workflow TEXT,
  ADD COLUMN trigger_type TEXT,
  ADD COLUMN primary_answer TEXT,          -- 'yes' | 'almost' | 'no'
  ADD COLUMN reasons TEXT[] DEFAULT '{}',
  ADD COLUMN question_key TEXT,
  ADD COLUMN result_id UUID,
  ADD COLUMN image_url TEXT,
  ADD COLUMN user_plan TEXT,
  ADD COLUMN priority TEXT DEFAULT 'none';
```

This is backward-compatible — existing bug/feature/general feedback keeps working unchanged. New "survey" type entries use these additional columns.

---

## New Shared Component: `ContextualFeedbackCard`

One reusable component with config props. Compact inline card, not a modal.

```
Props:
  workflow: string
  questionText: string
  buttonLabels: { yes: string, almost: string, no: string }
  reasonChips: string[]
  textPlaceholder: string
  resultId?: string
  imageUrl?: string
  productId?: string
  modelId?: string
  sceneId?: string
  triggerType: string  // 'result_ready' | 'paywall_dismiss' | etc.
```

**Step 1**: Title "Help us improve" + question + 3 buttons  
**Step 2** (only for almost/no): reason chips + optional text (max 160 chars) + Skip / Send  
**Success**: "Thanks — this helps us improve your results" → auto-collapse  

**Display logic:**
- Dismissible with X
- Stores dismissal in sessionStorage keyed by `workflow + resultId`
- 2-second delay before appearing
- Does not reappear in same session for same result

**Free vs paid**: Component receives `userPlan` from `useAuth`. For free users, only show Step 1 (no Step 2) to avoid competing with upgrade flow.

**Saves to existing `feedback` table** with `type = 'survey'` and the new columns populated.

**File:** `src/components/app/ContextualFeedbackCard.tsx`

---

## Placement — 3 Locations

### 1. Product Visuals Results (`ProductImagesStep6Results.tsx`)
- Insert the feedback card between the "Your visuals are ready" header and the image grid
- Question: "Are these visuals ready to use?"
- Buttons: "Yes, ready" / "Almost" / "No"
- Reason chips: Need better background, Wrong angle/shot, Product details off, Lighting/shadows, Not consistent enough, Missing shot type, Needs higher realism, Other
- Text placeholder: "What is missing? e.g. cleaner background, sharper details"
- Context: pass `resultId` from generation batch, first image URL as `imageUrl`

### 2. Freestyle Results (in `Generate.tsx`)
- Insert a small feedback card above the prompt composer area, visible only when results exist
- Question: "Did this generation match what you had in mind?"
- Buttons: "Yes" / "Almost" / "No"
- Reason chips: Prompt too hard to control, Product not preserved, Model/look is off, Scene/style is off, Composition is wrong, Not realistic enough, Needs better quality, Too slow, Other
- Text placeholder: "What were you hoping to get instead?"
- Context: pass latest generation ID, first result image URL

### 3. Workflow Results (Try-On, etc. — in `Generate.tsx` result sections)
- Insert the feedback card near the result action row for structured workflow results
- Question: "Does this result look right for your product?"
- Buttons: "Yes" / "Almost" / "No"
- Reason chips: Fit looks wrong, Product not preserved, Model doesn't match, Pose variety is weak, Styling feels off, Scene/background off, Needs more realism, Other
- Text placeholder: "What should improve? e.g. better fit, more natural pose"
- Context: pass workflow slug, generation IDs, first result image

---

## Admin Page Improvements (`/app/admin/feedback`)

### New filters
- **Answer** filter: all / yes / almost / no (for survey type)
- **Workflow** filter: all / product-visuals / freestyle / virtual-try-on / etc.
- **Plan** filter: all / free / starter / growth / pro

### Table columns update
Add columns: **Workflow**, **Answer**, **Reasons** (truncated chips), **Plan**, **Image** (small thumbnail if `image_url` exists)

### Detail dialog improvements
- Show answer + reason chips as badges
- Show workflow name
- Show image thumbnail (clickable to open full size)
- Show user plan
- Show trigger type
- Show question that was shown
- Add priority selector (none / low / medium / high)

### Summary bar at top
Lightweight stats row above the table:
- Total this week
- Most common answer breakdown (yes/almost/no counts)
- Top 3 reason chips
- Unresolved count

---

## Files to Create/Edit

| File | Action |
|------|--------|
| `src/components/app/ContextualFeedbackCard.tsx` | **Create** — shared 2-step feedback card |
| `src/components/app/product-images/ProductImagesStep6Results.tsx` | **Edit** — add feedback card after header |
| `src/pages/Generate.tsx` | **Edit** — add feedback card in freestyle results area + workflow result areas |
| `src/pages/AdminFeedback.tsx` | **Edit** — add workflow/answer/plan filters, new columns, enhanced detail dialog, summary bar |
| Database migration | **Add** 8 nullable columns to `feedback` table |

---

## What Is NOT Included in MVP

- Complex trigger engine (behavioral signals like "left without downloading")
- Post-Adjust or post-Start-Over micro-surveys
- Session ID tracking
- Full analytics dashboard
- "Upgrade blocker" chip flow for free users near paywall (deferred — keep upgrade flow primary)

---

## Open Questions (None Blocking)

All required data (user plan, workflow, route, generation IDs, image URLs) is already available in the frontend components. No backend dependencies are missing for MVP.

