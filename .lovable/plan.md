

# Show Only 6 Models with "View All" Modal

## What Changes

The `ModelPickerSections` component in `ProductImagesStep3Refine.tsx` currently renders ALL library models inline (50+ cards). Instead, show only the first 6 library models with a "View all models" button that opens a full modal picker.

## File: `src/components/app/product-images/ProductImagesStep3Refine.tsx`

### Changes to `ModelPickerSections` (lines 28-101)

1. **Add modal state**: `const [showAllModal, setShowAllModal] = useState(false)`

2. **Limit inline library grid to 6**: Change line 92 from rendering all `filteredGlobal` to `filteredGlobal.slice(0, 6)`. If the selected model is beyond index 6, include it in the visible set so it stays visible.

3. **Add "View all" button** after the 6-card grid:
   - Shows count like "View all 24 models →"
   - Opens the modal

4. **Add a full-screen Dialog** for the complete model list:
   - Has its own gender filter tabs (All / Women / Men)
   - Search input to filter by name
   - Shows ALL brand models at the top, then all library models in a scrollable grid
   - Clicking a model selects it and closes the modal
   - Selected model highlighted with checkmark (reuses `ModelSelectorCard`)

### Component structure for the modal:
```
<Dialog open={showAllModal} onOpenChange={setShowAllModal}>
  <DialogContent className="max-w-3xl max-h-[80vh]">
    <DialogHeader>
      <DialogTitle>Select a Model</DialogTitle>
    </DialogHeader>
    {/* Gender tabs + Search input */}
    {/* Scrollable grid of ALL models */}
  </DialogContent>
</Dialog>
```

### Selection logic:
- When a model is selected in the modal, call `onSelect(id)` and `setShowAllModal(false)`
- The selected model always appears in the inline 6-card preview (swap it in if it's not in the first 6)

## No other files need changes
The `ModelSelectorCard` component is reused as-is in both the inline grid and the modal.

