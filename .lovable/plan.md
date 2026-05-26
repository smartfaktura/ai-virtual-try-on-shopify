## /app/product-swap — QA report

Walked the full wizard (Scene → Products → Review → would-be Generate) on desktop (1350) and mobile (390). Core flow renders cleanly, hydration from `sessionStorage` works, ratio detection picks 3:4 correctly, library + product grids load, cost summary math is right. No console errors or failing network calls.

### Issues worth fixing

1. **Dead mobile branch in the "Selected" tray (Step 2)** — `src/pages/ProductSwap.tsx:834`. Outer wrapper is `hidden sm:block`, so the entire selected-products tray is hidden on mobile. Inside, there is still a `flex sm:hidden` "Mobile" subtree that can never render (lines 841–863). On mobile, users currently rely only on the small "1 / 50 selected" badge — fine, but the dead block is confusing. **Fix:** delete the unreachable `flex sm:hidden` block; keep only the desktop branch.

2. **"Swap more products" resets too much (results view)** — `ProductSwap.tsx:462`. After completion, the primary CTA clears scene, scene source, products, and step (back to step 1). The intended iterative loop is "same scene, different products". **Fix:** keep `sceneUrl` / `sceneTitle` / `sceneSource`; clear only `selectedProductIds` and jump to `setCurrentStep(2)`.

3. **Optimistic ETA on generating view** — `ProductSwap.tsx:342`. `estimatedTotal = genTotalCount * 8` seconds is far below real Pro-model latency (typically 25–45s/image). Users see "Est. 6s – 10s" then sit through a minute+. **Fix:** bump to `genTotalCount * 30`. (Aligns with the 4–6 min Short Film standard's "real ETA" convention.)

### Notes (no change needed)

- `data-hide-studio-chat` works (chat bubble hidden after hydration).
- Polling uses `pollVersionRef` for stale-result rejection; cleanup is correct.
- Aspect detection via `new Image()` works without CORS since only `naturalWidth/Height` are read.
- `forceProModel: true` + `quality: 'high'` + per-image cost 6 credits matches the cost summary.
- Library query is capped at 200 + 200 rows, signed via `toSignedUrls` — OK.
- No client-side size guard on combined scene+product base64 payload (each request ≈ scene + 1 product). If both source images are very large (>4 MB each), the edge function payload could approach 10 MB. Not seen in normal use; leaving as a known limit.

### Files touched

- `src/pages/ProductSwap.tsx` only (no hook / edge function changes).
