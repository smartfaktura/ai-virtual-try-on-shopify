

## Hide customer support icon on Perspectives page (mobile)

### Change

**File: `src/components/app/StudioChat.tsx` (line 50-53)**

Add `/app/perspectives` to the existing `hideOnMobile` condition:

```tsx
// Before
const hideOnMobile = isMobile && (
  location.pathname === '/app/creative-drops' ||
  location.pathname === '/app/freestyle'
);

// After
const hideOnMobile = isMobile && (
  location.pathname === '/app/creative-drops' ||
  location.pathname === '/app/freestyle' ||
  location.pathname === '/app/perspectives'
);
```

One line addition. The chat icon already hides on mobile for Creative Drops and Freestyle — this adds the same behavior for Perspectives.

