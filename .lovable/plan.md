

## Regenerate 15 Models with Better Portraits

### Problems with Current Generation
- All portraits look similar (same generic "model card" style)
- All females grouped together, then all males -- no mixing
- No hair variety specified (color, length, style)
- No skin tone variety in prompts
- Age range too narrow (mostly "young-adult" and "adult", no mature/older)
- Prompt was too generic, producing repetitive results

### Fix: Replace All 15 Models with Better, More Diverse Versions

Replace models 035-049 with a mixed, diverse set. Better prompts with specific hair, skin, and style details. Interleave male and female entries.

**New mixed model list (replacing 035-049):**

| ID | Name | Gender | Body | Ethnicity | Age | Hair / Look Details |
|----|------|--------|------|-----------|-----|---------------------|
| 035 | Olivia | Female | Slim | American | Young Adult | Long blonde hair, blue eyes, sun-kissed skin |
| 036 | Marcus | Male | Athletic | African American | Adult | Short fade haircut, dark skin, strong jawline |
| 037 | Yuna | Female | Slim | Korean | Young Adult | Straight black hair, porcelain skin, soft features |
| 038 | James | Male | Average | British | Mature | Silver-grey hair, light beard, distinguished look |
| 039 | Sofia | Female | Athletic | Spanish | Adult | Dark wavy hair, olive skin, warm brown eyes |
| 040 | Ethan | Male | Athletic | American | Young Adult | Messy brown hair, green eyes, casual look |
| 041 | Sienna | Female | Average | Italian | Mature | Auburn red hair, freckles, elegant features |
| 042 | Nina | Female | Slim | Scandinavian | Young Adult | Platinum blonde pixie cut, fair skin |
| 043 | Andre | Male | Slim | French | Adult | Dark curly hair, light stubble, hazel eyes |
| 044 | Priya | Female | Athletic | Indian | Adult | Long dark hair, warm brown skin, striking eyes |
| 045 | Clara | Female | Average | German | Young Adult | Honey blonde bob, blue-green eyes |
| 046 | Daphne | Female | Slim | Greek | Adult | Long dark brown hair, Mediterranean tan |
| 047 | Leo | Male | Athletic | Brazilian | Young Adult | Tanned skin, dark wavy hair, bright smile |
| 048 | Elise | Female | Average | Dutch | Mature | Strawberry blonde hair, light freckles, warm smile |
| 049 | Kai | Male | Average | Hawaiian/Mixed | Adult | Dark skin, curly black hair, relaxed expression |

### Implementation Steps

**Step 1: Recreate the edge function with improved prompts**

Create `supabase/functions/generate-model-portraits/index.ts` with:
- Close-up portrait framing: "Close-up portrait headshot from chest up"
- Specific hair descriptions per model (blonde, redhead, black, curly, pixie, etc.)
- Specific skin tone descriptions
- Specific eye color / facial features
- Each prompt unique to avoid repetitive results

Example prompt: "Close-up portrait headshot from chest up of a beautiful young woman, American, long flowing blonde hair, blue eyes, sun-kissed golden skin, naturally pretty face, soft warm smile, soft studio lighting, minimalist light gray background, fashion model quality, high-end editorial photo"

**Step 2: Update `src/data/mockData.ts`**

- Replace the 15 image URL constants (lines 1137-1151) with new file names matching the new models
- Replace the 15 model entries (lines 1267-1281) with the new mixed, diverse list above
- Models are interleaved: female, male, female, male... mixing ages and ethnicities

**Step 3: Deploy, run, then delete the edge function**

Generate all 15 new portraits, upload to storage (overwriting old files where names overlap, adding new ones), then remove the edge function.

### Result

The model selector will show a much more visually interesting and diverse grid with:
- Mixed gender ordering (not all F then all M)
- Visible hair variety (blonde, black, red, auburn, pixie, curly, silver)
- Skin tone variety (fair, olive, dark, tanned, porcelain)
- Age variety (young adult, adult, mature)
- Each portrait is a closer crop for better visual impact

