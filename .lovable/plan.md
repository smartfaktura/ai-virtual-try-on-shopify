

## Safe fix — show scene names + thumbnails on `/app/admin/scene-performance`

### Is it safe?

Yes. This is a one-line read policy on a non-sensitive catalog table.

- `product_image_scenes` is a **public catalog of available scenes** — every authenticated user already sees this exact data inside `/app/generate/product-images`.
- We only add a **SELECT** policy. No INSERT/UPDATE/DELETE exposure.
- Admin-only write policies (insert/update/delete) stay exactly as they are.
- Zero impact on generation, credits, queues, or any user data.
- Trivial rollback: `DROP POLICY` reverts instantly.

### Why it's needed

The admin dashboard fetches scene metadata client-side:
```ts
supabase.from('product_image_scenes').select('scene_id,title,…')
```
The table currently has an `authenticated`-only SELECT policy, but the lookup is silently returning empty for the admin page's metadata join — so rows show raw IDs (`closeup-detail-hats-watches`) instead of names + thumbnails.

### The change (one SQL statement)

```sql
CREATE POLICY "Public can read scene catalog"
ON public.product_image_scenes
FOR SELECT
TO anon, authenticated
USING (true);
```

That's it. No code changes. No edge function changes. No schema changes.

### What stays untouched

- Generation pipeline, credits, RLS on user data — untouched
- Admin write policies on `product_image_scenes` — untouched
- All other tables — untouched
- Frontend code — untouched

### Validation

1. Reload `/app/admin/scene-performance`
2. Rows show real names (`Frozen Aura`, `Close-Up Detail`, …) + thumbnails
3. Category column shows real values instead of `—`
4. Top risers rail also gets names + thumbnails

### Rollback (if ever needed)

```sql
DROP POLICY "Public can read scene catalog" ON public.product_image_scenes;
```

