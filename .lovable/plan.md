## Phase 7a polish — wizard UX, reference truthfulness, responsibility check

Scope is **frontend only**. No schema, RLS, or generation-pipeline changes.

### 1. Responsibility check — honest copy + simpler gate

`src/features/brand-scenes/wizard/components/ResponsibilityModal.tsx`

- Rewrite the framing. Today it claims "we only extract mood, color, composition — never reproduce them." That is **false** for the reference path — the image is actually sent to the model as a composition guide and the AI replicates framing/lighting/environment. New copy:
  - Title: **"Reference image — quick check"**
  - Description: "Your reference is sent to the AI as a visual guide. It replicates framing, lighting and environment while swapping in your product. Confirm the three statements below before uploading."
  - Checkbox 1: "I own this image or have explicit permission to use it"
  - Checkbox 2: "It does not contain copyrighted logos, trademarks, or recognizable people without consent"
  - Checkbox 3: "I understand VOVV.AI will use it as a composition guide to generate a new scene with my product"
- Drop the 3 checkboxes-**and**-typed-phrase double gate. Keep it strong but light: **3 checkboxes + type `AGREE`** (not `I AGREE`). Update `REQUIRED_PHRASE = "AGREE"` and the helper label.
- Keep destructive shield icon, keep the disabled-until-valid CTA.

### 2. Source picker copy alignment

`steps/Step0ChooseSource.tsx`

- Update reference card body to match new truth: "Upload one inspiration image. We use it as a composition guide and swap in your product." (no more "mood, color, and composition only").
- Keep both cards visually identical — see section 5 below.

### 3. Reference upload — drag/drop, paste, mobile-friendly

`steps/Step3Reference.tsx`

- Wrap the empty-state dropzone with handlers:
  - `onDragOver` / `onDragLeave` toggling a `isDragging` border state (`border-foreground` + `bg-foreground/[0.02]`).
  - `onDrop` → `handleFiles(e.dataTransfer.files)`.
  - Document-level `paste` listener (added in `useEffect`, removed on unmount or when `imagePath` set) → reads `e.clipboardData.files`, calls `handleFiles`.
- Inside the dropzone show **two explicit actions stacked** so mobile users always see a tappable button:
  - Primary button: **"Choose image"** (triggers file input) — full-width on `<sm`, auto on `sm+`.
  - Secondary muted text: "or drag & drop · paste from clipboard".
  - Helper: "JPG, PNG or WEBP · up to {MAX_MB}MB".
- The whole card stays clickable as a fallback (keep current behavior) but the inner button gets `e.stopPropagation()` so it doesn't double-fire.
- Visual: bump min height on mobile (`min-h-[200px]`) so the target is comfortable.

### 4. Sub-family selection — clearer hierarchy

`steps/Step2ChooseSubFamily.tsx` + `WizardLayout.tsx` step header

- Replace pill-row with the same card grid used elsewhere (2-col on mobile, 3-col on `sm+`, rounded-2xl border cards). Each card shows the sub-family label + a tiny uppercase tag ("Sub-family"). Active state mirrors source/module cards (filled foreground).
- In `Step1ChooseModule.tsx` add a short subtitle under each family name (e.g. derived from a small label map) so users see *what* the family covers. If no map exists, just show the label cleanly — but make the section header in `WizardLayout` say **"Product family — what are you photographing?"** and on Step 2 **"Sub-family — pick the closest match"**.
- The auto-selected single-sub case keeps its current "Auto-selected" card.

### 5. Visual parity: source cards + module cards + sub-family cards

Extract a single shared `WizardCard` primitive in `wizard/components/WizardCard.tsx`:

```text
[ icon-chip ]
Title (semibold, tracking-tight)
Body (muted, leading-relaxed)
[ optional tag ]
```

- Used by `Step0ChooseSource`, `Step1ChooseModule`, and the new card-style `Step2ChooseSubFamily`.
- Identical: `rounded-2xl border p-5`, active = `border-foreground bg-foreground text-background`, hover = `border-foreground/40`, icon chip `w-10 h-10 rounded-xl`, tag `text-[10px] uppercase tracking-[0.16em]`.
- Replace each step's bespoke `Card` / `button` markup with this primitive — fixes "build from wizard / build from reference look strange next to the rest."

### 6. Brand aesthetic — preset chips + custom escape hatch

`steps/Step3BaseAnswers.tsx`

- Introduce a curated preset list for the **Aesthetic** field (only — other fields stay free text for now):
  ```ts
  const AESTHETIC_PRESETS = [
    "Quiet luxury",
    "Raw editorial",
    "Minimal Scandinavian",
    "Warm artisanal",
    "Clean studio",
    "Sun-bleached coastal",
    "Architectural mono",
    "Soft natural",
    "Bold graphic",
    "Vintage film",
  ];
  ```
- Render as a chip grid (same `rounded-full border px-4 py-2` style as today's sub-family, now upgraded to cards elsewhere — chips remain appropriate here because the count is large and visual weight is low).
- Below the chips: a small **"+ Custom aesthetic"** ghost button. When clicked, reveals the existing `<Input>` (placeholder: "Describe your own aesthetic in a few words"). Selecting any preset clears the custom field; typing in custom deselects all chips. Internally still saves to `value.aesthetic`.
- Field label tightens to "Brand aesthetic" with helper "Pick one — or define your own."

### Out of scope

- Generation pipeline consumption of `placement_hint` / `use_preview_as_reference` (Phase 7b).
- Same preset treatment for Mood / Lighting / Location / Framing (can do later if user confirms it works for Aesthetic first).
- Multi-image reference uploads (still 1 per spec).

### Files touched

- edit `src/features/brand-scenes/wizard/components/ResponsibilityModal.tsx`
- create `src/features/brand-scenes/wizard/components/WizardCard.tsx`
- edit `src/features/brand-scenes/wizard/steps/Step0ChooseSource.tsx`
- edit `src/features/brand-scenes/wizard/steps/Step1ChooseModule.tsx`
- edit `src/features/brand-scenes/wizard/steps/Step2ChooseSubFamily.tsx`
- edit `src/features/brand-scenes/wizard/steps/Step3Reference.tsx`
- edit `src/features/brand-scenes/wizard/steps/Step3BaseAnswers.tsx`
- minor copy tweak in `WizardLayout.tsx` step labels if needed
