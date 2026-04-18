

The "Share feedback" button in `src/components/app/FeedbackBanner.tsx` (line 75) uses `variant="outline" size="sm"` with hardcoded `text-xs px-4 h-8` — inconsistent with the unified design system (`h-10 rounded-full` pill standard).

### Fix

**File:** `src/components/app/FeedbackBanner.tsx` (line 75)

Replace:
```tsx
<Button variant="outline" size="sm" className="text-xs font-semibold px-4 h-8">
  Share feedback
</Button>
```

With:
```tsx
<Button variant="outline" size="pill" className="font-semibold">
  Share feedback
</Button>
```

This brings it to `h-10 rounded-full text-sm` matching all other CTAs in the app.

### Acceptance
- Button renders at `h-10` with `rounded-full` corners and `text-sm` font
- Visually consistent with other secondary pill CTAs across `/app`

