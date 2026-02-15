

## Creative Drops Page -- Final UI Polish and Edit Flow

### 1. Edit Schedule Flow (Currently Missing)

The "Edit" option in the dropdown is disabled with "(coming soon)". This needs to be fully functional before the engine is built.

**Implementation:**
- Add an `onEdit` callback prop to `DropCard` alongside `onDuplicate`
- In `CreativeDrops.tsx`, `handleEdit` opens the wizard with `initialData` from the schedule plus a new `editingScheduleId` field
- `CreativeDropWizard` accepts an optional `editingScheduleId` prop. When present, the save mutation uses `.update()` instead of `.insert()`, and the final button reads "Save Changes" instead of "Create Schedule"
- The wizard header changes to "Edit Schedule" when editing

---

### 2. Improved Stats Summary Bar

Current stats are plain chips that all look the same. Improve with:
- Better visual hierarchy: larger numbers, smaller labels stacked vertically
- Add a "generating" count when any drops are in-progress
- Show next scheduled run time across all active schedules
- Wrap in a subtle card for visual grouping

---

### 3. Generation Progress -- Time Estimate and ETA

When a drop has status "generating", users need to know estimated time remaining.

**Implementation:**
- Calculate estimated time based on `total_images` count (using ~8 seconds per standard image as a rough baseline)
- Show "~X min remaining" on generating drop cards
- Show a more detailed progress line: "8 of 25 images -- ~2 min remaining"
- Use `created_at` timestamp to calculate elapsed time and derive ETA

---

### 4. Schedule Card -- Remove Stale Theme Badge

From the screenshot, the card still shows a "summer" theme badge next to the name. This was supposed to be removed in the previous round but appears to still be present. Ensure no theme badge renders on schedule cards.

---

### 5. Schedule Card -- Show Workflow Names

Currently shows "1 workflow" as a count. Replace with actual workflow names (truncated) so users know what content types are configured, e.g., "Product Listing Set" instead of "1 workflow".

**Implementation:**
- Pass workflow data to `DropCard` or resolve workflow names from IDs
- Show up to 2 workflow names with "+N more" overflow

---

### 6. Schedule Card -- Show Next Run as Prominent Info

For scheduled (non-one-time) schedules, the next run time should be more visible -- currently it's a small relative time text that's easy to miss.

**Fix:** Move next run info to the subtitle line as "Next: Mar 15, 2026" with a clock icon.

---

### 7. Drop Card -- Elapsed Time for Active Generation

For "generating" status drops, show how long generation has been running: "Started 3 min ago" using `created_at`.

---

### 8. Overall Page Header -- Cleaner Layout

- Stats bar should only show when there's meaningful data (not all zeros)
- Add a subtle description under each stat for context
- The "Create Schedule" button should be more prominent on the page level, not just inside the Schedules tab

---

### Technical Details

**Files modified:**

| File | Changes |
|------|---------|
| `src/components/app/CreativeDropWizard.tsx` | Accept `editingScheduleId` prop; use update mutation when editing; change header/button text |
| `src/components/app/DropCard.tsx` | Add `onEdit` callback; remove any remaining theme badges; show workflow names; improve next run display; add time estimate for generating drops |
| `src/pages/CreativeDrops.tsx` | Add `handleEdit` function; improve stats bar design; pass workflow names to DropCard; better empty/zero state for stats |

**Edit flow -- Wizard changes:**

```typescript
// New prop
interface CreativeDropWizardProps {
  onClose: () => void;
  initialData?: CreativeDropWizardInitialData;
  editingScheduleId?: string; // NEW
}

// Save mutation changes
const saveMutation = useMutation({
  mutationFn: async () => {
    const payload = { /* same fields */ };
    if (editingScheduleId) {
      const { error } = await supabase
        .from('creative_schedules')
        .update(payload)
        .eq('id', editingScheduleId);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('creative_schedules')
        .insert({ ...payload, user_id: user.id });
      if (error) throw error;
    }
  },
  onSuccess: () => {
    toast.success(editingScheduleId ? 'Schedule updated' : 'Schedule created');
    onClose();
  },
});
```

**Edit handler in CreativeDrops.tsx:**

```typescript
const handleEdit = (schedule: CreativeSchedule) => {
  setWizardInitialData({
    name: schedule.name,
    theme: schedule.theme,
    themeNotes: schedule.theme_notes,
    brandProfileId: schedule.brand_profile_id || '',
    selectedProductIds: schedule.selected_product_ids || [],
    selectedWorkflowIds: schedule.workflow_ids || [],
    selectedModelIds: schedule.model_ids || [],
    workflowFormats: /* extract from scene_config */,
    deliveryMode: schedule.frequency === 'one-time' ? 'now' : 'scheduled',
    frequency: schedule.frequency === 'one-time' ? 'monthly' : schedule.frequency,
    imagesPerDrop: schedule.images_per_drop,
    includeFreestyle: schedule.include_freestyle || false,
    freestylePrompts: schedule.freestyle_prompts || [],
  });
  setEditingScheduleId(schedule.id);
  setWizardOpen(true);
};
```

**Time estimate for generating drops:**

```typescript
const SECONDS_PER_IMAGE = 8;
const elapsedMs = Date.now() - new Date(drop.created_at).getTime();
const estimatedTotalMs = targetImages * SECONDS_PER_IMAGE * 1000;
const remainingMs = Math.max(0, estimatedTotalMs - elapsedMs);
const remainingMin = Math.ceil(remainingMs / 60000);
// Display: "~2 min remaining" or "Finishing up..."
```

**Improved stats bar:**

```typescript
// Only show stats when there's at least one schedule
// Show "next run" across all schedules
const nextRun = schedules
  .filter(s => s.active && s.next_run_at)
  .sort((a, b) => new Date(a.next_run_at!).getTime() - new Date(b.next_run_at!).getTime())[0];

const generatingCount = drops.filter(d => d.status === 'generating').length;
```

**DropCard workflow names:**

```typescript
// New prop on DropCard
interface ScheduleCardProps {
  type: 'schedule';
  schedule: CreativeSchedule;
  onDuplicate?: (schedule: CreativeSchedule) => void;
  onEdit?: (schedule: CreativeSchedule) => void; // NEW
  workflowNames?: string[]; // NEW - resolved names
}
```

