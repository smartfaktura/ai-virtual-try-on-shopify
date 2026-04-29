## Goal

Remove the `{{balance}}` merge tag from `03-credits-low.html` so the template works as a plain Resend broadcast with no live-data sync required.

## Change

**File:** `/mnt/documents/resend-templates/03-credits-low.html`

Replace the lead line:

> You have **{{balance}} credits** left. Refill so your next campaign doesn't pause mid-shoot.

With:

> Your credit balance is running low — refill before your next campaign so generation doesn't pause mid-shoot.

Also sweep the rest of the file to ensure no other `{{balance}}` references remain (subject line, preview text, body). Keep `{{first_name}}` and `{{unsubscribe_url}}` as-is (Resend handles those natively from contact fields).

## Untouched

- All other 7 templates stay as they are
- Spacing, VOVV.AI branding, community section, CTAs unchanged
- File name and structure unchanged — just copy/paste the updated HTML into Resend

## Result

Template 03 becomes safe to send as a one-shot Resend broadcast to any segment (e.g. "users with < 10 credits") without needing an edge function or live DB sync.
