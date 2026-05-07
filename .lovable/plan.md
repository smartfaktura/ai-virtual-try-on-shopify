## Fix Tennis Editorial scene `subject` values

The new Tennis Editorial scenes were inserted with `subject = 'model'` and `'product'`, but the rest of the activewear category uses `'with-model'` and `'product-only'`. This mismatch is why model selection doesn't appear for these scenes.

### Database change
- Update 5 Tennis Editorial scenes from `subject = 'model'` → `'with-model'`
- Update "Racket & Gear Flat Lay" from `subject = 'product'` → `'product-only'`

No frontend changes needed.
