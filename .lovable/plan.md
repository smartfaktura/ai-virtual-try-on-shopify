

## Fix: FeedbackBanner Not Visible on Dashboard

### Root Cause

The `FeedbackBanner` uses `sessionStorage` with key `vovv-feedback-dismissed`. If the user previously submitted feedback or dismissed the banner (from the old code that used the X button to fully dismiss), it set this key to `'true'` — and the component returns `null` for the rest of the session.

Additionally, there's no visual indicator that the banner exists at the bottom since it blends in after the Upcoming Drops section.

### Fix

**`src/components/app/FeedbackBanner.tsx`**:
- Remove the `sessionStorage`-based initial dismissal entirely. The banner should always render (either expanded or collapsed).
- Keep the collapsed state as the default "minimized" view after clicking X, but never fully hide the banner.
- Only use `sessionStorage` to remember the collapsed preference so it starts collapsed on next page load if the user minimized it — but it still renders the one-liner.
- After successful submission: show the thank-you state, then after a timeout transition to collapsed (not fully gone).

This ensures the banner is always visible in some form on Dashboard and Settings.

### Changes — single file

| File | Change |
|------|--------|
| `src/components/app/FeedbackBanner.tsx` | Remove full dismissal logic; always show either expanded or collapsed state; use `sessionStorage` only to remember collapsed preference |

