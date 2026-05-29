Refine `src/components/library/SceneDetailModal.tsx`:

**1. Smaller, image-true modal**
- `DialogContent`: `sm:max-w-2xl md:max-w-4xl lg:max-w-[58rem]`, `max-h-[90vh]` (down from `lg:max-w-6xl` / `92vh`)
- Grid: `md:grid-cols-[4fr_3fr]` — image column drives width; at 4:5 the panel height naturally matches the hero
- Hero column: **remove `md:aspect-auto`** so the image keeps its native `aspect-[4/5]` on every breakpoint (no stretch, no crop)
- Body padding back to a calmer `p-6 sm:p-8 md:p-10`

**2. Better copy**
- Skip the redundant description when it equals the title (current DB has `description === title`, so "City Corner Ease / City Corner Ease" shows twice). Treat `description === title` as empty.
- Improved fallback description: *"An editorial direction crafted by VOVV.AI. Upload your own product and we'll restage it in this exact mood — same light, same composition, your brand."*
- Helper microcopy under the CTA, rewritten and split into a two-sentence body (so it can keep punctuation per the core rule): *"Upload one product photo. We adapt the styling, lighting, and composition while keeping your product true to life."*
- Title sizing toned back to `sm:text-[1.75rem] md:text-3xl` to match the smaller frame

No logic, data, or prop changes.
