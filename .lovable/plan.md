

## Plan: Add workflow quick-nav strip below the page subtitle

The problem: first-time users see a long page of large workflow cards and can't tell what's available without scrolling. The fix is to add a compact horizontal strip of clickable chips/pills right below the subtitle that lists all available workflows. Clicking a chip scrolls to that workflow card.

### Changes

**File: `src/pages/Workflows.tsx`**

1. Add a horizontal row of small pill buttons below the subtitle (before the activity section) showing each workflow name (e.g. "Virtual Try-On Set", "Product Listing Set", etc.)
2. Each pill scrolls to the corresponding `WorkflowCard` using `scrollIntoView({ behavior: 'smooth' })`
3. Use workflow IDs as anchor refs — pass an `id` prop or use `data-workflow-id` on each `WorkflowCard`

**File: `src/components/app/WorkflowCard.tsx`**

4. Accept an optional `id` prop and apply it to the root `<Card>` element so it can be scrolled to

**File: `src/pages/Workflows.tsx` (subtitle update)**

5. Update the subtitle from the generic "Choose an outcome-driven workflow..." to something more descriptive that tells users what types of workflows exist, e.g.:
   `"Generate virtual try-ons, product listings, UGC selfies, flat lays, staging & more — pick a workflow below."`

### Result
- Users immediately see all available workflow types at a glance
- One click jumps to the workflow they're interested in
- Better subtitle communicates the breadth of options

