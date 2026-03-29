

# Fix Broken Terms & Privacy Links on Auth Page

## Problem
The signup form links point to `/terms-of-service` and `/privacy-policy`, but the actual routes are `/terms` and `/privacy`.

## Fix
In `src/pages/Auth.tsx`, update the two `<Link>` components (around lines 509-511):
- `/terms-of-service` → `/terms`
- `/privacy-policy` → `/privacy`

Single file, two-word change each. No other files affected.

