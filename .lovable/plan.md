

## Improve Shopify Import: Interactive Dropzone + Selectable Product Review

### Changes (single file: `src/components/app/ShopifyImportTab.tsx`)

**1. Enhanced Dropzone**
- Make the entire dropzone a clickable `<label>` with hover/active states and a prominent "Browse files" button
- Add animated upload icon on drag, subtle pulse animation
- Rounded-2xl with better padding, Shopify green accent on drag
- Clearer visual hierarchy: icon → headline → subtitle → file types accepted

**2. Product Selection Review (replaces current flat table)**
After CSV is parsed, show a review panel with:
- **Select All / Deselect All** toggle at the top with count indicator
- **Each product row gets a checkbox** for individual selection/deselection
- Image thumbnail + title + type + status columns (keep existing layout but add checkbox)
- Invalid products are shown but grayed out and unchecked (not selectable)
- **Filter chips**: "All", "Valid only", "Missing image" to quickly filter the list
- **Import button** updates dynamically: "Import 12 of 45 Products" based on selection
- Products without images still importable (user can toggle them on) — only truly invalid ones (no title) stay locked out

**3. Interaction Flow**
```text
Upload CSV → Parse → Review panel with all valid pre-selected
  ├─ User can uncheck products they don't want
  ├─ Filter by status
  ├─ "Select All" / "Deselect All"
  └─ Click "Import X Products" → confirms and imports selected only
```

No separate confirmation dialog needed — the review table with checkboxes IS the confirmation step. This avoids an extra modal-in-modal which feels heavy.

### No database or backend changes needed.

