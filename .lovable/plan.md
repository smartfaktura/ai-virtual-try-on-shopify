## Section: "One bag · A whole feed" (bags page only)

A meticulously detailed showcase section that mounts directly after `CategoryBuiltForEveryCategory` on `/ai-product-photography/bags`. The user's uploaded feed screenshot (1127 × 2000, portrait ≈ 9:16) is embedded as the visual hero.

## Vibe alignment (matches the rest of the page exactly)

Every spacing, type, and color decision is copied from `CategoryBuiltForEveryCategory` so the section reads as a member of the same family — not a guest.

- Section wrapper: `<section className="py-16 lg:py-32 bg-background overflow-hidden scroll-mt-24">`
- Inner container: `<div className="max-w-[1400px] mx-auto px-6 lg:px-10">`
- Eyebrow: `text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground` → `ONE BAG · WHOLE FEED`
- H2: `text-[#1a1a2e] text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight` → `Your entire feed from a single upload` (no terminal period — per memory rule for headers)
- Subtitle: `mt-4 text-sm sm:text-base text-muted-foreground max-w-xl` → `One product photo in — a month of posts, reels and PDP details out, on brand and on rhythm` (single sentence, no terminal period)
- Buttons: identical markup, sizing, and colors to the existing peer CTA block (h-[3.25rem], rounded-full, shadow-lg shadow-primary/25 for the primary; bordered for the secondary)
- Animation: `animate-in fade-in duration-700` on the image frame and a tiny `slide-in-from-bottom-2` on the text rail — matches the soft, restrained fades already used elsewhere

## Responsive layout (carefully tuned at every breakpoint)

The feed image is tall portrait, so the layout pivots:

```text
≥ lg (1024px+)        ┌──── text rail ────┐ ┌────── feed image ──────┐
                      │ eyebrow            │ │                        │
                      │ H2 (3 lines max)   │ │                        │
                      │ subtitle           │ │   9:16 portrait        │
                      │                    │ │   capped ~ 480px wide  │
                      │ • 12 posts         │ │   rounded-3xl frame    │
                      │ • 3 reels          │ │   soft shadow + ring   │
                      │ • 4 carousels      │ │                        │
                      │                    │ │                        │
                      │ [primary] [ghost]  │ │                        │
                      └────────────────────┘ └────────────────────────┘

sm – md (640–1023)    text rail full width, centered
                      then feed image centered below, max-w-[420px]

< sm (mobile)         single column, image capped at calc(100vw - 48px) but ≤ 360px
                      CTAs stack full width
```

Concrete classes:

- Grid wrapper: `grid grid-cols-1 lg:grid-cols-[1.05fr_minmax(0,520px)] gap-10 lg:gap-16 items-center`
- Text rail: `text-center lg:text-left mx-auto lg:mx-0 max-w-xl`
- Stat row: `flex items-center justify-center lg:justify-start gap-x-5 gap-y-2 flex-wrap text-[13px] text-foreground/70 tracking-wide` — each item rendered as `icon (lucide, 14px) + label`; separators are the natural gap, not bullets, to keep the editorial feel.
- CTA row: same `flex flex-col sm:flex-row gap-4 justify-center lg:justify-start` so the two buttons sit side by side from `sm+` and stack on mobile.
- Image frame: `relative w-full max-w-[420px] sm:max-w-[460px] lg:max-w-none lg:w-[480px] mx-auto lg:mx-0 aspect-[1127/2000] rounded-3xl overflow-hidden ring-1 ring-foreground/[0.06] bg-muted/30 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)]`
- `<img>` inside: `absolute inset-0 w-full h-full object-cover` with `loading="lazy"`, `decoding="async"`, `fetchpriority="low"`, descriptive alt.

## Small details that lift it from "fine" to "feels right"

- A whisper-thin "phone safe-area" bezel: the rounded-3xl frame uses a 1px ring at 6% opacity instead of a heavier border — feels like a soft mat, not a card. No fake notch, no fake status bar (would look gimmicky against the rest of the page).
- A subtle floating chip at the bottom-left of the image: `absolute left-4 bottom-4 inline-flex items-center gap-1.5 rounded-full bg-background/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/80 ring-1 ring-foreground/[0.06] shadow-sm`. Reads: `12 POSTS · 3 REELS`. Hidden on `xs` (< 360 CSS px) to avoid crowding.
- A second whisper-tag on the top-right: `ONE UPLOAD` in the same chip style with `bg-foreground/85 text-background`. Anchors the storytelling: input on the right, output below.
- Hover affordance: `transition-transform duration-700 hover:scale-[1.01]` on the image frame, matching the very restrained scale used in peer sections (no aggressive zoom).
- LCP guard: the image is below the fold, so `loading="lazy"` and `fetchpriority="low"` keep it from competing with the hero LCP.
- `prefers-reduced-motion: reduce` respected automatically by Tailwind's `motion-reduce:transition-none` on the image (added explicitly).
- The two stat-icon set uses three lucide icons already used elsewhere on the page so we don't introduce new visual vocabulary: `Grid3x3` (posts), `Film` (reels), `Layers` (carousels).
- Spacing between H2 and stat row: `mt-8`. Between stat row and CTAs: `mt-8 lg:mt-10`. Matches the vertical rhythm in `CategoryUseCases` / `CategoryBuiltForEveryCategory`.

## Files

- **Copy** `user-uploads://vovv.ai_bags-feed-1.jpg` → `src/assets/seo/bags-feed.jpg`  
  (Vite will hash + serve it; image is 1127×2000, ~ a few hundred KB — fine for lazy below-the-fold.)
- **New** `src/components/seo/photography/category/CategoryFeedShowcase.tsx`
  - `import feedImage from '@/assets/seo/bags-feed.jpg';`
  - Takes `{ page }: { page: CategoryPage }`.
  - Renders `null` when `page.slug !== 'bags'` so we don't accidentally show a bag screenshot on watches, etc. When you supply per-category feed images later, we'll extend this gate.
  - Reuses `Link` from `react-router-dom`, `ArrowRight`, `Grid3x3`, `Film`, `Layers` from `lucide-react`, and `getVisualLibraryHrefForCategory`.
- **Edit** `src/pages/seo/AIProductPhotographyCategory.tsx`
  - Import `CategoryFeedShowcase`.
  - Mount it directly under `<CategoryBuiltForEveryCategory page={page} />` and above `<CategoryVisualOutputs page={page} />`.

## Verification

After build, manually visit `/ai-product-photography/bags` at desktop (≥ 1280), tablet (768), and mobile (375). Confirm:
- Section spacing matches the section directly above it (same `py-16 lg:py-32` rhythm).
- Image stays within frame at all breakpoints, never overflows, retains 9:16 aspect.
- CTAs share the same height/style as the peer section's CTAs.
- Reduced-motion users get no hover scale.
- Other category pages (e.g. `/ai-product-photography/watches`) render unchanged.

## Out of scope

- No feed sections for other category pages yet (need their own screenshots).
- No DB, hooks, admin overrides, or interactive overlays on the image.
- No new color tokens, font weights, or layout primitives — strict reuse of the page's existing system.
