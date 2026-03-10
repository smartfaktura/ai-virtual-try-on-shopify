

## Add 10 New American/European-Market Models with AI-Generated Previews

### The 10 New Models

| # | Name | Gender | Body Type | Look | Gap Filled |
|---|------|--------|-----------|------|------------|
| 1 | **Hannah** | Female | Slim | Classic blonde American | All-American blonde (young) |
| 2 | **Jordan** | Male | Athletic | African American | Young athletic Black American male |
| 3 | **Emma** | Female | Average | Brunette American | Girl-next-door everywoman |
| 4 | **Chris** | Male | Average | Light brown hair American | Everyday American guy |
| 5 | **Natalie** | Female | Athletic | Mixed race American | Biracial American female |
| 6 | **Jake** | Male | Plus-size | American | Young plus-size American male |
| 7 | **Megan** | Female | Plus-size | American redhead | Plus-size American (non-Latina/African) |
| 8 | **Daniel** | Male | Slim | British | Classic British/European slim |
| 9 | **Sarah** | Female | Average | American mature | Mature American everywoman |
| 10 | **Ryan** | Male | Athletic | American classic | Classic American athletic |

### Changes — 3 files

**1. `supabase/functions/generate-asset-previews/index.ts`**
- Add 10 new entries to the `ALL_ASSETS` array (indices 19–28) with model portrait prompts
- Each prompt follows the Sofia benchmark: "Professional headshot portrait, centered head-and-shoulders, symmetrical framing, 85mm lens, sharp focus on face, minimalist light gray background, [specific description]"
- Storage paths: `models/model-050-hannah.jpg` through `models/model-059-ryan.jpg`
- Uses `google/gemini-3-pro-image-preview` (already configured)
- After deploy, trigger from admin panel with `start_index: 19` and `batch_size: 2` (5 batches of 2)

**2. `src/data/mockData.ts`**
- Add 10 new URL constants (line ~1148): `const model050Hannah = getLandingAssetUrl('models/model-050-hannah.jpg')` etc.
- Add 10 new entries to `mockModels` array (model_050 through model_059) with proper `ModelProfile` fields

**3. `src/components/landing/ModelShowcaseSection.tsx`**
- Update badge text from "44+" to "55+"
- Add 5 new models to ROW_1, 5 to ROW_2

### Prompt Style (matching existing models)

All 10 prompts follow the exact same pattern that produced consistent results for models 035–049:

```text
"Professional headshot portrait of [description]. Perfectly centered 
head-and-shoulders composition, symmetrical framing, 85mm lens 
aesthetic with sharp focus on the face, minimalist light gray 
background, natural skin texture, professional studio lighting, 
ultra high resolution"
```

With specific descriptions like:
- Hannah: "a slim young American woman in her early 20s with long straight blonde hair, blue eyes, warm natural smile"
- Jordan: "a young athletic African American man in his mid 20s with a short fade haircut, strong jawline, confident expression"
- etc.

### Execution Flow
1. Deploy updated edge function
2. Trigger 5 batches (start_index 19, batch_size 2 each) from admin
3. Verify images in storage bucket
4. Deploy frontend updates with new model data and marquee entries

