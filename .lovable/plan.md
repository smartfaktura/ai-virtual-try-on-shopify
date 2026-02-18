

## Add Apple Sign-In and Fix Auth Page Layout

### Problem
1. No Apple Sign-In option on the auth page
2. The Google button and "or" divider have no vertical spacing between sections (they're crammed together as seen in the screenshot)

### Changes

**File: `src/pages/Auth.tsx`**

1. **Add Apple Sign-In button** below the Google button, using the Apple logo SVG and dark styling to match Apple's brand guidelines

2. **Fix spacing** by wrapping the OAuth buttons and divider in a properly spaced container:
   - Add `space-y-3` wrapper around both OAuth buttons
   - Add `my-6` margin to the divider so it has breathing room from the buttons above and the form below

3. **Layout after fix:**

```text
+---------------------------+
|  VOVV.AI logo             |
|  Create your account      |
|  Start with 5 free...     |
|                           |
|  [G  Continue with Google]|  <- space-y-3
|  [  Continue with Apple ]|
|                           |  <- my-6
|  ──────── or ────────     |
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
| Apple OAuth | Uses `lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin })` from the already-configured `@lovable.dev/cloud-auth-js` module |
| Apple button style | Dark background (`bg-black text-white`) with Apple logo SVG, rounded-full to match Google button |
| Google button | Unchanged functionally, just spacing fixed |
| Divider | Gets `my-6` for proper vertical breathing room |
| Files changed | `src/pages/Auth.tsx` only |

