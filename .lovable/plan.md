

## Diagnosis: Why Perspective Generation Produces No Visible Results

### Root Cause: Silent FK Violation

The generation **did succeed** — the image was generated and uploaded to storage. But it never appeared in the library because of a **silent database insert failure**.

**The chain of events:**
1. User selects a library image as source (e.g., from a workflow result)
2. The library item gets a synthetic ID like `"job-e591eed9-8276-44c1-ac2d-25193a30c0e2-1"`
3. The hook passes this as `productId` in the payload (only `'direct'` is filtered to `null`)
4. The edge function tries to insert into `freestyle_generations` with `product_id = 'job-e591eed9-...'`
5. The `freestyle_generations_product_id_fkey` FK constraint rejects it — `user_products` has no such ID
6. **Supabase JS doesn't throw on FK errors** — it returns `{ error }`, but the code never checks `.error`. It logs "Saved" regardless.
7. Result: Image exists in storage but no DB record. User sees nothing in library.

### Secondary Issue: No Results View

After generation, the page only shows a toast ("Perspectives queued!"). There is no results loading screen, no redirect to library, and no inline results gallery. The user has to manually navigate to Library and hope to find it.

---

### Fix Plan

#### 1. `src/hooks/useGeneratePerspectives.ts` — Fix productId for non-product sources

The hook currently only nullifies `productId` when `product.id === 'direct'`. Library-sourced items have IDs like `"fs-..."` or `"job-..."` which aren't valid FK references.

**Fix:** Nullify `productId` for any ID that isn't a valid UUID from `user_products`:
```typescript
// Any synthetic ID (starts with 'direct', 'fs-', 'job-') should be null
const isRealProductId = !['direct', 'fs-', 'job-'].some(prefix => product.id.startsWith(prefix));
productId: isRealProductId ? product.id : null,
```

#### 2. `supabase/functions/generate-freestyle/index.ts` — Check insert error

Add `.error` check after the `freestyle_generations` insert so failures are logged properly:
```typescript
const { error: insertErr } = await supabase.from('freestyle_generations').insert({...});
if (insertErr) {
  console.error('Failed to save freestyle_generations:', insertErr.message);
} else {
  console.log('Saved freestyle_generations record for image ' + (i + 1));
}
```

#### 3. `src/pages/Perspectives.tsx` — Navigate to library after generation

Update `onComplete` to navigate to the library page so users can see results:
```typescript
onComplete: () => {
  refreshCredits();
  toast.success('Perspectives queued! Check your library for results.');
  navigate('/app/library');
},
```

### Files Changed

| File | Change |
|------|--------|
| `src/hooks/useGeneratePerspectives.ts` | Fix productId — nullify synthetic IDs from library/scratch sources |
| `supabase/functions/generate-freestyle/index.ts` | Check `.error` on freestyle_generations insert |
| `src/pages/Perspectives.tsx` | Navigate to library on completion |

