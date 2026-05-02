
## Changes to `src/components/app/StudioChat.tsx`

### 1. Remove fake team member personas
- Remove the three avatar imports (Sophia, Kenji, Zara) and the stacked avatar display
- Replace with a single Sparkles icon avatar representing the AI assistant

### 2. Update header
- Title: "VOVV.AI Assistant" (was "VOVV.AI Studio")
- Subtitle: "AI-powered · instant answers" (was "Online · replies instantly")
- Remove the UserRound icon button from header (moving contact to footer)

### 3. Update loading state
- Remove "Sophia is thinking..." text — keep only the bouncing dots

### 4. Update welcome message
- New: "Hey, I'm the VOVV.AI assistant — I can help you find the right Visual Type, explain features, or troubleshoot. Ask me anything! Need a human? Hit **Talk to Team** below anytime."

### 5. Persistent "Talk to Team" strip
- Add a footer strip below the input area with a Mail icon + "Talk to Team" text
- Always visible, opens the existing ContactFormDialog
- Styled as a subtle border-top button

### 6. Update placeholder text
- Input placeholder: "Ask the AI assistant..." (was "Ask your studio team...")

### 7. Add product-images page chips
- Add `/app/generate/product-images` entry to PAGE_CHIPS with relevant suggestions like "How to control model outfit?" and "What goes in Additional Note?"

### 8. Update SYSTEM_PROMPT (edge function)
- Add a line instructing the AI to identify itself as an AI assistant, not a human
- Mention that users can always reach the real team via "Talk to Team"

### Files changed
- `src/components/app/StudioChat.tsx` — all UI changes
- `supabase/functions/studio-chat/index.ts` — SYSTEM_PROMPT update for AI identity
