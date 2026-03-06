

## Fix Logo Link to Navigate Home

The logo in `LandingNav.tsx` uses `<a href="#">` which only scrolls to the top of the current page — it doesn't navigate to the home page (`/`). This is noticeable on feature pages like `/features/virtual-try-on` where clicking the logo does nothing useful.

### Change

**`src/components/landing/LandingNav.tsx`** (line 55)

Replace the logo's `<a href="#">` with an `onClick={() => navigate('/')}` button/link, consistent with how other navigation is handled in the component.

