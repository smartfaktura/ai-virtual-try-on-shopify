

# Show & Control Workflow Assignments per Scene in Admin Scenes

## Current Architecture

Scenes don't have explicit workflow assignments. Instead, workflow membership is determined by **category**:
- **On-model categories** (`studio`, `lifestyle`, `editorial`, `streetwear`) → scenes appear in **Try-On workflows** (`uses_tryon: true`)
- **All other categories** → scenes appear in **Product Listing Set** workflow
- Workflows with `show_scene_picker` or `show_pose_picker` in their config pull from both pools

This means **changing a scene's category already controls which workflows it appears in**. The admin can already change categories via the category dropdown.

## What This Plan Adds

### 1. Workflow indicator badges (read)
For each scene row, show small badges indicating which workflows the scene currently appears in, based on its category. This makes the implicit mapping visible.

### 2. Quick workflow toggle (control)
Instead of a separate control, enhance the existing **category dropdown** with a visual hint showing "→ Try-On workflows" or "→ Product workflows" next to each category option. This way the admin understands the consequence of changing categories.

Additionally, add a small info tooltip next to the workflow badges explaining: "Scene appears in these workflows based on its category. Change category to move between workflows."

### Files to Edit

**`src/pages/AdminScenes.tsx`**
- Fetch workflows table via `useQuery` to get workflow names and their `uses_tryon` flag
- Create a helper: `getWorkflowsForScene(category)` → returns list of workflow names
- Render compact `Badge variant="outline"` components next to each scene showing workflow names
- Add workflow group labels in the category `<Select>` dropdown (e.g., category options grouped under "On-Model (Try-On)" and "Product Scenes")
- Add info tooltip on workflow badges

No database changes needed — this is purely a UI enhancement using existing data relationships.

