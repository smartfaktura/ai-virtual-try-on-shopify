Prevent mobile keyboard auto-opening on search-first modals

## Problem
On touch devices, opening the Library picker or Category picker immediately focuses the search input, causing the on-screen keyboard to slide up before the user has tapped anything. This blocks content and feels invasive.

## Solution
Add a touch-only guard on Radix Dialog's auto-focus so the keyboard only appears when the user intentionally taps the search field.

## Changes

1. **Create `src/lib/dialogAutoFocus.ts`** — shared helper:
   ```ts
   export const preventAutoFocusOnMobile = (e: Event) => {
     if (typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches) {
       e.preventDefault();
     }
   };
   ```
   - Only blocks on touch devices (`pointer: coarse`). Desktop mice/trackpads are unaffected.
   - Tapping the search input still focuses it normally.

2. **Update `src/components/app/video/LibraryPickerModal.tsx`**
   - Add `onOpenAutoFocus={preventAutoFocusOnMobile}` to the `DialogContent` component.

3. **Update `src/components/app/product-images/CategoryPickerModal.tsx`**
   - Remove explicit `autoFocus` from the `Input` component.
   - Add `onOpenAutoFocus={preventAutoFocusOnMobile}` to `DialogContent`.

## Out of scope
- Intentional focus-on-open inputs (rename editors, single-field prompts, admin forms).
- Visual style changes.