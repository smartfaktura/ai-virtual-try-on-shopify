
## Send Service Incident Notification to Affected Users

Your existing `send-email` edge function already has Resend integration and VOVV.AI branding. We just need to:

### Step 1: Add a "service_notice" email template
Add a new template to `send-email/index.ts` — a clean, professional apology/informational email that:
- Acknowledges a temporary delay in their image generations
- Confirms the issue is resolved and all their queued visuals have been processed
- Includes a CTA to go check their results
- Keeps the tone calm and professional (no dramatic language)

### Step 2: Deploy the updated function

### Step 3: Send to all 26 affected users
Run a one-time script via the edge function that sends the email to each affected user. We'll skip the Apple Private Relay email (`28h4d6zqwg@privaterelay.appleid.com`) since those don't accept external emails.

**25 users will receive the email**, sent from `hello@vovv.ai` via Resend.

---

### Email draft (subject + body):

**Subject:** Your visuals are ready — VOVV.AI

**Body:**
> Hey [name],
>
> Earlier today we experienced a temporary delay in our generation pipeline that affected some of your queued visuals. We want to let you know that the issue has been fully resolved — all your images have been processed and are waiting for you.
>
> We apologize for any inconvenience. Your credits were not affected by this delay.
>
> [Button: View Your Creations →]

### Safety
- No database schema changes
- No credit adjustments needed (credits were already deducted at enqueue; completed jobs keep them, failed jobs auto-refund)
- One file changed: `supabase/functions/send-email/index.ts` (new template)
- Emails sent one-time via curl calls to the function
