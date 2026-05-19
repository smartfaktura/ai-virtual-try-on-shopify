## Fix: brand model reference image silently replaced by `index.html` (Product Images + Catalog only)

### Why freestyle works but Product Images doesn't

Three flows consume brand models, but they read the URL differently:

| Flow | Code | URL used |
|---|---|---|
| Freestyle (`pages/Freestyle.tsx:563`) | `selectedModel.previewUrl` | Always real Supabase `https://` URL. Works. |
| Product Images (`pages/ProductImages.tsx:826`) | `found.sourceImageUrl \|\| found.previewUrl` | Prefers "source" for stronger identity match. **Breaks** on AI-generated models. |
| Catalog (`pages/CatalogGenerate.tsx:244`) | `m.sourceImageUrl \|\| m.previewUrl` | Same as Product Images. Same silent bug. |

When a brand model is created from a text description (not from an uploaded photo), `BrandModels.tsx:384` writes `user_models.source_image_url = 'generator'` — a metadata flag, not a URL. `useUserModels.toModelProfile` exposes that flag as `sourceImageUrl`. Because `'generator'` is a truthy string, the `||` short-circuit picks it; then `convertImageToBase64('generator')` falls into the "relative URL" branch, fetches `/generator` against the preview origin, the SPA returns `index.html`, and the HTML gets base64-encoded as `data:text/html;base64,...` and shipped to the AI as the model reference.

Verified in queue payload `dd0f0dca-4420-4588-89b4-4dbce7ce3a56` (Tomas job, info@tsimkus.lt): `model.imageUrl` decodes exactly to the Vite dev shell HTML. The generation pipeline then has no image, falls back to text descriptors (name + gender + ethnicity + age + body type), and renders a stranger.

Freestyle is unaffected because it never reads `sourceImageUrl`.

### Fix — two surgical edits, defence in depth

**1. `src/hooks/useUserModels.ts` — primary fix (mask the bad flag at the source)**

One-line change inside `toModelProfile`:

```ts
sourceImageUrl: (m.source_image_url && /^https?:\/\//i.test(m.source_image_url))
  ? m.source_image_url
  : m.image_url,
```

Effect: any value that isn't an actual http(s) URL — today only the literal `'generator'`, but also any future flag — is filtered out, and callers fall back to the real `image_url` (the high-res generated portrait). Fixes both Product Images and Catalog in one shot without touching either call site, and freestyle stays unchanged because it doesn't read this field.

**2. `src/lib/imageUtils.ts` — secondary guard (so this failure mode can never silently base64 HTML again)**

Add two checks to `convertImageToBase64`:

- Reject non-URL inputs up front:
  ```ts
  if (!imageUrl || (!/^https?:\/\//i.test(imageUrl) && !imageUrl.startsWith('data:') && !imageUrl.startsWith('/') && !imageUrl.startsWith('blob:'))) {
    throw new Error(`[imageUtils] Invalid image URL: ${imageUrl}`);
  }
  ```
- After fetch, if `response.headers.get('content-type')` does not start with `image/` (and isn't `application/octet-stream`), throw instead of base64-encoding the body. Loud failure beats silent garbage.

### Safety analysis — what could break?

- **Consumers of `sourceImageUrl`**: full grep covered. Two read it (`ProductImages.tsx:826`, `CatalogGenerate.tsx:244`), both purely as a URL passed to `convertImageToBase64`. No code branches on the literal `'generator'`. Falling back to `image_url` is exactly what we want — that's the high-res generated portrait.
- **Photo-upload brand models**: `source_image_url` is already a real `https://` URL → passes the regex unchanged → no behaviour change.
- **Built-in models** (`useCustomModels.ts:41`): already sets `sourceImageUrl: m.image_url` → unaffected.
- **Freestyle**: doesn't touch `sourceImageUrl` → unaffected.
- **Catalog flow**: same silent bug exists today; will be fixed as a strict improvement (catalog generations with text-generated models stop degrading).
- **`imageUtils` new validation**: every existing caller passes either a Supabase `https://` URL, a `data:` URL, an absolute path like `/placeholder.svg`, or a `blob:` URL from `URL.createObjectURL` (Freestyle line 458–470). All four pass the new pre-check. The content-type check only rejects responses that aren't images — which today only happens in this exact bug.
- **No DB migration**: leaving `source_image_url='generator'` in the 8-ish rows is harmless because the hook now masks it. Backfilling would change zero behaviour.
- **No edge function changes**: `generate-user-model` keeps writing `'generator'` as intentional metadata; generation/queue functions never read that field — they read whatever `imageUrl` the frontend sends.

### Verification after deploy

1. Ask user to regenerate a Product Image with brand model "Tomas".
2. Inspect new `generation_queue` row: `payload->'model'->>'imageUrl'` should start with `https://azwiljtrbtaupofwmpzb.supabase.co/storage/...jpg` (`convertImageToBase64` returns full https URLs unchanged) — **not** `data:text/html;...`.
3. Visually confirm the rendered person resembles Tomas.

### Out of scope

- Cleaning the legacy `'generator'` string from existing rows.
- Refactoring `BrandModels.tsx` to write `null` instead of `'generator'` (would need a DB nullability migration; current bug fully neutralised without it).
- Any change to generation edge functions, prompt builders, or freestyle.
