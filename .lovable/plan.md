

# Improve ChatContactForm Layout in Chat

## Problem
When the contact form appears inside a chat bubble, it inherits the bubble's `px-3.5 py-2.5` padding plus its own `p-3` padding and `border`, creating excessive inset. The form also has rounded corners and a border that look redundant inside an already-styled bubble. On mobile the inputs feel cramped.

## Changes

### File: `src/components/app/ChatContactForm.tsx`

**1. Remove outer container padding and border**
The form sits inside a chat bubble that already has padding and background. Remove the wrapper's `p-3 rounded-xl bg-muted/50 border border-border` — replace with just `space-y-2.5` so it blends seamlessly into the bubble.

**2. Improve input styling**
- Increase input height slightly: `py-2` → `py-2.5` for better touch targets on mobile
- Use subtle `bg-muted/40` instead of `bg-background` so inputs don't clash with the bubble bg

**3. Improve sent state**
- Remove `p-3` from success state, use `py-2` for less bulk inside the bubble

### File: `src/components/app/ChatMessageBubble.tsx`

**4. Remove margin on contact form wrapper**
Change `mt-2.5` to `mt-2` for tighter coupling with the message text above.

### Files
- `src/components/app/ChatContactForm.tsx` — remove container chrome, improve input sizing
- `src/components/app/ChatMessageBubble.tsx` — reduce contact form margin

