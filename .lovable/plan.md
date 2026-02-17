

## Fix: Chat Icon Should Be Behind Mobile Sidebar Menu

### Problem
The Studio Chat floating button and panel use `z-50`, which is the same z-index as the mobile sidebar overlay. This causes the chat icon to appear on top of (or compete with) the sidebar menu when it's open.

### Fix

**File: `src/components/app/StudioChat.tsx`**

Lower the z-index of both the chat panel and the floating button from `z-50` to `z-40`. This ensures the sidebar overlay (`z-50`) renders above the chat icon when the menu is open.

Changes on two lines:
- Line 82: Chat panel — change `z-50` to `z-40`
- Line 217: Floating button — change `z-50` to `z-40`

The chat icon will still appear above normal page content but will correctly sit behind the mobile sidebar overlay.

