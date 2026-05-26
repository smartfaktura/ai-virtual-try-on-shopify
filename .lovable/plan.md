# Product Swap Workflow

A new workflow at `/app/product-swap` that lets users keep a reference scene exactly as-is and only replace the hero product with one or more products from their library.

## User flow

```text
Step 1  Pick scene reference
        ├── Upload image, OR
        └── Select from Library
Step 2  Pick one or many products from /app/products
Step 3  Review + Generate
Step 4  Results grid (reuses Product Images results)
```

One job per selected product (fan-out via `enqueue_generation`). Output count = number of products picked.

## What gets built

**Frontend**
- New page `src/pages/ProductSwap.tsx` — 3-step wizard
- Thin hook `src/hooks/useProductSwap.ts` — handles upload, enqueue loop, polling
- Route added in `src/App.tsx` at `/app/product-swap`
- Sidebar entry under Visual Studio (alphabetically near Perspectives)
- Reuses: `LibraryDetailModal` picker pattern, Product Images Step 2 product picker, `ProductImagesStep6Results` grid

**Backend**
- ~15 lines added to `supabase/functions/generate-freestyle/index.ts`: when `mode === 'product_swap'`, prepend a hardened directive:
  - "Replicate the source image pixel-for-pixel: identical camera angle, focal length, framing, lighting, background, props, and composition."
  - "Fully remove the original product. Replace with the provided product reference. No drift, no re-interpretation, no added elements."
  - Lock aspect ratio to source image's ratio (detect from upload/library asset metadata)
  - Force model to Gemini 3 Pro (only model that holds composition reliably)

**Database**
- One workflow row insert (slug `product-swap`, sort order positioned to appear in `/app/workflows` grid)
- One workflow preview tile image uploaded to `workflow-previews` bucket

**Sync per memory rule**
- Update `studio-chat` SYSTEM_PROMPT and `StudioChat` PAGE_CHIPS to include Product Swap as a Visual Type

## Cost / credits

Same per-image cost as Perspectives / Freestyle (Gemini 3 Pro tier). Total credits = per-image × number of selected products. Standard `enqueue_generation` reservation + refund-on-fail flow.

## Out of scope

- No new model integration
- No new edge function (extends existing `generate-freestyle`)
- No editing of the scene itself (that's already handled by Image Editing workflow)

## Effort

~half a day end-to-end (wizard + edge tweak + DB row + sidebar/chat sync + QA).

## Risks

- **Composition drift** — Gemini 3 Pro is good but not perfect; some scenes (extreme close-ups, complex hands-holding-product shots) may still drift slightly. Mitigation: explicit directive + locked aspect ratio.
- **Ghost product** — if original product isn't fully masked, traces can remain. Mitigation: explicit "fully remove" language in directive.
- **Aspect ratio mismatch** — must read source image dimensions and pass exact ratio, not default 4:5.
