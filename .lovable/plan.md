

## Fix: Hide Studio Chat on Creative Drop Wizard + Improve Mobile Scroll

### Problems

1. **Studio Chat floating button blocks scrolling** -- The StudioChat component renders a `fixed bottom-4 right-4 z-50` button that sits on top of the wizard content. On mobile, this 48x48px touch target intercepts swipe gestures near the bottom-right of the screen, making it hard to scroll smoothly. This is the "customer support icon" you want hidden.

2. **Scroll still feels restricted** -- The combination of the fixed mobile header (80px from top) and the floating chat button creates a constrained scroll zone. Removing the chat button during wizard mode will free up the full scroll area.

### Solution

**Hide the StudioChat component when the Creative Drop wizard is open.** The wizard state (`wizardOpen`) lives in the `CreativeDrops.tsx` page, but StudioChat is rendered in `AppShell.tsx` (the global shell). The cleanest approach: use the current route + a simple CSS/conditional approach.

Since the wizard is shown inline on the `/app/creative-drops` page (not a separate route), we need to pass context from the page to the shell. The simplest way: use `useLocation` state or a body data attribute that the StudioChat can read.

Even simpler: **hide StudioChat on mobile when on the creative-drops route entirely**, since the chat is not essential during wizard creation and can still be accessed on desktop.

---

### Technical Changes

**File: `src/components/app/StudioChat.tsx`**

1. Import `useLocation` from react-router-dom and `useIsMobile` hook
2. Add a check: if on mobile AND the current route is `/app/creative-drops`, hide the floating button entirely (return null or hide with a class)

```
// At the top of StudioChat component:
const location = useLocation();
const isMobile = useIsMobile();
const hideOnMobile = isMobile && location.pathname === '/app/creative-drops';

// Wrap the floating button:
if (hideOnMobile) return null;
```

This hides both the chat panel and the floating button on mobile when viewing Creative Drops (which includes the wizard). On desktop it remains visible since it doesn't cause scroll issues there.

**File: `src/components/app/CreativeDropWizard.tsx`**

3. Add `-webkit-overflow-scrolling: touch` to improve iOS scroll momentum. Add the Tailwind utility class `touch-auto` to the wizard's root container to ensure touch events are properly handled.

Change line 431:
```
<div className="space-y-0">
```
To:
```
<div className="space-y-0 touch-auto">
```

This is a minor addition but ensures the wizard content area doesn't have any touch-action restrictions that could interfere with smooth scrolling.

### Summary
- 2 files modified
- StudioChat hidden on mobile during Creative Drops (covers wizard creation)
- No new dependencies
- Chat remains fully accessible on desktop and on all other mobile pages
