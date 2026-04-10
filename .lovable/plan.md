

# Separate Jewelry from Watches & Eyewear

## Change
Move `watches` and `eyewear` out of the Jewelry group and into "Bags & Accessories".

### File: `src/components/app/product-images/ProductImagesStep2Scenes.tsx`

Update `CATEGORY_SUPER_GROUPS` (line 68-76):

```typescript
{ label: 'Bags & Accessories', ids: ['bags-accessories', 'backpacks', 'wallets-cardholders', 'belts', 'scarves', 'hats-small', 'watches', 'eyewear'] },
{ label: 'Jewelry', ids: ['jewellery-rings', 'jewellery-necklaces', 'jewellery-earrings', 'jewellery-bracelets'] },
```

That's it — two lines changed.

