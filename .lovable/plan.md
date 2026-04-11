

# Replace Status Chips with Helper Text & Move "Apply to All" Inline

## Problem
The status chips row (lines 841-870) duplicates information already shown in the category tabs. User wants helper text instead, and wants "Apply to all" near the category tabs, not off to the side.

## Changes — `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

### 1. Delete the status chips block (lines 841-870)
Remove the entire `<div className="flex flex-col sm:flex-row ...">` containing the colored status chips and the "Apply to all" button.

### 2. Move "Apply to all" into the category tabs container (line 796-839)
Add the "Apply to all" button as the last element inside the `<div ref={tabsRef} ...>` flex container, after the `.map()` of category buttons. Style it as a small outline button matching the tab row aesthetic. Only show when the active category has shots selected.

### 3. Add helper text below the tabs container
After the tabs `<div>`, add:
```
<p className="text-xs text-muted-foreground">
  Select shots for each category below. Use "Apply to all" to copy your selection across categories.
</p>
```

### Result
```text
[accessories 3] [Earrings 3] [Hoodies 3] [⎘ Apply to all]
Select shots for each category below.

[scene grid...]
```

Single file edit.

