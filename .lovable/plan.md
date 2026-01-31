

# Regenerate All 34 Models with Hyper-Realistic Quality

## Problem Analysis
The current model images have several quality issues:
- **Waxy/plastic skin texture** - lacks natural pores, fine lines, subtle imperfections
- **Unnatural features** - proportions look AI-generated, not photorealistic
- **Inconsistent lighting** - some look flat, others have strange shadows
- **Missing natural details** - no visible skin texture, freckles, or authentic human characteristics

## Solution
Regenerate all 34 model portraits using:
1. **Higher quality AI model** - `google/gemini-3-pro-image-preview` (pro version produces better results)
2. **Hyper-detailed prompts** optimized for photorealism
3. **Consistent bright studio setup** for all portraits

## Improved Prompt Template

```
RAW photograph, ultra high resolution headshot of a real [gender] [ethnicity] fashion model, 
[age] years old, [body description]. Shot on Hasselblad H6D-100c with 85mm f/1.4 lens. 
Professional studio lighting setup with large softbox key light and fill. 
BRIGHT CLEAN WHITE TO LIGHT GRAY GRADIENT studio background. 
Visible from mid-chest up, facing camera with natural relaxed expression.

CRITICAL REALISM DETAILS:
- Natural skin texture with visible pores, fine lines, subtle imperfections
- Real human skin with natural color variations and undertones
- [Specific hair color and style]
- [Specific eye details]
- No heavy makeup, natural beauty look
- Authentic human proportions
- Subtle natural shine on skin

Fashion magazine editorial quality, Vogue test shot aesthetic.
NOT artificial, NOT CGI, NOT 3D render, NOT illustration.
```

## Model Specifications for Regeneration

### Female Models (20)

| Name | Ethnicity | Age | Body | Hair | Eyes | Skin Notes |
|------|-----------|-----|------|------|------|------------|
| Yuki | Japanese | 22 | Slim | Black silky straight | Dark brown almond | Porcelain, smooth |
| Amara | Nigerian | 28 | Athletic | Natural short coils | Dark brown | Rich dark cocoa, radiant |
| Isabella | Brazilian Latina | 24 | Plus-size | Wavy dark brown | Hazel | Golden caramel, warm |
| Charlotte | French | 32 | Average | Sandy blonde shoulder length | Blue-green | Fair with light freckles |
| Victoria | British | 55 | Slim | Silver gray elegant | Blue | Mature with fine lines |
| Priya | Indian | 23 | Athletic | Long black lustrous | Dark brown | Warm golden brown |
| Ingrid | Swedish | 21 | Slim | Platinum blonde | Ice blue | Very fair, pink undertones |
| Layla | Lebanese | 30 | Average | Dark brown wavy | Green-brown | Olive Mediterranean |
| Nia | Ghanaian | 22 | Plus-size | Protective braids | Dark brown | Deep rich brown, glowing |
| Soo-Min | Korean | 20 | Slim/Petite | Black straight with bangs | Dark brown | Pale porcelain |
| Sofia | Italian | 29 | Athletic | Dark wavy thick | Brown | Olive toned |
| Elena | Mexican | 23 | Athletic | Long dark flowing | Dark brown | Warm bronze |
| Maya | Senegalese | 33 | Average | Natural afro | Dark brown | Deep mahogany |
| Akiko | Japanese | 35 | Plus-size | Black bob cut | Dark brown | Fair with rosy cheeks |
| Freya | Norwegian | 21 | Average | Natural blonde | Light gray-blue | Very fair Nordic |
| Mei | Chinese | 52 | Slim | Elegant gray streaked | Dark brown | Mature Asian graceful |
| Zara | Mixed Black/White | 24 | Athletic | Curly light brown | Hazel | Light caramel, freckles |
| Fatima | Moroccan | 34 | Plus-size | Dark brown styled | Dark brown | Warm olive |
| Sienna | Irish | 25 | Average | Natural ginger red | Green | Very fair with freckles |
| NEW - Sienna remains

### Male Models (14)

