

# Expand Model Library - Add 18 New Diverse Models

## Overview
Add 18 new hyper-realistic AI model profiles to achieve better gender balance and ethnic/body type diversity. Models will be generated using AI image generation to match the existing high-quality portrait style.

## New Models to Create

### Male Models (10 new - bringing total to 14)

| Name | Body Type | Ethnicity | Age | Description |
|------|-----------|-----------|-----|-------------|
| **Liam** | Athletic | European (British) | Adult | Athletic build, light brown hair, blue eyes, stubble |
| **Rafael** | Athletic | Latino (Brazilian) | Young Adult | Athletic surfer build, wavy dark hair, warm skin |
| **Kenji** | Athletic | Japanese | Adult | Lean athletic, short black hair, defined jawline |
| **Anders** | Slim | Nordic (Swedish) | Young Adult | Tall slim, blonde, light eyes, sharp features |
| **Diego** | Average | Latino (Mexican) | Adult | Medium build, dark hair, warm brown skin |
| **Jamal** | Plus Size | Black African | Adult | Larger build, bald/short hair, rich dark skin |
| **Ravi** | Slim | South Asian (Indian) | Adult | Lean, dark hair, warm brown complexion |
| **Chen Wei** | Average | Chinese | Mature | Distinguished, greying temples, wise expression |
| **Tyler** | Athletic | Mixed (Black/European) | Young Adult | Athletic, curly hair, medium brown skin |
| **Mateo** | Plus Size | Latino (Colombian) | Adult | Plus size, friendly expression, dark features |

### Female Models (8 new - bringing total to 18)

| Name | Body Type | Ethnicity | Age | Description |
|------|-----------|-----------|-----|-------------|
| **Sofia** | Athletic | European (Italian) | Adult | Toned, olive skin, dark wavy hair |
| **Elena** | Athletic | Latina (Mexican) | Young Adult | Fit dancer build, long dark hair |
| **Maya** | Average | Black African | Adult | Natural hair, rich brown skin, warm smile |
| **Akiko** | Plus Size | Japanese | Adult | Plus size, elegant features, black hair |
| **Freya** | Average | Nordic (Norwegian) | Young Adult | Fresh-faced, light blonde, natural look |
| **Mei** | Slim | Chinese | Mature | Elegant mature, greying, sophisticated |
| **Zara** | Athletic | Mixed (Black/White) | Young Adult | Athletic, curly hair, light brown skin |
| **Fatima** | Plus Size | Middle Eastern | Adult | Plus size, hijab option, warm features |

## Coverage Matrix After Implementation

```text
                    FEMALE (18 total)                    MALE (14 total)
              Slim  Athletic  Average  Plus    |    Slim  Athletic  Average  Plus
Young Adult    4       2         1       2     |      2       2         1       0
Adult          0       2         2       2     |      2       4         2       2
Mature         2       0         0       0     |      0       0         1       1

Ethnicities: East Asian, South Asian, Black African, European, Nordic, 
             Latino/Hispanic, Middle Eastern, Mixed/Biracial
```

## Implementation Steps

### Step 1: Generate Model Images with AI
Use Gemini image generation with detailed prompts for each model:
- Professional headshot/portrait style
- Neutral gray gradient background
- Natural lighting, soft shadows
- Visible from shoulders up
- Neutral, confident expression
- High skin texture detail

### Step 2: Create Image Assets
Save generated images to:
```
src/assets/models/
├── model-male-athletic-european.jpg     (Liam)
├── model-male-athletic-latino.jpg       (Rafael)
├── model-male-athletic-japanese.jpg     (Kenji)
├── model-male-slim-nordic.jpg           (Anders)
├── model-male-average-latino.jpg        (Diego)
├── model-male-plussize-african.jpg      (Jamal)
├── model-male-slim-indian.jpg           (Ravi)
├── model-male-average-chinese.jpg       (Chen Wei)
├── model-male-athletic-mixed.jpg        (Tyler)
├── model-male-plussize-latino.jpg       (Mateo)
├── model-female-athletic-european.jpg   (Sofia)
├── model-female-athletic-latina.jpg     (Elena)
├── model-female-average-african.jpg     (Maya)
├── model-female-plussize-japanese.jpg   (Akiko)
├── model-female-average-nordic.jpg      (Freya)
├── model-female-slim-chinese.jpg        (Mei)
├── model-female-athletic-mixed.jpg      (Zara)
└── model-female-plussize-middleeast.jpg (Fatima)
```

### Step 3: Update mockData.ts
Add new model entries with imports and ModelProfile objects.

### Step 4: Update Existing Files
- Add imports for new model images
- Extend `mockModelProfiles` array with 18 new entries

## AI Image Generation Prompt Template

For consistent, realistic results:

```
Professional fashion model portrait photograph. [Name], [gender], [ethnicity], 
[age range], [body type] build. Studio headshot with neutral gray gradient 
background. Natural soft lighting with subtle rim light. Shoulders and face 
visible. Confident, approachable expression. Ultra realistic skin texture with 
natural pores, subtle imperfections. Shot on Canon EOS R5, 85mm f/1.4, 
fashion photography quality. No makeup exaggeration, natural beauty.
```

## Technical Details

**Files to modify:**
- `src/data/mockData.ts` - Add 18 new model entries with imports

**Files to create:**
- 18 new model image files in `src/assets/models/`

**Estimated credits:**
- 18 AI image generations x 1 credit = 18 credits

## Result
After implementation:
- **32 total models** (18 female + 14 male)
- Every body type represented for both genders
- 10+ ethnicities covered
- Young Adult, Adult, and Mature ages balanced
- Professional, consistent portrait quality

