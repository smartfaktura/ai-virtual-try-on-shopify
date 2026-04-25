# Terms & Privacy as Modals on Auth Page

Keep the user on the signup form. Replace the two `<Link target="_blank">` anchors in the Terms checkbox with buttons that open scrollable modals containing the policy text — with a clear close button. The standalone `/terms` and `/privacy` routes stay intact (still used by the footer, emails, SEO).

## Scope

Only one file changes: **`src/pages/Auth.tsx`** (the signup checkbox row at lines 571–576).

No changes to:
- `src/pages/TermsOfService.tsx` / `src/pages/PrivacyPolicy.tsx` (routes preserved)
- `App.tsx` routes
- Footers (`HomeFooter`, `LandingFooter`) — those stay as page links, which is correct outside of signup

## What the user sees

- Checkbox label still reads: *"I agree to the **Terms of Service** and **Privacy Policy**"*
- Clicking either underlined word opens a centered modal (Dialog) on top of the auth screen
- Modal has: title, scrollable body with the full policy content, a footer "Close" button, and the standard top-right `X` close (built into `DialogContent`)
- Closing returns the user to the exact same signup state (form values preserved — modal is purely presentational)
- Mobile: dialog is responsive (already handled by our `Dialog` primitive: `w-[calc(100%-2rem)]`, `max-h-[calc(100vh-2rem)]`, `overflow-y-auto`)

## Technical implementation

1. In `src/pages/Auth.tsx`:
   - Add two state booleans: `termsOpen`, `privacyOpen`
   - Import `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` from `@/components/ui/dialog`, plus `Button`
   - Replace the two `<Link>` elements inside the checkbox label with `<button type="button">` (so they don't submit the form) styled identically (`underline text-foreground hover:text-primary`), each setting its respective state to true
   - Render two `<Dialog>` blocks at the bottom of the signup form JSX

2. Content source — to avoid duplicating long legal copy, **extract the body JSX** of each policy page into a small shared component:
   - Create `src/components/legal/TermsContent.tsx` (the `<main>` inner content of `TermsOfService.tsx`)
   - Create `src/components/legal/PrivacyContent.tsx` (same for `PrivacyPolicy.tsx`)
   - Update `TermsOfService.tsx` and `PrivacyPolicy.tsx` to render these components inside their existing page chrome (no visible change)
   - The Auth modals render `<TermsContent />` / `<PrivacyContent />` inside a `max-h-[70vh] overflow-y-auto` wrapper

3. Modal sizing: `DialogContent className="max-w-2xl"` so legal text is readable on desktop; default mobile sizing already fits viewport.

4. Accessibility: `DialogTitle` provides the accessible name; the built-in `X` button + footer "Close" button + Escape key + overlay click all dismiss.

## Out of scope

- No change to footer links across the site (those should remain real pages)
- No change to the actual policy text
- No new routes, no DB changes

Approve to implement.