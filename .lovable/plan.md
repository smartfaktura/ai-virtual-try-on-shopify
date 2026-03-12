

## Fix Freestyle Showcase Text Overflow on Mobile

### Problems
1. **Prompt text wraps mid-animation** — "White Crop Top, three looks: studio, outdoor café, urban concrete" is too long for 390px, causing the text to jump to a second line partway through typing, creating a jarring layout shift.
2. **Section feels text-heavy on mobile** — the header, subtitle, demo panel, and CTA stack up densely.

### Solution

**1. Use a shorter prompt on mobile**
- Add a mobile-specific constant: `PROMPT_TEXT_MOBILE = 'Crop Top — studio, café, urban'` (fits one line at 390px with `text-xs`)
- Use `window.innerWidth` or a `useIsMobile()` hook (already exists in `src/hooks/use-mobile.tsx`) to pick the right prompt
- This completely prevents line-hopping since the text fits in one line

**2. Trim the subtitle on mobile**
- Hide or shorten the `<p>` subtitle on mobile — e.g., show only on `md:` or use a shorter version like "Describe it, generate it. Studio quality in seconds."

**3. Reduce section vertical padding on mobile**
- Change `py-20 md:py-28` to `py-12 md:py-28` for a less heavy feel

### Changes — `src/components/landing/FreestyleShowcaseSection.tsx`

- Add `PROMPT_TEXT_MOBILE` constant (~25 chars, fits one line)
- Import and use `useIsMobile` hook to select the right prompt
- Shorten subtitle text on mobile with responsive classes
- Reduce mobile section padding

