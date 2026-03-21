

# Lighter Heading + Dark Blue Accent Word (No Background)

## Changes

### File: `src/pages/TryShot.tsx`

**Line 143**: Make "Product shots for" lighter weight — change from `font-bold` to `font-medium text-muted-foreground` so it's a softer grey tone.

**Line 147**: Remove the background highlight from the rotating word. Change from `text-primary bg-primary/[0.08] px-3 py-1 rounded-lg` to just `text-primary font-bold` — pure dark navy blue text, no pill background. The contrast between the lighter grey heading and the bold dark blue word will make it stand out naturally.

