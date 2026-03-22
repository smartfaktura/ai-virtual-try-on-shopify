

# Premium Spacing Polish

## Changes

### File: `src/components/app/DashboardPersonalizationHero.tsx`

**Line 73**: Change container spacing from `space-y-1.5 mt-1` to `space-y-2 mt-2.5`

- `mt-2.5` — more breathing room between "Welcome back" greeting and the headline (currently too tight)
- `space-y-2` — slightly more air between headline and selector row

### File: `src/pages/Dashboard.tsx`

**Line 412**: Change Quick Actions margin from `mt-4` to `mt-5`

- More separation between the personalization block and the action buttons below

### Result
```text
Welcome back, Tomas 👋
                              ← 10px gap (was 4px)
Create clean, high-end skincare visuals...
                              ← 8px gap (was 6px)
Personalized for [Beauty & Skincare ▼]
                              ← 20px gap (was 16px)
[Upload Product] [Generate Images] ...
```

Each section gets room to breathe without feeling disconnected. Two files, two lines changed.

