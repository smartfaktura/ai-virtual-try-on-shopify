

## Enable Google Sign-In

### Step 1: Configure Google OAuth
Use Lovable Cloud's built-in social auth configuration tool to set up Google OAuth and generate the required module at `src/integrations/lovable/`.

### Step 2: Add Google Sign-In Button to Auth Page

**File: `src/pages/Auth.tsx`**

- Import `lovable` from `@/integrations/lovable/index`
- Add a `handleGoogleSignIn` function that calls `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`
- Add a "Continue with Google" button between the heading and the email/password form, with a visual divider ("or") separating it from the form
- The button will use Google's brand colors (white background, dark text, Google "G" icon via inline SVG)
- Show the Google button in both signup and login modes

### UI Layout (after changes)

```text
+---------------------------+
|  VOVV.AI logo             |
|  Create your account      |
|  Start with 5 free...     |
|                           |
|  [G  Continue with Google]|
|                           |
|  ──── or ────             |
|                           |
|  Display name             |
|  Email                    |
|  Password                 |
|  [Create Account]         |
|                           |
|  Already have an account? |
+---------------------------+
```

### Technical Details

| What | Detail |
|------|--------|
| OAuth provider | Google (managed by Lovable Cloud, no API key needed) |
| Auth function | `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })` |
| Redirect handling | Existing `onAuthStateChange` listener in `AuthContext` will pick up the session automatically |
| Files changed | `src/pages/Auth.tsx` (add button + handler) |
| New dependency | `@lovable.dev/cloud-auth-js` (auto-installed by configure tool) |

