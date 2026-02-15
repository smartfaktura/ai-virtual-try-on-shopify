

## Creative Drops Wizard -- Clean Up & Fix Configuration UX

### Problems Identified

1. **Visual overload**: When a workflow is expanded, ALL config sections (format, scenes, pose library, models, custom settings) show simultaneously -- creating a wall of thumbnails and controls that's overwhelming
2. **Credit calculation broken**: `calculateDropCredits` receives an empty `selectedModelIds` array (the old global state) on line 223, so it always computes `hasModel = false` at the function level. The per-workflow `hasModel` flag in `workflowConfigs` IS set correctly, but the calculator double-checks `modelIds.length > 0` internally, which is always false now
3. **Customer support chat bubble overlaps** the sticky "Estimated Cost" bar at the bottom of Step 3 -- needs right padding or z-index fix

---

### Solution

**A. Collapsible sections inside each workflow (declutter)**

Instead of showing scenes, poses, models, and settings all at once, wrap each section in a mini collapsible with a summary header line. Only one section expands at a time per workflow. Each header shows a quick count badge so users see status at a glance without expanding:

```text
Virtual Try-On Set                               [check]
  Format: [1:1] [4:5] [9:16] [16:9]
  
  > Scenes         2 of 4 selected          [chevron]
  v Scene Library   5 selected               [chevron]
    [thumbnail grid - expanded]
  > Models          3 selected               [chevron]
```

This dramatically reduces the vertical space used. Each collapsible section header is a single line with count + chevron. Only one section open at a time keeps focus.

**B. Fix credit calculation**

In `src/lib/dropCreditCalculator.ts`, remove the `modelIds` parameter and the internal `hasModel` check on line 48. The per-workflow `hasModel` flag passed via `WorkflowCostConfig` is already correct (set on line 218 of the wizard). The calculator should ONLY use `wf.hasModel` from the config array.

In the wizard, remove the `selectedModelIds` argument from the `calculateDropCredits` call (line 223) since it's no longer needed.

**C. Fix sticky credit bar overlap with chat bubble**

Add `pb-16` (or `mb-16`) to the sticky credit bar so it sits above the customer support bubble. Alternatively, add `right padding` (pr-16) to prevent text from going under the bubble icon.

---

### Technical Details

**File: `src/lib/dropCreditCalculator.ts`**

- Remove `modelIds` parameter from `calculateDropCredits` function signature
- Remove line 48 (`const hasModel = modelIds.length > 0`)
- On line 54, change `hasModel || wf.hasModel` to just `wf.hasModel` -- the per-workflow flag is the sole source of truth now

**File: `src/components/app/CreativeDropWizard.tsx`**

1. **Credit calc call** (line 223): Remove the `selectedModelIds` argument:
   ```typescript
   const costEstimate = calculateDropCredits(workflowConfigs, imagesPerDrop, effectiveFrequency);
   ```

2. **Collapsible sections** (lines 604-854): Replace the flat stack of sections with collapsible wrappers:
   - Add state: `expandedSection: Record<string, string | null>` -- tracks which section is open per workflow (e.g., `{ 'wf-id': 'scenes' }`)
   - Each section (Scenes, Scene Library, Models, Custom Settings) gets a clickable header row showing the count badge and a chevron
   - Clicking a header toggles that section open and closes any other open section within the same workflow
   - Aspect ratio chips stay always visible (small, non-collapsible)
   - Flat Lay info note stays always visible

3. **Sticky credit bar** (lines 862-879): Add `pr-14` to prevent overlap with chat bubble, or wrap content in a container with right margin

4. **Scene/model grids**: Reduce grid from `grid-cols-4 sm:grid-cols-5` to `grid-cols-5 sm:grid-cols-6` for scenes and `grid-cols-6 sm:grid-cols-8` for models -- denser grid means less vertical scroll needed

5. **Section header pattern**:
   ```tsx
   <button 
     onClick={() => toggleSection(wf.id, 'scenes')}
     className="w-full flex items-center justify-between py-2 text-xs"
   >
     <span className="font-medium">Scenes</span>
     <div className="flex items-center gap-2">
       <Badge variant="secondary" className="text-[10px]">
         {sceneSelections.size} of {variations.length}
       </Badge>
       <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', 
         expandedSection[wf.id] === 'scenes' && 'rotate-180')} />
     </div>
   </button>
   ```

**Files modified:**
- `src/lib/dropCreditCalculator.ts` -- fix function signature and logic
- `src/components/app/CreativeDropWizard.tsx` -- collapsible sections, fix calc call, fix sticky bar

