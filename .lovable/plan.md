

# Add Quick Upload Option to Product Visuals Step 1

## Problem
Currently, users can only select from previously saved products. There's no way to quickly upload/paste an image and go straight into the generation flow without first creating a product entry.

## Solution
Add a prominent "Upload Image" card alongside the existing product grid in Step 1. When used, it creates a temporary product entry in the database (via the existing `AddProductModal` flow) but with a streamlined, faster path — or better yet, add a **quick-upload drop zone** directly in Step 1 that:

1. Accepts drag-and-drop or click-to-upload
2. Auto-uploads the image to storage
3. Creates a product record with AI-analyzed title and type (using the existing `analyze-product-image` edge function)
4. Auto-selects the newly created product

### Changes

**File: `src/pages/ProductImages.tsx`**
- Add a `QuickUploadCard` component rendered as the **first item** in the product grid (before the existing "Add New" dashed card)
- This card shows a large upload icon, "Upload Image" label, and accepts file input + drag-and-drop
- On file drop/select:
  1. Upload image to `product-images` storage bucket
  2. Call `analyze-product-image` to get title/type
  3. Insert into `user_products` table
  4. Invalidate products query and auto-select the new product ID
  5. Show a brief toast: "Product created — select shots next"
- Also support **paste from clipboard** (Ctrl+V) — listen for paste events on the page during Step 1, extract image from clipboard, and trigger the same flow
- The quick-upload card should be visually distinct: slightly larger than product cards, with a gradient border and upload icon, clearly communicating "start from an image"

**File: `src/pages/ProductImages.tsx` (sticky bar area)**
- Update the sticky bar CTA: when a quick-uploaded product is the only selection, show "Next: Choose Shots →" as usual (no change needed, just works)

### Visual Layout (Step 1 grid)
```text
┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  📤 Upload   │  │ Product1 │  │ Product2 │  │ + Add New│
│  Image       │  │          │  │          │  │  (modal) │
│  Drop or     │  │          │  │          │  │          │
│  click here  │  │          │  │          │  │          │
└──────────────┘  └──────────┘  └──────────┘  └──────────┘
```

### Upload Flow Details
- Show a small spinner overlay on the card while uploading + analyzing
- After creation, the card reverts to its default state and the new product appears in the grid (already selected)
- If the user has no products at all, the empty state gets an additional "or upload an image" button alongside the existing "Add Your First Product"

### No new files needed — all changes in `src/pages/ProductImages.tsx`

