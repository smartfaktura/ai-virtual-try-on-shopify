

## Add "Generate Prompt from Image" Feature to Discover Detail Modal

### What this does

When a user opens any image in the Discover detail modal, they see a "Generate Prompt" button (like the competitor screenshot). Clicking it sends the image to an AI vision model which analyzes the photo and returns a highly detailed, photography-focused prompt that could reproduce a similar image. The generated prompt appears in the modal and can be copied or sent directly to Freestyle.

### How it works

1. User clicks any Discover card to open the detail modal
2. They see a "Generate Prompt" button next to the image
3. Clicking it sends the image URL to a new backend function
4. The backend function calls Lovable AI (Gemini 2.5 Flash -- fast, multimodal, already available via `LOVABLE_API_KEY`) with the image and a system prompt instructing it to produce a detailed image-reproduction prompt
5. The generated prompt is displayed in the modal, with Copy and "Use in Freestyle" actions

### Architecture

```text
[Detail Modal] ---> POST /functions/v1/describe-image
                          |
                          v
                    [Edge Function]
                          |
                          v
              [Lovable AI Gateway - Gemini 2.5 Flash]
                          |
                          v
                    Returns detailed prompt text
                          |
                          v
              [Modal shows prompt + Copy / Use buttons]
```

### Changes

#### 1. New Edge Function: `supabase/functions/describe-image/index.ts`

- Accepts `{ imageUrl: string }` (can be HTTPS URL or base64)
- Calls `https://ai.gateway.lovable.dev/v1/chat/completions` with `google/gemini-2.5-flash`
- System prompt instructs the model to analyze the image and output a single detailed comma-separated prompt covering: subject, clothing, pose, camera angle, lighting, color palette, mood, film aesthetic, composition, texture -- optimized for AI image generation
- Returns `{ prompt: string }`
- Handles 429/402 errors gracefully

#### 2. Update `src/components/app/DiscoverDetailModal.tsx`

- Add a "Generate Prompt" button below the image (styled like the competitor: full-width, with a text icon)
- On click, call the edge function with the image URL
- Show a loading spinner while generating
- Display the generated prompt in a text box below the button
- Add "Copy" and "Use in Freestyle" action buttons for the generated prompt
- This works for BOTH presets and scenes -- any image can have a prompt generated

#### 3. Update `supabase/config.toml`

- Add the new `describe-image` function entry with `verify_jwt = false` (public, same pattern as other functions)

### What this enables

- Users can click any inspiration image and get an AI-generated prompt to recreate it
- Works for both curated presets AND scene images
- The prompt is tailored for AI image generation (not a generic description)
- Users can immediately use the prompt in Freestyle with one click

### Technical Details

- Uses `google/gemini-2.5-flash` for speed and cost efficiency (vision-capable, no extra API key needed)
- The system prompt is crafted on the backend (not exposed to client)
- Image is passed as a URL in the multimodal message content (no base64 conversion needed for HTTPS URLs)
- For local/blob images, the frontend converts to base64 first using the existing `convertImageToBase64` utility
- No database changes needed
- Rate limit (429) and payment (402) errors are surfaced as toasts to the user

