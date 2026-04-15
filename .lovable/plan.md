

# Fix: Re-upload Seedream CDN URLs to Permanent Storage

## Problem
When Seedream 4.5 generates an image, it returns a temporary CDN URL (~24h expiry). The upload-to-storage logic in `generate-workflow/index.ts` (line 1271) only triggers for `data:` base64 URLs, so Seedream results are saved with expiring URLs. This causes:
1. Images disappear from results after ~24 hours
2. ZIP download silently skips expired images

## Root Cause
Line 1271: `if (imageUrl.startsWith("data:"))` — only re-uploads base64 images. Seedream CDN URLs pass through as-is.

## Solution

**File: `supabase/functions/generate-workflow/index.ts`** (lines 1268-1304)

Expand the upload logic to also handle external URLs (non-base64, non-storage). After the existing `data:` check, add an `else if` branch that:
1. Detects if the URL is an external CDN URL (not from our Supabase storage)
2. Fetches the image bytes from the temporary URL
3. Uploads to `workflow-previews` bucket
4. Replaces `finalUrl` with the permanent public URL

```typescript
if (imageUrl.startsWith("data:")) {
  // existing base64 upload logic...
} else if (!imageUrl.includes("supabase.co/storage")) {
  // External URL (Seedream CDN etc.) — fetch and re-upload to permanent storage
  try {
    const extResp = await fetch(imageUrl);
    if (extResp.ok) {
      const bytes = new Uint8Array(await extResp.arrayBuffer());
      const fmt = detectImageFormat(bytes);
      const userId = body.user_id || "anonymous";
      const jobId = body.job_id || crypto.randomUUID();
      const storagePath = `${userId}/${jobId}/${i}-${a}.${fmt.ext}`;
      const { error: uploadError } = await supabase.storage
        .from("workflow-previews")
        .upload(storagePath, bytes, {
          contentType: fmt.contentType,
          cacheControl: "3600",
        });
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("workflow-previews")
          .getPublicUrl(storagePath);
        finalUrl = publicUrlData.publicUrl;
        console.log(`[generate-workflow] Re-uploaded external URL to storage: ${storagePath}`);
      }
    }
  } catch (reuploadErr) {
    console.error("[generate-workflow] External URL re-upload error:", reuploadErr);
  }
}
```

**Same fix needed in**:
- `supabase/functions/generate-text-product/index.ts` — same pattern
- `supabase/functions/generate-tryon/index.ts` — same pattern  
- `supabase/functions/generate-freestyle/index.ts` — same pattern

## Impact
- All Seedream-generated images will be permanently stored in the `workflow-previews` bucket
- ZIP downloads will always work regardless of when the user downloads
- No change to the user-facing flow — just ensures URL permanence

## Technical Detail
- 4 edge function files modified with the same re-upload logic
- Adds ~1-3 seconds per Seedream image for the fetch+upload, but this happens during generation (not user-facing)
- Existing images with expired Seedream URLs cannot be recovered retroactively

