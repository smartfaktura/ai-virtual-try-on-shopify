

## Fix: Mobile Upload Session Mismatch

### Root Cause

The `MobileUploadTab` component creates a new session every time it mounts (via `useEffect` calling `createSession`). When the component remounts (modal close/reopen, tab switch, React re-render), a brand new session + QR code is generated. But the user's phone already scanned the PREVIOUS QR code and uploaded to that session. The desktop polls only the newest session token, so the upload is never detected.

Evidence from the database:
- Session `8597b86d` (11:45:09) -- status: **uploaded** with image (the phone uploaded here)
- Session `fd7d419e` (11:45:31) -- status: **pending** (desktop was polling this one)

### Fix Strategy

Two changes to make this robust:

**1. MobileUploadTab.tsx -- Poll ALL recent pending/uploaded sessions, not just the latest one**

Instead of polling a single session token, the status check should look for any session that has been uploaded for this user within the last 15 minutes. This way, even if the component remounts and creates a new session, it will still detect uploads from earlier sessions.

Change the polling logic: Instead of checking `status` for one specific token, also query for the most recent `uploaded` session for the user. The edge function `status` action will be updated to support this.

**2. Edge function mobile-upload/index.ts -- Add a "check-any" status action**

Add a new action (or modify "status") that checks if ANY session for this user has status "uploaded" and returns it. This covers the case where the desktop session token doesn't match the one the phone used.

### Files to Change

| File | Change |
|------|--------|
| `supabase/functions/mobile-upload/index.ts` | Add fallback: when the polled session is still "pending", also check if any other session for this user was recently uploaded |
| `src/components/app/MobileUploadTab.tsx` | Update polling to pass user context and handle the "found uploaded from different session" case |

### Technical Details

**Edge function change (mobile-upload/index.ts, status action):**

When `action=status` and the specific token returns "pending", also query:
```sql
SELECT image_url FROM mobile_upload_sessions 
WHERE user_id = :userId AND status = 'uploaded' 
AND created_at > now() - interval '15 minutes'
ORDER BY created_at DESC LIMIT 1
```

If found, return that image_url even though the specific token is still pending. This handles the session mismatch gracefully.

**MobileUploadTab.tsx:**

No major UI changes needed. The polling callback just needs to handle the new response shape where `image_url` can come from a different session.

Also add a guard to prevent creating a new session if one was created less than 30 seconds ago (debounce re-creation on remount).

