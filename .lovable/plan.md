

# Fix: Invalid `imageSize` Value Causing Gemini INVALID_ARGUMENT

## Problem Found
The logs show `HTTP 400: INVALID_ARGUMENT` from the native Gemini `generateContent` endpoint. The root cause is on **line 752** of `generate-freestyle/index.ts`:

```typescript
if (quality === 'high') imageConfig.imageSize = "2048";  // WRONG
```

Google's API expects string values `"1K"`, `"2K"`, or `"4K"` — not pixel numbers like `"2048"`. Since your test generation used `quality: "high"`, this invalid value triggers the 400 error every time, causing the fallback to Seedream.

## Fix
One line change in `generate-freestyle/index.ts`:

```typescript
// Line 752: change "2048" to "2K"
if (quality === 'high') imageConfig.imageSize = "2K";
```

## Other functions
- `generate-workflow` and `generate-tryon` only pass `aspectRatio` in their `imageConfig` — no `imageSize` issue. They should work already for standard quality generations.
- `generate-workflow-preview` has a hardcoded `aspectRatio: "3:4"` — also fine.

## After fix
- Redeploy `generate-freestyle`
- Test a high-quality generation
- Confirm logs show `nanobanana/gemini-3-pro-image-preview → ok`

