

## Fix: Show User's Original Prompt Instead of Backend-Engineered Prompt

### Problem
When a user clicks "Copy prompt" on a generated image in Freestyle, the app copies the **backend-engineered prompt** (which includes auto-built model descriptions, scene context, brand tone, etc.) back into the editor. The screenshot shows this clearly — the prompt area contains text like "Create a new professional product photograph featuring the item shown in the reference image. Use a fresh angle, creative composition, and professional lighting Portrait of a female, average, Nordic model set in a Urban NYC Street environment — Gritty New York street with" — this is the auto-built `finalPrompt`, not what the user typed.

### Solution
Add a `user_prompt` column to the `freestyle_generations` table to store the user's raw typed prompt separately from the engineered prompt. Use this column for the "Copy prompt" action.

### Changes

**1. Database migration** — Add `user_prompt` column
```sql
ALTER TABLE public.freestyle_generations
ADD COLUMN user_prompt text;
```

**2. `src/hooks/useFreestyleImages.ts`**
- Add `userPrompt` to `FreestyleImage` and `SaveImageMeta` interfaces
- Store `user_prompt` when inserting rows
- Read `user_prompt` when fetching rows

**3. `src/pages/Freestyle.tsx`**
- Pass the user's raw `prompt` (from the textarea) as `userPrompt` in the save meta
- Change `onCopyPrompt` to use `userPrompt` instead of `prompt` (falls back to `prompt` for older images without `user_prompt`)

**4. `src/components/app/freestyle/FreestyleGallery.tsx`**
- Update the copy button to use `img.userPrompt || img.prompt` so it prefers the user's original prompt but falls back gracefully for older generations

This is backward-compatible — existing images without `user_prompt` will still copy the engineered prompt as before.

