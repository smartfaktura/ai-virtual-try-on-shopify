

# Creative Drops Wizard — UX Audit & Improvement Plan

## Issues Found

### 1. Missing "Images Per Workflow" context on config steps
The user sets `imagesPerDrop` on the **Delivery step** (step 5+), but workflow config steps (steps 3+) already reference it for model distribution hints ("~8 img each"). Since they haven't set it yet, it defaults to 25 — which may not match their intent. The user has no way to know this number while configuring scenes/models.

**Fix**: Show the current `imagesPerDrop` value as a subtle info chip at the top of each config step, e.g. "25 images per workflow". Make it tappable to jump to the delivery step or show an inline editor.

### 2. No step descriptions on config steps
Steps 0-2 have clear descriptions ("Choose which visual styles to include"). Config steps just show the workflow name and description but no guidance on *what the user should do* on this page.

**Fix**: Add a one-liner below the workflow identity header: "Configure scenes, models, and formats for this workflow."

### 3. Review step missing workflow config details
The review step shows scene counts and model counts as badges, but doesn't show which **aspect ratios** were selected per workflow, or the **aesthetic/mood** choices — important creative decisions that should be reviewable.

**Fix**: Already partially there (formats shown as badges). Ensure aesthetic, mood, and pose selections are visible in the review summary.

### 4. No "Select All / Deselect All" for products on large catalogs
Products step has "Select All" but it's easy to miss. With many products, there's no category filter.

**Fix**: Already exists — low priority. Skip.

### 5. Freestyle prompts section is on the Workflows step — confusing placement
Freestyle prompts are conceptually separate from workflow selection but appear under the same step. Users may not scroll down to see them.

**Fix**: Move freestyle toggle to the Delivery/Schedule step or keep but add a visual separator with a clear header.

### 6. No confirmation or warning when credit cost is very high
A user could configure 100 images x 5 products x 3 workflows x 2 formats = 18,000 credits without any warning.

**Fix**: Add a warning banner on the Review step when `costEstimate.totalCredits` exceeds the user's current balance.

### 7. Step counter shows "3/7" but step names are hidden
The progress indicator shows `{step+1}/{totalSteps}` but only the current step label is shown. Users can't see what's coming or where they've been.

**Fix**: Add a horizontal step indicator or breadcrumb showing abbreviated step names with active/completed states.

### 8. "Powered by VOVV.AI" in the footer wastes space
The branding text between Back/Next is unnecessary inside the app and pushes validation hints into a cramped area.

**Fix**: Remove "Powered by VOVV.AI" from the wizard footer.

### 9. Missing back-navigation guard
If a user is on step 5 and presses browser back or "Back to Schedules", all wizard state is lost with no confirmation.

**Fix**: Add a confirmation dialog when closing the wizard if any state has been modified.

### 10. Config step credit estimate is verbose and confusing
The credit estimate card on each config step shows a formula like "2 products x 25 images x 2 formats = 100 images, 100 x 6 = 600 credits". This is useful but the math notation is dense.

**Fix**: Simplify to a single bold number with an expandable breakdown.

---

## Recommended Changes (Prioritized)

### High Impact

1. **Add step breadcrumb/stepper** — Replace the plain `3/7` counter with a horizontal dot/pill stepper showing step names. Completed steps get a checkmark, current step is highlighted. On mobile, show dots with the current label.

2. **Add guidance text to config steps** — One-liner instruction below workflow header: "Pick scenes, models & formats for this workflow."

3. **Credit balance warning on Review** — If `costEstimate.totalCredits > profile.credits_balance`, show a yellow warning: "This drop costs more than your current balance (X credits). You have Y credits."

4. **Remove "Powered by VOVV.AI"** from wizard footer.

### Medium Impact

5. **Show images-per-workflow chip on config steps** — Small pill at top: "25 images/workflow" so users have context while picking scenes/models.

6. **Unsaved changes guard** — When clicking "Cancel" or "Back to Schedules" after modifying state, show a confirm dialog.

7. **Simplify config-step credit card** — Show just the total with a "See breakdown" toggle.

### Low Impact

8. **Review step: show mood/aesthetic selections** — Already shows scene/model counts; add the custom settings values too (already partially done with badges).

---

## Technical Details

**File**: `src/components/app/CreativeDropWizard.tsx`

### Step breadcrumb (change 1)
Replace lines 506-528 (progress header) with a horizontal stepper component:
- Map step indices to short labels using `getStepLabel()`
- Render as a flex row of dots/pills: completed = checkmark + muted, current = primary, future = muted
- On mobile, collapse to dots with current label shown below

### Guidance text on config steps (change 2)
After the workflow identity div (line 889), add:
```tsx
<p className="text-sm text-muted-foreground">Pick scenes, models & formats for this workflow.</p>
```

### Credit warning on Review (change 3)
Before the review Card (line 1460), add conditional warning:
```tsx
{profile?.credits_balance != null && costEstimate.totalCredits > profile.credits_balance && (
  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2 text-sm">
    <Wallet className="w-4 h-4 text-amber-600" />
    <span>This drop costs <strong>{costEstimate.totalCredits}</strong> credits but you only have <strong>{profile.credits_balance}</strong>.</span>
  </div>
)}
```

### Remove branding (change 4)
Delete lines 1643-1650 (the "Powered by VOVV.AI" div).

### Images-per-workflow chip (change 5)
After the workflow identity div on config steps (~line 889), add:
```tsx
<Badge variant="outline" className="text-xs rounded-full">{imagesPerDrop} images/workflow</Badge>
```

### Unsaved changes guard (change 6)
Track a `isDirty` boolean (true when any field changes from initial). On `onClose` or Cancel at step 0, show a confirm dialog if dirty.