| Name | Ethnicity | Age | Body | Hair | Eyes | Skin Notes |
|------|-----------|-----|------|------|------|------------|
| Omar | Turkish | 24 | Slim | Dark wavy | Light brown | Mediterranean olive |
| Marcus | African American | 31 | Athletic muscular | Short fade | Dark brown | Deep brown, defined |
| Jin | Chinese | 23 | Average | Black modern cut | Dark brown | Fair East Asian |
| Henrik | German | 48 | Plus-size | Graying brown | Blue | Fair with character |
| Liam | British | 30 | Athletic | Light brown textured | Blue | Fair with light stubble |
| Rafael | Brazilian | 25 | Athletic surfer | Wavy dark | Hazel | Tanned warm |
| Kenji | Japanese | 33 | Athletic lean | Short black | Dark brown | Fair Japanese |
| Anders | Swedish | 22 | Slim tall | Blonde | Light blue | Very fair |
| Diego | Mexican | 35 | Average | Black short | Brown | Warm brown |
| Jamal | Nigerian | 32 | Plus-size | Bald | Dark brown | Deep rich black |
| Ravi | Indian | 29 | Slim | Dark neat | Dark brown | Warm brown |
| Chen Wei | Chinese | 50 | Average | Salt-pepper | Dark brown | Mature East Asian |
| Tyler | Mixed Race | 24 | Athletic | Curly brown | Light brown | Medium brown |
| Mateo | Colombian | 36 | Plus-size | Dark thick | Dark brown | Warm bronze |
| Rowan | Scottish | 28 | Athletic | Auburn red | Green | Fair with freckles |

## Technical Implementation

### Step 1: Generate Images in Batches
Use `google/gemini-3-pro-image-preview` for higher quality output.

Process in batches:
- Batch 1: Female models 1-10
- Batch 2: Female models 11-20  
- Batch 3: Male models 1-14

### Step 2: Replace All Image Files
Overwrite existing files in `src/assets/models/`:
- All 34 model portraits with consistent quality and backgrounds

### Step 3: No Code Changes Needed
The mockData.ts imports remain the same - only the image files change.

## Quality Checklist for Each Generated Portrait

Each portrait must have:
- [ ] Natural visible skin pores
- [ ] Realistic skin color variations
- [ ] Natural hair texture and shine
- [ ] Authentic eye reflections
- [ ] Subtle skin imperfections (natural, not flaws)
- [ ] Consistent bright white/gray gradient background
- [ ] Professional lighting with soft shadows
- [ ] Natural expression (not forced smile)
- [ ] Proper human proportions

## Files to Regenerate

```
src/assets/models/
├── model-female-slim-asian.jpg           (Yuki)
├── model-female-athletic-black.jpg       (Amara)
├── model-female-plussize-latina.jpg      (Isabella)
├── model-female-average-european.jpg     (Charlotte)
├── model-female-mature-european.jpg      (Victoria)
├── model-female-athletic-indian.jpg      (Priya)
├── model-female-slim-nordic.jpg          (Ingrid)
├── model-female-average-middleeast.jpg   (Layla)
├── model-female-plussize-african.jpg     (Nia)
├── model-female-petite-korean.jpg        (Soo-Min)
├── model-female-athletic-european.jpg    (Sofia)
├── model-female-athletic-latina.jpg      (Elena)
├── model-female-average-african.jpg      (Maya)
├── model-female-plussize-japanese.jpg    (Akiko)
├── model-female-average-nordic.jpg       (Freya)
├── model-female-slim-chinese.jpg         (Mei)
├── model-female-athletic-mixed.jpg       (Zara)
├── model-female-plussize-middleeast.jpg  (Fatima)
├── model-female-average-irish.jpg        (Sienna)
├── model-male-slim-middleeast.jpg        (Omar)
├── model-male-athletic-black.jpg         (Marcus)
├── model-male-average-asian.jpg          (Jin)
├── model-male-plussize-european.jpg      (Henrik)
├── model-male-athletic-european.jpg      (Liam)
├── model-male-athletic-latino.jpg        (Rafael)
├── model-male-athletic-japanese.jpg      (Kenji)
├── model-male-slim-nordic.jpg            (Anders)
├── model-male-average-latino.jpg         (Diego)
├── model-male-plussize-african.jpg       (Jamal)
├── model-male-slim-indian.jpg            (Ravi)
├── model-male-average-chinese.jpg        (Chen Wei)
├── model-male-athletic-mixed.jpg         (Tyler)
├── model-male-plussize-latino.jpg        (Mateo)
└── model-male-athletic-scottish.jpg      (Rowan)
```

## Expected Result
- 34 hyper-realistic fashion model portraits
- Consistent bright studio backgrounds
- Natural skin textures visible at thumbnail size
- Professional fashion photography quality
- All body types, ethnicities, and ages represented authentically

