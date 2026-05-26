## Always start the Brand Scene wizard blank

Right now `useWizardState` initializes from `initial`, but the wizard component instance can be re-used across in-app navigations (browser back, "New scene" after a generation), so prior answers can still appear pre-selected. We'll guarantee a clean slate every time the user lands on `/app/brand-scenes/new`.

### Changes

1. **`src/pages/BrandSceneWizard.tsx`**
   - Read `useLocation()` and render `<Wizard key={location.key} />`. Any navigation to `/app/brand-scenes/new` (even from inside the app) produces a new React key, forcing a full remount and discarding all prior state.

2. **`src/features/brand-scenes/wizard/BrandSceneWizard.tsx`**
   - Add a mount-time `useEffect(() => { dispatch({ type: "reset" }); }, [])` as a belt-and-suspenders reset. Even if the key strategy fails (HMR, edge cases), the wizard always boots into the `initial` state.

3. **No schema/registry changes**
   - Category defaults shown in chips are not "saved settings" — they're presentation defaults from the registry. We're not touching those. Only actual wizard state (cast, scale, scene, base, references, note, responsibility flag) gets reset.

### Out of scope
- No localStorage/DB draft (none exists today).
- No changes to generation, prompt assembly, or other steps.
