
Goal: stop hero headline line-hopping on mobile so the page no longer jumps vertically while the typewriter runs.

Root cause (from current code)
- In `src/components/landing/HeroSection.tsx`, `SLOGANS` includes longer phrases (ex: “Every Product. Every Scene.”).
- Mobile hero uses `text-4xl` and the typed line is not width-constrained, so some phrases wrap to an extra line at 390px.
- When typed text wraps/un-wraps, `<h1>` height changes, pushing the whole section up/down.

Implementation plan

1) Add mobile-specific slogan set (shorter phrases)
- Keep existing desktop `SLOGANS` unchanged.
- Add `SLOGANS_MOBILE` with compact phrases that always fit one line on 320–390px.
- Use `useIsMobile()` to choose the phrase list passed into `useTypewriter`.

2) Lock typed line to a stable one-line area on mobile
- Wrap typed text in a dedicated block/span with mobile constraints:
  - `whitespace-nowrap`
  - fixed/min height for one line (so heading height stays constant)
  - optional fixed width in `ch` on mobile to prevent micro-jitter from cursor + varying phrase length.
- Keep desktop behavior unchanged.

3) Slightly tune mobile hero typography for safety
- Reduce mobile headline size one step (or tighten with responsive clamp) so longest mobile phrase + cursor never wraps.
- Keep `sm+` sizes as-is.

4) Reduce perceived text heaviness on mobile (small UX polish)
- Keep current desktop paragraph unchanged.
- Show shorter mobile paragraph copy (already done in other landing sections) to reduce visual density.

Files to update
- `src/components/landing/HeroSection.tsx` only:
  - import `useIsMobile`
  - add `SLOGANS_MOBILE`
  - switch `useTypewriter(...)` input by viewport
  - adjust typed-line wrapper classes for no-wrap + stable line height
  - optional mobile-only paragraph variant

Validation checklist
- Test at 320, 375, 390 widths.
- Watch full typewriter cycle through all phrases.
- Confirm:
  - typed line never wraps on mobile,
  - no vertical page jump in hero,
  - cursor remains aligned,
  - desktop layout/text remains unchanged.
