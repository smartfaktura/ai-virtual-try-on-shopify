## Bug: Password validation error breaks signup form layout

### Root cause

When Supabase returns a password complexity error like "Password should contain at least one character of each: abcdefghijklmnopqrstuvwxyz,ABCDEFGHIJKLMNOPQRSTUVWXYZ, 0123456789", the `mapAuthError` function in `src/lib/authErrors.ts` doesn't match it — it only checks for "password should be at least", not "password should contain". The raw message falls through to the last-resort handler and is displayed verbatim, causing layout distortion.

### Fix

**`src/lib/authErrors.ts`** (line 78): Add `msg.includes('password should contain')` to the weak password check block, and update the friendly message to mention the actual requirements:

```
message: 'Please choose a stronger password (at least 6 characters, include uppercase, lowercase, and a number).'
```

One-line addition, no layout or structural changes needed.
