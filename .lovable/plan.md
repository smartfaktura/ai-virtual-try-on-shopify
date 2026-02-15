

## Creative Drop Wizard -- Scheduling, Format Selection, and UI Upgrade

### Overview

Three major improvements to the Creative Drop Wizard:

1. **Clear scheduling with date selection and "Generate Now" option** -- so users know exactly when their drop runs
2. **Per-workflow aspect ratio (orientation) selection** -- users pick image formats for each workflow
3. **Luxury, spacious Apple-inspired UI redesign** -- elevated visual experience branded for VOVV.AI

---

### 1. Scheduling and Delivery Clarity

**Problem:** Users have no control over *when* the drop runs. The frequency setting implies automation but there's no visible date, no "run immediately" option, and the review step doesn't communicate timing.

**Solution -- Restructure Step 4 (Volume and Schedule):**

- Add a **delivery mode toggle** at the top of Step 4:
  - **"Generate Now"** -- Run this drop immediately upon creation (one-time, no scheduling)
  - **"Schedule"** -- Pick a start date and recurring frequency
- When "Schedule" is selected:
  - Show a **date picker** (using the existing `Calendar` component from `react-day-picker`) for the first drop date
  - Show the frequency selector (Weekly / Biweekly / Monthly) below
  - Display a clear label: "First drop: [date], then every [frequency]"
- When "Generate Now" is selected:
  - Hide frequency and date picker
  - Set `frequency` to `'one-time'` and `start_date` to now
- **Review Step** (Step 5) will prominently show:
  - A delivery section: "Generates immediately" or "First drop on [date], recurring [frequency]"
  - The estimated credit cost with a clear "Credits will be deducted when the drop runs" note

**Database:** The `start_date` column already exists on `creative_schedules`. No migration needed.

---

### 2. Per-Workflow Aspect Ratio Selection

**Problem:** Users can't choose what orientation/format their images should be generated in.

**Solution -- Add format chips next to each workflow in Step 3:**

- After selecting a workflow, show a small row of **aspect ratio chips** (1:1, 4:5, 9:16, 16:9) beneath each selected workflow card
- Default to `1:1` for all workflows
- Store selections in the existing `scene_config` JSONB column as `{ [workflowId]: { aspect_ratio: "4:5" } }`
- Each chip shows a tiny visual ratio indicator (like a small rectangle) for clarity
- The review step will list the chosen format per workflow

**Database:** Uses existing `scene_config` JSONB column. No migration needed.

---

### 3. Luxury UI/UX Redesign

**Visual upgrades across the entire wizard:**

| Element | Current | Upgraded |
|---------|---------|----------|
| Step indicator | Small pills | Elegant numbered circles with connecting lines, refined typography |
| Section headers | Plain labels | Soft uppercase tracking-wide headers with subtle dividers |
| Cards (products, workflows) | Basic bordered boxes | Floating `rounded-2xl` cards with subtle shadows and hover lift |
| Spacing | Compact `space-y-4/5` | Generous `space-y-8` with breathing room |
| Theme cards | Small grid buttons | Larger cards with frosted glass hover effect |
| Footer buttons | Basic outline/primary | Pill-shaped buttons with minimum height 48px |
| Product grid | Tight 3-4 col grid | 3-col grid with larger thumbnails, softer borders |
| Review card | Single dense card | Sectioned layout with clear visual hierarchy |
| Workflow items | List rows | Elevated cards with preview images and format chips |
| Empty states | N/A | Subtle gradient backgrounds for empty search |

**Branding touches:**
- "Powered by VOVV.AI" subtle watermark in the footer area
- Primary accent usage consistent with the dark navy Control Blue brand
- Step header: "Create Your Drop" instead of "Create Creative Drop Schedule"

---

### Technical Details

**Files Modified:**

| File | Changes |
|------|---------|
| `src/components/app/CreativeDropWizard.tsx` | All three features: scheduling controls, aspect ratio chips, UI overhaul |

**New State Variables:**
- `deliveryMode: 'now' | 'scheduled'` -- controls whether to generate immediately or schedule
- `startDate: Date` -- the selected start date for scheduled drops
- `workflowFormats: Record<string, string>` -- per-workflow aspect ratio selections (stored in `scene_config`)

**Step 4 Restructured Layout:**
```text
+-------------------------------------------+
|  How should this drop be delivered?        |
|                                            |
|  [ Generate Now ]    [ Schedule ]          |
|                                            |
|  (if Schedule selected):                   |
|  First Drop Date:  [Feb 20, 2026]          |
|  Repeat:  [Weekly] [Biweekly] [Monthly]    |
|                                            |
|  --- Images Per Drop ---                   |
|  [10] [25] [50] [100] [Custom]             |
|                                            |
|  --- Credit Estimate ---                   |
|  Product Listing: 13 x 4cr = 52 credits    |
|  Total per drop: 100 credits               |
+-------------------------------------------+
```

**Step 3 Workflow Cards with Format:**
```text
+-------------------------------------------+
|  [img] Product Listing Set          [x]   |
|        E-commerce ready visuals           |
|        Format: [1:1] [4:5] [9:16] [16:9]  |
+-------------------------------------------+
```

**Save Mutation Updates:**
- Pass `start_date` from the date picker (or `new Date()` for "Generate Now")
- Pass `scene_config` with per-workflow aspect ratios
- Set `frequency: 'one-time'` when "Generate Now" is chosen

**Review Step Delivery Section:**
- Shows a prominent card with calendar icon: "Generates immediately after creation" or "First drop: Feb 20, 2026 -- then monthly"

