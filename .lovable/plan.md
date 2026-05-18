## Diagnosis

`Preview voice` is reaching the backend now, but the function returns `401 {"error":"Unauthorized"}`. The request includes a valid signed-in user token, so the problem is in the new `preview-talking-voice` function’s auth validation path, not CORS.

## Plan

1. **Fix backend auth validation**
   - Update `preview-talking-voice` to validate the incoming bearer token with the same working pattern used by existing functions like `studio-chat` / `kling-lip-sync`.
   - Explicitly extract `Authorization: Bearer ...`, call `auth.getUser(token)`, and use `user.id` for rate limiting.
   - Return clearer errors for missing auth vs expired auth.

2. **Make the frontend error message useful**
   - Replace the generic `Edge Function returned a non-2xx status code` toast with the backend’s actual JSON error when available.
   - If auth is missing/expired, show `Please sign in again to preview voice` instead of a technical error.

3. **Harden playback**
   - Keep the existing base64 data-URI playback, but catch `audio.play()` browser failures separately so users see `Click again to play preview` if autoplay is blocked.
   - Reset cached preview audio when script, voice, or speed changes so stale audio is not replayed.

4. **Deploy and verify**
   - Deploy `preview-talking-voice`.
   - Test the function directly and in the browser: click `Preview voice`, confirm the request returns `200`, and confirm the button changes to `Stop preview` / `Play preview` without showing the app error modal.

## Technical notes

- No database changes needed.
- No change to credit charging; voice preview stays free and rate-limited.
- The current CORS header fix stays in place.