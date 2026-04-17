

## Goal
Fix three issues on `/app/learn/*` detail pages:
1. **Alignment** — guide page width doesn't match the hub, so it feels shifted
2. **Visual polish** — too flat, doesn't match the hub's panel rhythm
3. **Content** — generic SaaS copy, not VOVV-specific or actionable

---

## 1. Fix alignment (the real "pushed right" issue)

Today: hub uses `max-w-3xl`, guide uses `max-w-2xl`. Both `mx-auto` inside the same AppShell — so the narrower guide column visibly shifts and looks disconnected from the hub.

**Fix:** Match the hub container exactly.
- `GuideLayout` outer wrapper → `max-w-3xl mx-auto pt-2 pb-24` (same as `Learn.tsx`)
- Inner reading column for prose → `max-w-2xl` *inside* the outer container, left-aligned (not centered), so left edge lines up perfectly with hub rows. Right side gets natural breathing room. This preserves comfortable reading line-length while keeping the content anchored to the same left rail as the hub.
- "Back to Learn" pill aligns to that same left rail (drop the `-ml-2` negative margin which causes a subtle shift).

Result: navigating hub → guide → hub feels like one continuous canvas.

---

## 2. Visual polish — match the hub's panel rhythm

The hub introduced soft panels (`rounded-xl border border-border/60 bg-card/40 divide-y`). Guide page should echo that language without becoming card-heavy.

**Header refresh**
- Tiny uppercase eyebrow above title showing the track (e.g. `GETTING STARTED · 2 MIN READ`) — replaces the standalone "min read" pill
- Title stays `text-3xl md:text-4xl font-semibold tracking-tight`
- Tagline `text-lg text-muted-foreground` with `max-w-[58ch]` for editorial line-length
- Slim divider rule below header (`border-b border-border/50 pb-10 mb-12`) — anchors the header as a real hero block

**Body sections**
- Keep the flat typographic rhythm BUT split into two subtle visual treatments:
  - **"Quick start" and "Tips & best practices"** → wrap in soft panel (`rounded-xl border border-border/50 bg-card/30 p-6`) — these are the action-oriented blocks, deserve anchoring (matches hub panel pattern)
  - **Other prose sections** (What it does / Best for / What you need / What you get back) → stay as plain typographic blocks with the small uppercase label, but pair them in a 2-col grid on `md+` for "Best for / What you need / What you get back" so the page reads denser and more designed (less endless scrolling)
- "What it does" stays full-width as the lead paragraph (slightly larger: `text-[16px] leading-relaxed`)

**Step numerals (Quick start)**
- Refine the numbered chip to a cleaner outlined style (`border border-border/60 bg-background text-foreground/70`) — feels less "form-y"
- Steps separated with `divide-y divide-border/40` inside the panel for clear sequence

**Tips**
- Replace the small bg-circle Check/X with cleaner inline markers: green-tinted `+` for Do, muted `–` for Don't, both `text-[12px] font-semibold` in a tiny rounded chip — quieter, more editorial
- Or even simpler: just two columns — "Do" and "Avoid" — inside the tips panel, no icons at all. Cleaner, scannable. **Going with this.**

**CTA footer**
- Wrap CTA in a soft panel matching Quick start style: `rounded-xl border border-border/50 bg-card/30 p-6 mt-16`
- Helper line bumped to `text-[13px] font-medium text-foreground/80` ("Ready to try it?")
- Buttons stay rounded-full

---

## 3. Content quality — make it VOVV-specific & actionable

Audit of current `learnContent.ts`: items like *"PDP hero images"*, *"Brand refreshes"* under Best for, or *"One sharp product photo"* under What you need are okay but vague. Steps like `{ label: 'Generate' }` are fillers. Tips are broad.

**Schema upgrade in `src/data/learnContent.ts`** — add new optional fields the layout will render when present (back-compat: existing fields keep working):

```ts
interface LearnGuide {
  // ...existing fields stay
  
  // NEW: a one-liner that answers "When should I pick THIS over similar ones?"
  whenToUse?: string;
  
  // NEW: optional comparison row — "Use X if … Use Y if …"
  vsAlternatives?: { label: string; useThisWhen: string }[];
  
  // Existing quickStart upgraded — every step gets a real `detail`
  // Existing tips — tightened to be specific & VOVV-aware
}
```

The layout adds a **new "When to use this"** section right after the hero (replaces the vague feeling). If `vsAlternatives` is present, render it as a compact 2-col block ("Use Product Visuals if you need… · Use Catalog Studio if you need…").

**Content rewrite — every guide gets:**
- A sharper `tagline` (already mostly good, light edits)
- New `whenToUse` one-liner
- `vsAlternatives` for the 4 most-confused workflows: Product Visuals / Catalog Studio / Freestyle / Try-On
- `bestFor` rewritten as concrete VOVV use-cases (e.g. "Replacing low-res Shopify catalog shots before a paid campaign" instead of "PDP hero images")
- `whatYouNeed` made input-specific (e.g. "Front-facing product photo at 1024px+ — no shadows, no lifestyle background, no watermark")
- `whatYouGet` made output-specific with what NOT to expect
- `quickStart` — every step now has a specific `detail` tied to the actual VOVV UI (e.g. `detail: 'Tap "Add Product" in Step 1 of the wizard, then drop your front-on photo. Wait for "Analysis complete".'`)
- `tips` — concrete dos/don'ts mentioning real VOVV features ("Lock a Brand Profile in Step 3 before generating — switching mid-batch breaks consistency.")

**Files where content lives:** all in `src/data/learnContent.ts` — single source of truth, rewrites are append-friendly.

---

## Files touched

- `src/data/learnContent.ts` — add `whenToUse` + `vsAlternatives` to type; rewrite copy for all 11 guides (concrete, VOVV-specific, actionable)
- `src/components/app/learn/GuideLayout.tsx` — width fix (`max-w-3xl` outer / `max-w-2xl` inner left-aligned), header eyebrow + divider, soft panels for Quick start + Tips + CTA, 2-col grid for short prose sections, refined step chips, "Do / Avoid" two-col tips, new "When to use" + optional "Use this vs alternatives" sections

No changes to: routing, hub page, sidebar, `useLearnRead`.

---

## Acceptance

- Guide page left edge lines up exactly with hub list rows (no shift on navigation)
- Header reads as a real hero (eyebrow + title + tagline + divider)
- Quick start, Tips, and CTA sit in soft panels matching hub language
- "Best for / What you need / What you get back" render side-by-side on desktop, stacked on mobile
- Every guide has a `whenToUse` line and concrete VOVV-specific copy
- 4 confused workflows have `vsAlternatives` comparisons
- Quick start steps each have actionable detail tied to real wizard UI
- Tips read as practical Do / Avoid, no generic fluff
- Still zero icons spam, no thumbnails, no progress UI
- Clean at 1276px desktop and 375px mobile

