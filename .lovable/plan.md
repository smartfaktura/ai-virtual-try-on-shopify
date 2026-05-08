
## Send service notice emails to affected users

### Who receives the email (7 users)

| Email | Failed jobs |
|---|---|
| stewartryananderson@gmail.com | 4 |
| johns101609@gmail.com | 2 |
| tyty.meadors@gmail.com | 2 |
| b@x-art.com | 1 |
| ievute040@gmail.com | 1 |
| ileana.santana@aol.com | 1 |
| mgdesigns@sbcglobal.net | 1 |

Excluded: `hello@123presets.store` (your account), two Apple relay addresses.

### Email content

**Subject:** We're back on track — VOVV.AI

**Body:**

> Hey there,
>
> We recently experienced longer than usual queue waiting times that may have affected some of your generations. We're sorry for the delay.
>
> The issue has been fully resolved, and credits for any failed generations were automatically refunded to your account.
>
> Everything is running smoothly now — jump back in and keep creating.
>
> **[CTA Button: "Start Creating" → https://vovv.ai/app]**

### How it will be sent

1. **Update the `service_notice` template** in `send-email/index.ts` — replace the current copy with the message above (new subject line + updated body text).

2. **Deploy** the updated `send-email` edge function.

3. **Send emails** — Call `send-email` via `curl_edge_functions` once per user with `{ type: "service_notice", to: "<email>", data: {} }`. The function requires service_role auth, so each call will be made individually.

No frontend code changes. The template update is permanent but generic enough to reuse for future service notices.
