

## Keep Success Message Visible Longer

### Problem
The green "Message sent!" confirmation banner disappears after ~3.5 seconds, which is too fast to read comfortably.

### Change
In `src/components/app/ChatContactForm.tsx`, increase the `setTimeout` delay from `3500ms` to `10000ms` (10 seconds). This gives users ample time to read the confirmation and note the email address.

**File:** `src/components/app/ChatContactForm.tsx` line 61  
- Change `}, 3500);` → `}, 10000);`

