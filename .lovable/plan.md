

# Freestyle Prompt Builder Quiz

## Overview
A modal-based guided quiz that helps users construct an optimized prompt through simple questions. Pure mechanical/conditional logic — no AI calls. Opens from a button near the prompt panel. Outputs a well-structured prompt string directly into the textarea.

## Quiz Flow (6 steps)

### Step 1: Category
"What are you creating content for?"
- Fashion & Apparel, Beauty & Skincare, Fragrances, Jewelry, Accessories, Home & Decor, Food & Beverage, Electronics, Sports & Fitness, Health & Supplements, Other

### Step 2: Subject
"Who or what is the main subject?"
- **With person** → Single model, Multiple models, Faceless (hands/body only)
- **Product only** → Product on surface, Product floating/levitating, Flat lay arrangement
- *(conditionally shown based on category — e.g., Electronics won't show "Multiple models")*

### Step 3: Product Interaction *(only if "With person" selected)*
"How should the product appear?"
- Worn / Used naturally, Held in hand, Placed nearby, In the background
- *(options adapt to category — e.g., Fashion defaults to "Worn", Food to "Held")*

### Step 4: Setting & Mood
"Where should this take place?"
- Studio (clean background), Indoor lifestyle (home, café, office), Outdoor (street, nature, urban), Editorial / Abstract, Let AI decide
- Sub-question: Mood selector — Luxury, Clean & Minimal, Bold & Energetic, Warm & Cozy, Natural & Organic

### Step 5: Framing *(only if person selected)*
"How close should the camera be?"
- Full body, Upper body, Close-up detail, Side profile, Hand/wrist focus
- *(pre-filtered based on category — jewelry shows hand/wrist, neck options)*

### Step 6: Review & Generate
Shows the assembled prompt with a clean preview card. User can edit the text before inserting. "Use This Prompt" button inserts into the freestyle textarea.

## Prompt Assembly Logic (mechanical, no AI)

Template structure per combination:
```
[MOOD] [SETTING] product photography of [PRODUCT_DESCRIPTION].
[SUBJECT_CONTEXT]. [INTERACTION]. [FRAMING_HINT].
[STYLE_KEYWORDS].
```

Example outputs:
- **Fashion + Single model + Worn + Outdoor + Full body + Bold:**
  `"Bold, high-contrast outdoor product photography. A single model wearing the product in an urban street setting. Full body shot, head to toe. Striking editorial composition with dynamic energy."`

- **Jewelry + Faceless + Hand focus + Studio + Luxury:**
  `"Premium, sophisticated studio product photography. Elegant hands showcasing the jewelry piece. Close-up hand and wrist framing with shallow depth of field. Clean background, refined lighting with luxurious details."`

- **Food + Product only + Surface + Indoor + Warm:**
  `"Warm, inviting indoor product photography. The food product artfully arranged on a natural surface. Overhead angle with soft natural light. Cozy atmosphere with earth tones and organic textures."`

## Files to Create/Modify

### New: `src/components/app/freestyle/PromptBuilderQuiz.tsx`
- Multi-step modal dialog (~6 steps) with progress indicator
- Step components with icon-based option cards (not boring radio buttons)
- Conditional step rendering based on previous answers
- Prompt assembly function at the end
- VOVV.AI branding — dark header with sparkle icon, step dots

### New: `src/lib/promptBuilderTemplates.ts`
- All template fragments organized by category × subject × setting × mood
- `assemblePrompt(answers: QuizAnswers): string` function
- Category-specific keyword maps and interaction defaults

### Modify: `src/components/app/freestyle/FreestylePromptPanel.tsx`
- Add a small "✨ Prompt Helper" pill button next to the Upload Image button in the settings chips row
- Opens the quiz modal
- On quiz completion, sets the prompt text via `onPromptChange`

### Modify: `src/pages/Freestyle.tsx`
- Add state for quiz modal open/close
- Pass callback to insert generated prompt

## UI Design
- Modal with white background, rounded corners
- Each step: large heading question + grid of visual option cards (icon + label + subtle description)
- Selected card gets primary border + checkmark
- Bottom bar: Back / Next buttons + step dots
- Final step: prompt preview in a styled card with "Edit" toggle and "Use This Prompt" CTA
- Mobile: full-screen sheet instead of modal

## Scope
- ~2 new files, ~2 modified files
- No database changes, no edge functions, no AI calls
- Pure client-side conditional logic

