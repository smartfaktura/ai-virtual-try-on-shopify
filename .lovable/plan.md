

## Regenerate All 10 Remaining Models (Excluding Sofia) with Fresh Faces

### What We're Doing
Regenerating all 10 models from the last batch (keeping Sofia as the style reference) with completely new faces and matching Sofia's tight, centered head-and-shoulders framing.

### Models to Regenerate (10 total)

| # | Name | Gender | Ethnicity | Age | Unique Look Details |
|---|------|--------|-----------|-----|---------------------|
| 035 | Olivia | F | American | Young Adult | Long blonde hair, blue eyes, sun-kissed skin |
| 036 | Marcus | M | African American | Adult | Short fade haircut, dark skin, strong jawline |
| 040 | Ethan | M | American | Young Adult | Messy brown hair, green eyes |
| 041 | Sienna | F | Italian | Mature | Auburn red hair, freckles |
| 044 | Priya | F | Indian | Adult | Long dark hair, warm brown skin |
| 045 | Clara | F | German | Young Adult | Honey blonde bob, blue-green eyes |
| 046 | Daphne | F | Greek | Adult | Long dark brown hair, Mediterranean tan |
| 047 | Leo | M | Brazilian | Young Adult | Tanned skin, dark wavy hair, bright smile |
| 048 | Elise | F | Dutch | Mature | Strawberry blonde hair, light freckles |
| 049 | Kai | M | Hawaiian/Mixed | Adult | Dark skin, curly black hair |

Sofia (039) stays untouched -- she's the gold standard.

### Prompt Strategy

Use a prompt closely modeled on what produced the Sofia portrait:

> "Hyper-realistic studio portrait photo of a [beautiful/handsome] [gender] fashion model, [ethnicity], [age description], [specific hair/skin/eye details]. Face perfectly centered in frame, symmetrical composition, head and shoulders portrait, face fills most of the frame, eyes at center of image, looking directly at camera with a natural confident expression. Soft diffused studio lighting, minimalist light gray background, high-end fashion model card photo, sharp focus on face, 85mm lens look."

Key additions vs previous attempts:
- "85mm lens look" for consistent shallow-depth feel
- "natural confident expression" instead of generic smile
- "face fills most of the frame" to match Sofia's tight crop

### Implementation Steps

**Step 1: Create temporary edge function**

Create `supabase/functions/generate-model-portraits/index.ts` with the 10 model definitions and the improved prompt template. Process one at a time to ensure quality. Upload each to `landing-assets/models/` overwriting existing files.

**Step 2: No code changes needed**

Since the file names remain identical (model-035-olivia.jpg, etc.), `src/data/mockData.ts` stays untouched. Only the storage images get replaced.

**Step 3: Deploy, execute, verify, then delete the function**

Run the function once, confirm all 10 images uploaded, then remove the temporary edge function and its config entry.

