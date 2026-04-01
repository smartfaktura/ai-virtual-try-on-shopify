

# Upgrade Video Generation to 1080p (Pro Mode)

## Current State
- `src/hooks/useVideoProject.ts` line 198: `mode: 'std'` (720p)
- `src/hooks/useBulkVideoProject.ts` line 193: `mode: 'std'` (720p)
- `supabase/functions/generate-video/index.ts` line 111: reads `body.mode` and defaults to `'std'`
- All generated videos are currently 720p

## Changes

### 1. `src/hooks/useVideoProject.ts`
Change `mode: 'std'` to `mode: 'pro'` on line 198.

### 2. `src/hooks/useBulkVideoProject.ts`
Change `mode: 'std'` to `mode: 'pro'` on line 193.

### 3. `supabase/functions/generate-video/index.ts`
Update the default fallback on line 111 from `'std'` to `'pro'`.

## Note
- Pro mode generates at 1080p but may cost more Kling API credits per generation and take slightly longer.
- No database migration needed.
- No UI changes needed — the resolution display in VideoDetailModal already derives from aspect ratio (e.g. "1920 x 1080" for 16:9).

