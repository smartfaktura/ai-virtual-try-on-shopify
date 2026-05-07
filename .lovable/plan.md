Hide "Bundle Visuals" from the app sidebar navigation.

The only navigation entry is in `src/components/app/AppShell.tsx` at line 65 inside the `navGroups` array under the "Create" section. Remove that single line.

- Leave the route in `App.tsx` intact so the page remains accessible by direct URL if needed.
- No other references to bundle navigation exist in cards, landing pages, or other menus.