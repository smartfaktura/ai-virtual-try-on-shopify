## Goal

Make the "How it works" section much more compact on mobile by switching the three stacked step cards into a horizontal swipeable carousel. Desktop layout stays exactly as it is today (3 columns side-by-side).

## Plan — edit `src/components/home/HomeHowItWorks.tsx`

1. **Mobile carousel container.** On mobile (`< lg`), replace the current vertical stack + `ArrowDown` connectors with a horizontal scroll-snap row:
   - Outer: `lg:hidden -mx-6 px-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar`.
   - Inner: `flex gap-4 pb-2`.
   - Each step: fixed-width slide `w-[78%] sm:w-[60%] shrink-0 snap-center`.
   - Hide scrollbar with utility classes (`[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`).
   - Drop the `ArrowDown` connector entirely on mobile (carousel implies progression).
   - Show the title + visual stacked inside each slide (same `step.num` heading + `<step.Visual />`).

2. **Step indicator dots under the carousel.** A small row of three dots showing the active slide. Keep it simple (no JS needed for the dots themselves — they're decorative, the active dot tracks scroll via an `IntersectionObserver` on slide refs and `useState`). Container: `flex justify-center gap-1.5 mt-4 lg:hidden`. Dots: `h-1.5 w-1.5 rounded-full bg-foreground/20`, active: `w-5 bg-foreground/70 transition-all`.

3. **Desktop layout untouched.** Wrap the existing 3-column flex row in `hidden lg:flex` so it's only used on `lg+`. Mobile uses the new carousel.

4. **Tighter mobile section padding.** Reduce section vertical padding on mobile so the section takes less space overall: `py-12 lg:py-32` (was `py-16 lg:py-32`), and header bottom margin to `mb-8 lg:mb-16` (was `mb-12 lg:mb-16`).

No changes to the three step visual components themselves, no changes to copy or CTA, no changes to any other file.

## Files

- `src/components/home/HomeHowItWorks.tsx`
