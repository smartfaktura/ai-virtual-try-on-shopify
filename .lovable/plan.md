

## Swap "Create with Prompt" sidebar icon to wand

Find sidebar nav entry for "Create with Prompt" and replace its `Sparkles` icon with the same wand icon used on the dashboard for the matching action, so both surfaces stay in sync.

### Steps
1. Locate the sidebar nav config (likely `src/components/app/Sidebar*.tsx` or a nav items file) and confirm current icon is `Sparkles`.
2. Locate the dashboard tile labeled "Create with Prompt" / Freestyle and read which wand icon it uses (`Wand` or `Wand2` from lucide-react).
3. Update the sidebar import + usage to that exact same icon.

### Files (to confirm during exploration)
- Sidebar nav (icon source of truth for left menu)
- Dashboard tile component (icon source of truth to match)

### Acceptance
- Sidebar "Create with Prompt" renders the wand icon, identical to the dashboard tile
- No other sidebar icons change
- No unused `Sparkles` import left behind

