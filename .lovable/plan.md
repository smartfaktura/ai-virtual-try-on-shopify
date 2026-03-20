

# Improve Cost Summary & Generate Button UX

## Changes

### 1. Cost summary bar — show total images + cleaner mobile layout
**Files**: `TryOnSettingsPanel.tsx`, `WorkflowSettingsPanel.tsx`

- Add total image count next to credit cost: **"32 images · 192 credits"**
- On mobile, stack the layout vertically (credits available below the cost line) instead of side-by-side to prevent text overlap
- Use `flex-col sm:flex-row` pattern for the summary bar

### 2. Simplify Generate button text
- Change `Generate ${totalImages} Try-On Images` → `Generate`
- Change `Generate ${count} ${workflow} Images` → `Generate`
- The total image count is already shown in the summary bar above, so the button stays clean

### 3. Mobile credits available fix
- Wrap credits-available text to its own line on small screens
- Ensure the destructive "need X credits" button also wraps cleanly

### Files to edit
- `src/components/app/generate/TryOnSettingsPanel.tsx` — summary bar + button
- `src/components/app/generate/WorkflowSettingsPanel.tsx` — summary bar + button

