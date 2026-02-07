

## AI Studio Team Chat Assistant

Add an interactive chat widget where users can talk with the AI "Studio Team" to get personalized tips, tricks, and recommendations for what images to generate based on their products and brand.

### How It Works

The chat appears as a floating button in the bottom-right corner of the app. Clicking it opens a compact chat panel where the user can converse with the AI team. The AI responds in-character as the studio team, asking about the user's products, brand style, target audience, and goals -- then provides specific, actionable photography recommendations.

### What Gets Built

**1. Backend Function: `studio-chat`**
A new edge function that calls the Lovable AI Gateway (using the already-configured `LOVABLE_API_KEY`). The system prompt instructs the AI to role-play as the brandframe.ai studio team -- referencing Sophia (photographer), Kenji (art director), Zara (stylist), and others by name. It will:
- Ask smart questions about the user's product category, target platform, and brand vibe
- Recommend specific workflows, templates, and photography styles
- Give tips on lighting, composition, and background choices
- Suggest which team member's specialty applies to their needs
- Use streaming for real-time token-by-token responses

**2. Frontend Component: `StudioChat.tsx`**
A floating chat widget with:
- A circular button (bottom-right) showing a team member avatar that pulses subtly to invite interaction
- When opened: a compact chat panel (approx 380px wide, 500px tall) with a header showing the team, message bubbles, and an input field
- Messages from the AI show a small team avatar next to them
- Streaming responses render token-by-token with markdown support
- A few suggested starter questions as clickable chips (e.g., "What style works for skincare?", "Best shots for fashion brands?", "How to make my product stand out?")
- Smooth open/close animation
- Conversation stays in memory during the session (no database persistence needed)

**3. Integration into AppShell**
The chat widget mounts inside `AppShell.tsx` so it's available on every app page, floating above all content.

### User Experience Flow

1. User sees a small floating chat bubble in the bottom-right with a team avatar
2. Clicks it -- chat panel slides up with a welcome message: "Hey! Your studio team is here. Tell us about your product and we'll suggest the perfect visual strategy."
3. User types about their product (e.g., "I sell organic skincare serums")
4. AI responds in-character, asking follow-up questions and giving specific recommendations
5. User can close/reopen the chat at any time; conversation persists during the session

### Technical Details

- **AI Model**: `google/gemini-3-flash-preview` via Lovable AI Gateway (fast, conversational)
- **Streaming**: SSE-based token streaming for responsive feel
- **System Prompt**: Rich prompt that includes all 10 team member personas, their specialties, and knowledge of the platform's workflows/templates
- **No new database tables needed** -- conversation is session-only (React state)
- **No new dependencies** -- uses existing UI primitives (Button, ScrollArea, Avatar, Input)
- **Edge function config**: Add `studio-chat` to `config.toml` with `verify_jwt = false` for simplicity (no auth data is sent)
- **New files**:
  - `supabase/functions/studio-chat/index.ts` -- edge function
  - `src/components/app/StudioChat.tsx` -- chat widget component
  - `src/hooks/useStudioChat.ts` -- streaming chat hook
- **Modified files**:
  - `src/components/app/AppShell.tsx` -- mount the chat widget
  - `supabase/config.toml` -- register the new edge function

