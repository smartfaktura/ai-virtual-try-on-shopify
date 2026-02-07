

## Secure Product Import System

Build a complete product import system with four methods (manual upload, store URL import, CSV import, and mobile QR code upload), all secured so that files and data are strictly tied to the authenticated user's account.

### Security Improvements (Critical)

The current `scratch-uploads` storage bucket has wide-open policies ("Anyone can upload/view/delete"). This will be replaced with a new **private** `product-uploads` bucket that uses user-scoped file paths (`{user_id}/filename.jpg`) and proper RLS policies:

- **Upload**: Only authenticated users can upload to their own folder
- **View**: Only the file owner can view their files
- **Delete**: Only the file owner can delete their files

The `import-product` and `mobile-upload` edge functions will both verify the user's JWT token before performing any action. The mobile upload flow uses a secure, time-limited session token stored in a database table with user association.

### What Gets Built

**1. New Storage Bucket: `product-uploads`**

A private bucket with user-scoped RLS policies. All product images (manual, imported, CSV, mobile) flow through this bucket. File paths follow the pattern `{user_id}/{timestamp}-{random}.{ext}` so each user's files are isolated.

**2. Database Table: `mobile_upload_sessions`**

A small table to securely bridge the desktop-to-mobile QR code flow:
- `id` (uuid), `user_id` (uuid), `session_token` (text, unique), `image_url` (text, nullable), `status` (pending/uploaded/expired), `expires_at` (timestamp), `created_at` (timestamp)
- RLS: users can only access their own sessions
- Sessions auto-expire after 15 minutes

**3. Edge Function: `import-product`**

Handles URL-based product imports with JWT verification:
- Accepts a product URL (Shopify, WooCommerce, Etsy, Amazon, or any page with Open Graph tags)
- Fetches the page HTML server-side
- Uses AI (Gemini Flash) to extract: product title, primary image URL, and product type from the HTML/meta tags
- Downloads the product image and uploads it to the secure `product-uploads` bucket under the user's folder
- Returns structured product data (title, image URL, type)
- Requires valid auth token -- rejects unauthenticated requests

**4. Edge Function: `mobile-upload`**

Handles the QR code mobile upload flow with two endpoints:
- `POST /create-session`: (authenticated, desktop) Creates a new upload session with a random token, returns QR code URL
- `POST /upload`: (public with session token validation) Accepts an image file from mobile, validates the session token hasn't expired, uploads to the user's secure folder, updates the session record
- `GET /status?token=xxx`: (authenticated, desktop) Polls session status to detect when the mobile upload completes

**5. Add Product Modal**

A dialog with four tabs replacing the current "Upload Product" button behavior:

- **Manual Upload**: Drag-and-drop image upload with product details form (title, type, description). Uses the secured upload hook to store in `product-uploads/{user_id}/`
- **Import from Store**: Paste a URL, click Import. Shows a loading state while the edge function scrapes the product. Preview the extracted info before saving
- **CSV Import**: Upload a CSV file with columns (title, product_type, image_url, description). Client-side parsing with preview table. Bulk-inserts into `user_products` with proper `user_id`
- **Mobile Camera (QR)**: Desktop shows a QR code. Scan with phone to open a simple upload page. Desktop polls for completion and shows the image when ready

**6. Mobile Upload Page**

A new public route `/upload/:sessionToken`:
- Clean, mobile-optimized page with large camera/upload button
- Validates the session token is valid and not expired
- Uploads image directly to `product-uploads` via the `mobile-upload` edge function
- Shows success screen: "Photo sent to your desktop. You can close this tab."
- No login required on mobile -- the session token links back to the desktop user's account securely

**7. Updated File Upload Hook**

The existing `useFileUpload` hook will be updated to:
- Upload to the new `product-uploads` bucket instead of `scratch-uploads`
- Prefix file paths with the authenticated user's ID
- Include the auth token in requests

### User Experience

1. Click "+ Add Product" on the Products page
2. Modal opens with four clear import options
3. **Manual**: Upload image, fill details, save -- product appears in grid
4. **Store URL**: Paste `https://myshop.com/products/cool-tee`, click Import. AI extracts title and image. Confirm and save
5. **CSV**: Drop a CSV, preview rows in a table, click "Import All"
6. **Mobile**: QR code appears on desktop. Scan with phone, take photo or pick from camera roll. Image appears on desktop within seconds, fill in details, save

### Files Summary

**New files:**
- `supabase/functions/import-product/index.ts` -- URL scraping edge function (JWT verified)
- `supabase/functions/mobile-upload/index.ts` -- mobile session handler (JWT verified for session creation)
- `src/components/app/AddProductModal.tsx` -- main modal with tab navigation
- `src/components/app/ManualProductTab.tsx` -- manual upload tab
- `src/components/app/StoreImportTab.tsx` -- URL import tab
- `src/components/app/CsvImportTab.tsx` -- CSV import tab
- `src/components/app/MobileUploadTab.tsx` -- QR code tab
- `src/pages/MobileUpload.tsx` -- public mobile upload page
- `src/lib/qrCode.ts` -- lightweight QR code canvas renderer

**Modified files:**
- `src/pages/Products.tsx` -- replace navigate-to-generate with modal
- `src/hooks/useFileUpload.ts` -- use secure bucket with user-scoped paths
- `src/App.tsx` -- add `/upload/:sessionToken` public route
- `supabase/config.toml` -- register `import-product` and `mobile-upload` edge functions

**Database changes:**
- New storage bucket `product-uploads` (private) with user-scoped RLS
- New table `mobile_upload_sessions` with RLS policies
- Tighten existing `scratch-uploads` bucket policies (or migrate to new bucket)

### Technical Details

**Storage RLS policies for `product-uploads`:**
```text
INSERT: auth.uid()::text = (storage.foldername(name))[1]
SELECT: auth.uid()::text = (storage.foldername(name))[1]
DELETE: auth.uid()::text = (storage.foldername(name))[1]
```

This ensures a user can only upload/view/delete files inside their own `{user_id}/` folder.

**Edge function security:**
- `import-product`: `verify_jwt = true` in config.toml. Extracts user ID from the auth token. Uploads images to `product-uploads/{user_id}/`
- `mobile-upload`: `verify_jwt = false` (mobile endpoint needs public access), but validates session tokens server-side and creates the Supabase admin client to verify ownership

**QR code generation:** Built with a small canvas-based utility (no external dependency). The QR encodes the URL `{app_origin}/upload/{sessionToken}`.

**CSV parsing:** Uses the browser's built-in `FileReader` + manual CSV parsing (handles quoted fields). No new dependencies needed.

**Supported platforms for URL import:**
- Shopify (detects `og:title`, `og:image`, product JSON-LD)
- WooCommerce (similar meta tag extraction)
- Etsy (Open Graph tags)
- Amazon (product title + image from structured data)
- Any page with `og:title` and `og:image` meta tags (generic fallback)

