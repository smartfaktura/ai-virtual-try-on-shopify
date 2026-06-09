# Surface the 7 fashion-welcome emails as previewable artifacts

You're looking in the artifacts panel (where `resend-templates/*.html` and `new-scenes-announcement.html` live). The 7 fashion-welcome files were written into the **project repo** at `src/emails/fashion-welcome/`, so they don't appear there.

## Fix

Copy the 7 HTML files into the artifacts area so they show up next to your other `resend-templates/*.html` files, and emit a `<presentation-artifact>` tag for each one so they're one click to preview.

Target paths:
- `/mnt/documents/resend-templates/fashion-welcome/01-welcome.html`
- `/mnt/documents/resend-templates/fashion-welcome/02-first-gen.html`
- `/mnt/documents/resend-templates/fashion-welcome/03-more-angles.html`
- `/mnt/documents/resend-templates/fashion-welcome/04-fashion-scenes.html`
- `/mnt/documents/resend-templates/fashion-welcome/05-product-swap.html`
- `/mnt/documents/resend-templates/fashion-welcome/06-brand-look.html`
- `/mnt/documents/resend-templates/fashion-welcome/07-upgrade.html`

Source files in the repo stay untouched. The in-app preview at `/admin/email-preview/fashion-welcome` keeps working.

Approve and I'll copy + link them.
