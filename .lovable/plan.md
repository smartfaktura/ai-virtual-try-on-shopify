

## Upgrade Contact Form to a Centered Dialog

Currently the contact form is squeezed inline inside the 360px chat panel. We'll convert it to a proper centered **Dialog modal** that opens when the user clicks the "Talk to a human" button, with improved sizing and polish.

### Changes

**1. New `ContactFormDialog.tsx` component**
- Use the existing `Dialog`/`DialogContent` from shadcn UI
- Centered on screen, `max-w-md` (~448px) — much roomier than the 360px chat panel
- Larger input fields (`h-10` instead of tiny `py-2`), proper spacing, bigger textarea (4-5 rows)
- Branded header with team avatars and a clear title
- Success state: full-width success banner with checkmark, auto-closes after a few seconds
- Error state: clear inline error message

**2. Update `StudioChat.tsx`**
- Replace the inline `<ChatContactForm>` inside the scroll area with the new `<ContactFormDialog>` that opens as an overlay
- The "Talk to a human" button (`UserRound` icon) toggles the dialog open/closed
- On successful send, close the dialog and inject the confirmation system message into chat as it does today

**3. Visual improvements**
- Inputs use standard form sizing (not cramped chat-widget sizes)
- Proper `DialogHeader` with title "Message Our Team" and subtitle
- Submit button full-width, prominent primary style
- Success state centered with animation
- Works well on mobile too (dialog auto-adjusts)

### Files
- **Create:** `src/components/app/ContactFormDialog.tsx`
- **Edit:** `src/components/app/StudioChat.tsx` — swap inline form for dialog

