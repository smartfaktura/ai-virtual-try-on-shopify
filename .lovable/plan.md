## Goal
Restructure the Brand Scenes wizard to feel Typeform-style — one focused question per screen, consistent vertical rhythm, no squished/duplicated chrome — while keeping the existing VOVV.AI design tokens (Inter, neutral palette, rounded-2xl, current chip/card components).

## What's wrong today
1. **WizardLayout** stacks: thin step bars + tiny step labels (10px, truncate on narrow viewports) + large title + content + sticky footer that *also* echoes the current step label → noisy and redundant.
2. Step labels squish on 6-7 segments and the per-step label under the bar is illegible at common widths.
3. Heavy steps (Step4Cast 742 lines, Step5Photography 262 lines) cram many `Section` blocks into a single scroll — opposite of "one question, full focus".
4. Inconsistent vertical rhythm: page uses `space-y-8`, Sections use `space-y-3.5`, content area forces `min-h-[280px]` regardless of step content → alignment drifts.
5. Sticky footer left-side "current step label" tag duplicates the breadcrumb above; eats horizontal space on mobile.

## Restructure (keeps every color/font/component)

### 1. WizardLayout — quieter chrome, true centering
- Replace per-step labels row with a single hairline progress track (`h-0.5`) + right-aligned "Step n / m · {currentLabel}" in muted text. No more truncating 10px row.
- Lift `max-w-3xl` to `max-w-2xl` for typeform-like reading line; center vertically inside a min-height column (`min-h-[calc(100svh-...)]` flex column) so short steps (Step0, Step1) sit in the optical middle instead of clinging to the top.
- Title block: serif-free, current Inter, but bump to `text-3xl sm:text-4xl`, `tracking-tight`, with a small monospaced step number prefix (`01.`) above title — classic Typeform "question marker". Subtitle is single line of muted text.
- Drop redundant left-side label inside sticky footer. Footer becomes: hint (only when `nextDisabledReason`) · Back · Next. Counter moves out (already in top track).

### 2. Consistent vertical rhythm
- Standardize spacing tokens used inside steps:
  - Between top of step body and first Section: `mt-10`.
  - Between Sections: `space-y-10` (currently mixed 6/8).
  - Inside a Section: keep `space-y-3.5`.
- Remove `min-h-[280px]` content clamp from WizardLayout; replaced by vertical-center column so all steps feel anchored consistently.

### 3. Step content discipline (Typeform "one focus" rule)
No copy changes, no question removals — just visual grouping:
- **Step4Cast** & **Step5Photography**: wrap their multiple Sections in a single column with `divide-y divide-border/40` and `py-8` per Section, so each question reads as its own band instead of a stacked grid.
- **Step0/1/2/3** (single-question steps): center the card grid vertically; cap grid width at `max-w-xl` so options don't sprawl edge-to-edge on desktop.

### 4. Sticky footer polish
- Single row on all breakpoints (Back + Next right-aligned; no stacked mobile layout — current pill buttons fit fine in 360px).
- Remove the duplicate "current step label" pill on desktop.
- Keep tooltip-on-disabled behavior unchanged.

### 5. Optional micro-fades
- Add a `fade-in` (existing Tailwind animation already in project) on the title + content block when `step` changes, so transitions feel intentional like Typeform.

## Out of scope (this pass)
- No backend, no schema, no copy edits, no new questions.
- Brand Models page (`/app/brand-models`) — separate component, can be done in a follow-up if you want the same treatment there.
- Step-content logic rewrites (Step4Cast's 742 lines are conditional rendering — left as-is, just rewrapped in a normalized container).

## Files touched
- `src/features/brand-scenes/wizard/WizardLayout.tsx` (main rewrite)
- `src/features/brand-scenes/wizard/components/Section.tsx` (small spacing tweak)
- Light wrappers in: `Step0ChooseSource.tsx`, `Step1ChooseModule.tsx`, `Step2ChooseSubFamily.tsx`, `Step4Cast.tsx`, `Step5Photography.tsx`, `Step5Review.tsx`, `Step3Reference.tsx`, `Step4Environment.tsx`, `Step6PreviewAndPick.tsx` — wrap their root in a normalized spacing container; no logic changes.
