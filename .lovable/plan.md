## Goals

Three focused refinements to `/app/models/new`:

1. Ethnicity chips that reflect the actual user base (Western Europe / UK-leaning) without losing inclusivity
2. Reference image section always visible (no toggle) + mandatory consent + visible safety policy
3. Cleaner header rhythm (back link + title + subtitle)

---

## 1. Ethnicity — better-curated options

Current chips are generic continental buckets ("Caucasian / Asian / African / Hispanic / Middle Eastern / South Asian / Mixed") that don't match how Western / UK brands actually brief models.

**New approach — two-level, descriptive:**

Replace `ChipSelect` with a more useful **Region/Look** select, grouped:

- **European** — Northern European, British / Irish, Mediterranean, Eastern European, Scandinavian
- **Latin / Hispanic** — Latin American, Iberian
- **Asian** — East Asian, South Asian, Southeast Asian
- **African / Afro-descendant** — African, Afro-Caribbean, Afro-European
- **Middle Eastern / North African**
- **Mixed heritage**

Rendered as a single `Select` (grouped with `SelectGroup` / `SelectLabel`) so it stays compact and isn't dominated by 15 chips. Default value changes from `"Caucasian"` to `"Northern European"`. The string is passed through to the prompt as-is, so the edge function keeps working unchanged.

Rationale: gives Western/UK-targeted brands the precise look they brief for (e.g. "British / Irish", "Scandinavian") while still covering global diversity in a clean dropdown.

---

## 2. Reference image — always open + consent gate + policy

- Remove the `Switch` toggle. The upload tile is always rendered.
- Drop `useReference` state (or default it to `true` permanently) — uploader, preview, and consent live inline.
- Consent checkbox is **always visible** below the uploader (not only after upload), but only becomes *required* when an image is uploaded. When no image is uploaded it shows as informational/disabled.
- Strengthen the policy copy and lift it into a small bordered "Content Policy" callout above the checkbox:

  > **Content & rights policy.** Only upload photos of yourself, people who have given you explicit written permission, or images you fully own. Do not upload photos of celebrities, minors without guardian consent, or anyone whose likeness you don't have the right to use. VOVV.AI is not liable for misuse — you accept full responsibility for any reference you upload. Violations may result in account suspension.

- Checkbox label tightens to:
  > "I confirm I own or have explicit permission to use this image, and I accept full responsibility under the VOVV.AI Content Policy."

- `canGenerate` logic update: if `uploadedUrl` exists, require `termsAccepted`. If no upload, generation proceeds without the checkbox.
- "Reference is optional" hint sits under the section title so users know they can skip.

---

## 3. Header spacing / layout polish

Current header stacks: `← Brand Models` (ghost button) / `Create New Model` (h1) / `Describe your ideal model · 20 credits per generation` — spacing feels loose and the back button visually fights the title.

Changes in `BrandModelNew.tsx` only (no shared `PageHeader` edits):

- Replace `PageHeader` usage with a local header block that gives a cleaner hierarchy:
  - Tiny back link rendered above as a quiet breadcrumb: `← Brand Models` in `text-xs text-muted-foreground hover:text-foreground`, `mb-3`, not a button-shaped element
  - Title `text-3xl font-semibold tracking-tight` (drop bold for editorial feel matching the rest of the platform), `mb-1.5`
  - Subtitle `text-sm text-muted-foreground` with the credit cost rendered as a subtle pill on the right: `20 credits per generation`
- Outer container: keep `max-w-3xl mx-auto`, add `pt-2 pb-32` (room for sticky footer), and tighten the header block to `mb-6`.
- The three section cards inside `UnifiedGenerator layout="sections"` get consistent `space-y-5` between them (already close — verify).

---

## Technical details

**Files:**
- `src/pages/BrandModels.tsx`
  - Replace ethnicity `ChipSelect` (line 504-506) with a grouped `Select` using the new region list. Update default `useState('Caucasian')` → `useState('Northern European')`.
  - Refactor `referenceBlock` (lines 596-668): remove the `Switch`/`useReference` gating, always render uploader; always render consent box (disabled-looking until file uploaded); add policy callout above; tighten `canGenerate` to require `termsAccepted` only when `uploadedUrl` is set.
- `src/pages/BrandModelNew.tsx`
  - Stop using `PageHeader`; render a local header (back breadcrumb + title + subtitle/credit pill) with the spacing described above. Keep `UnifiedGenerator layout="sections"`.

**Out of scope:** edge function, DB, prompt template changes (the new ethnicity strings are free-text and pass straight through). No changes to `/app/models` grid.