## Hide Hero `<br>` on Mobile

On mobile the homepage hero headline currently renders as 3 lines:

```
AI Product Visuals.
No Photoshoot
Needed.
```

The forced `<br>` after "AI Product Visuals." plus the typewriter line wrapping creates an awkward 3-line stack.

### Fix
In `src/components/home/HomeHero.tsx` (line 172–176), make the line break responsive so the headline flows as natural prose on mobile and only forces a break on `sm+` screens.

```tsx
<h1 className="...">
  <span>AI Product Visuals.</span>
  {/* Force the break only on tablet/desktop — on mobile let
      the typewriter flow inline so the headline can wrap naturally. */}
  <br className="hidden sm:inline" />
  <span className="sm:hidden"> </span>
  <HeroTypewriter />
</h1>
```

Result on mobile: text flows as one paragraph and wraps based on container width — typically rendering as 2 balanced lines instead of 3 awkward ones.

No other changes — desktop layout is preserved.
