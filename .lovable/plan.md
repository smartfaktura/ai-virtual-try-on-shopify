## Improve "Message Our Team" Dialog

Refinements to `src/components/app/ContactFormDialog.tsx` so the modal feels calmer, more premium, and consistent with the new founder-led "team of pros" voice we just rolled out on `/app/help`.

### 1. Stop auto-focusing the first field
Radix `Dialog` auto-focuses the first focusable child on open, which makes the Name input look pre-selected with a blue ring the moment the modal appears (visible in the screenshot). 

- Add `onOpenAutoFocus={(e) => e.preventDefault()}` to `DialogContent` so the dialog opens in a neutral state. Focus only appears when the user actually clicks into a field.

### 2. Softer, more rounded inputs
Current inputs use `rounded-lg` + `h-10` + `bg-muted/50` and feel boxy.

- Inputs and textarea: `rounded-2xl`, `h-11`, `px-4`, `bg-muted/40`, `border-border/60`, focus state switches to `focus:bg-background focus:border-foreground/20 focus:ring-1 focus:ring-foreground/10` (single subtle ring instead of the loud 2px primary ring).
- Textarea: `rounded-2xl`, `px-4 py-3`, same focus treatment, `min-h-[112px]`.
- Labels: keep small uppercase-ish style but tighten — `text-[11px] tracking-[0.12em] uppercase text-muted-foreground/80`.
- Submit button: already `rounded-full` — bump to `h-11` so it matches input height and add `shadow-sm`.
- Error banner: `rounded-2xl` to match.

### 3. Replace persona avatars with founder-led header
The dialog still shows three fictional persona avatars (Sophia, Kenji, Zara) which conflicts with the recently approved direction (real team, founder Tomas).

- Drop the three persona avatars and the `landingAssets` imports.
- Show a single larger avatar using the existing `src/assets/founder-tomas.jpg` (already optimized) at `w-11 h-11 rounded-full ring-2 ring-background`.
- Update copy:
  - Title: `Message our team` (sentence case, no terminal period — matches Core memory rule)
  - Description: `Tomas and the team — usually a few hours on weekdays`
- Header padding tightened to `px-6 pt-6 pb-3`.

### 4. Small consistency tidy
- Dialog container: add `rounded-2xl` to `DialogContent` className so the modal corners match the new inputs (current shadcn default is `rounded-lg`).
- Body spacing: `space-y-3.5` instead of `space-y-4` for a tighter rhythm.
- Success state: change wording to drop the period in the heading (`Message sent` instead of `Message sent!`) to stay aligned with the minimalist tone, keep the body sentence as-is (multi-clause copy keeps punctuation per memory rule).

### Files touched
- `src/components/app/ContactFormDialog.tsx` (only file)

No DB, edge function, or routing changes. No new dependencies.
