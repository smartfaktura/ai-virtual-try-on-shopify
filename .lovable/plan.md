

## Improve PlanChangeDialog button labels for clarity

The dialog currently uses generic labels like "Confirm Upgrade" for all cases. We can make the UX clearer by indicating **where the user is going next** — Stripe Checkout for new subscribers, or the billing portal for existing ones.

### Changes

#### `src/components/app/PlanChangeDialog.tsx`
- Add a new prop `hasActiveSubscription: boolean` to distinguish new checkout vs portal redirect
- For **upgrade/downgrade** buttons:
  - New subscriber: "Continue to Checkout →" (they'll see Stripe Checkout)
  - Existing subscriber: "Continue to Billing Portal →" (they'll see the Stripe portal)
- For **cancel/reactivate**: Keep "Continue to Billing Portal →" since those always go to the portal
- Add a small helper text line below the summary: "You'll be securely redirected to complete this change" with a lock or external-link icon
- Add the `ExternalLink` icon to the confirm button to signal redirection

#### `src/pages/Settings.tsx`
- Pass the new `hasActiveSubscription` prop based on `subscriptionStatus === 'active' || subscriptionStatus === 'canceling'`

### What stays the same
- All dialog content, layout, styling, and functional behavior remain identical
- The confirm action logic is unchanged — only the button label text updates

