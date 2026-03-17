
Goal: fix the signup popup flow so users only see success when the welcome email is actually sent, and improve the popup UI (larger + better UX on desktop/mobile).

What I found
- The signup popup calls `capture-lead` from `SignupSlideUp.tsx`.
- `capture-lead` currently logs send-email failures but still returns `{ success: true }`.
- Result: frontend shows “You’re in / Check your inbox” even when email delivery failed.
- Current logs confirm repeated failure from `send-email`: Resend 403 “notify.vovv.ai domain is not verified”.
- So there are two issues: (1) delivery configuration mismatch, (2) false-success UX logic.

Implementation plan

1) Fix sender configuration in `send-email` (backend)
- Update `supabase/functions/send-email/index.ts` to use the domain that is actually configured for this project’s email setup (instead of hardcoding a possibly invalid sender).
- Add explicit startup validation for required env vars (`RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) and clearer structured error responses for provider failures.
- Keep provider error details in logs (for debugging) but return safe client-facing error codes/messages.

2) Make `capture-lead` return truthful status (backend)
- Update `supabase/functions/capture-lead/index.ts`:
  - If lead capture succeeds but welcome email fails, return non-success response (no silent success).
  - Include a clear error code so frontend can show the right message (e.g. email temporarily unavailable).
  - Only return success when email send actually succeeds.
- Keep audience capture logic intact, but do not claim inbox success when delivery failed.

3) Update signup popup UX + sizing (frontend)
- Refactor `src/components/landing/SignupSlideUp.tsx` states from simple success/error to explicit states:
  - `idle | submitting | success | error`
- Only set `localStorage.lead_captured = true` on real success.
- Improve message copy:
  - Success: “You’re in. Welcome email sent.”
  - Error: “Couldn’t send email right now. Please try again.”
- Improve visual design:
  - Desktop: centered modal-style card with larger width (not tiny corner chip).
  - Mobile: full-width bottom sheet/card with better spacing and larger controls.
  - Better hierarchy: stronger title, clearer helper text, cleaner error block, improved button loading feedback.

4) Reliability + diagnostics checks
- Verify end-to-end by submitting from popup and confirming:
  - Network response reflects true status.
  - UI shows success only on actual delivery.
  - Edge logs show successful send event.
- If provider still returns domain error after code fix, rotate/update the email provider key to the workspace where the sender domain is verified (this is configuration-level, not UI logic).

Files to update
- `supabase/functions/send-email/index.ts`
- `supabase/functions/capture-lead/index.ts`
- `src/components/landing/SignupSlideUp.tsx`

Expected outcome
- No more false “check inbox” success.
- Clear actionable error state when delivery fails.
- Larger, cleaner signup popup experience (centered desktop + improved mobile UX).
