

## Creative Drops -- Complete UI Gap Analysis and Fixes

### Overview

After a thorough audit of the Creative Drops wizard, schedule listing, drop detail modal, calendar view, and data model, here are all the missing UI features and polish items to address before building the backend engine.

---

### 1. Duplicate Schedule (Clone)

**Gap:** Users who want a similar schedule (e.g., same products, different theme) must re-create from scratch.

**Fix:** Add a "Duplicate" option to the DropCard three-dot dropdown menu. Clicking it opens the wizard pre-filled with the cloned schedule's settings (name + " (Copy)", same products, workflows, formats, theme, etc.). This requires passing initial values to `CreativeDropWizard` via an optional `initialData` prop.

---

### 2. "Run Now" Button on Existing Schedules

**Gap:** Users with recurring schedules have no way to trigger an ad-hoc drop outside the normal cadence. The only "Generate Now" option is during initial creation.

**Fix:** Add a "Run Now" option to the DropCard schedule dropdown menu (next to Edit and Delete). This will create a one-time `creative_drops` row linked to the schedule. For now, it shows a toast confirming queuing; the engine will handle actual execution later.

---

### 3. Freestyle Prompts Integration (Unused DB Columns)

**Gap:** The database has `include_freestyle` (boolean) and `freestyle_prompts` (text array) columns on `creative_schedules`, but the wizard completely ignores them. Users may want to add custom freestyle prompts alongside workflow-based generation in their drops.

**Fix:** Add a collapsible "Freestyle Prompts" section at the bottom of Step 3 (Workflows). It contains a toggle to enable freestyle generation, and when active, a text area to add up to 5 custom prompts. These get saved to the existing database columns.

---

### 4. Drop-to-Schedule Link in Drops Tab

**Gap:** The Drops tab shows drops with dates and statuses, but there's no indication of which schedule produced them. If a user has multiple schedules, they can't tell which drop belongs to which.

**Fix:** Show the schedule name on each drop card by joining `creative_drops.schedule_id` to `creative_schedules`. Display it as a subtle label (e.g., "From: Summer 2026 Collection") beneath the date.

---

### 5. Drops Tab -- Filter/Sort Controls

**Gap:** The drops list has no filtering or sorting. As drops accumulate, users will need to find specific ones.

**Fix:** Add a compact filter bar at the top of the Drops tab with:
- Status filter chips: All, Scheduled, Generating, Ready, Failed
- Sort toggle: Newest first (default) / Oldest first

---

### 6. Drop Detail Modal -- Lightbox for Individual Images

**Gap:** Clicking an image in the drop detail modal only toggles the checkbox. There is no way to view a full-size preview of any individual image.

**Fix:** Add a lightbox view. Clicking the image body toggles selection (existing behavior), but add a small "expand" icon button (like the download button) that opens the existing `ImageLightbox` component for full-screen viewing.

---

### 7. Drop Detail Modal -- Select All / Deselect All

**Gap:** The modal has per-image checkboxes and "Download Selected" but no way to select/deselect all images at once.

**Fix:** Add "Select All" and "Clear" action links in the modal header next to the download buttons.

---

### 8. Calendar View -- Click Day to See Details

**Gap:** Calendar days show colored dots for drops/scheduled but are not interactive. Users can't click a day to see what's happening.

**Fix:** Make days with events clickable. Clicking a day with a drop dot scrolls/switches to the Drops tab filtered to that date. Clicking a scheduled dot shows a small popover with the schedule name and next run time.

---

### 9. Schedule Card -- Show Selected Product Count and Workflow Names

**Gap:** Schedule cards show "X workflows" and credit estimate but not which specific workflows or how many products.

**Fix:** Add a second line to the schedule card showing:
- Product count: "12 products"
- Workflow names truncated: "Product Listing, Selfie / UGC" with tooltip for overflow
- Format badges if non-default (e.g., "4:5")

---

### 10. Schedule Card -- Next Run Countdown

**Gap:** The "Next: [date]" label shows a static date. For upcoming runs, a relative time like "in 3 days" is more useful.

**Fix:** Use `formatDistanceToNow` from date-fns to show relative time (e.g., "Next run in 3 days") with the exact date on hover via a tooltip.

---

### 11. Wizard -- Product Empty State with "Add Product" CTA

**Gap:** If user has zero products, Step 2 shows "No products found" with no actionable guidance.

**Fix:** Show a proper empty state card with "You haven't added any products yet" and a "Go to Products" button linking to `/app/products`.

---

### 12. Wizard -- Step Validation Feedback

**Gap:** When the "Next" button is disabled (e.g., no name entered, no products selected), there's no explanation of why.

**Fix:** Add subtle inline helper text under each required field. For example, "Give your drop a name to continue" when the name field is empty and the user has attempted to click Next.

---

### 13. Drops Tab -- Empty State Improvement

**Gap:** The empty state says "Once your schedules run..." but doesn't guide users toward creating their first schedule.

**Fix:** Update the empty state to include a "Create your first schedule" button that switches to the Schedules tab and opens the wizard.

---

### 14. Page-Level Stats Summary

**Gap:** There's no at-a-glance overview of the user's creative drops activity (total images generated, credits spent, active schedules count).

**Fix:** Add a compact stats bar above the tabs showing 3-4 metric chips: "X Active Schedules", "X Total Drops", "X Images Generated", "X Credits Used". Computed from the existing queries.

---

### 15. Schedule Pause State Visual Distinction

**Gap:** Paused schedules look the same as active ones except for a small "Paused" badge. It's easy to miss.

**Fix:** Apply a subtle opacity reduction (opacity-60) and a muted border to the entire paused schedule card to visually indicate inactivity.

---

### Technical Details

**Files modified:**

| File | Changes |
|------|---------|
| `src/components/app/CreativeDropWizard.tsx` | Add `initialData` prop for cloning; add freestyle prompts section in Step 3; add validation helper text; improve product empty state |
| `src/components/app/DropCard.tsx` | Add Duplicate and Run Now to dropdown; show schedule name on drop cards; add product/workflow details to schedule card; relative time for next run; paused state styling |
| `src/pages/CreativeDrops.tsx` | Add stats summary bar; add drop status filter and sort controls; pass schedule data to drop cards; calendar day click interaction; improve drops empty state with CTA |
| `src/components/app/DropDetailModal.tsx` | Add Select All / Clear buttons; add lightbox expand button per image |

**Duplicate/Clone flow:**
- DropCard passes schedule data up to CreativeDrops via a new `onDuplicate` callback
- CreativeDrops opens the wizard with `initialData` set from the schedule
- CreativeDropWizard accepts optional `initialData` prop and pre-fills all state from it, appending " (Copy)" to the name

**Freestyle prompts section (Step 3):**
- New state: `includeFreestyle: boolean`, `freestylePrompts: string[]`
- UI: Collapsible section with Switch toggle + text inputs for prompts
- Saved to existing `include_freestyle` and `freestyle_prompts` columns

**Drops tab schedule join query:**
```typescript
const { data, error } = await supabase
  .from('creative_drops')
  .select('*, creative_schedules(name)')
  .order('run_date', { ascending: false });
```

**Stats computation (from existing data):**
```typescript
const activeCount = schedules.filter(s => s.active).length;
const totalDrops = drops.length;
const totalImages = drops.reduce((sum, d) => sum + d.total_images, 0);
const totalCredits = drops.reduce((sum, d) => sum + d.credits_charged, 0);
```

**Calendar day click:**
- Days with drops: set active tab to "drops" and apply a date filter
- Days with scheduled runs: show a small Popover with schedule name and time

