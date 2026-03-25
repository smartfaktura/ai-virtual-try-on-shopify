

# Brand Models Page — `/app/models`

## Overview
A new dedicated "Models" page in the sidebar (after Library), serving as the brand's model management hub. It combines two creation flows — **reference-based** (upload a photo) and **generator-based** (a quiz/form to describe the model from scratch) — plus displays the user's existing generated models. Plan-gated: free/starter users see an upgrade prompt with benefits.

## Sidebar & Routing
- Add `{ label: 'Models', icon: Users, path: '/app/models' }` to `navItems` in `AppShell.tsx` (after Library)
- Add route `/models` in `App.tsx` pointing to new `BrandModels` page
- Lazy-load the page

## Page Structure: `src/pages/BrandModels.tsx`

### Plan Gate
- Fetch user profile plan. If `free` or `starter`, show a hero section with benefits of brand models (consistency, any ethnicity/age/gender, kids models, custom looks) and an "Upgrade" CTA. No creation UI shown.

### For Growth/Pro Users — Two Creation Tabs

**Tab 1: From Reference Image** (existing flow, refined)
- Upload a reference photo
- AI analyzes and generates a studio portrait matching our standard format (light grey background, sharp, realistic)
- Uses existing `generate-user-model` edge function (will enhance the prompt)
- Cost: 20 credits

**Tab 2: Model Generator** (new — inspired by the screenshot reference)
- A structured form/quiz with collapsible sections:
  - **Essentials**: Gender (Female/Male/Other chips), Age (slider 18-70), Ethnicity (Caucasian/Asian/African/Hispanic/Middle Eastern chips)
  - **Details**: Morphology (slim/athletic/average/plus-size), Eye Color, Hair Style, Hair Color, Distinctive Trait (all via selects)
  - **Visual Reference** (optional): Upload a mood/style reference
- "Generate" button builds a detailed prompt from selections and calls the same edge function but with `mode: 'generator'` and a `description` payload instead of `imageUrl`
- Cost: 20 credits

### My Models Grid
- Below creation area, show all user's models from `user_models` table
- Card grid with model image, name, metadata badges (gender, ethnicity, age)
- Actions: Delete (soft-delete via `is_active: false`)
- Empty state for no models yet

## Edge Function Enhancement: `generate-user-model`
Add a second mode (`generator`) that accepts structured description fields instead of a reference image:
- Build a hyper-specific prompt from the form fields (gender, age, ethnicity, morphology, eye color, hair style, hair color, distinctive trait)
- Use the same `gemini-3-pro-image-preview` model
- Enforce strict prompt engineering: "Professional fashion model headshot, light grey seamless studio background, soft diffused lighting, sharp focus on face, natural skin texture, no retouching artifacts, editorial quality, 8K, waist-up portrait"
- When reference image IS provided, pass it as a secondary reference but the prompt still controls the output

## Files Changed

| File | Change |
|------|--------|
| `src/pages/BrandModels.tsx` | New page with plan gate, two creation tabs, model grid |
| `src/App.tsx` | Add lazy import + route `/models` |
| `src/components/app/AppShell.tsx` | Add Models nav item after Library |
| `supabase/functions/generate-user-model/index.ts` | Add `generator` mode with structured description prompt |
| `src/hooks/useUserModels.ts` | Add `useGenerateUserModelFromDescription` mutation |

## Prompt Engineering (Generator Mode)
The edge function will construct prompts like:
```
"Professional fashion model studio portrait. Female, age 25, Caucasian, slim build. 
Blue eyes, long wavy blonde hair. Light grey seamless studio background, 
soft diffused three-point lighting, sharp focus on facial features, natural skin 
texture visible, no airbrushing, editorial fashion photography quality, 
waist-up framing, looking directly at camera with neutral confident expression. 8K."
```

No database migration needed — reuses existing `user_models` table.

