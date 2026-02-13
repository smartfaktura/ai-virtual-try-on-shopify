

## Add 15 New European/American Models (10 Female + 5 Male)

### New Models

**10 Females:**

| ID | Name | Body Type | Ethnicity | Age | File Name |
|----|------|-----------|-----------|-----|-----------|
| 035 | Olivia | Slim | American | Young Adult | model-female-slim-american.jpg |
| 036 | Emma | Athletic | British | Adult | model-female-athletic-british.jpg |
| 037 | Clara | Average | German | Young Adult | model-female-average-german.jpg |
| 038 | Amelie | Slim | French | Adult | model-female-slim-french.jpg |
| 039 | Giulia | Athletic | Italian | Young Adult | model-female-athletic-italian.jpg |
| 040 | Lina | Average | Swedish | Young Adult | model-female-average-swedish.jpg |
| 041 | Mila | Slim | Spanish | Adult | model-female-slim-spanish.jpg |
| 042 | Daphne | Athletic | Greek | Young Adult | model-female-athletic-greek.jpg |
| 043 | Natalie | Average | American | Adult | model-female-average-american.jpg |
| 044 | Elise | Slim | Dutch | Young Adult | model-female-slim-dutch.jpg |

**5 Males:**

| ID | Name | Body Type | Ethnicity | Age | File Name |
|----|------|-----------|-----------|-----|-----------|
| 045 | Ethan | Athletic | American | Young Adult | model-male-athletic-american.jpg |
| 046 | James | Average | British | Adult | model-male-average-british.jpg |
| 047 | Lucas | Slim | French | Young Adult | model-male-slim-french.jpg |
| 048 | Matteo | Athletic | Italian | Adult | model-male-athletic-italian.jpg |
| 049 | Sebastian | Average | German | Young Adult | model-male-average-german.jpg |

### Implementation Steps

**Step 1: Create one-time edge function to generate portraits**

Create `supabase/functions/generate-model-portraits/index.ts` that:
- Loops through all 15 model definitions
- Uses `google/gemini-2.5-flash-image` with prompt: "Hyper-realistic studio portrait photo of a beautiful [gender] fashion model, [nationality/ethnicity], [age range], [body build], naturally pretty face with soft features, warm natural expression, soft studio lighting, minimalist light gray background, shoulders visible, looking at camera, high-end model card photo"
- Decodes the base64 response and uploads each image to `landing-assets/models/` storage bucket
- Returns the list of generated file paths

**Step 2: Update `src/data/mockData.ts`**

- Add 15 new image URL constants after line 1135 (before the pose section)
- Add 15 new model entries to the `mockModels` array after line 1249

**Step 3: Deploy and run the edge function once**

Call the deployed function to generate all 15 portraits and populate the storage bucket. After verification, delete the edge function since it is a one-time utility.

### Result

Model library grows from 34 to 49 models with strong European/American representation. All model selectors in Workflows and Freestyle automatically display the new models.

