

## Vision

A **native, premium learning layer** that lives inside the app — not a separate help center. Think Linear/Notion-style "Learn" surface: short, scannable, action-oriented, beautifully typed, with one-click "Try it now" CTAs that drop the user into the actual flow. Scalable to all app areas, but launching with **Catalog Studio (Visual Types)** + **Freestyle Studio**.

Terminology stays consistent with existing memory: **Visual Studio** (route /app/workflows), **Visual Types** (the cards), **Freestyle Studio** (route /app/freestyle), **Catalog Studio** (route /app/catalog).

---

## UX format chosen (and why)

After weighing options (tooltips, modals, full pages, expandables), the right format here is a **dedicated `/app/learn` hub + per-Visual-Type detail pages**, surfaced contextually from the existing UI. Reasons:

- **Hub page** → discoverable, scalable, indexable for future areas (Video, Brand Models, etc.)
- **Per-guide detail page** → enough room for visual examples + dos/don'ts without feeling like docs
- **Contextual entry points** (subtle "Learn how" links on cards, empty states, header) → users who need help find it; users who don't aren't blocked
- **No long-form docs, no walkthrough overlays** (we already have the Freestyle inline coachmark for first-time, and that stays)

---

## Information architecture

```text
/app/learn                          ← Hub: 2 sections (Catalog Studio · Freestyle Studio)
/app/learn/visual-studio/:slug      ← Per Visual Type guide (10 guides)
/app/learn/freestyle                ← Freestyle Studio guide
```

Each guide page uses the same template — one component, content-driven by a TS config file. Adding a new guide = appending one object.

---

## Per-guide layout (single template)

```text
┌─────────────────────────────────────────────────┐
│  ← Back to Learn          [time chip · 2 min]   │
│                                                 │
│  [Hero thumbnail / animated preview]            │
│                                                 │
│  Visual Type · Product Visuals                  │
│  Brand-ready product shots, fully art-directed. │
│                                                 │
├─ What it does ──────────────────────────────────┤
│  1-2 sentences. Plain language.                 │
├─ Best for ──────────────────────────────────────┤
│  • PDP heroes  • Editorial campaigns  • Ads     │
├─ What you need ─────────────────────────────────┤
│  • 1 product photo (clean bg preferred)         │
│  • Optional: brand profile, model               │
├─ What you get back ─────────────────────────────┤
│  • 2K PNG · choice of aspect ratio · 1000+ scenes│
├─ Quick start (3 steps) ─────────────────────────┤
│  ① Pick product  ② Pick scene  ③ Generate       │
├─ Tips ──────────────────────────────────────────┤
│  ✓ Use a sharp source image                     │
│  ✓ Pair with a Brand Profile for cohesion       │
│  ✗ Don't upload screenshots or watermarked pics │
├─ Visual examples (3-image strip) ───────────────┤
│  [img] [img] [img]                              │
└─ [ Start now → ]   [ See examples in Explore ]──┘
```

Premium touches: Inter typography, generous vertical rhythm, subtle section dividers, fade-in animation, mobile-stack at <768px. Reuses existing `<PageHeader>`, `<Button>`, `<Badge>`, `<ShimmerImage>`, `<Card>`. No new design tokens.

---

## Hub page layout (`/app/learn`)

```text
Learn                                  [Search guides …]
Get the most out of VOVV.AI in minutes.

CATALOG STUDIO · 9 guides
┌──────┐ ┌──────┐ ┌──────┐
│ card │ │ card │ │ card │  ← 3-col grid (2-col tablet, 1-col mobile)
└──────┘ └──────┘ └──────┘   each card: thumb, title, 1-line, "2 min"

FREESTYLE STUDIO · 1 guide
┌──────────────────────────┐
│ Freestyle Studio Basics  │  ← featured wide card
└──────────────────────────┘

COMING SOON
Video · Brand Models · Brand Profiles    (greyed chips)
```

---

## Discovery (entry points)

| Where | What |
|---|---|
| **Sidebar** | Add "Learn" item under a new tiny `LEARN` section at the bottom (icon: `GraduationCap`, path: `/app/learn`) |
| **Visual Studio cards** (`/app/workflows`) | Subtle `Learn how →` text link on each `WorkflowCardCompact` (bottom-left, muted) |
| **Catalog Studio empty state** (`/app/catalog`, no jobs) | Quick-start card linking to its guide |
| **Freestyle Studio header** | Small `Learn` ghost button next to existing controls |
| **Freestyle existing inline coachmark** (`FreestyleGuide.tsx`) | Add `View full guide →` link in the "Got it!" final step |
| **Dashboard** | One "Learn the basics" tip card (reuses existing `DashboardTipCard`) |

