

## Fix: Bottom Padding + Primary CTA on Mobile Freestyle

### Problem
From the screenshot: the "Buy Credits" CTA button sits flush against the very bottom of the screen with no breathing room, and the button uses a muted outline style instead of the primary brand color.

### Changes

**File: `src/pages/Freestyle.tsx`**
- Line 1059: Add bottom padding on mobile to the prompt panel container. Change `pb-0` to `pb-4` (or `pb-safe` for safe-area) so the CTA doesn't touch the bottom edge. Update from:
  ```
  isPromptCollapsed ? "pb-0" : "pb-0 sm:pb-6"
  ```
  to:
  ```
  isPromptCollapsed ? "pb-2" : "pb-4 sm:pb-6"
  ```

**File: `src/components/app/freestyle/FreestylePromptPanel.tsx`**
- Lines 355-363: Change the "Buy Credits" button from `variant="outline"` with muted styling to use the primary color. Replace:
  ```
  variant="outline"
  className="... bg-muted text-foreground border border-border hover:bg-accent shadow-none"
  ```
  with:
  ```
  className="... bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
  ```
  And update the icon from `text-muted-foreground` to match primary-foreground.

### Impact
- Bottom padding gives the CTA breathing room above the phone's navigation bar
- Primary-colored "Buy Credits" button is more prominent and on-brand

