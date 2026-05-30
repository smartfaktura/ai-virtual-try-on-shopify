Change the search bar visibility threshold in the Product Images generation flow from 5 to 10 products.

The search bar and Select All/Clear toolbar currently only appear when `userProducts.length >= 5`. This needs to be updated to `>= 10` in both places within `src/pages/ProductImages.tsx`.

No other logic changes needed.