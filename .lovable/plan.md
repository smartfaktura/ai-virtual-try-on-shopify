

## Plan: Optimize Product Upload UX

Three issues identified from the screenshots and code review:

### 1. Convert Add Product from Modal/Drawer to Full Page

Currently `AddProductModal` renders as a Dialog (desktop) or Drawer (mobile). On mobile especially, the drawer feels cramped and the tabs get cut off.

**Changes:**
- Create a new page `src/pages/AddProduct.tsx` that renders the same tabs content (Upload, URL, CSV, Mobile, Shopify) but as a full page within AppShell, not a modal
- Add route `/products/new` in `src/App.tsx`
- Add route `/products/:id/edit` for editing
- In `Products.tsx`, change "Add Product" button to navigate to `/app/products/new` instead of opening modal
- Change edit button to navigate to `/app/products/{id}/edit`
- On mobile, the tabs will use a horizontally scrollable `TabsList` so all 5 tabs are accessible without clipping
- Page header with back arrow to `/app/products`

### 2. Add "Other" to QUICK_TYPES in ManualProductTab

**`src/components/app/ManualProductTab.tsx`** — line 46:
- Add `'Other'` to the `QUICK_TYPES` array

### 3. Hide Mobile QR Tab on Mobile Devices

Showing a QR code to "scan with your phone" when you're already on a phone is useless.

**Changes:**
- In the new `AddProduct.tsx` page (and the existing `AddProductModal` if kept for desktop), conditionally hide the "Mobile" tab when `isMobile` is true
- Replace with a direct camera/gallery picker or simply hide the tab since the Upload tab already handles mobile image picking

### 4. Tab Bar Scroll on Mobile

The 5 tabs (Upload, URL, CSV, Mobile, Shopify) don't fit on mobile. After removing the Mobile tab on mobile devices (leaving 4), make the `TabsList` horizontally scrollable with `overflow-x-auto` and `flex-nowrap` to handle any remaining overflow.

