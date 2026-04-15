

# Admin Conversion Preview Page

Create a new admin page at `/app/admin/conversion` that renders all 3 Post-Gen Conversion components in an interactive sandbox so you can preview, compare, and request design changes.

## What You'll See

The page will display all 3 layers side-by-side with controls:

- **Layer 1 — PostGenerationUpgradeCard**: Inline card with category dropdown to preview all 9 category variants (fashion, beauty, jewelry, etc.)
- **Layer 2 — UpgradeValueDrawer**: Opens from a button, showing the value drawer with category switcher and optional generation context preview
- **Layer 3 — NoCreditsModal**: Opens from a button, showing the credit pack purchase modal with category switcher

Each section will have:
- Category selector dropdown (all 9 categories)
- Desktop/mobile viewport toggle (renders in a constrained container to simulate breakpoints)
- Open/close controls for drawer and modal
- The 3-second fade-in delay on Layer 1 will be bypassed for instant preview

## Technical Plan

| Step | Details |
|------|---------|
| **Create page** | `src/pages/AdminConversion.tsx` — standalone admin page with all 3 components rendered in preview containers |
| **Add route** | `src/App.tsx` — add `<Route path="/admin/conversion" element={<AdminConversion />} />` |
| **Add nav link** | `src/components/app/AppShell.tsx` — add "Conversion" button in admin menu |

### Page Layout

```text
┌─────────────────────────────────────────────┐
│  Post-Gen Conversion Preview     [Category ▼]│
├─────────────────────────────────────────────┤
│  LAYER 1 — Inline Upgrade Card              │
│  ┌─────────────────────────────────┐        │
│  │ [PostGenerationUpgradeCard]     │        │
│  └─────────────────────────────────┘        │
│  [Desktop] [Mobile 375px]                   │
├─────────────────────────────────────────────┤
│  LAYER 2 — Value Drawer                     │
│  [Open Drawer]                              │
├─────────────────────────────────────────────┤
│  LAYER 3 — No Credits Modal                 │
│  [Open Modal]                               │
├─────────────────────────────────────────────┤
│  COPY REFERENCE TABLE                       │
│  Category | Headline | Subline | Chips      │
└─────────────────────────────────────────────┘
```

The copy reference table at the bottom will show all category copy variants from `conversionCopy.ts` in a scannable table format.

### Key Details
- Layer 1 card will bypass the 3-second delay by rendering with `visible` forced to `true` (we'll render it directly using the copy functions rather than wrapping in the component, or pass a `forceVisible` prop)
- Layer 2 and Layer 3 open via buttons — they use their real components so you see exactly what users see
- Mobile preview wraps the Layer 1 card in a `max-w-[375px]` container to simulate mobile
- Admin-only: protected behind `useIsAdmin` check

