

## Fix admin page access control

### Current state

All four admin pages (`AdminScenes`, `AdminChatSessions`, `AdminFeedback`, `AdminStatus`) check `isAdmin` and redirect non-admins, but inconsistently:

- **AdminStatus** — uses `<Navigate>` correctly
- **AdminChatSessions** — calls `navigate('/app')` during render (React anti-pattern, can cause warnings/flash)
- **AdminFeedback** — same `navigate()` during render issue
- **AdminScenes** — uses `useEffect` for redirect (can flash admin content briefly before redirect fires)
- **AdminChatSessions & AdminFeedback** — data queries run even for non-admins (no `enabled: isAdmin` guard)

The sidebar admin links are already properly gated behind `isRealAdmin`, so regular users won't see them. But if someone navigates directly to `/app/admin/*`, they could briefly see the page skeleton.

### Plan

1. **Standardize all admin pages** to use `<Navigate to="/app" replace />` pattern (matching AdminStatus):
   - `AdminScenes` — replace `useEffect` redirect with early return `<Navigate>`
   - `AdminChatSessions` — replace `navigate('/app')` call with `<Navigate>` component
   - `AdminFeedback` — same fix

2. **Gate data queries** with `enabled: isAdmin` in AdminChatSessions and AdminFeedback to prevent unnecessary requests for non-admin users.

3 files changed, no database changes needed. Regular users who visit admin URLs will be immediately redirected to `/app` with no content flash.

