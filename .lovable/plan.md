

## Clean Up Auth Signup Page

Two changes to simplify the signup form:

### 1. Remove duplicate credits messaging
- **Line 76**: Keep the subtitle "Start with 20 free credits — no credit card required"
- **Lines 225-230**: Remove the bottom Sparkles badge ("20 free credits included with every new account") — it says the same thing

### 2. Remove Display Name field from signup
- **Lines 133-145**: Remove the display name field entirely from the signup form
- The `handle_new_user` trigger already falls back to the email prefix as the display name, so no data is lost
- Users can update their name later in Settings/Profile if needed
- This reduces signup friction: only Email + Password required

### File changed
- `src/pages/Auth.tsx`

