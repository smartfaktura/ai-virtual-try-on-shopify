

# Add Terms & Privacy Acceptance Checkbox to Signup

## Problem
The signup form has a marketing opt-in checkbox but no required checkbox for accepting Terms of Service and Privacy Policy. This is a legal requirement, especially for GDPR compliance.

## Changes

### `src/pages/Auth.tsx`

1. **Add state**: `const [termsAccepted, setTermsAccepted] = useState(false);`

2. **Add a required checkbox** above the marketing opt-in (only in signup mode):
   ```tsx
   <div className="flex items-start space-x-2">
     <Checkbox
       id="termsAccept"
       checked={termsAccepted}
       onCheckedChange={(v) => setTermsAccepted(!!v)}
       className="mt-0.5"
     />
     <label htmlFor="termsAccept" className="text-sm text-muted-foreground leading-snug cursor-pointer">
       I agree to the <Link to="/terms-of-service" target="_blank" className="underline text-foreground">Terms of Service</Link> and <Link to="/privacy-policy" target="_blank" className="underline text-foreground">Privacy Policy</Link>
     </label>
   </div>
   ```

3. **Block submission** if `!termsAccepted` in signup mode — show validation error: "You must accept the Terms of Service and Privacy Policy."

4. **Reset state** when switching between login/signup modes.

One file, ~15 lines added.

