

## Change "1 photo → 8 results" to "1 photo → ∞ results"

Replace the numeric count with an infinity symbol in `src/components/landing/HeroSection.tsx` around line 346-348:

- Change `{current.outputs.length} results` to `∞ results`
- Use the `Infinity` icon from lucide-react (or just the `∞` unicode character) for a cleaner look

Single line change — swap the text span content.

