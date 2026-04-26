## Add accent color to Pricing + Contact hero titles

Mirror the home hero accent (soft slate-blue `text-[#4a5578]`, already used by `HeroTypewriter` in `HomeHero.tsx`) on the two-line hero headlines on `/pricing` and `/contact`.

## Changes

**1. `src/components/landing/LandingPricing.tsx` (line ~153)**
Wrap the second line of the hero `<h1>` in an accent span:
```tsx
Simple pricing.
<br />
<span className="text-[#4a5578]">Real production output.</span>
```

**2. `src/pages/Contact.tsx` (line ~67)**
Headline is currently a single phrase "Get in touch". Split into two lines so the accent has somewhere to live, matching Pricing/Home rhythm:
```tsx
<h1 className="text-foreground text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.08] font-semibold tracking-[-0.03em] mb-6">
  Let's talk.
  <br />
  <span className="text-[#4a5578]">Get in touch.</span>
</h1>
```

No other styles or copy change. No new design tokens introduced — uses the same `#4a5578` already shipped in the home hero so the brand stays consistent.
