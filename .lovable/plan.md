

## Fix Hero Carousel: Hide Scrollbar and Clean Up Layout

### Problem
The hero output carousel shows an ugly visible scrollbar beneath the images. The `scrollbar-thin` class and inline `scrollbarColor` style make it visible, which looks unprofessional alongside the dot indicators and arrow buttons that already serve as navigation.

### Changes

**File: `src/components/landing/HeroSection.tsx`**

1. **Hide the scrollbar completely** on the carousel container (line 318-319):
   - Remove `scrollbar-thin` class
   - Remove inline `scrollbarColor` style
   - Add a CSS utility class `scrollbar-hide` to completely hide the scrollbar while keeping scroll functionality

2. **Add scrollbar-hide CSS** via an inline style block (or use the existing pattern of inline `<style>` tags already in the component):
   - Add `-webkit-scrollbar { display: none }` and `scrollbar-width: none` to the carousel container

### Technical Detail

Line 318 change:
```tsx
// Before
className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin"
style={{ scrollbarColor: 'hsl(var(--border)) transparent' }}

// After
className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 snap-x snap-mandatory"
style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
```

Also add to the existing `<style>` block at the bottom of the component:
```css
[data-hero-carousel]::-webkit-scrollbar { display: none; }
```

And add `data-hero-carousel` attribute to the scroll container.

This keeps smooth horizontal scrolling via touch/trackpad and arrow buttons while completely hiding the scrollbar for a clean premium look.

