<final-text>
I checked the short-film reference loading flow again.

Short answer: your suspicion is partly right, but the main issue is not a backend timeout. The library requests are client-side and I can see successful 200 responses for products and model metadata. The real problem is that `/app/video/short-film` is loading and rendering the pickers in a very heavy way:

- all picker data starts loading as soon as the References step mounts
- the dialogs try to render entire libraries at once
- thumbnails use raw/original image URLs instead of lighter preview URLs
- the products query is unpaginated, so very large libraries can hit the 1000-row API cap
- the UI shows full-grid skeletons too aggressively, so it looks “stuck” even when data exists

Also important: admin-managed models are already wired into short film through `mockModels + model_sort_order`, and brand models are wired through `user_models`. So the source mapping is correct; the loading strategy is what needs to be fixed.
</final-text>

Implementation plan

1. Rebuild the short-film pickers to load on demand
- only fetch products when the Product dialog opens
- only fetch scenes when the Scene dialog opens
- only fetch model-related queries when the Model dialog opens
- stop preloading large libraries just by entering the References step

2. Stop rendering huge libraries all at once
- add search + initial visible slice for each picker
- render only the first batch initially
- add “Load more” / infinite-scroll behavior for long lists
- keep current results visible during background refetch instead of replacing everything with skeletons

3. Fix heavy image loading
- switch picker cards to optimized thumbnail URLs using the existing image optimization helper
- use small preview widths for products, scenes, and overridden admin model images
- keep original URLs only for the final selected reference asset, not the picker grid

4. Make large libraries robust
- paginate the products query so large `/app/products` libraries do not silently stop at the API row cap
- use lightweight scene fields for short-film picker needs instead of the full scene payload
- keep the merged model source, but page/filter the rendered grid so `/app/admin/models` changes still appear without choking the modal

5. Clean up the broken loading UX
- only show empty states after fetch completion
- only show skeletons when there is truly no data yet
- preserve loaded cards while images continue streaming in
- clear the dialog ref warning if it is still triggered by this picker composition

Files I expect to touch
- `src/components/app/video/short-film/ReferenceUploadPanel.tsx`
- `src/hooks/useProductImageScenes.ts`
- `src/hooks/useModelSortOrder.ts`
- possibly a small new lightweight picker hook for short-film libraries
- possibly `src/components/ui/dialog.tsx` only if the ref warning needs a direct cleanup

Technical details
- Products: real risk of row-cap + over-rendering
- Scenes: not a 1000+ limit issue right now, but still too many cards/images rendered at once
- Models: data merge is correct; rendering and thumbnail strategy are the weak points
- This does not need background job architecture; it needs lazy queries, pagination, and thumbnail optimization

QA I will run after implementation
- verify products from `/app/products` appear in short film
- verify admin-managed models from `/app/admin/models` appear in short film
- verify scenes open with real thumbnails and no blank/stuck grids
- test with mobile, tablet, and desktop
- verify picker open/close/search/load-more behavior stays responsive
- verify selected references are still added correctly after the picker refactor