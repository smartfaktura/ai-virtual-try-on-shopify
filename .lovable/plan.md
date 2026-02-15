

## Fix: Restore Full Workflow Settings Visibility for Virtual Try-On and Mirror Selfie Set

### Problem
The Scene Library, Models, and Scenes sections in Step 3 of the Creative Drop Wizard are rendering as **collapsed headers** that are nearly invisible on the muted background. Users expect to see these settings expanded when a workflow is selected. The thin `border-t` header buttons blend into the `bg-muted/30` container, making it look like "everything was deleted."

### Root Cause
All collapsible sections (Scenes, Scene Library, Models) start collapsed by default. The `expandedSection` state initializes as `{}`, so no sections are open. On mobile, the thin header buttons are easy to miss.

### Solution
Auto-expand the first relevant section when a workflow is selected, and make collapsed headers more prominent.

### Technical Changes

**File: `src/components/app/CreativeDropWizard.tsx`**

**1. Auto-expand sections when a workflow is selected (line 660-675)**

When a workflow is added to `selectedWorkflowIds`, also set its first relevant section as expanded in `expandedSection`:

```typescript
// Inside the onClick handler where workflow is selected:
if (!isSelected) {
  next.add(wf.id);
  // Auto-select scenes
  if (variations.length > 0 && !workflowSceneSelections[wf.id]) {
    setWorkflowSceneSelections(prev => ({
      ...prev,
      [wf.id]: new Set(variations.map((v: { label: string }) => v.label)),
    }));
  }
  // Auto-expand first relevant section
  const firstSection = (variations.length > 0 && !wf.uses_tryon)
    ? 'scenes'
    : showPosePicker
      ? 'poses'
      : needsModels
        ? 'models'
        : null;
  if (firstSection) {
    setExpandedSection(prev => ({ ...prev, [wf.id]: firstSection }));
  }
}
```

This ensures that when you select Virtual Try-On, the "Scene Library" section auto-opens. When you select Mirror Selfie, the "Scenes" section auto-opens.

**2. Make collapsed section headers more visually prominent (lines 748-752, 823-827, 897-901, 960-964)**

Update all four collapsible header buttons from the nearly-invisible style to a more prominent card-like style:

```typescript
// Before (all 4 section headers):
className="w-full flex items-center justify-between py-2 text-xs hover:bg-muted/50 rounded-lg px-1 transition-colors"

// After:
className="w-full flex items-center justify-between py-2.5 text-xs hover:bg-muted/50 rounded-lg px-2 transition-colors"
```

And update the border separator from barely-visible to clearer:

```typescript
// Before:
className="border-t border-border/50 pt-1"

// After:
className="border-t border-border pt-2"
```

This makes all four collapsible section headers (Scenes, Scene Library, Models, Settings) more visible with:
- Stronger border separator (full opacity instead of 50%)
- More padding for better touch targets
- Clearer visual separation from the Format row above

### Summary of Changes
- 1 file modified: `src/components/app/CreativeDropWizard.tsx`
- Auto-expand first relevant section when workflow is selected
- Improve visibility of collapsed section headers with stronger borders and padding
- No new dependencies
