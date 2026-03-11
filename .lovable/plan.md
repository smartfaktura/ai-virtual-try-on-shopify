

## Redesign: Buy Credits Modal Header & Billing Section (Mobile)

### Problems from Screenshot
1. **Small X button + wasted top-left space** — The default DialogContent close button is tiny and there's awkward empty space in the header area
2. **PRO badge appears twice** — Once in the balance header (line 108) and again in the billing status card (line 214-216)
3. **Billing section layout is cluttered** — Three separate rows stacked: `PRO · Monthly billing · Save 20%`, then `Monthly | Annual` toggle — feels disjointed

### Changes

**`src/components/app/BuyCreditsModal.tsx`**

1. **Remove duplicate PRO badge** — Remove the Badge from the billing status card (lines 214-216), keeping only the one in the balance header

2. **Merge billing info into the toggle row** — Collapse the status card into just the Monthly/Annual toggle with the "Save 20% with annual" as a subtle link below (or remove the separate status text entirely since the header already shows the plan name)

3. **Simplify the billing card** — Remove the outer `bg-muted/30` wrapper and the plan name + "Monthly billing" text. Just show the billing toggle directly, since the PRO badge in the header already communicates the plan. Keep the "Save 20% with annual →" CTA only when relevant (monthly paid user viewing monthly prices)

4. **Fix X button** — Add a custom larger close button to the header row (right side) and hide the default DialogContent X by passing a custom class or restructuring. Move the `mr-8` spacer off the PRO badge since we'll have our own close button

**`src/components/ui/dialog.tsx`** — No changes needed; we'll hide the default X via the existing className approach on DialogContent

### Result
- Header: `[Wallet icon] 3,398 credits` ... `[PRO badge] [X button]`
- Below tabs: Just the `Monthly | Annual SAVE 20%` toggle centered, with optional "Save 20% with annual →" link for monthly users
- No duplicate plan name, cleaner vertical rhythm

