

# Strengthen Product Isolation in Generation Engine (Prompt-Only Fix)

## Root Cause
The `BACKGROUND ISOLATION` directive (line 565) assumes the product image has a clean background ("shows the product ONLY"), which is false for non-white backgrounds. The AI sees strong visual context (stone, water, etc.) and reproduces it. Additionally, the image label on line 712 says "reproduce this EXACTLY" — which the AI interprets as reproducing the entire image including background.

## Changes — `supabase/functions/generate-workflow/index.ts`

### 1. Fix image label to explicitly scope reproduction to the product object only (line 712)
Change:
```
'[PRODUCT IMAGE] Primary product reference — reproduce this EXACTLY:'
```
To:
```
'[PRODUCT IMAGE] Product reference — reproduce ONLY the product object (shape, colors, labels, materials). IGNORE all background, surfaces, and environment in this image:'
```

### 2. Strengthen BACKGROUND ISOLATION directive (line 565)
Change:
```
7. BACKGROUND ISOLATION (CRITICAL): The [PRODUCT IMAGE] shows the product ONLY. You MUST completely IGNORE the background...
```
To:
```
7. BACKGROUND ISOLATION (CRITICAL): The [PRODUCT IMAGE] may contain a background — you MUST completely IGNORE it. Extract ONLY the product object from the reference. The output background/environment MUST come exclusively from the variation instruction above. Do NOT reproduce any surface, texture, lighting, or environment from [PRODUCT IMAGE]. If the reference shows stone, water, fabric, or any surface — that is NOT part of the product.
```

### 3. Add negative prompt reinforcement
After the existing negatives line (line 568), append background-bleed prevention terms:
```
"reference background, original background, source image background"
```
This adds these as negative prompt terms to actively suppress background reproduction.

### 4. Strengthen the client-side `REFERENCE_ISOLATION` constant (`src/lib/productImagePromptBuilder.ts`, line 235)
Update to match the same stronger language for the Product Images flow.

## Why This Should Work
The current directives contradict reality ("shows the product ONLY" when it doesn't). By acknowledging the background exists and explicitly commanding the AI to strip it mentally, the instruction aligns with what the model actually sees. Combined with negative prompt terms and scoped image labels, this creates multiple reinforcement layers without needing preprocessing.

