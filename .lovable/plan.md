## Goal

Wrap the `/app/models/new` flow in the exact same wizard chrome as `/app/brand-scenes/new`: thin top progress bar, `01 / 02` step counter + label, internal h1/subtitle, `max-w-2xl` column, and a sticky pill footer with Back + primary CTA. The fixed full-width footer and bespoke "Switch mode" link both go away.

## Reference

`src/features/brand-scenes/wizard/WizardLayout.tsx` — owns the chrome (progress bar lines 102-125, animated title block 128-139, sticky pill footer 142-164). Width: `max-w-2xl mx-auto w-full`.

## Two virtual steps

The brand-models flow only has two real states (chooser → manual/reference form). Treat them as a 2-step wizard so the chrome reads correctly.

| # | Label  | Body                       | Footer                                          |
|---|--------|----------------------------|-------------------------------------------------|
| 1 | Mode   | Two `WizardCard` chooser   | None (clicking a card auto-advances)            |
| 2 | Details| Existing manual / reference form | Back (→ chooser) + Generate (current handler) |

## Changes — `src/pages/BrandModels.tsx` (`UnifiedGenerator`, `layout === 'sections'`)

1. Derive a `currentStep`: `creationMode === 'chooser' ? 1 : 2`.
2. Render a single shared shell around both states:
   ```text
   <div className="max-w-2xl mx-auto w-full">
     <ProgressTrack step={currentStep} total={2} label={step1 ? 'Mode' : 'Details'} />
     <div key={creationMode} className="animate-fade-in pt-12 pb-28 sm:pb-10">
       <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.15]">{title}</h1>
       <p  className="text-base text-muted-foreground mt-3 leading-relaxed max-w-xl">{subtitle}</p>
       <div className="mt-10">{stepContent}</div>
     </div>
     {step === 2 && <StickyFooter ... />}
   </div>
   ```
   Visuals copied 1:1 from `WizardLayout`:
   - Progress: `h-0.5 bg-border rounded-full` track with `bg-foreground` fill = `(step/total)*100%`; underneath, a row of `text-[10px] uppercase tracking-[0.18em] text-muted-foreground` with `01 / 02` tabular-nums on the left and step label on the right.
   - Sticky footer: `sticky bottom-2 sm:bottom-4 z-20`, inner `rounded-2xl border border-border bg-card/95 backdrop-blur-sm shadow-lg`, flex with Back (`variant="outline" size="pill"`) + primary (`size="pill"`).
3. Step 1 content = existing `WizardCard` chooser grid (no inner padding wrapper changes).
4. Step 2 content = the existing Sections block (Identity / Reference / Essentials / Appearance / Summary / Admin) **unchanged** except:
   - Remove the in-block `Switch mode` row (lines ~1013-1018) — Back lives in the new sticky footer.
   - Remove the existing fixed footer at lines ~1082-1108 — replaced by the sticky pill footer.
5. Sticky footer wiring (step 2):
   - Back → `setCreationMode('chooser'); setPreviewUrl(null); setUploadedUrl(null); setTermsAccepted(false); setReferenceNotes('');` (same reset the old link did).
   - Primary button = current `handleGenerate`, label `makePublic ? 'Generate · free' : 'Generate'`, `disabled={!canGenerate}`. When `validationError` exists, render a left-aligned `text-[11px] text-muted-foreground/80` reason inside the pill (matches brand-scenes' `nextDisabledReason` slot); keep the low-credits clickable variant that opens `NoCreditsModal`.
6. Keep `NoCreditsModal` mount and the variations preview branch (when `variations.length > 0`) exactly as today — the variations view already takes over the page.

## Changes — `src/pages/BrandModelNew.tsx`

- Drop the page-level `pb-28` since the sticky footer no longer needs fixed-position breathing room (wizard handles its own bottom padding). Keep `max-w-2xl mx-auto`, the back button, the h1 and subtitle.

## Out of scope

- Backend, validation logic, generation API, variations selector, admin block, and the variations preview UI all stay untouched.
- No copy changes beyond the two internal step titles/subtitles introduced above.
