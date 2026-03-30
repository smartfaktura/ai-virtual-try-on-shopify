

## Adjust Hero Banner Text (Responsive)

**File:** `src/components/landing/HeroSection.tsx`

### Changes

**1. Main title (line 216-222)**

Replace the static "Your AI Photography Team." with responsive variants:
- Desktop: `Use Your AI Product Visual Team.`
- Tablet (sm-md): `Use Your AI Visual Team.`  
- Mobile: `Use Your AI Visual Team.`

Use hidden/block utility classes to swap between the two versions. The typing lines remain untouched.

```tsx
<h1 className="...">
  <span className="hidden sm:inline">Use Your AI Product Visual Team.</span>
  <span className="sm:hidden">Use Your AI Visual Team.</span>
  <br />
  <span className="text-primary ...">
    {typedText}
    <span className="..." />
  </span>
</h1>
```

**2. Subtitle (lines 227-232)**

- Desktop/tablet (line 227-229): Change to `Upload a product photo and create high-quality visuals for ads, product listings, and campaigns in seconds.`
- Mobile (line 230-232): Change to `Upload one product photo, get ∞ brand ready visuals in seconds.`

