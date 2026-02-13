

## Regenerate 15 Model Portraits to Match Existing Style

### Problem
The last batch of generated portraits (models 035-049) doesn't match the visual style of the original 34 models. The originals have:
- Face perfectly centered in frame
- Consistent soft studio lighting
- Minimalist light gray background
- Tight head-and-shoulders crop with face as the main focal point
- Clean, polished fashion model card aesthetic

The new ones look more casual, with faces off-center and inconsistent framing.

### Fix: Regenerate All 15 with Improved Prompts

Keep the same diverse roster but use a prompt that closely matches the original generation style. Key prompt changes:
- Emphasize **"face centered in frame, symmetrical composition"**
- Use **"head and shoulders portrait, face fills most of the frame"** instead of "close-up from chest up"
- Add **"looking directly at camera, eyes at center of image"**
- Match the original prompt style: "soft studio lighting, minimalist light gray background, high-end model card photo"

### Updated Model List (same 15, better prompts)

| ID | Name | Gender | Body | Ethnicity | Prompt Hair/Look Details |
|----|------|--------|------|-----------|--------------------------|
| 035 | Olivia | F | Slim | American | Long blonde hair, blue eyes, sun-kissed skin |
| 036 | Marcus | M | Athletic | African American | Short fade haircut, dark skin, strong jawline |
| 037 | Yuna | F | Slim | Korean | Straight black hair, porcelain skin |
| 038 | James | M | Average | British | Silver-grey hair, light beard, distinguished |
| 039 | Sofia | F | Athletic | Spanish | Dark wavy hair, olive skin, brown eyes |
| 040 | Ethan | M | Athletic | American | Messy brown hair, green eyes |
| 041 | Sienna | F | Average | Italian | Auburn red hair, freckles |
| 042 | Nina | F | Slim | Scandinavian | Platinum blonde pixie cut, fair skin |
| 043 | Andre | M | Slim | French | Dark curly hair, light stubble, hazel eyes |
| 044 | Priya | F | Athletic | Indian | Long dark hair, warm brown skin |
| 045 | Clara | F | Average | German | Honey blonde bob, blue-green eyes |
| 046 | Daphne | F | Slim | Greek | Long dark brown hair, Mediterranean tan |
| 047 | Leo | M | Athletic | Brazilian | Tanned skin, dark wavy hair, bright smile |
| 048 | Elise | F | Average | Dutch | Strawberry blonde hair, light freckles |
| 049 | Kai | M | Average | Hawaiian/Mixed | Dark skin, curly black hair |

### Implementation Steps

**Step 1: Recreate edge function with style-matched prompts**

Create `supabase/functions/generate-model-portraits/index.ts` with an improved prompt template:

"Hyper-realistic studio portrait of a beautiful [gender] fashion model, [ethnicity], [age], [hair/look details]. Face perfectly centered in frame, symmetrical composition, head and shoulders crop, face fills most of the image, eyes at center of image, looking directly at camera. Soft diffused studio lighting, minimalist light gray background, high-end fashion model card photo, sharp focus on face."

Each model gets unique hair/skin/feature details appended to prevent repetitive results.

**Step 2: No changes to `src/data/mockData.ts`**

The model entries and file names stay exactly the same (model-035-olivia.jpg through model-049-kai.jpg). Only the images in storage get replaced.

**Step 3: Deploy, run once, then delete the edge function**

Generate all 15 portraits, uploading to the same storage paths (overwriting old images). Then remove the temporary edge function.

### Result

All 15 new models will have the same centered-face, studio-lit, light-gray-background aesthetic as the original 34 models, while maintaining the diverse mix of hair colors, skin tones, ethnicities, and ages.

