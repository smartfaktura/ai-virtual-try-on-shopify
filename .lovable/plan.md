## Goals
1. Replace the "Built for visually demanding products" section with a **trust block** (testimonials) — honest, low-key, sample/early-user style. No fake metrics.
2. Slim down the **"One scene, every product"** section copy and visuals.
3. In **"Create visuals in minutes"**:
   - Fix the weird upload icon (the small "cap" + bottle silhouette reads strange).
   - Tone down/replace the busy animations.
   - Update CTA to **"Start Generating Free"**.

---

## 1. New `HomeTrustBlock` (replaces `HomeCategoryExamples`)

Create `src/components/home/HomeTrustBlock.tsx` and swap it in `src/pages/Home.tsx` for `HomeCategoryExamples`. Delete `HomeCategoryExamples.tsx`.

**Layout** — 3-column testimonial grid, premium minimal (matches the design language):
- Eyebrow: `EARLY USERS` (uppercase, tracked, muted)
- H2: `What early users are saying` *(honest, doesn't claim mass adoption)*
- Sub: `Sample feedback from creators and brands testing VOVV during early access.` *(makes it explicit these are early/sample quotes — not fake testimonials)*

**Three testimonial cards** (white card, rounded-3xl, subtle border, no avatars — use a simple monogram circle with initials in muted bg):
- Quote glyph (lucide `Quote` icon, muted, top-left)
- Short quote (1–2 sentences, realistic and specific)
- Footer: monogram circle + name (initials only, e.g. `M.L.`) + role (e.g. `Jewelry founder`)

Quotes (kept honest and specific to features the product actually has):
1. *"Being able to test 10 angles for one bag in five minutes — that alone replaces a whole afternoon of shooting."* — **M.L.**, Jewelry founder
2. *"Locking a single visual direction across my skincare line keeps the catalog feeling like one brand, not a Frankenstein."* — **D.K.**, Skincare brand owner
3. *"I use it to mock up campaign ideas before committing to a real shoot. Saves a ton of back-and-forth."* — **A.R.**, Ecommerce photographer

A single small disclaimer line under the grid in muted text:
`* Early-access feedback from beta testers.`

---

## 2. Simplify `HomeOnBrand`

Edit `src/components/home/HomeOnBrand.tsx`:

- **Title** stays: `One scene, every product.` (drop the long em-dash tail)
- **Subtitle** shorter: `Lock the look once. Every product drops into the same scene.`
- **Left panel ("Visual direction")** — keep the 5 settings rows but **remove the 3 bullet "points" block at the bottom** (`One scene, infinite products` etc.) — they repeat the headline.
- **Right grid** — keep the 4 existing images (already same-scene/different-product). Add a tiny caption above the grid: `Same scene · 4 products` in small uppercase muted text, so the demo reads instantly.

Net result: noticeably less text, same visual demonstration.

---

## 3. Fix `HomeHowItWorks`

Edit `src/components/home/HomeHowItWorks.tsx`:

### Step 1 — Upload (clean redesign)
Drop the bottle "silhouette + cap" hack. Replace with a single, clean **Upload Card** mock:
- Centered `Upload` icon (size 36) inside a soft circular badge
- Below it: `Drop product photo` text bar (small grey bar)
- Below that: small `PNG · JPG` chip
- Container: dashed rounded-2xl, neutral bg
- Animation: a subtle one-time `translate-y` float on the upload icon (slow, 3s ease-in-out infinite, range only ±2px). No "ping" rings.

### Step 2 — Choose shots (calmer)
- Keep the 1000+ chip + faux search bar.
- Keep the 2x2 placeholder grid.
- Remove the rotating selection ring + per-tile staggered shimmer (too busy).
- Replace with: **one** tile at a time gets a subtle `bg-foreground/5` highlight + thin ring, cycling slowly across the 4 tiles every ~2.5s. Calm and obvious.
- Drop the `search-grow` animation.

### Step 3 — Generate (calmer)
- Remove the looping fade-out / fade-in (looks like a glitch).
- Make the 3 rows simply mount with a one-time staggered fade-in via `useScrollReveal`. After mount, they sit still.

### CTA
- Button text: `Start Generating Free`
- Keep the small "No studio. No models. No complex setup." line.

### Cleanup
- Remove the `<style>` block keyframes that are no longer used (`shimmer`, `bounce-soft`, `search-grow`, `row-in`, `select-1..4`).
- Keep only `float` (very subtle).

---

## Files
- create `src/components/home/HomeTrustBlock.tsx`
- delete `src/components/home/HomeCategoryExamples.tsx`
- edit `src/pages/Home.tsx` (swap import)
- edit `src/components/home/HomeOnBrand.tsx`
- edit `src/components/home/HomeHowItWorks.tsx`
