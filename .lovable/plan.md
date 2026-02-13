

## Pass Product Dimensions to Workflow Generations

### Problem

Freestyle generations correctly include product dimensions in the AI prompt, but Workflow generations (Virtual Try-On, Product Listing Set, Flat Lay, etc.) do not. This means workflows ignore dimension data even when it's stored on the product.

### What Changes

**1. Update `generate-workflow` edge function** (`supabase/functions/generate-workflow/index.ts`)

- Add `dimensions?: string` to the `product` object inside `WorkflowRequest`
- In `buildVariationPrompt`, append a dimension line to the PRODUCT DETAILS section:
  ```
  PRODUCT DETAILS:
  - Product: Backpack CM8309
  - Type: Backpack
  - Dimensions: 28 x 35 x 13 cm -- render at realistic scale
  ```

**2. Update `Generate.tsx`** (`src/pages/Generate.tsx`)

- When building the request payload for workflow generation, include `dimensions` from the selected product (pulled from the user's product library)

### Files Changed

- `supabase/functions/generate-workflow/index.ts` -- add `dimensions` to interface and prompt builder
- `src/pages/Generate.tsx` -- pass `dimensions` in the product payload sent to the workflow edge function

### No database or dependency changes needed

The `dimensions` column already exists on `user_products`. This just pipes the existing data through to the workflow generation path.

