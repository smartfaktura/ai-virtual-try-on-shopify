

# Fix: Terms & Privacy Links Open as Popups on Auth Page

## Problem
The "Terms of Service" and "Privacy Policy" links in the signup checkbox use `<Link to="/terms-of-service" target="_blank">`, which navigates the user away from the registration page. The links should open inline as dialog popups instead.

## Changes — `src/pages/Auth.tsx`

### 1. Add two state variables for dialog visibility
- `showTermsDialog` and `showPrivacyDialog` (boolean states)

### 2. Replace `<Link>` tags with `<button>` click handlers
Change lines 509-511 from `<Link to="/terms-of-service" target="_blank">` and `<Link to="/privacy-policy" target="_blank">` to `<button onClick={() => setShowTermsDialog(true)}>` styled as inline text links.

### 3. Add two `<Dialog>` components at the bottom of the page
Each dialog will:
- Use `DialogContent` with `max-w-2xl max-h-[80vh] overflow-y-auto`
- Render the same prose content from `TermsOfService.tsx` / `PrivacyPolicy.tsx` directly (extracted into shared content components or inlined)
- Have a "Close" button at the bottom

### 4. Extract legal content into reusable components
Create two small components:
- `src/components/legal/TermsContent.tsx` — just the prose `<div>` from `TermsOfService.tsx` (without `PageLayout`/`SEOHead`)
- `src/components/legal/PrivacyContent.tsx` — same for privacy

Then both `Auth.tsx` dialogs and the existing full pages import these shared content components, avoiding duplication.

### Files
- `src/components/legal/TermsContent.tsx` — new, extracted prose content
- `src/components/legal/PrivacyContent.tsx` — new, extracted prose content
- `src/pages/Auth.tsx` — replace Link with button + add dialogs
- `src/pages/TermsOfService.tsx` — import `TermsContent` instead of inline prose
- `src/pages/PrivacyPolicy.tsx` — import `PrivacyContent` instead of inline prose

