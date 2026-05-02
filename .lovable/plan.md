
## Restore VOVV brand avatars + improve Talk to Team

### 1. Restore header avatars
Bring back the three VOVV team avatar images (Sophia, Kenji, Zara) in the stacked layout for brand warmth. Add a small "AI" badge pill next to the "VOVV.AI" title to make it clear it's an AI assistant. Subtitle stays "AI assistant · instant replies" with the green pulse dot.

### 2. Improve "Talk to Team" footer button
- Replace Mail icon with ArrowRight for a cleaner CTA feel
- Label: "Talk to VOVV.AI Team" (branded)
- Add hover arrow animation (translate-x)
- Slightly smaller text (11px) so it doesn't compete with the input

### 3. Keep AI message avatars as Sparkles icon
Individual message bubbles keep the Sparkles icon avatar (not a person) — this reinforces that responses come from AI, while the header shows the brand team behind the product.

### 4. Update welcome message
"Hey, I'm the VOVV.AI AI assistant — trained on everything about our platform. I can help you pick the right Visual Type, explain features, troubleshoot, and more. For anything I can't resolve, hit **Talk to VOVV.AI Team** below to reach a real person."

### 5. Support CTA in chat responses (already working)
The SYSTEM_PROMPT already has `[[Talk to the Team|__contact__]]` as an approved CTA, and `ChatMessageBubble.tsx` already renders `__contact__` CTAs as inline buttons that open the contact form. No code change needed — this works today when users ask about support.

### Files changed
- `src/components/app/StudioChat.tsx` — restore avatars, update header, improve footer CTA, update welcome message
