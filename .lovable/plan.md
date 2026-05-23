## Refine the "Reference image — quick check" modal

Goal: make the popup feel calm, premium and easy to scan. Less alarm, fewer words, no friction-for-friction's-sake.

### File
`src/features/brand-scenes/wizard/components/ResponsibilityModal.tsx`

### Changes

**1. Tone down the header**
- Replace the red `ShieldAlert` destructive badge with a softer neutral `Sparkles` (or `ImageIcon`) in a muted circle (`bg-muted text-foreground/70`). It's a guideline, not a warning.
- Shorten title to: **"Before you upload"**.
- Rewrite description to one tight line: *"Your image guides framing, lighting and mood — your product replaces the original. Please confirm:"*

**2. Simplify and shorten the checklist**
Three short, parallel lines (no walls of text):
- "I own this image or have permission to use it"
- "No copyrighted logos or recognizable people"
- "It's used only as a composition guide"

Visual cleanup of each row:
- Wrap each row in a subtle card: `rounded-xl border border-border/60 bg-muted/30 px-3.5 py-3 hover:bg-muted/50 transition-colors`
- Whole row clickable (already a `<label>`), checkbox right-aligned would be cleaner — keep left to match conventions but tighten gap to `gap-3`, text `text-sm`.

**3. Remove the "Type AGREE" field**
Three checkboxes are already explicit consent. The typed phrase is friction that makes the modal feel legalistic and crowded. Drop the `Input`, the `phrase` state, and the `REQUIRED_PHRASE` gate. `canAccept = c1 && c2 && c3`.

**4. Footer**
- Cancel: keep ghost, rounded-full.
- Primary CTA shortened to **"Continue"** (rounded-full, font-medium). The three checkboxes are the responsibility acknowledgement — the button doesn't need to say it.
- Right-align both, comfortable gap.

**5. Spacing & container**
- `DialogContent` → `sm:max-w-md` (down from `lg`) so it feels focused, not a form.
- Tighten vertical rhythm: header `space-y-2`, checklist `space-y-2`, `pt-2` before footer.

### Out of scope
- Trigger logic / where the modal is opened.
- Copy in other modals.
- The actual upload flow.

### Memory note
Follows project rules: no terminal periods in the short title, Inter weights only, semantic tokens (no raw colors), minimalist luxury restraint.
