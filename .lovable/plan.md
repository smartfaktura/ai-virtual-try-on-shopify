

## Sidebar Redesign + Polish Toggle Enhancement

Three changes: (1) remove the top header bar, (2) redesign the sidebar with a floating/collapsible luxury feel, and (3) rework the Polish toggle into a larger, richer component with Luna's avatar.

---

### 1. Remove the Top Header Bar

The `header` element in `AppShell.tsx` (lines 148-198) will be removed entirely. The user profile/menu and mobile hamburger button will be relocated into the sidebar itself.

**Where things move:**
- User avatar, name, and dropdown menu --> bottom of the sidebar, above the credits section
- Mobile hamburger menu button --> a small floating button in the top-left corner of the main content area (only visible on mobile, `lg:hidden`)

**Impact on page layout:**
- The main content area currently calculates height based on `h-screen` minus the 3.5rem header. With the header gone, pages like Freestyle that use `calc(100vh - 3.5rem)` will switch to just `100vh` (full viewport)
- All other pages get more vertical space automatically since the `<main>` container now starts at the top

---

### 2. Luxury Floating Sidebar

Inspired by the competitor reference (dark sidebar with generous spacing, rounded elements, and clean hierarchy):

**Visual changes to `AppShell.tsx`:**
- **Floating effect**: Add `m-3` margin around the sidebar with `rounded-2xl` corners, creating a "card floating on the background" look rather than an edge-to-edge panel
- **More spacing**: Increase nav item padding from `py-2.5` to `py-3`, increase gap between items, add `px-4` to the sidebar body
- **Larger icons**: Bump nav icons from `w-4 h-4` to `w-[18px] h-[18px]`
- **Refined active state**: Use a softer `bg-white/[0.08]` with a subtle left accent bar (2px rounded primary-colored indicator) instead of just background color
- **Section labels**: More breathing room above/below section dividers
- **Logo area**: More vertical padding, cleaner separation
- **Generate button**: Slightly larger with more vertical padding (`py-3`)

**Collapsible sidebar:**
- Add a collapse toggle button (chevron icon) at the top-right of the sidebar
- Collapsed state: sidebar shrinks to `w-16` showing only icons (no labels)
- Store collapsed state in `localStorage` so it persists across sessions
- Smooth width transition with `transition-all duration-300`
- On mobile: behavior stays the same (overlay drawer)

**User profile in sidebar (bottom):**
- Between the credits section and the bottom edge
- Shows avatar circle + user name + email (truncated)
- Click opens the same dropdown menu (Settings, Sign out) -- popover anchored above the avatar
- In collapsed mode: just the avatar circle, dropdown still works on click

---

### 3. Freestyle Page Height Adjustment

**File: `src/pages/Freestyle.tsx`**
- Change `h-[calc(100vh-3.5rem)]` to `h-[calc(100vh)]` or use a simpler approach: the parent container already fills available space, so we can use `h-full` since the header is gone

---

### 4. Polish Toggle Redesign

**File: `src/components/app/freestyle/FreestyleSettingsChips.tsx`**

Current: Small inline chip with tiny Luna avatar + "Polish" text + switch toggle

New design (inspired by the reference screenshot showing a larger circular avatar with toggle):
- **Remove** the small inline avatar from the chip
- The chip shows just: "Polish" + Switch toggle (clean, minimal)
- **On hover**: A popover/tooltip card appears showing:
  - Luna's avatar image at a larger size (~48px circle)
  - Her name: "Luna"
  - Her role: "Retouch Specialist"  
  - A short description: "Refines your prompt with professional photography lighting, composition, and mood techniques for studio-quality results."
- The hover card uses `HoverCard` from Radix (already installed) for a smooth, larger tooltip that feels premium
- This keeps the chip row clean while providing a rich, branded touchpoint on interaction

---

### Technical Details -- Files Changed

| File | Change |
|------|--------|
| `src/components/app/AppShell.tsx` | Remove top header; add floating sidebar with rounded corners, more spacing, collapse toggle, and user profile section at bottom; add mobile hamburger as floating button |
| `src/pages/Freestyle.tsx` | Update height calculation now that header is removed (remove the `3.5rem` offset) |
| `src/components/app/freestyle/FreestyleSettingsChips.tsx` | Replace inline Luna avatar chip with clean "Polish + Switch" chip; add HoverCard on hover showing larger Luna avatar, name, role, and description |

No database or backend changes needed.

