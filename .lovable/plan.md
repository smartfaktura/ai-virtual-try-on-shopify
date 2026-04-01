

# Match Video Showcase Section CTA and Spacing to Landing Page Style

## Problem
The video section CTA button uses default styling (`size="lg" className="gap-2"`) while all other landing page CTAs use the rounded-full pill style with larger padding and shadow. Section spacing also needs alignment.

## Changes — `src/components/landing/VideoShowcaseSection.tsx`

### 1. Update CTA button to match other landing CTAs
Current: `<Button asChild size="lg" className="gap-2">`
New: `<Button asChild size="lg" className="rounded-full px-10 py-6 text-base font-semibold gap-2 shadow-xl shadow-primary/25">`

This matches the exact pattern from FinalCTA and ChannelShowcase sections.

### 2. Adjust section and grid spacing
- Section padding: keep `py-20 lg:py-28` (already matches)
- Heading container: increase bottom margin from `mb-10` to `mb-12` for more breathing room
- Grid: add `sm:px-2 lg:px-4` for slightly more edge padding on larger screens
- CTA container: increase top margin from `mt-10` to `mt-14` to match ChannelShowcase's `mt-14`

### 3. Refine heading weight
Per design system, use `font-semibold` instead of `font-bold` on the h2 to match the premium editorial feel used site-wide.

## Single file change
`src/components/landing/VideoShowcaseSection.tsx`

