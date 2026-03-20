

# Fix Creative Drops Wizard Header Redundancy

## Problems
1. **Redundant title**: PageHeader shows "← Back to Creative Drops" + "Creative Drops" side by side — double mention
2. **Duplicate "Details"**: The step label "Details" appears both in the breadcrumb stepper AND below as a section heading (line 603: `getStepLabel(step)`)
3. **Drop Name input too wide**: Full-width input on a wide layout is excessive

## Changes

### 1. Hide PageHeader title when wizard is open (`src/pages/CreativeDrops.tsx`)
- Change `backAction` content from `'Back to Creative Drops'` to just `'Back'`
- Hide the title when wizard is open by passing an empty/conditional title, or better: just shorten the back button text

### 2. Remove duplicate "Details" label (`src/components/app/CreativeDropWizard.tsx`)
- Remove the standalone step label line (around line 602-603) that shows `getStepLabel(step)` below the breadcrumb — the breadcrumb already highlights the current step
- Keep the config step badge for "1 of 3 workflows" but attach it inline to the breadcrumb area instead

### 3. Make Details step more compact (`src/components/app/CreativeDropWizard.tsx`)
- Constrain the Drop Name input with `max-w-md`
- Reduce vertical spacing from `space-y-8` to `space-y-5` on the details step

