

## Add Product Page Tips Banner

Add a dismissible tips strip below the page header on the Add Product page, using the same team avatar pattern as `DashboardTipCard`. It will cycle through 3 product-specific tips from team members.

### Changes

**1. Create `src/components/app/ProductUploadTips.tsx`**

A compact, dismissible tip banner reusing the same `teamAvatar()` helper and styling pattern from `DashboardTipCard`. Three tips that rotate daily:

- **Sophia · Pro tip**: "Write clear, specific titles like 'Black Leather Crossbody Bag' — the AI uses your title to understand what it's generating."
- **Kenji · Better results**: "Add real dimensions (e.g. height: 15cm, width: 10cm) in the description — this helps the AI scale your product realistically in scenes."
- **Sienna · Quick tip**: "Upload a clean, well-lit photo on a plain background for the best AI generations. Multiple angles help too."

Uses `sessionStorage` key `product-upload-tip-dismissed` so it won't reappear once closed within the session. Same visual style: rounded card, team avatar (20px border accent), member name + highlight label, dismiss X button.

**2. Update `src/pages/AddProduct.tsx`**

Import and render `<ProductUploadTips />` between the page header and the tabs/content area (after line 69, before the `{isEditing ? ...}` block). Show on both new and edit views.

