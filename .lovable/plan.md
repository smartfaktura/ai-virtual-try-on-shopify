

# Streamline Step 1 Product Selection Header

## The Problem

There are **two stacked headers** before the product grid:
1. `PageHeader`: "Product Visuals" / "Select one or multiple products to create visuals for"
2. Section header: "Your Products (317)" / "Select from your catalog or upload a new image · Tip: drag & drop or paste (⌘V)"

Both say "select products" — redundant. The section header wastes ~60px of vertical space repeating what the page title already communicates.

## The Fix

**Merge useful info into the toolbar row, remove the section header entirely.**

The count "(317)" and the tip are useful — but they don't need their own heading block. Instead:

- **Remove** the "Your Products (317)" / subtitle `<div>` block entirely (lines 972-976)
- **Move the count** into the search bar placeholder: `"Search 317 products…"` — always visible, zero extra space
- **Move the tip** into a subtle inline hint next to the search bar (only on desktop): a small `Cmd+V` keyboard shortcut badge
- The `PageHeader` subtitle already tells users what to do, so no information is lost

### Result

The grid moves up ~60px. The search bar shows the count contextually. The drag-and-drop tip appears as a keyboard shortcut hint rather than a sentence.

## Files Changed

1. **`src/pages/ProductImages.tsx`** (~10 lines) — Remove the section header div (lines 972-976), update search placeholder to include product count, add a small `⌘V` hint badge next to the search input

