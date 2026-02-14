

## Mirror Selfie Set: Fix Wizard Flow and Improve Animation

### Problem

1. The Mirror Selfie Set has `uses_tryon: true` in the database, which forces it through the **Virtual Try-On wizard** (Product -> Model -> Pose/Scene -> Settings). This is wrong because the Mirror Selfie scenes are defined as **variation strategies** (the 8 mirror environments), not as try-on poses.

2. The animated thumbnail on the Workflows page reuses the Selfie/UGC background image instead of a mirror selfie image.

3. The wizard shows no mirror-specific guidance or composition examples.

---

### Fix 1: Database Migration

Set `uses_tryon = false` for the Mirror Selfie Set workflow. The existing `ui_config` already has `show_model_picker: true` and `skip_template: true`, which will correctly route the wizard as:

**Product -> Brand Profile -> Model -> Settings (with 8 mirror scene checkboxes) -> Generate -> Results**

This means:
- Model selection still works (identity preservation)
- Scene selection happens via the variation strategy checkboxes (Bedroom, Bathroom, Elevator, etc.) in the Settings step -- not via the try-on pose picker
- The "Product Angles" section won't show (not relevant for mirror selfies -- will add a condition to hide it for this workflow)

---

### Fix 2: Workflow Animation Thumbnail

**File: `src/components/app/workflowAnimationData.tsx`**

Update the Mirror Selfie Set scene to use a mirror-selfie-appropriate background. Since we don't have a dedicated mirror selfie image in storage yet, we'll use the `generate-workflow-preview` edge function approach: for now, use a more fitting placeholder and add a badge element labeled "Mirror" with a phone icon instead of camera to better communicate the concept.

Update elements to be more descriptive:
- Product chip stays
- Model chip stays
- Change "8 Mirrors" badge to "Mirror Selfie" with a Smartphone icon
- Add a "4:5 Portrait" badge

---

### Fix 3: Mirror-Specific Wizard Content

**File: `src/pages/Generate.tsx`**

Add mirror selfie-specific guidance in the Settings step when the active workflow is "Mirror Selfie Set":

1. **Hide "Product Angles" card** for Mirror Selfie Set (angles don't apply -- it's always a front-facing mirror reflection)

2. **Add a "Mirror Selfie Tips" info card** above the scene selection grid with composition guidance:
   - "Your model will appear holding a smartphone, capturing their reflection"
   - "Each scene places your product in a different mirror environment"
   - "Output is Instagram-ready at 4:5 portrait format"

3. **Update the model selection step heading** when the workflow name is "Mirror Selfie Set":
   - Title: "Choose Your Model" (same)
   - Subtitle: "This model will appear taking a mirror selfie wearing your product"

---

### Technical Details

| File | Change |
|------|--------|
| Database migration | `UPDATE workflows SET uses_tryon = false WHERE name = 'Mirror Selfie Set'` |
| `src/components/app/workflowAnimationData.tsx` | Update Mirror Selfie Set scene with Smartphone icon and better badge labels |
| `src/pages/Generate.tsx` | Hide Product Angles for mirror selfie; add mirror tips card; update model step subtitle |
| `src/components/app/WorkflowCard.tsx` | No changes needed (features already correct) |

### Wizard Flow After Fix

```text
Step 1: Product  -->  Select clothing item(s)
Step 2: Brand    -->  Optional brand profile
Step 3: Model    -->  Pick model (with mirror selfie context text)
Step 4: Settings -->  Mirror tips card + 8 scene checkboxes + quality
Step 5: Generate -->  Queue with team avatar
Step 6: Results  -->  Image grid
```

