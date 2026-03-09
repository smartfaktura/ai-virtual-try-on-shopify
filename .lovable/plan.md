

## Fix Contact Form Feedback + Email Delivery

### Problem 1: No visible confirmation after sending
The `ChatContactForm` shows a success state, but `onSent()` fires immediately, which sets `showContactForm(false)` in `StudioChat.tsx` — the success message disappears instantly because the entire form component unmounts.

### Problem 2: Email not arriving at hello@vovv.ai
Edge function logs confirm `send-email` returned success, but the email may not be reaching the inbox. This could be a Resend domain/API key scope issue. We should add better error logging and also inject a confirmation message into the chat so the user has clear feedback regardless.

### Changes

**`src/components/app/ChatContactForm.tsx`**
- Remove the `onSent` callback from the success path — keep the form mounted to show the green success banner
- Add a delay before calling `onSent` (e.g., 4 seconds) so the user sees the confirmation
- Or better: don't call `onSent` at all, let the success state persist in the form

**`src/components/app/StudioChat.tsx`**
- When contact form is sent successfully, inject a chat message like "✅ Your message has been sent to our team! We'll get back to you within 24 hours." into the messages array
- Don't immediately hide the contact form on `onSent` — instead keep it showing the success state

**`src/components/app/ChatContactForm.tsx`** (refined approach)
- Change `onSent` to pass back the success info so StudioChat can add a confirmation message to the chat
- After successful send, show the green success banner for 3 seconds, then collapse the form and add a confirmation message to chat

**`supabase/functions/send-email/index.ts`**
- Add more detailed error logging for the Resend API response to help diagnose delivery issues
- Log the full Resend response body on success too (it contains the email ID for tracing)

**`supabase/functions/send-contact/index.ts`**  
- Log the full response from `send-email` for better debugging

### Summary of UX flow after fix
1. User fills form → clicks Send → button shows "Sending..."
2. On success → green banner appears "Message sent! We'll get back to you within 24 hours"
3. After 3 seconds → form collapses, a confirmation message appears in chat thread
4. If error → red error message stays visible with retry option

