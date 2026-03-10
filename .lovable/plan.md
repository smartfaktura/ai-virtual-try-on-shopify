

## Plan: Replace Shopify Tab Content with "Coming Soon"

Replace the entire `ShopifyImportTab` component body with a simple centered "coming soon" placeholder showing a Shopify icon, a heading, and a brief message that the Shopify app listing is in progress.

### File to change

| File | Change |
|---|---|
| `src/components/app/ShopifyImportTab.tsx` | Replace the component's return with a static "Coming Soon" card. Keep the props interface so the parent doesn't break. Remove all the internal state/logic. |

### UI

A centered card with:
- `ShoppingBag` icon (muted)
- **"Shopify Import — Coming Soon"** heading
- Subtitle: "Our Shopify app is currently under review. This feature will be available once the app is approved."
- Cancel button at the bottom

