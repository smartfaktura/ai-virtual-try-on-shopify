

## Add "Talk to a Human" Contact Form in Studio Chat

### Approach
When the AI detects the user wants to speak with a human (or the user clicks a "Talk to a Human" button), show an inline contact form directly inside the chat panel. On submit, send the message to hello@vovv.ai via the existing `send-email` edge function with a new `contact_form` template.

### Changes

#### 1. Edge Function: `send-email/index.ts`
- Add a `contact_form` email template that sends to `hello@vovv.ai` (not the user)
- Includes: user's name, email, their message, and timestamp
- Styled with the existing VOVV.AI brand wrapper

#### 2. AI System Prompt: `studio-chat/index.ts`
- Add instruction: "If the user wants to talk to a human, contact support, or has a complaint/issue you can't resolve, respond with the special marker `[[CONTACT_HUMAN]]` in your message. This will trigger a contact form in the chat."
- Add a CTA: `[[Talk to a Human|__contact__]]` for the AI to use

#### 3. New Component: `src/components/app/ChatContactForm.tsx`
- Compact inline form with: Name (pre-filled from profile), Email (pre-filled), Message textarea
- Submit button sends to `send-email` edge function with type `contact_form`
- Shows success/error state inline
- Appears inside the chat message area when triggered

#### 4. Update `ChatMessageBubble.tsx`
- Detect the special `__contact__` route in CTA parsing
- Instead of navigating, render the `ChatContactForm` inline

#### 5. Update `StudioChat.tsx`
- Add a small "Talk to a Human" icon button in the chat header (next to clear button)
- Clicking it injects the contact form directly into the chat

#### 6. Update `useStudioChat.ts`
- Add a `sendContactForm` function that calls `send-email` with type `contact_form` and adds a confirmation message to the chat

### User Flow
1. User asks to speak with someone → AI responds with "Sure! Fill out the form below" + contact form CTA
2. OR user clicks the human icon in the chat header → form appears inline
3. User fills name/email/message → submits
4. Email sent to hello@vovv.ai with all details
5. Confirmation message appears in chat: "Message sent! We'll get back to you within 24 hours."

### Technical Detail
The contact form call goes through the existing `send-email` function (service-role auth). The frontend will call a new thin edge function `send-contact` (or add a client-accessible path to `send-email` for this specific type) since `send-email` requires service-role auth. Simplest approach: create a small `send-contact` edge function that validates the user JWT, then internally calls `send-email` with service-role key.

