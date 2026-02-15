

## Creative Drops Onboarding -- Premium Visual Upgrade

The current onboarding is functional but visually flat: plain white cards, small icons, and basic badges. For B2B clients, we need a section that feels premium, editorial, and confidence-inspiring.

---

### What Changes

**1. Hero Section -- Gradient headline with editorial feel**
- Replace the plain `text-3xl font-bold` headline with a larger, tracked headline using a subtle gradient text effect (dark-to-medium tone, not flashy)
- Add a decorative sparkle/infinity icon above the headline as a visual anchor
- Increase subtitle font size and add more breathing room

**2. Step Cards -- Glassmorphism with hover elevation**
- Replace flat `border bg-card` cards with a frosted-glass aesthetic: `bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-sm border border-white/60 shadow-lg`
- Add a colored accent stripe on the left edge of each card (using primary color, fading opacity per card)
- Increase card padding and add hover effect: `hover:shadow-xl hover:-translate-y-1 transition-all duration-300`
- Make the step number circle larger (w-10 h-10) with a subtle gradient background
- Increase icon size and use primary color tint instead of muted
- Bump title to `text-base font-semibold` and description to `text-sm`

**3. Benefit Chips -- Pill-style with subtle glow**
- Replace plain secondary badges with outlined pills that have a subtle inner shadow and slight primary tint on hover
- Add a faint background gradient behind the entire benefits row

**4. CTA Button -- Premium styling**
- Make the CTA larger with a subtle shadow and gradient background
- Add a secondary text line below: "No credit card required. Cancel anytime." in muted small text for trust

**5. Visual Collage -- Product showcase strip**
- Add a horizontal strip of 4-5 small product/lifestyle preview thumbnails between the steps and benefits, using the existing `getLandingAssetUrl` showcase images
- Images shown in rounded pill-shaped containers with slight overlap and rotation for depth
- This gives users a visual preview of what their drops could look like

---

### Technical Details

**File: `src/pages/CreativeDrops.tsx`**

Only the `CreativeDropsOnboarding` component is modified (lines 404-461). No new files.

**Step card styling (after):**
```tsx
<div
  className={cn(
    "relative rounded-2xl p-7 text-left space-y-4",
    "bg-gradient-to-br from-white/90 to-stone-50/80",
    "border border-stone-200/60 shadow-md",
    "hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
    "animate-in fade-in-0 slide-in-from-bottom-4 duration-500 fill-mode-both"
  )}
>
  {/* Left accent stripe */}
  <div className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-primary/[opacity]" />
  ...
</div>
```

**Gradient headline:**
```tsx
<h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
```

**Product preview strip (using existing assets):**
```tsx
const previewImages = [
  getLandingAssetUrl('showcase/fashion-blazer-golden.jpg'),
  getLandingAssetUrl('showcase/skincare-serum-marble.jpg'),
  getLandingAssetUrl('showcase/food-coffee-artisan.jpg'),
  getLandingAssetUrl('showcase/fashion-tee-lifestyle.jpg'),
];

<div className="flex justify-center -space-x-3">
  {previewImages.map((img, i) => (
    <div
      key={i}
      className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-background shadow-md"
      style={{ transform: `rotate(${(i - 1.5) * 4}deg)`, zIndex: 4 - i }}
    >
      <img src={img} className="w-full h-full object-cover" />
    </div>
  ))}
</div>
```

**Trust line under CTA:**
```tsx
<p className="text-xs text-muted-foreground mt-3">
  Set up in under 2 minutes. Pause or cancel anytime.
</p>
```

**Layout:** Same max-w-3xl centered container, increased vertical spacing (space-y-12 instead of space-y-10), and slightly more padding (py-12 instead of py-8).
