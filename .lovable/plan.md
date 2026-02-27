

## Fix "AI analyzing product..." Labels for Interior Workflow

### Problem
The `UploadSourceCard` component has hardcoded product-centric labels ("Product Details", "Product Title", "AI analyzing product...", placeholders like "High-Waist Yoga Leggings"). When used in the Interior / Exterior Staging workflow, these labels are confusing and irrelevant.

### Solution
Add a `variant` prop to `UploadSourceCard` that switches all labels between "product" mode and "room" mode.

### Changes

**File: `src/components/app/UploadSourceCard.tsx`**
- Add optional prop `variant?: 'product' | 'room'` (defaults to `'product'`)
- Swap labels based on variant:
  - "Product Details" --> "Room Details"
  - "AI analyzing product..." --> "AI analyzing room..."
  - "Product Title" --> "Room Name"
  - Placeholder "High-Waist Yoga Leggings" --> "e.g., Master Bedroom, Kitchen"
  - "Product Type" placeholder --> "e.g., Living Room, Front Facade"
  - "Description" placeholder --> "e.g., Empty room with large windows, needs staging"
  - Helper text "Add details to help the AI generate better images" --> "Describe the space to help AI stage it accurately"
  - "Uploaded product" alt text --> "Uploaded room photo"

**File: `src/pages/Generate.tsx`**
- Pass `variant="room"` to `UploadSourceCard` when `isInteriorDesign` is true

This is a small, focused change -- just a prop addition and label swaps.