Nothing intrusive. No modal overlays. No forced tours.

---

## Content blueprint (10 guides)

All copy follows the same structure. Drafts (final wording in implementation, but locked-in tone):

1. **Product Visuals** — Brand-ready shots across 1000+ scenes. Best for PDP, ads, campaigns. Need: 1 product photo. Get: 2K editorial images.
2. **Virtual Try-On Set** — Garment on diverse AI models. Best for fashion PDPs. Need: flat-lay garment + chosen model. Get: try-on shots in poses.
3. **Selfie / UGC Set** — Creator-style content. Best for paid social, TikTok. Need: product + model. Get: authentic UGC-style images.
4. **Flat Lay Set** — Overhead styled arrangements. Best for IG grid, editorial. Need: product. Get: top-down compositions with props.
5. **Mirror Selfie Set** — Worn/held mirror selfies in real rooms. Best for lifestyle, TikTok. Need: product + model. Get: phone-in-hand mirror shots.
6. **Interior / Exterior Staging** — Stage empty rooms or boost curb appeal. Best for real estate, hospitality. Need: room/exterior photo. Get: staged version, architecture preserved.
7. **Picture Perspectives** — One photo → 9 angles. Best for PDP completeness. Need: 1 hero photo. Get: close-up, back, side, wide-angle variants.
8. **Image Upscaling** — Sharpen to 2K/4K. Best for upgrading legacy assets. Need: any image. Get: sharper textures, faces, detail.
9. **Catalog Studio (bulk)** — Generate full catalog runs. Best for stores with many SKUs. Need: multiple products. Get: catalog-ready set per SKU.
10. **Freestyle Studio basics** — Free-form prompt + image. When to use vs Catalog: Catalog = structured/scalable, Freestyle = exploratory/one-off. How to write better prompts (subject + style + camera + light), upload tips, dos/don'ts.

---

## Phased implementation

### Phase 1 — Foundation (single PR)
- Create `src/data/learnContent.ts` (typed config: `LearnGuide[]`)
- Create `src/pages/Learn.tsx` (hub) + `src/pages/LearnGuide.tsx` (template)
- Add routes in `App.tsx`: `/app/learn`, `/app/learn/visual-studio/:slug`, `/app/learn/freestyle`
- Build the per-guide template component (`src/components/app/learn/GuideLayout.tsx`) with all sections
- Ship hub + 3 highest-value guides (Product Visuals, Virtual Try-On, Catalog Studio)
- Add sidebar "Learn" entry

### Phase 2 — Full Visual Types coverage
- Add remaining 6 Visual Type guides + Freestyle guide
- Add `Learn how →` link on `WorkflowCardCompact`
- Add Freestyle header `Learn` button
- Add Catalog Studio empty-state CTA card
- Link from final step of existing `FreestyleGuide` coachmark

### Phase 3 — Polish & engagement
- Visual example images (3 per guide, pulled from existing Discover assets where possible — no new uploads needed initially)
- Dashboard "Learn the basics" tip
- Hub-page search (client-side filter — guides are <20 items)
- "Mark as read" persisted in `localStorage` (subtle ✓ on hub cards) — optional, no DB
- Smooth fade-in on guide load

### Phase 4 — Scale-out (future, not this build)
- Video guides
- Brand Models / Brand Profiles guides
- Optional: Supabase-backed analytics on which guides get opened

---

## Technical notes

- **Content lives in TypeScript**, not the DB. Faster to iterate, type-safe, no migrations. If we ever want CMS-style edits, we move to a `learn_guides` table later — interface stays the same.
- **One template, content-driven** → guarantees visual consistency across all 10+ guides.
- **No new deps.** Reuses shadcn primitives + existing icons (`lucide-react`).
- **Mobile-first.** Single-column stack <768px; CTAs sticky-bottom on mobile.
- **Memory updates** I'll write after build:
  - `mem://features/learn-guides-system` — architecture, content config location, how to add a guide
  - Update `mem://ui/sidebar-and-navigation` Core line to include `Learn` section

---

## Acceptance

- `/app/learn` hub renders all guides grouped by section
- Each guide renders the same template with all 8 content blocks
- Sidebar shows "Learn" entry; clicking lands on hub
- All 10 guides have final copy, fitting the "concise + action-oriented" voice
- Every guide has working "Start now →" CTA that routes into the actual flow
- Mobile layout is clean at 375px wide
- Adding a new guide is a single object append in `learnContent.ts`

