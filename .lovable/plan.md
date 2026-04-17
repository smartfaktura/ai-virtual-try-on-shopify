

## Problems with current `/app/learn/visual-studio/product-images`

1. **Factually wrong** — guide says "6-step wizard" but the real `STEP_DEFS` is **4 steps**: `Product → Shots → Setup → Generate` (steps 5/6 are internal Generating/Results screens, not user-facing wizard steps). Quick start refers to "Step 5" which doesn't exist for the user.
2. **Text-heavy** — wall of bullets across 6 sections, reads like a manual.
3. **Flat / lifeless** — no motion, no rhythm, no visual hook for what is the flagship feature.
4. **Generic structure** — uses the same template as every other guide, when this one deserves a hero treatment.

## Solution — make this guide a custom, animated walkthrough

Build a **bespoke layout** for `product-images` only (other guides keep current template). Replace the wall-of-text with a tight, animated 4-step walkthrough that mirrors the real wizard.

### New page structure (top → bottom)

**1. Hero** (animated)
- Eyebrow: `GETTING STARTED · 2 MIN READ`
- Title: "Product Visuals"
- One-line tagline (single sentence, no paragraph)
- **Animated mini-stepper** — 4 pill chips (Product / Shots / Setup / Generate) that fade-in sequentially on mount, with a subtle progress line connecting them. Pure CSS keyframes (`animate-fade-in`, staggered via `animation-delay`). No external lib.

**2. "When to use" — 2 quiet rows**
- "Use it for…" + "Skip it if…" — one line each. Replaces the verbose `vsAlternatives` block.

**3. The 4 steps — the centerpiece**
A vertical stack of 4 step cards. Each card:
- Big numeral (01–04), step name, one-line "what you do", one-line "why it matters"
- Soft panel matching hub style (`rounded-xl border bg-card/30 p-5`)
- **Scroll-reveal animation** using existing `useScrollReveal` hook — each card fades + slides up as it enters viewport
- Tiny inline visual cue per step (no images, just typographic/shape motif):
  - Step 1: small dashed upload-frame box
  - Step 2: 3 thumbnail-shaped placeholders in a row
  - Step 3: 2 small chip placeholders (model · brand)
  - Step 4: a pulsing dot + "~30s" label

This replaces "Quick start" + "What it does" + most of "Best for / What you need / What you get" into a single scannable, animated journey.

**4. Two compact 2-col blocks** (kept short)
- **Best for** (3 bullets max, tightened) | **What you'll need** (2 bullets max)
- Plain typography, no panels — keeps page light

**5. Tips — collapsed to 4 total**
- 2 Do · 2 Avoid in a single soft panel, two columns. Cut from current 5.

**6. CTA panel** (unchanged pattern)
- "Ready to try it?" + Open Product Visuals (primary) + See examples (secondary)

### Total content reduction
- Current: ~30 bullets across 6 sections + long paragraphs
- New: ~12 bullets total + 4 step cards + 1 tagline. ~60% less text, much higher signal.

### Animations (all CSS, no new deps)
- Hero stepper: staggered `animate-fade-in` with `animation-delay: {i * 120ms}`
- Step cards: existing `useScrollReveal` hook → `opacity-0 translate-y-2` → `opacity-100 translate-y-0` with 400ms transition
- Hero progress line: `animate-[progress_1.2s_ease-out_forwards]` scaling x from 0 → 1 (add keyframe to `tailwind.config.ts`)
- Step 4 "pulse" dot: `animate-pulse` on a 8px primary-tinted dot
- All respect `prefers-reduced-motion` via Tailwind's `motion-reduce:` variants

### Implementation approach

**Two files touched:**

1. **`src/data/learnContent.ts`** — rewrite the `product-images` guide entry only:
   - Fix "6-step" → "4-step" everywhere
   - Replace `quickStart` with **exactly 4 steps** matching real `STEP_DEFS` (Product · Shots · Setup · Generate)
   - Tighten `bestFor` to 3 items, `whatYouNeed` to 2, `tips` to 4 total
   - Remove redundant `whatItDoes` paragraph (subsumed by the steps)
   - Other 10 guides untouched

2. **`src/components/app/learn/GuideLayout.tsx`** — add a routing branch:
   - If `guide.slug === 'product-images'` → render new `<ProductVisualsGuide guide={...} />` component
   - Otherwise → existing layout (no regressions for other guides)

3. **New file `src/components/app/learn/ProductVisualsGuide.tsx`** — the bespoke animated layout described above. Reuses existing `useScrollReveal`, Button, and design tokens.

4. **`tailwind.config.ts`** — add one new keyframe (`progress-grow`) for the hero connector line.

### Acceptance
- Step count is correct (4, matching real wizard) everywhere on the page
- Page is visibly shorter and easier to scan than before
- Hero stepper animates in on load; step cards animate in on scroll
- Reduced motion users get a static version
- Other 10 guide pages render unchanged
- Mobile (375px): stepper wraps cleanly, step cards stack with proper spacing
- No new dependencies

