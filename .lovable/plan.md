## Change
Update the `image-upscaling` workflow description in the `workflows` table (and align the matching strings in code) so it only references 4K.

### 1. Migration — update DB description
```sql
UPDATE public.workflows
SET description = 'Sharpen any image to 4K and recover textures, faces, and fine detail.'
WHERE slug = 'image-upscaling';
```

### 2. `src/data/learnContent.ts` (line 309)
Change `tagline: 'Sharpen any image to 2K or 4K.'` → `tagline: 'Sharpen any image to 4K.'`

No other UI changes — the Visual Studio card reads `description` straight from the workflows row.