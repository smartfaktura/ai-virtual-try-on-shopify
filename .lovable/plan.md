

## Make "Buy Credits" Button a Prominent CTA

The "Buy Credits" button currently uses `bg-muted text-muted-foreground` (grey) styling when the user's balance is insufficient. This is counterintuitive — when the user can't afford to generate, the "Buy Credits" button should be the most prominent element, not look disabled.

### Change — 1 file

**`src/pages/Generate.tsx`** — Update all 4 instances where `Buy Credits` appears as the button label. When `balance < creditCost`, instead of grey muted styling, use a vibrant primary CTA style:

Replace:
```
className={balance < creditCost ? 'bg-muted text-muted-foreground hover:bg-muted' : ''}
```

With:
```
className={balance < creditCost ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
```

Also update the `onClick` handler for these buttons: when `balance < creditCost`, call `openBuyModal()` instead of triggering generation.

This affects lines ~2339, ~2826, ~2987, and ~3073.

