

## Freestyle card — match platform sizing + Apple-style animation refinement

### Problem (from screenshot at 390px viewport)
- Animation area is mostly empty white space — prompt bar + pills sit small in a huge `aspect-[2/3]` container.
- Padding (`p-5`), button (`h-10 px-5`), and title/description sizing don't match the sibling `WorkflowCardCompact` (uses `p-4`, `h-10 px-5` desktop / `p-3`, `h-9` mobile).
- Pills wrap awkwardly on narrow widths; subtle/non-Apple feel — too many staggered states, no hero focal moment.

### Goal
Quiet, confident Apple-like motion: one clear focal element, smooth fades, premium spacing. Visually consistent with the rest of the workflow card grid (same paddings, button, typography, aspect ratios).

### Changes (single file: `src/components/app/FreestylePromptCard.tsx`)

**1. Match sibling card sizing exactly**
- Content padding: `p-5` → `p-4` (desktop), `p-3` (mobile) — match `WorkflowCardCompact`.
- Button: identical class to sibling (`h-10 px-5` desktop, `h-9 px-4 text-xs` mobile), same `Start` / `Start Creating` labels.
- Title: `text-base` desktop / `text-sm` mobile — already matches; keep.
- Description: `text-sm text-muted-foreground line-clamp-2` desktop only — already matches; keep.
- Card outer: same `rounded-2xl border hover:shadow-lg` — already matches.

**2. Make the animation fill the frame (Apple-style hero composition)**
- Center the prompt bar vertically in the thumbnail area (currently floating).
- Increase prompt bar size so it reads as the hero element: `min-h-[110px]` desktop / `min-h-[88px]` mobile, larger horizontal padding.
- Constrain max width of inner block (`max-w-[88%]`) so it breathes inside the frame.
- Replace the soft circular blur with a subtle vertical gradient + faint radial highlight behind the prompt — closer to Apple keynote slide aesthetic.
- Add a tiny VOVV brand wordmark watermark (very low opacity, top-left of the thumbnail area) — `VOVV.AI` in `text-[10px] tracking-[0.2em] uppercase text-foreground/30 font-medium`. Reinforces brand without noise.

**3. Refine the workflow pills (less busy, more deliberate)**
- Remove individual border per pill; instead: pills sit in a single horizontal row with consistent `bg-background/60 border border-border/40 backdrop-blur-sm`.
- Smaller, single-line: `text-[10px]` desktop / `text-[9px]` mobile, force `flex-nowrap`, hide overflow gracefully.
- Avatar circles: `w-5 h-5` desktop / `w-4 h-4` mobile (smaller, more elegant).
- Generate pill: solid `bg-primary text-primary-foreground` (not tinted) — clearer arrival moment.

**4. Apple-style timing curve**
- Slow the typing slightly: `TYPING_SPEED 55 → 42` (smoother, more deliberate).
- Stagger pills closer: `PILL_STAGGER 250 → 180`.
- Hold longer: `HOLD_DURATION 2200 → 2800` (let the user read).
- Use `ease-[cubic-bezier(0.22,1,0.36,1)]` on the pill enter and prompt-bar fade — Apple's standard easing.
- Cursor: thinner (`w-px`) and slower pulse via custom inline style instead of `animate-pulse`.

**5. Micro-polish**
- Send button: `bg-primary` solid (not `bg-primary/15`), white arrow — matches "send" affordance in real Freestyle UI.
- Prompt text color: `text-foreground` (not `/80`), `font-normal` (not `font-medium`) for that crisp Apple keynote feel.

### Acceptance
- Card on mobile (390px) and desktop visually balanced — animation fills the frame, no blank ocean of white.
- Padding, button height, title size byte-identical to neighbouring `WorkflowCardCompact` cards in the same grid.
- Animation feels intentional and unhurried (typing → send → pills → generate → fade), with VOVV brand mark visible.
- No layout shift, no overflow on narrowest viewports.

