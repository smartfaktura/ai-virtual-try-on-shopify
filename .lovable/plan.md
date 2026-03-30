

## Change "See How It Works" button

**File:** `src/components/landing/HeroSection.tsx` (lines 239-246)

Change the outline button text from "See How It Works" to "See Real Examples" and make it navigate to `/discover` instead of scrolling to the how-it-works section.

- Replace `onClick` scroll handler with a `Link` wrapper using `asChild`
- Update button text to "See Real Examples"

```tsx
<Button
  variant="outline"
  size="lg"
  className="rounded-full px-8 py-6 text-base font-semibold"
  asChild
>
  <Link to="/discover">See Real Examples</Link>
</Button>
```

Ensure `Link` from `react-router-dom` is already imported (it is used elsewhere in the file).

