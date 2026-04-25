# Redesign Signup Slide-Up Popup

Restyle `src/components/landing/SignupSlideUp.tsx` to feel premium, spacious, and match the app's pill-button language.

## Visual changes

**Container**
- Wider: `sm:max-w-[460px]` (from 420px)
- Softer corners: `rounded-3xl` (from `rounded-2xl`)
- Stronger shadow: `shadow-2xl shadow-foreground/10`
- Mobile: bottom-sheet style with rounded top corners only (`rounded-t-3xl`), edge-to-edge feel
- Remove the colored header bar — replace with a subtle close button floating top-right

**Spacing**
- Increase inner padding: `px-7 pt-8 pb-7` (from `px-5 pb-5 pt-4`)
- Larger icon tile: `h-12 w-12 rounded-2xl` (from h-10/rounded-xl)
- More breathing room between header, form, and fine print (gap stack with `space-y-5`)

**Typography**
- Eyebrow: tiny uppercase `tracking-[0.2em] text-[11px] font-semibold text-primary` ("VOVV.AI" moved here, no header strip)
- Headline: `text-xl font-bold tracking-tight` ("Get 20 free credits")
- Sub-copy: `text-[13px] leading-relaxed text-muted-foreground`

**Form**
- Input: taller `h-12 rounded-full` pill, `px-5`, subtle border, focus ring
- Submit button: pill `h-12 rounded-full bg-primary` with arrow icon, font-semibold, shadow `shadow-lg shadow-primary/25`
- Spacing between input and button: `space-y-3`

**Success state**
- Larger checkmark tile (h-14 w-14 rounded-2xl), centered layout, more padding

**Close button**
- Floating top-right inside card: `absolute top-4 right-4`, small ghost circle button matching `EarnCreditsModal` pattern

## Behavior
- No logic changes (scroll trigger, capture-lead invocation, dismiss persistence remain identical)

## File touched
- `src/components/landing/SignupSlideUp.tsx`
