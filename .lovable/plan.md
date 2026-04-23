

## QA-only plan: verify Recreate-from-Explore → Product Images

Investigation only. No code edits. I'll spot-check code, query the DB, and run the live preview to confirm all three fixes hold.

### Steps

1. **Code spot-check (read-only)**
   - `src/pages/Discover.tsx` `handleUseItem` — confirm scene items pass `scene`, `sceneId`, `sceneImage`, `sceneCategory`, `fromDiscover=1`.
   - `src/components/app/DiscoverDetailModal.tsx` Recreate CTA — same params; Add-to-Discover picker uses `useDiscoverPickerOptions`.
   - `src/pages/ProductImages.tsx` resolver — priority `sceneId` → `sceneCategory` → `sceneImage` → product analysis → `candidates[0]`; waits when analyses pending.
   - `src/components/app/product-images/ProductImagesStep2Scenes.tsx` — `discoverSceneFull` renders From-Explore card immediately and injects `categoryCollection` into `priorityCategories`.

2. **DB sanity (read-only SQL)**
   - All 9 "Frozen Aura" rows distinct by `category_collection` + `preview_image_url`.
   - Active scene total matches what Add-to-Discover modal shows.

3. **Live preview QA (browser tool)**
   - `/app/discover` → click Beverages "Frozen Aura" → Recreate this.
   - Confirm URL: `/app/generate/product-images?scene=Frozen+Aura&sceneId=…&sceneImage=…&sceneCategory=beverages&fromDiscover=1`.
   - Pick a beverage product → Step 2 → "From Explore" card appears <200 ms with **beverages** preview, pre-ticked.
   - Repeat with Watches variant → confirm watches card.
   - Library → admin → Add to Discover → Scene picker shows all 9 Frozen Aura rows with `category · sub_category` captions.

4. **Regression spot-check**
   - Prompt-only preset Recreate → still routes to Freestyle.
   - `workflow_slug='product-images'` preset Recreate → routes to product-images with correct scene.

### Deliverable

Short report: ✅/❌ per validation step, with exact URL/screenshot/console evidence. If all pass, mark done. If any fail, I come back with a separate patch plan — no code edits in this loop.

### Out of scope

No file edits. No DB writes. No edge function deploys. If the preview requires login, I stop and ask.

