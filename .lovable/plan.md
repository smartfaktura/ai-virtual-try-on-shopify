

## Cache-Busting Version Check — Implementation Plan

### What This Does
Every time we deploy, a tiny version number gets baked into the app. When a returning user opens the site, the app quietly checks if their version is current. If outdated, it does one hard refresh. A safety flag prevents infinite loops.

### Files

**1. New: `src/lib/versionCheck.ts`**
- Declare `__BUILD_VERSION__` global type
- Export `checkAppVersion()` that fetches `/version.json?t=<now>`, compares its `v` field against `__BUILD_VERSION__`
- On mismatch: set `sessionStorage.version_reloaded = "1"`, call `location.reload()`
- On match or if already reloaded: clear the flag, exit silently
- Wrap everything in try/catch — any failure = silent exit

**2. Edit: `vite.config.ts`**
- Add `define: { __BUILD_VERSION__: JSON.stringify(Date.now().toString()) }`
- Add a small custom plugin (`generateVersionFile`) that writes `{ "v": "<timestamp>" }` to `public/version.json` during `buildStart`
- In dev mode, skip the version file generation

**3. Edit: `src/App.tsx`**
- Import `checkAppVersion` from `@/lib/versionCheck`
- Add a `useEffect` at the top of the `App` component that calls `checkAppVersion()` once on mount

**4. New: `src/vite-env.d.ts` update**
- Add `declare const __BUILD_VERSION__: string;` global declaration (or add to existing file)

