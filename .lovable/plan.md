## Changes — `src/pages/video/AnimateVideo.tsx`

### 1. Batch Mode "Upgrade" — open modal, not pricing page; restyle as branded pill
Line 618–623. Currently `navigate('/app/settings')` with a tiny `rounded-md` chip.
- Switch click to `openBuyModal('animate_batch_upgrade')`.
- Restyle to match the Motion Refinement upgrade pill: `rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/15 transition-colors`.

### 2. "VOVV.AI Studio" smart-assistant banner — match brand surfaces
Line 773–791. Current `rounded-xl bg-muted/30` reads flat next to the rest of the page.
- Promote to a proper card: `rounded-2xl border border-border bg-card p-5 flex items-center gap-4`.
- Add a small sparkle icon next to the "VOVV.AI Studio" label (use the existing `Sparkles` lucide icon, `h-3 w-3 text-primary`).
- Tighten typography: label `text-[11px] font-semibold tracking-wider uppercase text-muted-foreground`, body `text-sm text-foreground/80 mt-1 leading-relaxed`.
- Keep the team avatar stack (`-space-x-2`, `w-8 h-8`, `ring-2 ring-background`) for a slightly richer presence.

### 3. "Not enough credits" pill — match the cost pill scale
Line 1357–1359. Currently `text-[11px] px-2.5 py-0.5` which renders about half the visual weight of the adjacent "Cost: 25 credits" pill (`text-sm px-3.5 py-2`).
- Bump to `rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive` so the two pills sit in the same size band on the floating bar.
- Apply the same change to `src/pages/video/StartEndVideo.tsx` (line 394–397) for consistency.

## Notes
- No logic, routing, or schema changes beyond switching the Batch upgrade click handler.
- Uses existing `openBuyModal`, `useCredits`, design tokens, and the already-imported `Sparkles` icon.