
# Implement Real Product Image Generation

## Current Problem

The "Product-Only" generation mode is completely mocked:
- `handleConfirmGenerate` in Generate.tsx (lines 313-406) simulates a 4-second delay
- Returns random Unsplash stock images based on template category
- No actual AI is called - unlike Virtual Try-On which works perfectly

**Result**: The generated image shows random unrelated photos (like a smartwatch for Magnesium Sleep Capsules)

## Solution

Create a real AI generation flow for product photography, mirroring the working Virtual Try-On implementation.

### Architecture Overview

```text
+----------------+     +-------------------+     +------------------+
| Generate.tsx   | --> | useGenerateProduct| --> | generate-product |
| (Settings UI)  |     | (React Hook)      |     | (Edge Function)  |
+----------------+     +-------------------+     +------------------+
        |                       |                        |
        v                       v                        v
  Product + Template     Convert to Base64        Build prompt from
  + Brand Settings       Call Edge Function       template blueprint
                                                  Call Lovable AI
                                                  Return images
```

### Files to Create

**1. Edge Function: `supabase/functions/generate-product/index.ts`**

New edge function that:
- Accepts product image, template promptBlueprint, brand settings
- Builds comprehensive prompt using template data (sceneDescription, lighting, cameraStyle, backgroundRules)
- Includes brand tone and style preferences
- Calls Lovable AI Gateway (`google/gemini-2.5-flash-image`)
- Returns generated product photography

Request payload:
```typescript
{
  product: {
    title: string;
    productType: string;
    description: string;
    imageUrl: string;  // Base64 encoded
  };
  template: {
    name: string;
    promptBlueprint: {
      sceneDescription: string;
      lighting: string;
      cameraStyle: string;
      backgroundRules: string;
      constraints: { do: string[]; dont: string[] };
    };
    negativePrompt: string;
  };
  brandSettings: {
    tone: string;
    backgroundStyle: string;
  };
  aspectRatio: "1:1" | "4:5" | "16:9";
  imageCount: number;
}
```

**2. React Hook: `src/hooks/useGenerateProduct.ts`**

New hook (similar to useGenerateTryOn) that:
- Manages loading and progress state
- Converts product image to Base64
- Calls the edge function
- Returns generated images
- Handles errors (429 rate limit, 402 payment required)

### Files to Modify

**3. Update: `src/pages/Generate.tsx`**

Replace mock `handleConfirmGenerate` function:
- Import and use `useGenerateProduct` hook
- Pass real template promptBlueprint data
- Pass brand settings (tone, backgroundStyle)
- Handle the response and update generatedImages state

---

## Technical Details

### Prompt Engineering for Product Photography

The edge function will build prompts like:

```text
Create a professional e-commerce product photograph of [PRODUCT IMAGE].

PRODUCT DETAILS:
- Product: Collagen Peptides Powder
- Type: Supplements/Health
- Description: Premium collagen peptides for beauty and wellness

PHOTOGRAPHY STYLE:
- Scene: {template.sceneDescription}
- Lighting: {template.lighting}  
- Camera: {template.cameraStyle}
- Background: {template.backgroundRules}

BRAND GUIDELINES:
- Tone: Clean and minimal
- Style: Studio lighting with neutral backdrop

REQUIREMENTS:
- DO: {constraints.do.join(', ')}
- DON'T: {constraints.dont.join(', ')}

The product must match [PRODUCT IMAGE] exactly - same packaging, colors, labels.
```

### Edge Function Config

Update `supabase/config.toml`:
```toml
[functions.generate-product]
verify_jwt = false
```

---

## Implementation Summary

| Step | File | Action |
|------|------|--------|
| 1 | `supabase/functions/generate-product/index.ts` | Create new edge function |
| 2 | `src/hooks/useGenerateProduct.ts` | Create new hook |
| 3 | `src/pages/Generate.tsx` | Replace mock generation with real AI |
| 4 | `supabase/config.toml` | Add function config |

## Result

After implementation:
- Product photography generation will use real AI (same as Virtual Try-On)
- Images will be generated based on the selected template style
- Product appearance will be preserved while applying new backgrounds/lighting
- Brand settings will influence the final aesthetic
