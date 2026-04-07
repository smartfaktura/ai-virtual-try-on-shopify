

# Fix: Setup step scrolls to wrong position

## Problem
When navigating to the Setup step (step 3), the page scrolls to `wizardContentRef` which is placed **below** the page header and stepper. This scrolls the header and stepper out of view, making it feel like the user lands in the middle of the page instead of at the top.

## Fix

### File: `src/pages/ProductImages.tsx`

**Change the scroll behavior to scroll to the top of the page instead of to the wizard content div:**

Replace the scroll effect (lines 225-231):
```typescript
useEffect(() => {
  if (wizardContentRef.current) {
    wizardContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}, [step]);
```

With simply:
```typescript
useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, [step]);
```

This ensures on every step change the user sees the full page from the top — header, stepper, product context strip, and then the step content — instead of jumping to the middle.

