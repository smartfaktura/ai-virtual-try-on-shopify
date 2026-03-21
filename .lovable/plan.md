

# Restyle TryShot Rotating Word & Center Layout

## Changes

### File: `src/pages/TryShot.tsx`

**1. Rotating word styling (line 147)**

Remove italic and underline. Instead, use a soft background highlight to differentiate:

```tsx
<span className="text-primary bg-primary/8 px-3 py-1 rounded-lg">
```

This gives a light navy-tinted pill behind the word — no italic, no underline, clean and modern.

**2. Vertically center the hero area**

Change the `<main>` wrapper (line 142) to use flexbox centering with `min-h-[calc(100vh-64px)]` so the hero content sits in the vertical center of the viewport on load:

```tsx
<main className="max-w-3xl mx-auto px-6 pb-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
```

This removes the fixed `pt-16 sm:pt-24` top padding and instead vertically centers the entire hero block (headline + image + input + subtitle) in the viewport.

## Summary
- 2 lines changed in 1 file
- Rotating word: no italic/underline, soft background highlight instead
- Hero section vertically centered in viewport

