

# Remove "How did you find us?" from Onboarding

## Change
Remove step 3 ("How did you find us?" / referral source) from the onboarding flow, reducing it from 3 steps to 2.

## File: `src/pages/Onboarding.tsx`

1. **Change `TOTAL_STEPS` from 3 to 2**
2. **Remove `REFERRAL_OPTIONS` array** and `referralSource` state
3. **Remove `Select` import** (no longer needed)
4. **Update `canProceed()`** — remove case 3; step 2 stays as categories
5. **Update `handleNext()` save** — remove `referral_source` from the profile update (or send `null`)
6. **Delete the entire Step 3 JSX block** (the "How did you find us?" section with the Select dropdown)
7. **Remove unused imports** (`Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`)

The flow becomes:
- Step 1: Your Profile (name, company URL, marketing opt-in)
- Step 2: What do you sell? (categories) → final step, saves & redirects

