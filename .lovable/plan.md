
## What changes

Three improvements to the studio livechat (edge function `studio-chat/index.ts`):

### 1. Brand Models require Growth plan (not Starter)

Add an explicit rule in the SYSTEM_PROMPT under PLANS or BRAND MODELS section:

> Brand Models (creating your own) require the **Growth** plan or higher. Starter does not include Brand Models. If a user on Free or Starter asks about creating a Brand Model, guide them to upgrade to Growth. Public (VOVV.AI) Brand Models are free to use on any plan.

### 2. Outfit / clothing visibility guidance via Additional Note

Add a new knowledge block in the SYSTEM_PROMPT that teaches the chatbot about the "Additional note" field in the Product Visuals workflow (Step 3 — Setup / Refine). When users ask about controlling what a model wears (e.g. "how do I make sure the model isn't wearing a jacket?"), the chatbot should:

- Explain that in the Product Visuals flow, Step 3 has an **"Additional note"** text field (labeled "Anything important to keep in mind?")
- Suggest writing specific instructions there, e.g.: *"Model should not wear any outerwear — no jacket, blazer, or coat. The top/product must be fully visible and unobstructed."*
- Also mention the Outfit section if the scene includes a person (where they can pick specific clothing items)
- Provide a CTA to the workflow if they're not already there

### 3. Product Visuals page context

Add `/app/generate/product-images` to the `pageContextMap` so when users open the chat while on the Product Visuals workflow, the chatbot knows they're actively creating product images and can offer contextual tips — including mentioning the Additional Note field.

### Files changed

- `supabase/functions/studio-chat/index.ts` — all three changes in the SYSTEM_PROMPT and pageContextMap
