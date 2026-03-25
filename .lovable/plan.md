

# Upgrade Video Generation to Kling V3

## What changes
A simple model name swap — the V3 model uses the same API endpoint, same request/response format, and same parameters as V2.1.

## File changes

### 1. `supabase/functions/generate-video/index.ts`
- Line 153: Change default `model_name` from `"kling-v2-1"` to `"kling-v3"`

### 2. `src/hooks/useGenerateVideo.ts`
- Line 37: Change default `modelName` from `'kling-v2-1'` to `'kling-v3'`

### 3. `src/pages/VideoGenerate.tsx`
- Update any hardcoded model name references or UI labels to reflect "Kling V3"

No API endpoint changes needed — the Singapore endpoint and `/v1/videos/image2video` path remain the same. Authentication (HS256 JWT) is unchanged. All existing parameters (`image`, `prompt`, `duration`, `mode`, `aspect_ratio`, `image_tail`) remain compatible.

