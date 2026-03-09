

## Auto-Minimize Chat on CTA Click

### Problem
When a user clicks a navigation CTA (e.g., "Browse Workflows") inside a chat message, the chat panel stays open and blocks the page content. The user has to manually close it.

### Change

**`src/components/app/ChatMessageBubble.tsx`**
- Accept a new `onMinimize` callback prop
- Call `onMinimize()` after `navigate(cta.route)` for navigation CTAs, so the chat closes and the user can see the destination page
- Don't minimize for `__contact__` CTAs (those open the inline form)

**`src/components/app/StudioChat.tsx`**
- Pass `onMinimize={() => setIsOpen(false)}` to each `ChatMessageBubble` for assistant messages
- This closes the panel but keeps the floating chat icon visible with the green dot, so the user knows they can reopen

### UX After Fix
1. User gets a response with a CTA like "Browse Workflows →"
2. Clicks it → chat minimizes, page navigates to /app/workflows
3. Chat icon stays in the corner with green dot — user can tap to reopen and continue the conversation

