

# Reduce Hero H1 Font Weight

The hero `h1` in `HeroSection.tsx` line 216 uses `font-extrabold` (weight 800), which now renders heavier after adding weight 800 to the Google Fonts request.

## Fix
Change `font-extrabold` → `font-bold` (weight 700) on the h1 element. This keeps it prominent but less heavy.

**File**: `src/components/landing/HeroSection.tsx` line 216

