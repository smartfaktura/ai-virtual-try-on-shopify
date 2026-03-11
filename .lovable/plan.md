

## Fix: Downgrade CTA Buttons Should Not Use Primary Style

### Problem
On line 387, the CTA button variant logic uses `'default'` (primary filled style) for both upgrades AND downgrades when `p.highlighted` is true. The Growth plan has `highlighted: true`, so "Downgrade to Growth" renders as a prominent primary CTA — making it look like the recommended action. Downgrade buttons should use `'outline'` style, matching Free and Starter downgrades.

### Change

**`src/components/app/BuyCreditsModal.tsx` (line 387)**

Update the variant logic to only apply `'default'` for upgrades, never for downgrades:

```tsx
// Before:
variant={isDisabled ? 'secondary' : (p.highlighted || targetIdx > currentIdx) ? 'default' : 'outline'}

// After:
variant={isDisabled ? 'secondary' : targetIdx > currentIdx ? 'default' : 'outline'}
```

This ensures:
- **Upgrade buttons** → primary filled (`default`)
- **Downgrade buttons** → outlined (`outline`), regardless of the plan's `highlighted` flag
- **Current plan** → disabled secondary (unchanged)

Single line change, no other files affected.

