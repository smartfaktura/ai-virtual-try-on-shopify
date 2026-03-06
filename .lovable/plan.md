

## Fix Feedback Banner UX

Two issues to address:

### 1. Textarea expand/collapse has no animation
Currently uses conditional rendering (`{selectedType && ...}`) which causes an instant show/hide. Fix: wrap the textarea section in a CSS transition container with `overflow-hidden` and animated `max-height` / `opacity`, or use a `grid-rows` animation trick for smooth expand/collapse.

### 2. X button makes the banner disappear permanently
The X sets `sessionStorage` and the component returns `null` — the banner is gone for the session with no way to get it back. This feels abrupt.

**Fix**: Instead of fully removing the banner, the X button should collapse it into a minimal one-liner: just the icon + "Help us improve VOVV.AI" + a small "Share feedback" link to re-expand. Only after submitting feedback does it fully auto-dismiss.

### Changes — single file

**`src/components/app/FeedbackBanner.tsx`**:
- Add `collapsed` state (default false). X button sets `collapsed = true` instead of dismissing.
- When collapsed: show a compact single-line banner with "Share feedback" text button to expand back.
- Wrap the type chips + textarea section in a div with `transition-all duration-300` and animated height (using `grid` row trick: `grid-rows-[0fr]` → `grid-rows-[1fr]`).
- After successful submission, auto-dismiss fully (sessionStorage).
- Add `overflow-hidden` on the animated container to prevent content flash.

