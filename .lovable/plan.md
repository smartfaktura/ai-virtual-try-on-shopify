# Scene-Request Broadcast Email (for Resend)

You already broadcast marketing through Resend (Admin → Email Marketing). This is a one-off broadcast you'll paste into Resend's editor — no code changes to the app.

## Deliverable

A standalone HTML file at `/mnt/documents/scene-request-broadcast.html` styled to match the existing VOVV.AI email shell (`supabase/functions/_shared/email-render.ts`):
- Inter font, navy `#0f172a` headline, stone `#f5f5f4` accents, 560px container
- "VOVV.AI" wordmark header
- Short personal-feel body copy
- Big visual placeholder block (dashed border, 16:9, "Drop your scene image here" hint) so you remember to drag in a reference image inside the Resend editor before sending
- Single CTA: "Reply with your scene"
- `mailto:hello@vovv.ai?subject=Scene%20idea` fallback so click also opens reply
- Footer with unsubscribe merge tag (`{{{RESEND_UNSUBSCRIBE_URL}}}`) so it works with your Resend audience

## Subject line options (3 to pick from in Resend)

1. `What scene should we build next?`
2. `Imagine a scene — we'll build it`
3. `Tell us your dream scene. Reply with one line`

Default in the file: option 1. Preview text: `Reply with the scene you wish existed in VOVV — we'll build it in 1–2 days`

## Body copy (draft)

> Hey —
>
> Quick one. We're adding new scenes every week, and we'd rather build the ones *you* actually need.
>
> Picture the scene you wish existed in VOVV.AI for your products — a setting, a mood, a vibe, a reference shot. Anything.
>
> **Just reply to this email.** One line, a moodboard, a screenshot — whatever's easiest. We'll build it within 1–2 business days and ping you when it's live.
>
> — Tomas, founder

## Image placeholder

A `<table>` block with dashed border + caption *"Optional: drag a reference image here in Resend before sending"*. You replace it inside the Resend editor with a real `<img>` (Resend lets you drag-drop into HTML blocks).

## How you'll use it

1. Open the file from `/mnt/documents/`
2. Resend → Broadcasts → New → "Code" view → paste the HTML
3. Pick subject from the 3 options above
4. Drag your reference image into the placeholder block
5. Select your audience (the one synced from `marketing_emails_opted_in` profiles) → Send

## Out of scope

- No new edge function, no template registration, no DB changes — this is a manual Resend broadcast
- Not a transactional send (it goes to a list, so it lives in Resend, not in `send-transactional-email`)
