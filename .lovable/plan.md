

# Add "NEW" Badge to Brand Models + Ensure Video Generation in BuyCreditsModal

## Problem
In the BuyCreditsModal (plans popup), line 386 renders features as plain text even when they have a badge object (e.g. `{ text: 'Brand Models', badge: 'NEW' }`). The badge is stripped because the code only renders `f.text`.

## Changes

### File: `src/components/app/BuyCreditsModal.tsx` (line 386)

Replace the feature text rendering to handle badge objects, matching the pattern already used in `LandingPricing.tsx`:

```tsx
// Before:
<span className="text-[11px] text-muted-foreground leading-snug">{typeof f === 'string' ? f : f.text}</span>

// After:
<span className="text-[11px] text-muted-foreground leading-snug">
  {typeof f === 'string' ? f : (
    <span className="inline-flex items-center gap-1.5">
      {f.text}
      {f.badge && (
        <Badge className="text-[9px] px-1.5 py-0 leading-tight bg-primary/15 text-primary border-0">
          {f.badge}
        </Badge>
      )}
    </span>
  )}
</span>
```

This is a single-line change. The data already has `Video Generation` on all plans and `{ text: 'Brand Models', badge: 'NEW' }` on Growth and Pro — no data changes needed.

