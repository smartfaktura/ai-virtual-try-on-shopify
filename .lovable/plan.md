

## Plan: Add RESEND_AUDIENCE_ID secret

The `sync-resend-contact` edge function requires a `RESEND_AUDIENCE_ID` secret. The user has provided the value: `bb3f4e0a-9c15-4d19-8b35-997ac10f6f91`.

### Change
- Use the `add_secret` tool to store `RESEND_AUDIENCE_ID` with the provided value

No code changes needed — the edge function already reads this secret via `Deno.env.get("RESEND_AUDIENCE_ID")`.

