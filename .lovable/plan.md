

# Add Mobile Subtitle to Out-of-Credits Banner

## Problem
The subtitle text on `LowCreditsBanner` is hidden on mobile (`hidden sm:block`). The user wants a visible subtitle on mobile when out of credits: "Keep creating in minutes".

## Fix

### `src/components/app/LowCreditsBanner.tsx` — Line 28

Replace the single subtitle line with two variants:
- **Mobile** (shown only on small screens): "Keep creating in minutes"
- **Desktop** (shown on `sm:` and up): the full `message` text

```tsx
<p className="text-sm opacity-80 sm:hidden">{isEmpty ? 'Keep creating in minutes' : message}</p>
<p className="text-sm opacity-80 hidden sm:block">{message}</p>
```

Only the empty-credits state gets the short mobile subtitle; the low-credits state shows the same `message` on both.

| File | Change |
|------|--------|
| `src/components/app/LowCreditsBanner.tsx` | Add mobile-visible subtitle line |

