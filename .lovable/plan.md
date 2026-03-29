

# Fix "Save 20%" Badge Clarity

## Problem
The "Save 20%" pill floats next to the toggle with no context — users don't know *when* they save 20%.

## Solution
Move the savings text inside the Annual button area so it's clearly tied to annual billing. Change the Annual button label to include the discount context:

**Approach**: Keep the toggle clean but make the "Save 20%" badge only appear when Monthly is selected (as an incentive to switch). When Annual is active, show a checkmark or "Saving 20%" confirmation instead.

Simpler approach: Put "Save 20%" as a small tag directly attached to the Annual option, not as a separate floating element.

## File: `src/components/landing/LandingPricing.tsx` (lines 33-56)

Replace the toggle with:

```tsx
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
    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
      annual ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
    }`}
  >
    Annual
    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
      −20%
    </span>
  </button>
</div>
```

The "−20%" pill is now inside the Annual button, making it immediately clear that annual billing saves 20%. No separate floating badge.

