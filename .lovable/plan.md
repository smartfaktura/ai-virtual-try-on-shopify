
Problem: the auth email flow is now failing after the hook receives the signup event. The sender domain is no longer the blocker.

Do I know what the issue is? Yes.

What’s actually broken:
- `auth-email-hook` is running and receiving signup events correctly.
- It then calls `public.enqueue_email(...)` and fails with:
  `PGRST202: Could not find the function public.enqueue_email(payload, queue_name) in the schema cache`
- I also confirmed the queue-related email infrastructure is missing from the backend, so the hook was upgraded to the queue-based pattern before the required backend email queue setup existed.

Plan:
1. Restore the missing backend email infrastructure
   - Set up the project’s email queue backend so the missing RPC and supporting tables are created.
   - This should provision the queue wrapper used by `auth-email-hook`, plus the send log / suppression / unsubscribe infrastructure and the dispatcher that actually drains the queue.

2. Reconcile the auth email hook with the backend
   - Keep the current sender settings:
     - verified sender domain: `notify.vovv.ai`
     - visible From address: `VOVV.AI <notifications@vovv.ai>`
   - Re-deploy the auth email hook after backend setup so the live function and backend are aligned.
   - If the scaffolded auth email setup is out of sync, re-scaffold the auth templates/hook and preserve the current VOVV branding.

3. Harden the hook so failures are clearer
   - Update `supabase/functions/auth-email-hook/index.ts` to check and log insert errors for `email_send_log` instead of silently ignoring them.
   - Return a clearer infrastructure error if queue dependencies are missing again, so future failures are diagnosable immediately.

4. Verify end-to-end
   - Trigger signup / resend again.
   - Confirm logs move from “Received auth event” to successful enqueue/dispatch instead of `PGRST202`.
   - Confirm the confirmation email arrives and the resend action on `/auth` works.

Files / systems affected:
- Backend email infrastructure (queue RPCs, send-log/suppression tables, dispatcher/cron)
- `supabase/functions/auth-email-hook/index.ts`
- Possibly the auth email scaffold if reconciliation is needed
- No frontend Auth page change is required for the root fix

Technical notes:
- The verified domain check passed for `notify.vovv.ai`.
- The current issue is infrastructure mismatch, not DNS or sender naming.
- The old conclusion about the sender domain was incomplete; the exact blocker now is the missing queue email backend required by the new auth hook.
