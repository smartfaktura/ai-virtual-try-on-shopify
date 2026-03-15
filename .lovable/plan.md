

## Update Perspectives Page: Three Source Types + Better Messaging

### Problem
The current Perspectives page only lets users select from `user_products` or upload from scratch. Users also need to select from **Library generated assets** (freestyle_generations / generation_jobs). Additionally, the UI doesn't clearly communicate that for products, the **first image** will be used for generation.

### Plan

#### 1. Redesign Step 1 — Source Selection with 3 tabs/cards

Replace the current "Select Products" section with a **source type selector** (3 cards, like the screenshot shows but with correct options):

- **From Library** — Browse and select from previously generated images (freestyle_generations + generation_jobs)
- **From Products** — Select from user_products (with note: "The primary product image will be used")
- **From Scratch** — Upload your own image file

Only one source type active at a time. Switching clears previous selection.

#### 2. Add Library picker

When "From Library" is selected, show a grid of library items fetched from `freestyle_generations` and `generation_jobs` (simplified query — just need id, image_url, label, created_at). Users can multi-select up to 10. Each selected item passes its `imageUrl` as the source.

New query in Perspectives.tsx:
```typescript
const { data: libraryItems = [] } = useQuery({
  queryKey: ['perspectives-library-items'],
  queryFn: async () => {
    // Fetch recent freestyle + job results with images
    const [fs, jobs] = await Promise.all([
      supabase.from('freestyle_generations').select('id, image_url, prompt, created_at').order('created_at', { ascending: false }).limit(50),
      supabase.from('generation_jobs').select('id, results, created_at, status').eq('status', 'completed').order('created_at', { ascending: false }).limit(50),
    ]);
    // Merge and flatten into { id, imageUrl, title } format
  },
  enabled: sourceType === 'library',
});
```

#### 3. Update Products picker messaging

Add a subtle info note below the product grid:
> "The primary product image will be used as the source for perspective generation."

#### 4. Update `useGeneratePerspectives` hook

The hook already accepts `ProductInput[]` with `{ id, imageUrl, title }`. Library items and direct uploads can be mapped to the same interface — no hook changes needed, just different data sources on the page.

#### 5. File changes

| File | Change |
|------|--------|
| `src/pages/Perspectives.tsx` | Add source type selector (library/products/scratch), add library item picker, add messaging about primary image, restructure Step 1 |

No other files need changes — the hook interface already supports any image source.

