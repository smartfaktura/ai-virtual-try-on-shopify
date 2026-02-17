
## Move Support Chat Icon to Left Side on Mobile

### Problem
The floating chat button is positioned `bottom-4 right-4`, which overlaps CTA buttons like "Continue" on mobile screens (visible in the screenshot).

### Change

**File: `src/components/app/StudioChat.tsx`**

Update the floating button positioning (line 217) to use `left-4` on mobile and `right-4` on desktop:

```tsx
// Before
'fixed bottom-4 right-4 z-50 ...'

// After  
'fixed bottom-4 left-4 sm:left-auto sm:right-4 z-50 ...'
```

Also update the chat panel positioning (currently anchored to `right-4`) to open from the left on mobile:

```tsx
// Panel: left-4 on mobile, right-4 on desktop
'fixed bottom-20 left-4 sm:left-auto sm:right-4 ...'
```

This ensures the chat icon sits on the bottom-left on mobile (away from right-aligned CTAs) and stays in the traditional bottom-right on desktop.
