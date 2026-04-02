

# Fix Catalog Generation Failures

## Root Causes (from edge function logs)

### Bug 1: Invalid `max_tokens` parameter
```
"Invalid JSON payload received. Unknown name "max_tokens" at 'generation_config': Cannot find field."
```
The native Gemini `generateContent` API does not accept `max_tokens`. This was left over from the gateway migration. Remove it from `generationConfig`.

### Bug 2: Stack overflow in `fetchImageAsBase64`
```
fetchImageAsBase64 failed: Maximum call stack size exceeded
```
Line 32: `btoa(String.fromCharCode(...bytes))` spreads the entire image byte array as function arguments. Large images (>100KB) exceed the JS call stack limit. Fix: chunk the conversion.

## File: `supabase/functions/generate-catalog/index.ts`

### Fix 1 — Remove `max_tokens` (line 103)
Delete `max_tokens: 8192` from `generationConfig`. The native Gemini image endpoint doesn't support this parameter.

### Fix 2 — Chunk base64 encoding (line 32)
Replace:
```typescript
const b64 = btoa(String.fromCharCode(...bytes));
```
With chunked conversion:
```typescript
let binary = "";
const chunkSize = 8192;
for (let i = 0; i < bytes.length; i += chunkSize) {
  binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
}
const b64 = btoa(binary);
```

### No other changes needed
Everything else (queue completion, storage upload, reference image logic) is correct.

