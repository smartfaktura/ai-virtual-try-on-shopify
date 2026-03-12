

## Fix Topaz API Integration — 3 Issues Found

### Issues in Current `upscale-worker/index.ts`

**1. CRITICAL — Download endpoint is wrong**

Our code:
```typescript
const downloadResponse = await fetch(`${TOPAZ_BASE}/download/output/${processId}`, ...);
const processedBlob = await downloadResponse.blob(); // treats as direct image
```

Actual API: `GET /download/{process_id}` returns **JSON** with a `download_url` (presigned URL), not the image bytes directly. We need to:
- First call `GET /download/{process_id}` → get `{ download_url, head_url, expiry }`
- Then fetch the actual image from `download_url`

**2. Status field casing** — Minor but worth noting

API returns status as `"Completed"`, `"Processing"`, `"Pending"`, `"Failed"`, `"Cancelled"` (capitalized). Our code does `.toLowerCase()` before comparing, so this works correctly. No change needed.

**3. Delete cleanup endpoint path**

Our code uses `DELETE /status/${processId}` — the API does support `DELETE /status/{process_id}` for single job cleanup. This appears correct per the docs.

### Changes — 1 file

**`supabase/functions/upscale-worker/index.ts`** — Fix the download step (lines 139-151):

- Change URL from `/download/output/${processId}` → `/download/${processId}`
- Parse JSON response to get `download_url`
- Fetch the actual image from the presigned `download_url`
- Add `"Cancelled"` to the failure check in the polling loop

```text
Current (broken):
  fetch(/download/output/{id}) → blob

Fixed (two-step):
  fetch(/download/{id}) → JSON { download_url }
  fetch(download_url) → blob
```

Everything else (submit endpoint, model names, FormData fields, auth header, polling logic) matches the API docs correctly.

