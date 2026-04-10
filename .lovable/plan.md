

# Remove SKU Field from Product Form

## Change
Remove the SKU field from `ManualProductTab.tsx` — it's not relevant to AI image generation.

### File: `src/components/app/ManualProductTab.tsx`
1. Remove `sku` from the interface (~line 35)
2. Remove `sku` state (~line 84)
3. Remove `sku` loading from editingProduct (~line 122)
4. Remove `sku` from the `moreDetailsOpen` auto-open check (~line 123)
5. Remove `sku` from the insert payload (~line 424)
6. Remove the SKU input field (~lines 1040-1043)
7. Make the Materials field full-width (currently shares a row with SKU)

