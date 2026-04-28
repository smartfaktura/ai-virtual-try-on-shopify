# Restyle Earn Credits Modal to match /app aesthetic

The "Earn 200 Free Credits" modal currently uses a centered marketing layout with a dark navy primary button — both clash with the calm, left-aligned, restrained aesthetic we just unified across `/app/help`, `/app/bug-bounty`, `/app/settings`, `/app/learn`, and `/app/brand-profiles`.

This pass restyles **only** `src/components/app/EarnCreditsModal.tsx`. No content removed, copy preserved.

---

## Changes

### Layout & alignment
- Switch from centered (`text-center`) to **left-aligned** header — matches Help, Bug Bounty, Settings.
- Increase modal width slightly: `sm:max-w-[400px]` → `sm:max-w-[440px]` for breathing room.
- Add `shadow-xl` and switch border from `border-border/50` to solid `border-border` for a crisper card edge.

### Header
- Drop oversized centered icon block. Replace with the standard soft tile used everywhere in `/app`: `w-10 h-10 rounded-xl bg-primary/10` containing the Gift icon.
- Add an eyebrow label above the headline: `Reward` in `text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground` (matches Bug Bounty, Settings sub-section labels).
- Headline: `text-xl sm:text-2xl font-semibold tracking-tight` (was `text-lg font-bold`) — matches the restrained PageHeader scale.
- Lowercase headline ("Earn 200 free credits") to match Core memory rule (no Title Case marketing screams).

### Steps
- Wrap the 3 steps in a single bordered card with row dividers — exact pattern used on Help (helpers list) and Bug Bounty ("How it works"):
  `rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden`.
- Step number tile: tighten to `w-7 h-7 rounded-xl bg-primary/10 text-primary text-[12px] font-semibold` (was `rounded-full text-[11px] font-bold`) — matches the soft tile aesthetic (rounded-xl, not full circle).
- Step row padding: `p-4 sm:p-5`.
- Caption copy box (step 2): change from grey muted pill to bordered input style `rounded-xl bg-background border border-border hover:border-foreground/20` to match the standard input look on Settings/Help.

### CTA button
- Replace the custom dark-primary anchor with the standard `<Button asChild size="pill">` component — same primary CTA used on every other page (Bug Bounty, Settings, Help). Inherits theme tokens, hover, and shadow correctly.
- Move the `Send` icon to the **left** of the label (matches Bug Bounty's `Mail → label → arrow` convention).
- Lowercase label: "Claim my credits".

### Fine print
- Bump from `text-[10px] text-muted-foreground/50` to `text-[11px] text-muted-foreground/70` for legibility (still discreet).

### Mobile drawer
- Bump max height from `85vh` → `90vh` so the larger left-aligned header doesn't push fine print off-screen.

---

## Visual tokens applied (matches /app)

| Token | Value |
|---|---|
| Modal | `rounded-2xl border border-border bg-card shadow-xl` |
| Eyebrow | `text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground` |
| Soft tile | `w-10 h-10 rounded-xl bg-primary/10` (icon `text-primary`) |
| Step tile | `w-7 h-7 rounded-xl bg-primary/10 text-primary` |
| Steps card | `rounded-2xl border border-border bg-card divide-y divide-border` |
| CTA | `<Button size="pill">` with `gap-2 h-11 w-full` |
| Caption box | `rounded-xl bg-background border border-border` |

---

## File to edit

- `src/components/app/EarnCreditsModal.tsx`
