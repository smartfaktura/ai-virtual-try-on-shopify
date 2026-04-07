

# Fix App Crash on Product Images Page

## Problem
The app crashes with a full error overlay when interacting with the Product Images page (Step 1). The screenshot shows the error appearing while the "Outdated" badge and refresh button are visible on a product card.

## Root Causes Identified

### 1. Nested `<button>` inside `<button>` (HTML spec violation)
In the **grid view** (lines 827-836), a `<button>` (re-analyze) is nested inside another `<button>` (product selection card). This is invalid HTML and causes unpredictable behavior across browsers — React may throw during event delegation. The same issue exists in the **list view** (lines 775-784).

### 2. Potential null access in `product_type` filter
Line 732: `p.product_type.toLowerCase()` — while the DB schema says `product_type: string`, products created via certain import paths might have empty strings that combine with other edge cases. This is lower risk but worth guarding.

## Fix Plan

### File: `src/pages/ProductImages.tsx`

**Fix 1 — Replace nested buttons with `<div>` click handlers**
- In both grid and list views, change the inner re-analyze `<button>` to a `<div role="button" tabIndex={0}>` or move it **outside** the parent button entirely
- Better approach: wrap the product card in a `<div>` instead of a `<button>`, use `onClick` on the div, and keep the re-analyze as a proper `<button>` inside it
- Ensure `e.stopPropagation()` still prevents the parent click

**Fix 2 — Guard product_type filter**
- Change line 732 to: `(p.product_type || '').toLowerCase().includes(productSearch.toLowerCase())`

### Technical Detail
The grid view card (line 809) is a `<button>` element. The re-analyze trigger (line 827) is also a `<button>`. Per HTML spec, interactive content cannot be nested inside other interactive content. React's synthetic event system can throw when this happens during reconciliation.

The fix changes the outer product card wrapper from `<button>` to `<div role="button" tabIndex={0} onKeyDown={...}` in both grid and list views, keeping proper accessibility while avoiding the nesting violation.

