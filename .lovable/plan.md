Update `/mnt/documents/scene-request-broadcast.html` to lead with the uploaded banner image ("Scene Requests Open / What should we build next?"), then the body copy.

## Steps

1. Copy `user-uploads://vovv.ai-1-3.jpg` to `public/email/scene-request-banner.jpg` AND upload it to the public `landing-assets` Supabase storage bucket so the email has a stable absolute URL (Resend / Gmail need a hosted URL — local files won't render in inboxes).
2. Rewrite the HTML email so the structure becomes:
   - Full-width banner `<img>` (560px wide, responsive `max-width:100%`, `display:block`, alt text "Scene Requests Open — what should we build next?") at the very top, replacing the current "VOVV.AI" wordmark header. The banner already contains the headline so we drop the duplicate H1.
   - Short intro line under the banner
   - Existing body copy (slightly tightened since the banner now carries the headline)
   - Keep the "Optional: drag a reference image here in Resend" placeholder REMOVED — banner replaces it
   - Reply CTA + footer + unsubscribe merge tag unchanged
3. Keep subject line options the same (default: "What scene should we build next?"). Update preview text to "Tell us the scene you wish existed in VOVV.AI — we'll build it in 1–2 days".
4. Keep all styling inline, Inter font, 560px container, navy/stone palette — matches existing VOVV.AI email shell.

## Technical notes

- Banner hosted at `https://azwiljtrbtaupofwmpzb.supabase.co/storage/v1/object/public/landing-assets/email/scene-request-banner.jpg` (uses the existing public `landing-assets` bucket, no migration needed).
- Image dimensions in HTML: `width="560"` with `style="max-width:100%;height:auto;display:block;"` for retina + mobile.
- No code, DB, or edge function changes — still a manual Resend broadcast paste.

## Out of scope

- No new edge function, template registration, or audience changes
- No image resizing/optimization beyond the original upload (file is already web-sized)