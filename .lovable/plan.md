

# Fix: Launch Step Scrolls to Top When Navigating

## Problem
When navigating to Step 3 (Launch), the scroll position stays at the bottom because the wizard uses `window.scrollTo({ top: 0 })` but the actual scroll container is `#app-main-scroll` (the AppShell main content area). The window itself doesn't scroll — the main content div does.

## Change

### File: `src/components/app/CreativeDropWizard.tsx` (lines 421-429)

Replace both `window.scrollTo({ top: 0, behavior: 'smooth' })` calls in `handleNext` and `handleBack` with:
```ts
document.getElementById('app-main-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
```

This targets the correct scroll container used by AppShell (`<main id="app-main-scroll">`), ensuring the user sees the top of each step when navigating forward or backward.

## Summary
- 1 file, 2 lines changed
- Fixes scroll-to-top on step navigation so Launch step shows from the top

