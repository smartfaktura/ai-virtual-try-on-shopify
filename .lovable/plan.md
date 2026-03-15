

## Add Loading State to Credit Pack Cards on Settings Page

The "Buy Credits" buttons on the Settings page `/app/settings` have no loading feedback — tapping one just silently starts a redirect with no visual indication.

### Changes

**`src/components/app/CreditPackCard.tsx`** — Add `isLoading` prop to show spinner + "Redirecting…" state, and `disabled` prop to disable other cards while one is loading.

```tsx
interface CreditPackCardProps {
  pack: CreditPack;
  onPurchase: (packId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}
```

Button becomes:
```tsx
<Button disabled={disabled || isLoading} ...>
  {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Redirecting…</> : 'Buy Credits'}
</Button>
```

**`src/pages/Settings.tsx`** — Add `topUpLoadingId` state, wrap `handleCreditPurchase` with loading tracking, pass props to `CreditPackCard`.

```tsx
const [topUpLoadingId, setTopUpLoadingId] = useState<string | null>(null);

const handleCreditPurchase = async (packId: string) => {
  const pack = creditPacks.find(p => p.packId === packId);
  if (pack?.stripePriceId) {
    setTopUpLoadingId(packId);
    try {
      await startCheckout(pack.stripePriceId, 'payment');
    } catch {
      setTopUpLoadingId(null);
    }
  }
};

// In JSX:
<CreditPackCard
  pack={pack}
  onPurchase={handleCreditPurchase}
  isLoading={topUpLoadingId === pack.packId}
  disabled={!!topUpLoadingId}
/>
```

### Files
- `src/components/app/CreditPackCard.tsx` — add loading/disabled props
- `src/pages/Settings.tsx` — track loading state for credit purchases

