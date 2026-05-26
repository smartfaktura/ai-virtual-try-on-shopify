Three polish edits to `src/pages/ProductSwap.tsx` only.

### 1. "Select visible" → toggle + Clear
- Make the button context-aware: if every product currently visible is already selected, the button reads **"Unselect visible"** and removes them; otherwise it reads **"Select visible"** and adds them (existing behavior).
- Add a small ghost **"Clear"** link next to the `N / 50 selected` badge, shown only when `selectedProductIds.size > 0`. Clears the whole set in one click.

### 2. Remove duplicate titles/subtitles
Today every step shows: page title + page subtitle ("Product Swap / Same scene, different product") **and** a step-level H2 + helper. That's two title pairs.

Fix: keep the **page subtitle once on Step 1 only**, and drop the per-step subtitle on Step 1; keep step-level H2 (just the heading, no subtitle) on Steps 2 & 3. Net result:
- **Step 1** — page header: "Product Swap" + "Same scene, different product". Step body: just the heading "Pick the scene you want to reuse" and the picker (no second subtitle line).
- **Step 2** — page header: "Product Swap" only (subtitle hidden). Step body: heading "Choose products to swap in" + tiny helper "Max 50" (keep helper because it's a constraint, not duplicate copy).
- **Step 3** — page header: "Product Swap" only. Step body: heading "Review and generate" only (drop the "Everything looks right…" line).

Implementation: render the page subtitle conditionally on `currentStep === 1`. Remove `<p>` subtitle elements inside each step block per above.

### 3. Cleaner library scene name (fixes "Product Visuals" weirdness)
Root cause: library items derive their `title` from `workflowName || productTitle || 'Generated'`, so every Product Visuals output reads "Product Visuals" — meaningless to the user.

Fixes:
- In the `libraryItems` query mapping: swap priority to `productTitle || workflowName`, and when the result is the generic workflow label "Product Visuals" (or empty), fall back to a short date string like `"Library · May 25"` (built from `created_at`).
- In the **selected scene preview** (Step 1 confirmation row) and the **Review summary scene card**: when `sceneSource === 'library'`, show **"Library scene"** as the primary line and the (now-better) `sceneTitle` as the small secondary line. When `sceneSource === 'scratch'`, primary is "Uploaded image" and secondary is the filename if known.
- In the **generating view** header (results page area, around line 322–339): replace the `sceneTitle` usage in the H1 area with a generic "Your swapped scenes" / "Swapping products…" wording (already present) and drop any place that surfaces the raw `sceneTitle` as user-facing copy.

### Out of scope
No backend, hook, generation, RLS, or stepper changes.