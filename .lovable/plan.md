# Alternate the "Why VOVV" section to a light background

## Problem
On Virtual Try-On, Brand Profiles, Image Upscaling, Perspectives, and Real Estate Staging, the last two sections (`WhyVovvSection` + `FinalCtaDark`) are both dark navy. The previous fix only nudged one shade darker — the user wants real alternation: a **light** "Why VOVV" section flowing into the **dark** final CTA, matching the cream/dark rhythm used across the rest of the landing page.

## Fix
Edit the shared `WhyVovvSection` in `src/pages/features/PerspectivesFeature.tsx` to use the cream `#FAFAF8` light style. Final CTA stays dark `#1a1a2e`. Because both are shared components, all 5 feature pages update at once.

### Change to `WhyVovvSection`
- Background: `bg-[#FAFAF8]` with a subtle `border-t border-[#f0efed]` to separate from the section above
- Eyebrow: `text-foreground/60` (was `text-white/50`)
- Heading: `text-foreground` with `tracking-[-0.025em]` (was `text-white`)
- Cards: white `bg-white border border-[#f0efed] shadow-sm`, hover lifts via `hover:shadow-md hover:-translate-y-0.5` (was translucent white-on-dark)
- Card title: `text-foreground` (was `text-white`)
- Card body: `text-muted-foreground` (was `text-[#9ca3af]`)

### Unchanged
- `FinalCtaDark` stays exactly as-is (dark `#1a1a2e`, white CTA button, ghost outline button)
- All 5 feature pages auto-inherit the fix
- No content / props changes
- No other files touched

## Result
Section rhythm becomes: feature blocks (light) → **Why VOVV (light cream cards)** → **Final CTA (dark navy)** — clean alternation matching the homepage pattern.

## Files touched
- `src/pages/features/PerspectivesFeature.tsx`
