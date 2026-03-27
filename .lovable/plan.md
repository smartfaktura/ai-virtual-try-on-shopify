

# Add Product Toggle to Share to Discover (SubmitToDiscoverModal)

## Problem
The `SubmitToDiscoverModal` (used by non-admin users) has no product visibility toggle — unlike the admin `AddToDiscoverModal` which already has it. The callers don't pass product data either.

## Changes

### 1. `src/components/app/SubmitToDiscoverModal.tsx`
- Add optional props: `productName?`, `productImageUrl?`
- Add `showProduct` toggle state (default off), same style as in `AddToDiscoverModal`
- In `handleSubmit`, if `showProduct` is on and `productImageUrl` exists, call `generate-discover-preview` to create a safe public preview
- Include `product_name` and `product_image_url` in the submission data

### 2. `src/components/app/freestyle/FreestyleGallery.tsx`
- Pass `productName` and `productImageUrl` from `shareImg` data to `SubmitToDiscoverModal`
- The `shareImg` state already has generation metadata — need to check if product info is available and pass it through

### 3. `src/components/app/LibraryDetailModal.tsx`
- Pass `productName` and `productImageUrl` from `item` to `SubmitToDiscoverModal` (same as already done for `AddToDiscoverModal` on line 415-416)

### 4. Verify admin preview generation works
- Check edge function logs to confirm `generate-discover-preview` executed successfully when admin saved metadata
- No code changes needed — just runtime verification

