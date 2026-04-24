# Unify the /home page aesthetic across all sections

## What's inconsistent today

I read every section on `/home` (`HomeHero`, `HomeTransformStrip`, `HomeCreateCards`, `HomeHowItWorks`, `HomeWhySwitch`, `HomeOnBrand`, `HomeFAQ`, `HomeFinalCTA`). The page is **close** to a single language but drifts in five concrete ways:

1. **Hero is the only section using a different copy width** (`max-w-3xl`) and a different intro typography rhythm (no eyebrow label, no subtitle eyebrow). Every other section has the `text-[11px] / 0.2em / muted-foreground` eyebrow + h2 + lede pattern.
2. **Color tokens are hard-coded inconsistently.** Mix of `text-[#1a1a2e]`, `text-foreground`, `text-[#9ca3af]`, `text-muted-foreground`, `text-[#475569]`, `text-[#6b7280]` — same intent, four different values.
3. **Background palette has 4 alternating tones** (`#FAFAF8` hero, `bg-background` Create/HowItWorks/OnBrand, `#1a1a2e` WhySwitch + FinalCTA, `#f5f5f3` FAQ) but the *transitions* aren't intentional — light → light → light → light → dark → light → light → dark feels random.
4. **Card styling drifts.** `HomeCreateCards` and `HomeOnBrand` use `rounded-3xl bg-white border border-[#f0efed] shadow-sm`. `HomeHowItWorks` uses `rounded-3xl border-border/60 shadow-foreground/[0.04]`. `HomeWhySwitch` uses dark `bg-white/5 border-white/10`. The radii, borders and shadows aren't a system.
5. **CTA buttons drift.** Hero uses raw anchors with `h-[3.25rem] px-8 rounded-full`. Create/HowItWorks use `<Button asChild size="lg" className="rounded-full ...">`. FinalCTA uses raw anchors again. Same look, three implementations, slightly different padding.

## The unified system (single source of truth)

A small set of tokens applied to **every** section header, card, and CTA. No new files — just consistent classes.

### Section header pattern (used in every section)
```tsx
<div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
    {EYEBROW}
  </p>
  <h2 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4">
    {TITLE}
  </h2>
  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
    {SUBTITLE}
  </p>
</div>
```
On dark sections (`HomeWhySwitch`, `HomeFinalCTA`), only swap text colors to `text-white/60`, `text-white`, `text-white/70`. No size or spacing changes.

### Card pattern (light surfaces)
- Container: `rounded-3xl bg-white border border-border/60 shadow-sm shadow-foreground/[0.04]`
- Hover: `transition-all duration-500 hover:-translate-y-1 hover:shadow-md`
- Inner padding: `p-6 lg:p-8`

### Card pattern (dark surfaces — WhySwitch)
- `rounded-3xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] hover:border-white/20`

### CTA pattern (everywhere)
Always use the shadcn `<Button>` primitive — no raw anchors with handcrafted button classes:
```tsx
<Button asChild size="lg" className="rounded-full h-[3.25rem] px-8 text-base font-semibold shadow-lg shadow-primary/25">
  <Link to="/auth">Start free<ArrowRight className="ml-2 h-4 w-4" /></Link>
</Button>
```
Secondary CTA uses `variant="outline"` with the same sizing.

### Color tokens
Replace every hardcoded color in `src/components/home/*.tsx` with semantic tokens:
| Hardcoded | Replace with |
|---|---|
| `#1a1a2e` (heading text on light bg) | `text-foreground` |
| `#6b7280`, `#9ca3af`, `#475569` (body text) | `text-muted-foreground` |
| `#f0efed` (card border) | `border-border/60` |
| `#FAFAF8`, `#f5f5f3` (alt bg) | keep but consolidate to **one** alt tone (see rhythm below) |
| `#1a1a2e` (dark sections) | keep, but route through a single `bg-foreground` or hex constant — used identically by WhySwitch + FinalCTA |

### Background rhythm (intentional alternation)
```
Hero          → cream  (#FAFAF8)
TransformStrip→ white  (bg-background)
CreateCards   → cream  (#FAFAF8)
HowItWorks    → white  (bg-background)
WhySwitch     → dark   (#1a1a2e)
OnBrand       → white  (bg-background)
FAQ           → cream  (#FAFAF8)
FinalCTA      → dark   (#1a1a2e)
```
Two-tone light alternation with two dark "anchor" sections breaks the page into a clear vertical cadence.

### Container width
Every section uses `max-w-[1400px] mx-auto px-6 lg:px-10` (already the dominant pattern). `HomeFAQ` keeps its narrower `max-w-2xl` (intentional for readability). `HomeFinalCTA` keeps `max-w-2xl` for centered CTA.

### Vertical rhythm
Every section: `py-16 lg:py-32`. (Already the dominant value — only minor drift to fix.)

## Files I'll edit

- `src/components/home/HomeHero.tsx` — add eyebrow label, replace raw anchor CTAs with `<Button>`, normalize colors.
- `src/components/home/HomeTransformStrip.tsx` — normalize colors only (header/CTA already consistent).
- `src/components/home/HomeCreateCards.tsx` — switch to cream bg, normalize card border (`border-border/60`), normalize text colors.
- `src/components/home/HomeHowItWorks.tsx` — normalize wireframe card colors to match Create/OnBrand cards.
- `src/components/home/HomeWhySwitch.tsx` — apply unified dark card pattern, normalize text colors, ensure header pattern matches.
- `src/components/home/HomeOnBrand.tsx` — normalize card + text colors, replace hardcoded hexes with tokens.
- `src/components/home/HomeFAQ.tsx` — switch from `#f5f5f3` to `#FAFAF8` cream, normalize accordion item border.
- `src/components/home/HomeFinalCTA.tsx` — replace raw anchors with `<Button>` (white variant for primary, outline for secondary), keep dark bg + blob backdrop.

## Out of scope

- No structural section reordering (you already approved the current order).
- No new copy / no new sections.
- `LandingNav` and `LandingFooter` already match the design system — untouched.
- No animation overhauls — `useScrollReveal` stays exactly as-is.
- Image/video assets stay identical.

## QA checklist (I'll verify after implementation)

- All eight sections share the same eyebrow/title/lede typography.
- All buttons render as 52px-tall pill CTAs with consistent shadow.
- All cards on light bg share the same border/radius/shadow.
- No hardcoded `#1a1a2e` / `#9ca3af` / `#6b7280` / `#475569` / `#f0efed` left in `src/components/home/`.
- Background rhythm visibly alternates cream / white / cream / white / dark / white / cream / dark.
