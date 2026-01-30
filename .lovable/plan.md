

# Virtual Try-On AI Image Generation Implementation

## Problem Summary

The "Generate Try-On Images" button on the Virtual Try-On settings page doesn't work because:
1. The `handleGenerateClick()` function checks for `selectedTemplate` which is `null` in Virtual Try-On mode (we use model + pose instead)
2. There's no confirmation modal designed for Virtual Try-On - the existing `GenerateConfirmModal` is template-based
3. No backend integration exists - currently only mock/simulated generation with stock photos

## Solution Overview

Implement real AI-powered Virtual Try-On image generation using the Lovable AI Gateway (already configured with `LOVABLE_API_KEY`). This will:
1. Fix the broken button by properly handling Virtual Try-On mode
2. Create a new confirmation modal for Virtual Try-On
3. Build a backend edge function with carefully crafted prompts
4. Generate actual AI images using `google/gemini-2.5-flash-image` model

## Backend Prompt Strategy

The quality of Virtual Try-On results depends heavily on prompt engineering. Here's the approach:

### Core Prompt Template
```text
Professional fashion photography of a [model.gender] model ([model.ethnicity], [model.bodyType] build, [model.ageRange] age) 
wearing [product.title] - [product.description].

Pose: [pose.name] - [pose.description]

Photography style: High-end e-commerce fashion photography
Lighting: Professional studio lighting with soft fill and subtle rim light
Camera: Shot on Canon EOS R5, 85mm f/1.4 lens, shallow depth of field
Background: [pose.category-based: clean white studio / urban outdoor / editorial minimal / street setting]

Quality requirements:
- Photorealistic skin texture with natural pores and highlights
- Natural fabric draping and realistic garment fit
- High detail on product colors, patterns, and textures
- Professional fashion editorial quality
- No AI artifacts, no distorted hands, no unnatural poses

The garment must look exactly as in the product image - preserve all colors, patterns, logos, and details exactly.
```

### Negative Prompt
```text
blurry, low quality, distorted, deformed hands, extra fingers, bad anatomy, 
unnatural pose, cartoon, illustration, text, watermark, logo overlay, 
mannequin, flat lay, product only without model
```

## Technical Implementation

### 1. New Edge Function: `supabase/functions/generate-tryon/index.ts`

Creates AI-generated Virtual Try-On images with:
- Receives: product info, model profile, pose details, aspect ratio, image count
- Builds optimized prompts from templates
- Calls Lovable AI Gateway with `google/gemini-2.5-flash-image`
- Returns: Array of base64 encoded images

### 2. New Component: `TryOnConfirmModal.tsx`

Similar to `GenerateConfirmModal` but designed for Virtual Try-On:
- Shows Product + Model + Pose summary (not Template)
- Displays 3 credits per image cost
- Preview of what will be generated

### 3. Updated `Generate.tsx`

- Fix `handleGenerateClick()` to work for both modes
- Add `handleTryOnGenerate()` for Virtual Try-On flow
- Replace simulation with real API calls
- Add loading states and error handling for API failures (429/402)

### 4. New Hook: `useGenerateTryOn.ts`

Encapsulates the API call logic:
- Sends generation request to edge function
- Handles streaming/polling for multiple images
- Manages loading and error states
- Returns generated image URLs

## File Changes

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/generate-tryon/index.ts` | Create | Edge function for AI image generation |
| `src/components/app/TryOnConfirmModal.tsx` | Create | Confirmation modal for Virtual Try-On |
| `src/hooks/useGenerateTryOn.ts` | Create | API call hook with error handling |
| `src/pages/Generate.tsx` | Update | Fix button logic, integrate real API calls |

## Flow Diagram

```text
User clicks "Generate 4 Try-On Images"
          ↓
[TryOnConfirmModal opens]
  - Shows: Product + Model + Pose
  - Shows: 12 credits (4 × 3)
  - Confirm / Cancel
          ↓
User clicks "Generate"
          ↓
[Frontend calls edge function]
  POST /functions/v1/generate-tryon
  {
    product: { title, description, imageUrl },
    model: { gender, ethnicity, bodyType, ageRange },
    pose: { name, description, category },
    aspectRatio: "1:1",
    imageCount: 4
  }
          ↓
[Edge function builds prompt]
  Combines all info into optimized prompt
          ↓
[Lovable AI Gateway]
  model: google/gemini-2.5-flash-image
  → Returns 4 generated images
          ↓
[Edge function returns]
  { images: ["data:image/png;base64,...", ...] }
          ↓
[Frontend displays results]
  User can select and publish to Shopify
```

## Error Handling

- **429 Rate Limit**: Show toast "Please wait a moment and try again"
- **402 Payment Required**: Show toast "Please add credits to continue"
- **Generation failures**: Retry up to 2 times, then show helpful error message
- **Partial success**: If 3 of 4 images succeed, show what's available with regenerate option

## Credit Deduction

In production, credits would be deducted server-side. For now:
- Mock credit deduction on frontend after successful generation
- Update `mockShop.creditsBalance` in state
- Show toast with credits used

