
## Make Prompt Helper match the Model/Product/Scene slide-in modal

Bring `PromptBuilderQuiz` up to the same desktop pattern as `ModelCatalogModal`, `ProductCatalogModal`, and `SceneCatalogModal`: a right-side slide-in `Sheet` with a left sidebar, scrollable body, and sticky footer. Mobile keeps its current bottom sheet untouched.

### Edit — `src/components/app/freestyle/PromptBuilderQuiz.tsx`

**Desktop (≥lg) — replace centered Dialog with right-side Sheet**

- Swap `<Dialog>` / `<DialogContent max-w-2xl>` for `<Sheet><SheetContent side="right">` styled exactly like the other catalog modals: `w-full sm:max-w-[1100px] p-0 gap-0 flex flex-col` with hidden default close button, rounded-l-2xl on lg+.
- Layout split:
  - **Header** (sticky top): `Wand2` icon + "Prompt Builder" title, subtitle "Answer a few questions and we'll write the prompt", custom close `X` button top-right (mirrors Model modal).
  - **Body**: `flex flex-1 min-h-0` with two columns —
    - **Left sidebar** (240px, hidden on <lg, `border-r`): vertical step list replacing the thin progress bar. Each step row shows step number in a circle, label ("Category", "Subject", "Interaction" only when person, "Setting", "Mood", "Framing" only when person, "Review"), and a `Check` when complete. Active row uses the same muted-pill active style as Model sidebar (`bg-muted text-foreground`); upcoming rows are dimmed and **non-clickable**; completed rows are clickable to jump back. Subtle "STEPS" uppercase label at top, matching the Model "QUICK" / "GENDER" rail typography.
    - **Right content area** (`flex-1 overflow-y-auto`, `px-7 py-6`): renders the existing `stepContent` unchanged — all `OptionCard` grids, headings, and review textarea stay exactly as they are. Drop the top progress bar on desktop (sidebar replaces it).
  - **Sticky footer** (`border-t px-6 py-3.5 flex items-center justify-between`): identical pattern to the Use-product/Use-model bar.
    - Left: small muted summary text — `Step {n} of {total} · {currentStepLabel}`. On the review step, show "Prompt ready to use".
    - Right: `Back` (ghost pill, disabled on first step) + primary action (`Next` with `ArrowRight`, or `Use This Prompt` with `Sparkles` on review). Same `size="pill"` buttons used elsewhere.

**Mobile (<md)** — leave the existing bottom `Sheet` + thin progress bar + footer **completely untouched**. Only desktop branch changes.

**Logic — fully preserved**

- `steps`, `stepIndex`, `canAdvance`, `handleNext`, `handleBack`, `handleUse`, `handleOpenChange`, all state setters, dynamic person-aware step insertion, `assemblePrompt` call on entering review — all unchanged.
- Add a tiny helper `goToStep(i)` used only by the sidebar to jump to already-completed steps (`i < stepIndex`). Forward navigation still requires `canAdvance` via the footer Next button.

### Validation

- Desktop: clicking the Prompt Helper trigger opens a right-side sheet matching the Model/Product/Scene modals in width, edges, header, and footer rhythm.
- Sidebar shows all steps; person-only steps appear/disappear when subject changes (Interaction + Framing).
- Footer Next/Back/Use behave identically to the old dialog version; review textarea + Edit toggle still works.
- Mobile bottom sheet unchanged.
- Closing resets all state (existing `handleOpenChange` logic).

### Untouched

- `promptBuilderTemplates` lib, `assemblePrompt`, `OptionCard`, all icon maps and option grids
- `FreestylePromptPanel.tsx` props (`open`, `onOpenChange`, `onUsePrompt` API stays identical)
- Mobile sheet, all selection logic, copy on each step
