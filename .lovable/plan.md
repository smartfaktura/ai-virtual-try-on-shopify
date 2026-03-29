

# Fix Slow/Stuck Loading on Auth Page

## Problem
When visiting vovv.ai and clicking "Login", the Auth page renders `null` (blank screen) while `isLoading` is `true` (line 145: `if (isLoading || user) return null`). The AuthContext has a 10-second safety timeout, so if the Supabase session check is slow, users see a blank white page for up to 10 seconds.

## Solution
Replace the `return null` guard with a proper loading skeleton/spinner on the Auth page, so users see immediate visual feedback instead of a blank screen.

## File: `src/pages/Auth.tsx` (line 145)

Replace:
```tsx
if (isLoading || user) return null;
```

With:
```tsx
if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center animate-pulse">
          <span className="text-primary-foreground font-bold text-sm">V</span>
        </div>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}

if (user) return null;
```

This shows the branded "V" loading indicator (matching the ProtectedRoute loader) instead of a blank screen, and only hides the form once the user is confirmed logged in (at which point the `useEffect` redirect fires immediately anyway).

Single file, ~10 lines changed.

