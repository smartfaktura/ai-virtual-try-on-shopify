# Fix: Preview voice always errors

## Root cause

`supabase.functions.invoke()` sends extra headers (`x-supabase-client-platform`, `x-supabase-client-platform-version`, `x-supabase-client-runtime`, `x-supabase-client-runtime-version`). The `preview-talking-voice` edge function's `Access-Control-Allow-Headers` only lists `authorization, x-client-info, apikey, content-type`, so the browser blocks the POST after a successful OPTIONS preflight. Gateway logs confirm: only `OPTIONS | 200`, no POST ever recorded.

This is identical to the existing `generate-talking-video` CORS header set, which works.

## Change

**`supabase/functions/preview-talking-voice/index.ts`** — expand `Access-Control-Allow-Headers` to match the working `generate-talking-video` function:

```ts
"Access-Control-Allow-Headers":
  "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
```

Then redeploy `preview-talking-voice`.

## Verification

1. Open `/app/video/talking`, type a short script, click **Preview voice**.
2. Expect an MP3 to play within ~2s.
3. Confirm in gateway logs that a `POST | 200` row appears for `preview-talking-voice`.

## Out of scope

No other behavior, voice mapping, UI, or rate-limit changes.
