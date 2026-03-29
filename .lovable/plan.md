

# Improve Annual/Monthly Toggle Design

## Problem
The "−20%" badge overlaps awkwardly with the Annual button, creating poor spacing and unclear association.

## Solution
Replace the floating badge with a cleaner layout: place the "−20%" badge as a separate pill to the right of the toggle, outside the toggle container. This gives clear spacing and makes it obvious the discount applies to annual billing.

## File: `src/components/landing/LandingPricing.tsx` (lines 33-54)

Replace the toggle markup with:

```tsx
<div className="inline-flex items-center gap-3">
  <div className="inline-flex items-center p-1 rounded-full bg-muted">
    <button
      onClick={() => setAnnual(false)}
      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
        !annual ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
      }`}
    >
      Monthly
    </button>
    <button
      onClick={() => setAnnual(true)}
      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
        annual ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
      }`}
    >
      Annual
    </button>
  </div>
  <span className="inline-flex items-center rounded-full bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 whitespace-nowrap">
    Save 20%
  </span>
</div>
```

Key improvements:
- Badge moved outside the toggle as a sibling pill with proper `gap-3` spacing
- "Save 20%" is clearer copy than "−20%"
- Slightly taller buttons (`py-2.5`) for better tap targets
- No absolute positioning or negative offsets

