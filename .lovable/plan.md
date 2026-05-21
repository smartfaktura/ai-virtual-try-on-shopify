# Force the new Terms to show (kill the cached "Delaware" bundle)

## What's actually happening

The Terms file on disk is already correct. `src/components/legal/TermsContent.tsx` §25 reads:

> Business users: these Terms are governed by the laws of the Republic of Lithuania, and the courts of Vilnius, Lithuania have exclusive jurisdiction…

A full-text search for "Delaware" across the project returns zero matches. So there is nothing to rewrite in the legal copy.

What you are still seeing is the **previously cached JS bundle** in your browser. The signup modal and `/terms` route both render the same component, so once the new bundle loads, both update.

## Fix

Two small, safe changes to force every visitor (and you) onto the new bundle:

1. **Bump `public/version.json`** to a fresh timestamp. The app's deploy-state guard reads this file and triggers a soft reload for users on non-wizard routes when the version changes.
2. **Add a tiny "Last updated" line** at the very top of `TermsContent.tsx` with today's date. This is good legal hygiene anyway (users can see the Terms changed) and gives you a visible signal in the UI that the new copy is live — if you don't see today's date, you're still on the cached bundle and need to hard-refresh (Cmd/Ctrl+Shift+R).

That's it. No legal wording changes, no renumbering, no Privacy edits.

## Scope

- `public/version.json` — bump the `v` value
- `src/components/legal/TermsContent.tsx` — add one "Last updated: 21 May 2026" line under the opening div

No DB, auth, routes, components, or translations affected.
